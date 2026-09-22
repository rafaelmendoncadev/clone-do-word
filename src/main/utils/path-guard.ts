import { resolve, normalize } from 'path'
import { app } from 'electron'

const ALLOWED_DIRS = (): string[] => [app.getPath('documents'), app.getPath('desktop'), app.getPath('downloads'), app.getPath('temp')]

export function validatePath(path: string): void {
  const resolved = normalize(resolve(path))
  const allowed = ALLOWED_DIRS()
  const ok = allowed.some((dir) => resolved.startsWith(normalize(resolve(dir))))
  if (!ok) {
    throw new Error(`Path não permitido: ${path}`)
  }
}
