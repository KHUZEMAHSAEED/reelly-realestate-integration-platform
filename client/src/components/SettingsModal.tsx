import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyStatus: { isConfigured: boolean; maskedKey: string | null; hasEnvKey?: boolean };
  onStatusUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeyStatus,
  onStatusUpdated
}) => {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection(inputKey || undefined);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    try {
      await api.setApiKey(inputKey.trim());
      onStatusUpdated();
      handleTest();
    } catch (err: any) {
      alert(`Failed to save key: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2100,
      backgroundColor: 'rgba(5, 6, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-gold)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-luxury)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--gold-subtle)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={18} color="var(--gold-light)" />
            </div>
            <div>
              <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                Reelly API v2.0 Configuration
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Live Upstream Gateway & Offline Mock Fallback Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Indicator Box */}
        <div style={{
          background: apiKeyStatus.isConfigured ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${apiKeyStatus.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          {apiKeyStatus.isConfigured ? (
            <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}

          <div style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: 600, color: apiKeyStatus.isConfigured ? '#34d399' : '#fbbf24' }}>
              {apiKeyStatus.isConfigured ? 'Active Live Reelly API Key Configured' : 'Running on High-Fidelity Mock Engine'}
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              {apiKeyStatus.isConfigured
                ? `Key: ${apiKeyStatus.maskedKey}. Live queries are dynamically fetched with fallback to local luxury data.`
                : 'No custom API key detected. The platform is running offline in ultra-realistic UAE luxury mock mode with full off-plan inventory, developers, and markers.'}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reelly API Key (X-API-Key)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              placeholder={apiKeyStatus.isConfigured ? 'Enter new key to replace existing...' : 'Paste your Reelly v2 API key...'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-gold)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSave}
              disabled={saving || !inputKey.trim()}
              className="btn-gold"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {saving ? 'Saving...' : 'Save Key'}
            </button>
          </div>
        </div>

        {/* Diagnostics & Test Connection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Test authentication against <code style={{ color: 'var(--gold-light)' }}>api-reelly.up.railway.app</code>
            </span>
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Zap size={14} color="var(--gold-light)" />
              {testing ? 'Pinging API...' : 'Test Connection'}
            </button>
          </div>

          {testResult && (
            <div style={{
              background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: testResult.success ? '#34d399' : '#f87171'
            }}>
              <div style={{ fontWeight: 600 }}>{testResult.message}</div>
              {testResult.data && (
                <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
                  Total projects accessible: <strong>{testResult.data.total_projects}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
