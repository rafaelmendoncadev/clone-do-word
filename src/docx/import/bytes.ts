/** Normaliza bytes vindos do IPC (Uint8Array | ArrayBuffer | objeto plano). */
export function toUint8Array(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return data
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  }
  if (Array.isArray(data)) return new Uint8Array(data)
  if (data && typeof data === 'object') {
    const record = data as Record<string, number>
    const keys = Object.keys(record)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
    if (keys.length > 0) {
      return new Uint8Array(keys.map((k) => record[k] & 0xff))
    }
  }
  throw new Error('Conteúdo do arquivo inválido (bytes ilegíveis)')
}
