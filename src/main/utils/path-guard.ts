import { resolve, normalize } from 'path'

export function validatePath(path: string): void {
  if (!path || typeof path !== 'string') {
    throw new Error('Caminho de arquivo inválido')
  }
  if (path.includes('\0')) {
    throw new Error('Caminho contém caracteres nulos')
  }
  const resolved = normalize(resolve(path))
  if (!resolved || resolved === '.') {
    throw new Error(`Caminho inválido: ${path}`)
  }
}

