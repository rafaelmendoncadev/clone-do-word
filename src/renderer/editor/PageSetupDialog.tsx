import { useState } from 'react'
import type { PageSizeId } from '@shared/constants'
import { PAGE_SIZES } from '@shared/constants'
import type { PageSetup, HeaderFooterConfig } from './page-setup'

interface Props {
  open: boolean
  setup: PageSetup
  headerFooter: HeaderFooterConfig
  onClose: () => void
  onApply: (setup: PageSetup, hf: HeaderFooterConfig) => void
}

export function PageSetupDialog({ open, setup, headerFooter, onClose, onApply }: Props) {
  const [local, setLocal] = useState<PageSetup>(setup)
  const [hf, setHf] = useState<HeaderFooterConfig>(headerFooter)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 print:hidden">
      <div className="w-[420px] rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Configurar Página</h2>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Tamanho</label>
          <select
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            value={local.size}
            onChange={(e) => setLocal({ ...local, size: e.target.value as PageSizeId })}
          >
            {Object.entries(PAGE_SIZES).map(([id, ps]) => (
              <option key={id} value={id}>{ps.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Orientação</label>
          <div className="flex gap-2">
            {(['portrait', 'landscape'] as const).map((o) => (
              <button
                key={o}
                className={`flex-1 rounded border px-3 py-2 text-sm ${
                  local.orientation === o ? 'border-blue-500 bg-blue-50' : 'border-neutral-300'
                }`}
                onClick={() => setLocal({ ...local, orientation: o })}
              >
                {o === 'portrait' ? 'Retrato' : 'Paisagem'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Margens (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side}>
                <label className="text-xs text-neutral-500">
                  {side === 'top' ? 'Sup.' : side === 'right' ? 'Dir.' : side === 'bottom' ? 'Inf.' : 'Esq.'}
                </label>
                <input
                  type="number"
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  value={local.margins[side]}
                  onChange={(e) =>
                    setLocal({ ...local, margins: { ...local.margins, [side]: Number(e.target.value) } })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">Cabeçalho</label>
          <input
            type="text"
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="Ex: Meu documento"
            value={hf.header}
            onChange={(e) => setHf({ ...hf, header: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Rodapé</label>
          <input
            type="text"
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            placeholder="Ex: Página {PAGE} de {NUMPAGES}"
            value={hf.footer}
            onChange={(e) => setHf({ ...hf, footer: e.target.value })}
          />
          <p className="mt-1 text-[10px] text-neutral-400">Tokens: {'{PAGE} {NUMPAGES} {DATE} {TIME}'}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button className="rounded px-4 py-2 text-sm hover:bg-neutral-100" onClick={onClose}>Cancelar</button>
          <button
            className="rounded bg-office-blue px-4 py-2 text-sm text-white hover:bg-office-blue-dark"
            onClick={() => { onApply(local, hf); onClose() }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
