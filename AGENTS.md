# AGENTS.md

Electron desktop Word clone (PT-BR UI). electron-vite + React 18 + TipTap 3 + Zustand + Tailwind 4. Package manager: **pnpm**.

## Commands

| Task | Command |
|------|---------|
| Dev (long-running) | `pnpm dev` |
| Build main+preload+renderer | `pnpm build` |
| Package installer (Windows NSIS) | `pnpm dist` |
| Typecheck (node **and** web) | `pnpm typecheck` |
| Tests | `pnpm test` |
| Single test file | `pnpm vitest run src/path/to/file.test.ts` |
| Watch tests | `pnpm test:watch` |
| Lint | `pnpm lint` (`eslint src`, flat config in `eslint.config.mjs`) |

Verify before claiming done: `pnpm typecheck && pnpm test`. `pnpm build` when touching electron-vite entrypoints.

## Layout

```
src/main/      Electron main + IPC (src/main/ipc)
src/preload/   contextBridge → window.api (typed in src/shared/types/ipc.ts)
src/renderer/  React app (entry: src/renderer/main.tsx)
src/docx/      .docx import/export (mammoth, jszip, custom OOXML)
src/shared/    types + utils used by main and renderer
out/           build output (gitignored); main is out/main/index.js
```

Path aliases (must match in tsconfig.web.json **and** electron.vite.config.ts **and** vitest.config.ts):

- `@` → `src/renderer`
- `@shared` → `src/shared`

Security baseline in `src/main/index.ts`: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Never use `require`/Node in the renderer — go through `window.api` + preload IPC.

## IPC (easy to miss)

`IpcApi` in `src/shared/types/ipc.ts` is **not** enforced across processes. Every channel needs **three** sync points:

1. type in `src/shared/types/ipc.ts`
2. `ipcRenderer.invoke('…')` in `src/preload/index.ts`
3. `ipcMain.handle('…')` in `src/main/ipc/index.ts`

Miss step 3 and the renderer gets `No handler registered for '…'` at runtime (TS will not catch it). Happened with `window:setDirty`.

Channel names are not always `namespace:method` — e.g. `print.exportPdf` → `print:pdf`. Copy the string from preload, don't invent it.

Dirty window title format: `● {title} — Clone do Word`. Both `window:setTitle` and `window:setDirty` must keep that prefix/suffix and the `closeAfterSave` close path.

Main/preload changes need a `pnpm dev` restart; renderer hot-reloads.

## TipTap / ProseMirror (easy to break)

Hard-won constraints — violations caused a crash on first keystroke:

1. **Do not add raw `prosemirror-*` packages.** Only `@tiptap/pm` (and `@tiptap/*` extensions). Dual copies of `prosemirror-model` break wrap/split (Enter, lists) and can kill the renderer.
2. **`StarterKit` already includes** underline, gapcursor, dropcursor, bold, italic, strike, lists, history/undo, link. Do **not** register those again — TipTap warns `Duplicate extension names` and the editor misbehaves. Disable via `StarterKit.configure({ code: false, codeBlock: false })`, not by adding extras.
3. **Keyboard shortcuts live in an Extension** (`addKeyboardShortcuts` in `src/renderer/editor/extensions/schema.ts`), not `editor.setOptions({ editorProps: { handleKeyDown } })`. `setOptions` clobbers `editorProps` and races `useEditor`.
4. **Stable references** for `extensions` and `editorProps` in `useEditor` — use `useMemo(() => createEditorExtensions(), [])` (see `EditorCanvas.tsx`). A new object every render retriggers `setOptions` on the live view.
5. Editor schema/commands: `src/renderer/editor/extensions/schema.ts`, `src/renderer/lib/editor-commands.ts`.

## Testing

- Vitest; default env is `node`. Renderer/TipTap tests need `// @vitest-environment happy-dom` at the top of the file.
- Include glob: `src/**/__tests__/**/*.test.ts` and `tests/**/*.test.ts` only (`.tsx` is **not** picked up).
- Existing: `src/docx/__tests__/`, `src/renderer/editor/__tests__/`.
- No e2e/Electron harness (`tests/e2e/` is empty) — UI crash-on-type was fixed via unit tests + manual `pnpm dev`.

## Other gotchas

- `pnpm-workspace.yaml` sets `allowBuilds: { electron: false, esbuild: false, electron-winstaller: false }`. If Electron fails to download/run after install, check that flag before fighting the code.
- Dual typecheck: `tsconfig.node.json` (main/preload/shared/docx) and `tsconfig.web.json` (renderer/shared/docx). Both must pass.
- Prettier: no semicolons, single quotes, no trailing commas, printWidth 100 (`.prettierrc`).
- UI strings and comments are Portuguese; keep new user-facing text in PT-BR.
- `window.api` is optional-chained in places (`window.api?.…`) so the renderer can load outside Electron; don’t assume it always exists.
