/**
 * Fila FIFO de salvamentos pendentes.
 *
 * `saveCurrentDocument` é disparado sem await (botão da TitleBar e Ctrl+S via
 * evento `app:save`), então abrir/trocar de arquivo precisa esperar a gravação
 * terminar. Sem isso, a reabertura lê o disco antes de o save assíncrono
 * (exportDocx + writeFile) concluir e exibe o conteúdo antigo — como se nunca
 * tivesse sido salvo.
 */
let tail: Promise<unknown> = Promise.resolve()

/** Enfileira um salvamento; executa após os anteriores terminarem. */
export function enqueueSave<T>(run: () => Promise<T>): Promise<T> {
  const result = tail.then(run)
  // Mantém a fila viva mesmo quando um save falha (o erro continua no `result`).
  tail = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

/** Aguarda todos os salvamentos já enfileirados terminarem (com ou sem erro). */
export function drainSaves(): Promise<void> {
  return tail.then(
    () => undefined,
    () => undefined
  )
}
