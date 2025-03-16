import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
