import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0b10',
          color: '#fff',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(25, 30, 46, 0.85)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            borderRadius: '16px',
            padding: '36px',
            maxWidth: '520px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.7)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(239, 68, 68, 0.4)'
            }}>
              <AlertCircle size={28} color="#ef4444" />
            </div>
            <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', marginBottom: '8px', color: '#fff' }}>
              Interface Notice
            </h2>
            <p style={{ color: '#9ba1b5', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              A temporary display error occurred while rendering property items.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #dfba73 0%, #c5a059 100%)',
                color: '#0a0b10',
                fontWeight: 700,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px'
              }}
            >
              <RotateCcw size={15} /> Reload Luxury Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
