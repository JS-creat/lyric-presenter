export interface Stanza {
  label: string
  lines: string[]
}

export interface Song {
  id: string
  title: string
  stanzas: Stanza[]
}

export function parseStanzas(raw: string): Stanza[] {
  return raw
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .map((block, i) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      const match = lines[0]?.match(/^\[(.+)\]$/)
      if (match) lines.shift()
      return { label: match ? match[1] : `Estrofa ${i + 1}`, lines }
    })
    .filter((s) => s.lines.length > 0)
}

//Cargar canciones
export function stanzasToText(stanzas: Stanza[]): string {
  return stanzas.map((s) => `[${s.label}]\n${s.lines.join('\n')}`).join('\n\n')
}

const song1 = `[Verso 1]
Luz en la mañana
Camino por la calle
Todo se ilumina

[Coro]
Canta, canta fuerte
Que se escuche el cielo
Canta, canta fuerte

[Verso 2]
Cae la tarde lenta
Vuelvo por el mismo río

[Puente]
Y si el tiempo pasa
Aquí seguiré`

const song2 = `[Verso 1]
Esta es otra canción
Para probar la lista

[Coro]
Estribillo de prueba
Una línea más`

export const sampleSongs: Song[] = [
  { id: '1', title: 'Canción de prueba 1', stanzas: parseStanzas(song1) },
  { id: '2', title: 'Canción de prueba 2', stanzas: parseStanzas(song2) }
]