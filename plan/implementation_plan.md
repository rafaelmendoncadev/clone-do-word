# Plano de Melhorias e Estabilização — Clone do Word

Após uma inspeção aprofundada de todo o repositório, identificamos falhas estruturais críticas no motor DOCX, ações do editor destrutivas, botões inativos na Ribbon, ausência da tela Backstage/Recentes e quebra na esteira de lint (`eslint`).

Este plano estabelece uma evolução completa em 5 fases sequenciais para transformar o projeto em um editor robusto, estável e com alta fidelidade ao Microsoft Word.

---

## User Review Required

> [!IMPORTANT]
> **Substituir Tudo (Find & Replace)**: A implementação atual apagava toda a estrutura do documento (tabelas, imagens, cabeçalhos e estilos). O novo mecanismo fará substituições cirúrgicas no documento ProseMirror do TipTap de trás para frente, preservando 100% das formatações adjacentes.

> [!IMPORTANT]
> **Ordem dos Elementos no DOCX**: O parser anterior separava e reordenava blocos (colocando todos os parágrafos primeiro e todas as tabelas no fim). Utilizaremos o modo sequencial com `preserveOrder: true` do `fast-xml-parser` para manter a ordem exata entre texto e tabelas.

---

## Open Questions

Nenhuma questão em aberto — todas as decisões de design foram alinhadas e confirmadas no processo `/grill-me`.

---

## Proposed Changes

### 1. Motor DOCX & OOXML (Importação/Exportação)

Garantir fidelidade na estrutura e formatação ao abrir e salvar arquivos `.docx`.

#### [MODIFY] [parse-document.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/docx/import/parse-document.ts)
- Adicionar parsing sequencial do `<w:body>` mantendo a ordem intercalada real de `<w:p>` e `<w:tbl>`.
- Aprimorar extração de propriedades de numeração (`<w:numPr>`) para identificação de listas com marcadores e numéricas.

#### [MODIFY] [import-docx.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/docx/import/import-docx.ts)
- Corrigir `blockToPmNode`: parar de achatar todos os `runs` em uma única string com o estilo do primeiro `run`. Cada `run` passará a gerar seu próprio nó de texto com suas marcas (`bold`, `italic`, `underline`, `strike`, `color`, `fontFamily`, `fontSize`, `highlight`).
- Mapear parágrafos com numeração para nós TipTap `bulletList` / `orderedList` e `listItem`.
- No sentido inverso (`pmNodeToBlock`), adicionar conversão de `bulletList` e `orderedList` para blocos com `numPr` no modelo do Word.

#### [MODIFY] [write-document.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/docx/export/write-document.ts)
- Tratar nós de imagem na exportação para não descartar silenciosamente figuras inseridas no editor.

---

### 2. Editor Core, Busca & Comentários

Tornar as ferramentas de edição confiáveis, não-destrutivas e com persistência de estado.

#### [NEW] [useCommentsStore.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/stores/useCommentsStore.ts)
- Store global Zustand para comentários do documento, evitando que fechar o painel lateral apague os comentários inseridos.
- Permitir capturar o trecho de texto selecionado como citação ao comentar.

#### [MODIFY] [CommentsPane.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/features/comments/CommentsPane.tsx)
- Conectar o painel ao `useCommentsStore`, permitindo adicionar, resolver, reabrir e excluir comentários com permanência em memória do documento.

#### [MODIFY] [FindReplacePanel.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/features/find-replace/FindReplacePanel.tsx)
- Reescrever a busca para percorrer os nós de texto do TipTap (`editor.state.doc.descendants`), computar posições absolutas e selecionar/focar no termo localizado (`scrollIntoView`).
- Adicionar suporte a "Localizar Próximo" e "Localizar Anterior".
- Substituir a implementação destrutiva de "Substituir Tudo" por substituições transacionais do ProseMirror de trás para frente, preservando marks, cabeçalhos, imagens e tabelas.

---

### 3. Interface da Ribbon, Ícones & Backstage

Modernizar a estética visual com ícones profissionais e ativar funcionalidades inativas.

#### [MODIFY] [Ribbon.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/ribbon/Ribbon.tsx)
- Adicionar aba "Arquivo" estilizada no canto superior esquerdo com destaque visual (azul Office).
- Integrar alternância para a tela Backstage.
- Conectar as abas "Exibir" e "Referências" com controles úteis em vez de mensagem estática.

#### [MODIFY] [HomeTab.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/ribbon/tabs/HomeTab.tsx)
- Substituir todos os emojis e caracteres unicode por componentes SVG do `lucide-react` (`Bold`, `Italic`, `Underline`, `Strikethrough`, `FolderOpen`, `Clipboard`, `Scissors`, `Copy`, `AlignLeft`, `AlignCenter`, `AlignRight`, `AlignJustify`, `List`, `ListOrdered`, `Indent`, `Outdent`, `Undo2`, `Redo2`, `Highlighter`).
- Conectar botões inativos: "Colar" (`navigator.clipboard.readText`), "Diminuir recuo" (`outdent(editor)`), "Aumentar recuo" (`indent(editor)`).
- Adicionar botão para alternar o painel lateral de Estilos.

