export interface Stanza {
  label: string
  lines: string[]
}

export interface Song {
  id: string
  title: string
  stanzas: Stanza[]
}

// Líneas que, solas al inicio de una estrofa, se toman como su etiqueta
const LABEL_RE =
  /^(pre-?\s?coro|coro|estribillo|verso|estrofa|puente|intro|introducci[oó]n|final|outro|interludio|chorus|verse|bridge|pre-?chorus)\s*\d*\s*:?$/i

export function parseStanzas(raw: string): Stanza[] {
  return raw
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .split(/\n\s*\n/)
    .map((block, i) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      let label = `Estrofa ${i + 1}`
      const first = lines[0] ?? ''
      const bracket = first.match(/^\[(.+)\]$/)

      if (bracket) {
        label = bracket[1]
        lines.shift()
      } else if (LABEL_RE.test(first) && lines.length > 1) {
        label = first.replace(/:\s*$/, '')
        lines.shift()
      }

      return { label, lines }
    })
    .filter((s) => s.lines.length > 0)
}

export function stanzasToText(stanzas: Stanza[]): string {
  return stanzas.map((s) => `[${s.label}]\n${s.lines.join('\n')}`).join('\n\n')
}