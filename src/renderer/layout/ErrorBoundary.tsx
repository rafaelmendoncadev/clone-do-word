import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('Erro não tratado na interface:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-neutral-100 p-6 text-center">
          <h1 className="text-lg font-semibold">A interface encontrou um erro</h1>
          <p className="max-w-md text-sm text-neutral-600">{this.state.error.message}</p>
          <button
            className="rounded bg-office-blue px-4 py-2 text-sm text-white hover:bg-office-blue-dark"
            onClick={() => this.setState({ error: null })}
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
