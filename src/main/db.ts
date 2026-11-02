import { DatabaseSync } from 'node:sqlite'
import { app, ipcMain } from 'electron'
import { join } from 'path'

let db: DatabaseSync

export function initDb(): void {
  db = new DatabaseSync(join(app.getPath('userData'), 'lyric-presenter.db'))
  db.exec('PRAGMA journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      stanzas    TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
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