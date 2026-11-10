import { DatabaseSync } from 'node:sqlite'
import { app, ipcMain } from 'electron'
import { join } from 'path'

let db: DatabaseSync

// Cada elemento es una versión del esquema. REGLA: nunca se edita una migración
// ya publicada los cambios nuevos se agregan al final de la lista.
const migrations: string[] = [
  // v1: canciones
  `CREATE TABLE IF NOT EXISTS songs (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL,
    stanzas    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`
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
  migrate()
}

export function closeDb(): void {
  db?.close()
}

export function registerDbIpc(): void {
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
}