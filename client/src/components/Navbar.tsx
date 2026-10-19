import React from 'react';
import {
  Sparkles,
  Building2,
  Briefcase,
  KeyRound,
  LayoutGrid,
  Map as MapIcon,
  Columns3,
  ChevronDown
} from 'lucide-react';
import type { Currency, ViewMode, AppMode, BitrixDealContext } from '../types';

interface NavbarProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onOpenSettings: () => void;
  apiKeyStatus: { isConfigured: boolean; maskedKey: string | null };
  bitrixDeals: BitrixDealContext[];
  activeDealId: string;
  setActiveDealId: (id: string) => void;
  onOpenTimeline: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  appMode,
  setAppMode,
  currency,
  setCurrency,
  viewMode,
  setViewMode,
  onOpenSettings,
  apiKeyStatus,
  bitrixDeals,
  activeDealId,
  setActiveDealId,
  onOpenTimeline
}) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid var(--border-gold)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #dfba73 0%, #c5a059 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px var(--gold-glow)'
          }}>
            <Building2 size={22} color="#0a0b10" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.12em', color: '#fff' }}>
              REELLY <span className="text-gold-gradient">LUXE</span>
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              API v2.0 Real Estate Engine
            </div>
          </div>
        </div>

        {/* Dual Mode Switcher: Standalone Portal vs Bitrix24 CRM Mode */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '30px',
          padding: '4px',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setAppMode('portal')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: appMode === 'portal' ? 'linear-gradient(135deg, #dfba73 0%, #c5a059 100%)' : 'transparent',
              color: appMode === 'portal' ? '#0a0b10' : 'var(--text-muted)',
              fontWeight: appMode === 'portal' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Sparkles size={14} /> Luxury Portal
          </button>

          <button
            onClick={() => setAppMode('bitrix')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: appMode === 'bitrix' ? 'linear-gradient(135deg, #00b4ff 0%, #0088cc 100%)' : 'transparent',
              color: appMode === 'bitrix' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: appMode === 'bitrix' ? 700 : 500,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
          >
            <Briefcase size={14} /> Bitrix24 CRM Mode
          </button>
        </div>
      </div>

      {/* Bitrix Active Deal Context Switcher (if in CRM mode) */}
      {appMode === 'bitrix' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 162, 232, 0.1)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(0, 162, 232, 0.3)' }}>
            <span style={{ fontSize: '11px', color: '#5ed6ff', fontWeight: 600 }}>ACTIVE DEAL:</span>
            <select
              value={activeDealId}
              onChange={(e) => setActiveDealId(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {bitrixDeals.map(d => (
                <option key={d.deal_id} value={d.deal_id} style={{ background: '#11141f', color: '#fff' }}>
                  #{d.deal_id}: {d.contact_name} ({d.title.split('-')[0]})
                </option>
              ))}
            </select>
            <ChevronDown size={14} color="#5ed6ff" />
          </div>

          <button
            onClick={onOpenTimeline}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', height: '34px' }}
          >
            Deal Timeline
          </button>
        </div>
      )}

      {/* Right Controls: View Switcher, Currency, API Key Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border-light)'
        }}>
          <button
            title="Split Map & List"
            onClick={() => setViewMode('split')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'split' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'split' ? 'var(--gold-light)' : 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            <Columns3 size={16} />
          </button>
          <button
            title="Grid View"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'grid' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--gold-light)' : 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            title="Full Map View"
            onClick={() => setViewMode('map')}
            style={{
              padding: '6px 10px',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'map' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'map' ? 'var(--gold-light)' : 'var(--text-dim)',
              cursor: 'pointer'
            }}
          >
            <MapIcon size={16} />
          </button>
        </div>

        {/* Currency Switcher */}
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          style={{
            background: 'rgba(18, 22, 34, 0.9)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold-light)',
            padding: '7px 12px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '12px',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="AED">AED (د.إ)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>

        {/* Reelly API Key Status Button */}
        <button
          onClick={onOpenSettings}
          style={{
            background: apiKeyStatus.isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(197, 160, 89, 0.12)',
            border: `1px solid ${apiKeyStatus.isConfigured ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-gold)'}`,
            borderRadius: '8px',
            padding: '7px 14px',
            color: apiKeyStatus.isConfigured ? '#34d399' : 'var(--gold-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
        >
          <KeyRound size={14} />
          <span>{apiKeyStatus.isConfigured ? 'Reelly v2: Live' : 'Reelly Engine: Ready'}</span>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: apiKeyStatus.isConfigured ? '#10b981' : '#f59e0b',
            boxShadow: `0 0 8px ${apiKeyStatus.isConfigured ? '#10b981' : '#f59e0b'}`
          }} />
        </button>
      </div>
    </header>
  );
};
