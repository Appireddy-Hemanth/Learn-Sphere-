import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#0f172a', zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto', fontFamily: 'monospace' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>React Rendering Crash Detected</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '15px' }}>An unhandled error occurred during React lifecycle rendering:</p>
                    <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '15px', borderRadius: '8px', color: '#f8fafc' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#1e293b', border: '1px solid #334155', padding: '15px', borderRadius: '8px', color: '#cbd5e1', marginTop: '10px', fontSize: '12px' }}>
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/';
                        }}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Clear LocalStorage & Reset App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