#### [MODIFY] [InsertTab.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/ribbon/tabs/InsertTab.tsx)
- Substituir emojis por ícones Lucide (`Table`, `Image`, `Minus`, `SlidersHorizontal`).

#### [MODIFY] [LayoutTab.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/ribbon/tabs/LayoutTab.tsx)
- Substituir emojis por ícones Lucide (`Ruler`, `Columns2`, `Columns3`, `Square`, `Maximize2`).
- Conectar botões de colunas (estilização de colunas CSS no container do documento).

#### [MODIFY] [ReviewTab.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/ribbon/tabs/ReviewTab.tsx)
- Substituir emojis por ícones Lucide (`MessageSquare`, `ListTree`, `Search`, `Replace`).

#### [MODIFY] [useEditorUiStore.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/stores/useEditorUiStore.ts)
- Adicionar `showStylesPane` e `showBackstage` aos estados controláveis.

#### [MODIFY] [EditorCanvas.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/editor/EditorCanvas.tsx)
- Tornar o `StylesPane` condicional (`showStylesPane && <StylesPane />`), deixando o espaço de edição limpo e focado por padrão.

---

### 4. Backstage / StartScreen & Histórico de Recentes

Integrar a tela de abertura do Office com histórico real de arquivos.

#### [MODIFY] [useRecentFilesStore.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/stores/useRecentFilesStore.ts)
- Adicionar persistência automática em `localStorage` via middleware `persist` do Zustand.

#### [MODIFY] [StartScreen.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/features/home/StartScreen.tsx)
- Atualizar a interface com botão de retorno ao documento ("← Voltar"), atalhos para Novo, Abrir, Salvar, Exportar PDF, Imprimir e lista clicável de arquivos recentes.
- Conectar ícones Lucide.

#### [MODIFY] [App.tsx](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/renderer/App.tsx)
- Integrar renderização do `StartScreen` quando `showBackstage` estiver ativo.
- Ao abrir ou salvar um arquivo com sucesso, registrar no `useRecentFilesStore`.
- Conectar todas as ações de menu IPC pendentes: `file.exportPdf`, `file.print`, `edit.find`, `edit.replace`.

---

### 5. Exportação PDF Nativa, Impressão & ESLint 9

Adicionar recursos profissionais de saída e estabilizar a pipeline de lint.

#### [MODIFY] [src/main/ipc/index.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/main/ipc/index.ts)
- Adicionar handlers IPC para `print:pdf` (usando `win.webContents.printToPDF` com diálogo de salvar) e `print:document` (usando `win.webContents.print`).

#### [MODIFY] [src/preload/index.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/preload/index.ts) e [src/shared/types/ipc.ts](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/src/shared/types/ipc.ts)
- Expor métodos tipados `api.print.exportPdf(defaultPath)` e `api.print.document()`.

#### [NEW] [eslint.config.mjs](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/eslint.config.mjs)
- Criar configuração padrão flat config para ESLint 9.

#### [MODIFY] [package.json](file:///c:/Users/Rafael/Documents/Projetos/Clone%20do%20Word/package.json)
- Ajustar script `"lint": "eslint src"` (removendo `--ext`, que é incompatível com o ESLint 9).

---

## Verification Plan

### Automated Tests
1. **Typecheck completo (Node + Web)**:
   ```bash
   pnpm typecheck
   ```
2. **Execução de testes unitários**:
   ```bash
   pnpm test
   ```
3. **Novo teste para múltiplos runs e preservação de tabelas no DOCX**:
   ```bash
   pnpm vitest run src/docx/__tests__/import-docx.test.ts
   ```
4. **Verificação do linter**:
   ```bash
   pnpm lint
   ```
5. **Compilação de produção Electron**:
   ```bash
   pnpm build
   ```

### Manual Verification
1. Abrir a aplicação com `pnpm dev`.
2. Clicar na aba "Arquivo" para abrir o Backstage, verificar os botões de Novo, Abrir, Recentes e retornar ao editor.
3. Testar os novos ícones Lucide na Ribbon (Home, Inserir, Layout, Revisão).
4. Testar botões de Recuo (Indent/Outdent) e Colar.
5. Digitar parágrafo com palavras em negrito, itálico e cores diferentes; salvar como `.docx` e reabrir para confirmar que as formatações não se fundem em um único estilo.
6. Abrir o diálogo de "Localizar e Substituir", realizar busca e substituir texto sem perder títulos ou formatações existentes.
7. Testar "Exportar PDF" e "Imprimir" via menu ou Backstage.
