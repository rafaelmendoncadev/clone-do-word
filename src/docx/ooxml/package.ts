import JSZip from 'jszip'

export interface OoxmlPackage {
  parts: Map<string, Uint8Array>
  zip: JSZip
}

export async function readPackage(bytes: Uint8Array): Promise<OoxmlPackage> {
  const zip = await JSZip.loadAsync(bytes)
  const parts = new Map<string, Uint8Array>()

  const entries = Object.keys(zip.files)
  for (const name of entries) {
    if (zip.files[name].dir) continue
    const data = await zip.files[name].async('uint8array')
    parts.set(name, data)
  }

  return { parts, zip }
}

export async function writePackage(parts: Map<string, Uint8Array>): Promise<Uint8Array> {
  const zip = new JSZip()
  for (const [name, data] of parts) {
    zip.file(name, data)
  }
  return zip.generateAsync({ type: 'uint8array' })
}

export function getPartAsString(parts: Map<string, Uint8Array>, name: string): string | null {
  const data = parts.get(name)
  if (!data) return null
  return new TextDecoder('utf-8').decode(data)
}

export function setPartFromString(parts: Map<string, Uint8Array>, name: string, content: string): void {
  parts.set(name, new TextEncoder().encode(content))
}

export function getPartAsBytes(parts: Map<string, Uint8Array>, name: string): Uint8Array | null {
  return parts.get(name) || null
}
