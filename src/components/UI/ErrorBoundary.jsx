import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const { fallback, mini } = this.props;

            if (fallback) return fallback;

            if (mini) {
                return (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm">
                        <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                        <span className="text-red-700 dark:text-red-400">Error al cargar este componente</span>
                        <button
                            onClick={this.handleReset}
                            className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center min-h-[300px] p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Algo salió mal
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {this.state.error?.message || 'Ocurrió un error inesperado al cargar esta sección.'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <RefreshCw size={16} />
                            Reintentar
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mt-4 text-left">
                                <summary className="text-xs text-gray-400 cursor-pointer">Detalles técnicos</summary>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
