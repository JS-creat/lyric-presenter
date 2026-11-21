import { DatabaseSync } from 'node:sqlite'
import { app, ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { join } from 'path'

let db: DatabaseSync

// Cada elemento es una versión del esquema. REGLA: nunca se edita una migración
// ya publicada; los cambios nuevos se agregan al final de la lista.
const migrations: string[] = [
  // v1: canciones
  `CREATE TABLE IF NOT EXISTS songs (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    stanzas    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  // v2: servicios (listas ordenadas de canciones)
  `CREATE TABLE IF NOT EXISTS services (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS service_items (
    id         TEXT PRIMARY KEY,
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    song_id    TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_service_items_service ON service_items(service_id, position)`
]

function migrate(): void {
  const row = db.prepare('PRAGMA user_version').get() as unknown as { user_version: number }

  for (let version = row.user_version; version < migrations.length; version++) {
    db.exec('BEGIN')
    try {
      db.exec(migrations[version])
      db.exec(`PRAGMA user_version = ${version + 1}`)
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  console.log(`[db] esquema en versión ${migrations.length}`)
}

export function initDb(): void {
  db = new DatabaseSync(join(app.getPath('userData'), 'lyric-presenter.db'))
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  migrate()
}

export function closeDb(): void {
  db?.close()
}

export function registerDbIpc(): void {
  // ---- Canciones ----
  ipcMain.handle('songs:list', (): SongData[] => {
    const rows = db
      .prepare('SELECT id, title, stanzas FROM songs ORDER BY title COLLATE NOCASE')
      .all() as unknown as { id: string; title: string; stanzas: string }[]
    return rows.map((r) => ({ id: r.id, title: r.title, stanzas: JSON.parse(r.stanzas) }))
  })

  ipcMain.handle('songs:create', (_e, song: SongData) => {
    const now = Date.now()
    db.prepare(
      'INSERT INTO songs (id, title, stanzas, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).run(song.id, song.title, JSON.stringify(song.stanzas), now, now)
  })

  ipcMain.handle('songs:update', (_e, song: SongData) => {
    db.prepare('UPDATE songs SET title = ?, stanzas = ?, updated_at = ? WHERE id = ?').run(
      song.title,
      JSON.stringify(song.stanzas),
      Date.now(),
      song.id
    )
  })

  ipcMain.handle('songs:delete', (_e, id: string) => {
    db.prepare('DELETE FROM songs WHERE id = ?').run(id)
  })

  // ---- Servicios ----
  ipcMain.handle('services:list', (): ServiceData[] => {
    const services = db
      .prepare('SELECT id, name FROM services ORDER BY name COLLATE NOCASE')
      .all() as unknown as { id: string; name: string }[]
    const items = db
      .prepare('SELECT service_id, song_id FROM service_items ORDER BY service_id, position')
      .all() as unknown as { service_id: string; song_id: string }[]

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      songIds: items.filter((i) => i.service_id === s.id).map((i) => i.song_id)
    }))
  })

  // Guarda el servicio completo (nombre y orden de canciones) en una sola transacción
  ipcMain.handle('services:save', (_e, service: ServiceData) => {
    db.exec('BEGIN')
    try {
      db.prepare(
        `INSERT INTO services (id, name, created_at) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name`
      ).run(service.id, service.name, Date.now())
      db.prepare('DELETE FROM service_items WHERE service_id = ?').run(service.id)
      const insert = db.prepare(
        'INSERT INTO service_items (id, service_id, song_id, position) VALUES (?, ?, ?, ?)'
      )
      service.songIds.forEach((songId, i) => insert.run(randomUUID(), service.id, songId, i))
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  })

  ipcMain.handle('services:delete', (_e, id: string) => {
    db.prepare('DELETE FROM services WHERE id = ?').run(id)
  })
}
