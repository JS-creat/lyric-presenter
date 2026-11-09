// Lee un archivo de texto detectando la codificación (UTF-8, UTF-16 o ANSI de Windows)
export async function readTextFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(buffer)
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(buffer)

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('windows-1252').decode(buffer)
  }
}

export function titleFromFileName(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/_+/g, ' ').trim()
}