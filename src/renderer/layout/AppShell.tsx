import { TitleBar } from './TitleBar'
import { StatusBar } from './StatusBar'
import { Ribbon } from '../ribbon/Ribbon'
import { EditorCanvas } from '../editor/EditorCanvas'

export function AppShell() {
  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900 print:h-auto print:bg-white">
      <TitleBar />
      <Ribbon />
      <main className="flex-1 overflow-hidden print:overflow-visible">
        <EditorCanvas />
      </main>
      <StatusBar />
    </div>
  )
}
