import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { importDocx, docxToProseMirror, exportDocx, proseMirrorToDocx } from '../import/import-docx'

const fixture = (name: string) => new Uint8Array(readFileSync(join(__dirname, 'fixtures', name)))

describe('save changes roundtrip test', () => {
  it('modifies an imported document and verifies changes are persisted', async () => {
    // 1. Import fixture
    const initialDoc = await importDocx(fixture('single-paragraph.docx'))
    const pmDoc = docxToProseMirror(initialDoc) as {
      type: string
      content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>
    }

    // 2. Modify content
    pmDoc.content = [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Parágrafo alterado pelo usuário!' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Segundo parágrafo novo com mais texto.' }]
      }
    ]

    // 3. Export with empty originalParts (as App.tsx was doing)
    const docToExport1 = proseMirrorToDocx(pmDoc, new Map())
    const bytes1 = await exportDocx(docToExport1)

    // 4. Re-import and check content
    const reimported1 = await importDocx(bytes1)
    const pmReimported1 = docxToProseMirror(reimported1) as {
      type: string
      content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>
    }

    expect(pmReimported1.content).toHaveLength(2)
    expect(pmReimported1.content[0].content?.[0].text).toBe('Parágrafo alterado pelo usuário!')
    expect(pmReimported1.content[1].content?.[0].text).toBe('Segundo parágrafo novo com mais texto.')

    // 5. Export with initialDoc.originalParts
    const docToExport2 = proseMirrorToDocx(pmDoc, initialDoc.originalParts)
    const bytes2 = await exportDocx(docToExport2)

    // 6. Re-import and check content
    const reimported2 = await importDocx(bytes2)
    const pmReimported2 = docxToProseMirror(reimported2) as {
      type: string
      content: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>
    }

    expect(pmReimported2.content).toHaveLength(2)
    expect(pmReimported2.content[0].content?.[0].text).toBe('Parágrafo alterado pelo usuário!')
    expect(pmReimported2.content[1].content?.[0].text).toBe('Segundo parágrafo novo com mais texto.')
  })
})
