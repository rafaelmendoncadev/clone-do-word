import { describe, it, expect } from 'vitest'
import { countWords, formatBytes, cn } from '../../shared/lib/format'

describe('format utils', () => {
  it('counts words', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
    expect(countWords('uma palavra')).toBe(2)
    expect(countWords('  múltiplas   palavras aqui  ')).toBe(3)
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })

  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', false, 'b', undefined)).toBe('a b')
  })
})
