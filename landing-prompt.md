# Prompt para Lovable — Landing Page "Clone do Word"

## Contexto
Crie uma landing page de produto (uma única página, em **português do Brasil**) para o **Clone do Word** — um editor de texto desktop gratuito e de código aberto (licença MIT) para Windows, que abre, edita e salva arquivos **.docx** com formatação profissional e exporta **PDF** com a mesma formatação. É uma alternativa leve ao Microsoft Word para estudantes, professores e profissionais que precisam escrever documentos do Word sem assinatura ou nuvem. Tecnologia: Electron + React (app nativo para Windows 10/11). Versão atual: 0.1.5.

## Objetivo de conversão
O único objetivo é o **download do instalador para Windows** (`Clone do Word Setup 0.1.5.exe`). Todo CTA da página aponta para `#download` (placeholder para o link do GitHub Releases). Não há cadastro, e-mail nem login.

## Identidade visual
- Paleta: azul Office `#2b579a` (primário), azul escuro `#1e3f72` (hover/degradê), acento laranja `#d83b01` (CTA secundário/detalhes), neutros em cinza-claro e branco
- Fonte: Segoe UI / Inter (visual Windows moderno, estilo Fluent — limpo, arejado, cantos arredondados suaves, sombras discretas)
- Tom: direto, confiável, sem jargões de marketing exagerado
- Ícones de linha fina (estilo Lucide)

## Estrutura e copy sugerida

### 1. Navbar fixa
Logo "W" em quadrado azul + wordmark "Clone do Word" · links âncora: Recursos, Como funciona, FAQ · botão **"Baixar para Windows"**.

### 2. Hero (acima da dobra — valor claro em 5 segundos)
- **Headline (6–12 palavras):** "Documentos do Word sem pagar nada por isso"
- **Subheadline (15–25 palavras):** "Abra, edite e salve arquivos .docx com toda a formatação e exporte PDF profissional — direto no seu computador, sem internet e sem cadastro."
- **CTA primário:** "Baixar para Windows" (botão grande, azul, com ícone de download)
- **Microcopy sob o CTA:** "Grátis e de código aberto · Windows 10/11 · Instalador .exe"
- **Imagem hero:** mostrar o RESULTADO (uma pessoa satisfeita finalizando um documento/relatório impresso), com uma captura do editor em perspectiva sobreposta ao lado — não usar apenas screenshot plano.
- **Prova social honesta (sem inventar números):** "Código aberto no GitHub · Licença MIT · Funciona 100% offline"

### 3. Faixa de benefícios (4 itens com ícone)
"Compatível com .docx" · "Exporta PDF com rodapé por página" · "Funciona offline" · "Leve e gratuito"

### 4. Grid de recursos (6 cards com ícone + título + 1 frase)
1. **Compatibilidade total com .docx** — abra arquivos do Word, edite e salve de volta sem perder nada
2. **Formatação profissional** — negrito, itálico, fontes, cores, realce, títulos, listas e alinhamentos
3. **PDF como no Word** — exporte PDF com a mesma formatação e "Página X de Y" em cada página
4. **Página configurável** — A4, margens, cabeçalho e rodapé personalizáveis
5. **Tabelas, imagens e listas** — monte relatórios completos sem sair do editor
6. **Produtividade** — atalhos de teclado (Ctrl+S, Ctrl+E…), localizar/substituir, desfazer/refazer

### 5. Como funciona (3 passos)
**1. Baixe** o instalador · **2. Edite** seus documentos .docx com a formatação que você já conhece · **3. Salve ou exporte** em PDF pronto para imprimir ou enviar.

### 6. Diferenciais (faixa comparativa simples)
Sem assinatura · Sem conta · Sem internet · Sem telemetria — seus documentos nunca saem do seu computador.

### 7. FAQ (acordeão, 5 perguntas)
- É gratuito mesmo? (Sim, MIT, código aberto)
- Abre arquivos do Microsoft Word? (Sim, .docx)
- Exporta PDF? (Sim, com formatação e numeração de páginas)
- Precisa de internet? (Não, 100% offline)
- Funciona em Mac ou Linux? (Hoje é para Windows; outras plataformas no roadmap)

### 8. CTA final
Faixa azul com degradê: "Pronto para escrever sem limites?" + botão branco **"Baixar para Windows"**.

### 9. Footer
"Clone do Word — editor de texto de código aberto" · Licença MIT · link GitHub (placeholder) · "Feito por Rafael".

## SEO e técnico
- `<title>`: "Clone do Word — Editor de Texto .docx Grátis para Windows"
- Meta description: "Abra, edite e salve arquivos .docx e exporte PDF profissional. Gratuito, offline e de código aberto. Baixe para Windows."
- Open Graph com imagem do hero
- Design responsivo mobile-first, padrão de leitura em F, animações suaves de entrada ao rolar
- Acessibilidade: contraste AA, textos alternativos, foco visível nos botões
- Apenas página estática (sem backend), placeholders fáceis de trocar: `[LINK_DOWNLOAD_GITHUB_RELEASES]` e `[SCREENSHOTS_DO_APP]`

## Restrições
Tudo em PT-BR. Uma página só. Nada de blog, preços ou depoimentos inventados. Espaços reservados para capturas de tela do editor (o app tem visual claro, ribbon estilo Office, folha A4 branca sobre fundo cinza).
