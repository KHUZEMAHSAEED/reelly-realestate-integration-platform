import React from 'react';
import {
  User,
  Phone,
  DollarSign,
  Compass,
  Bed,
  Layers,
  History
} from 'lucide-react';
import type { BitrixDealContext, Currency } from '../types';
import { formatPrice } from '../services/api';

interface BitrixBarProps {
  deal: BitrixDealContext | null;
  currency: Currency;
  onOpenTimeline: () => void;
}

export const BitrixBar: React.FC<BitrixBarProps> = ({
  deal,
  currency,
  onOpenTimeline
}) => {
  if (!deal) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(0, 162, 232, 0.12) 0%, rgba(17, 20, 31, 0.95) 50%, rgba(197, 160, 89, 0.12) 100%)',
      borderBottom: '1px solid rgba(0, 162, 232, 0.35)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Left: Deal & Client Snapshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00b4ff 0%, #0077b6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '18px',
          boxShadow: '0 4px 15px var(--bitrix-glow)'
        }}>
          {deal.contact_name ? deal.contact_name.charAt(0) : 'B'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-bitrix">BITRIX24 CRM DEAL #{deal.deal_id}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Stage: <strong style={{ color: '#fff' }}>{deal.stage_id}</strong></span>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
            {deal.title}
          </div>
        </div>
      </div>

      {/* Middle: Client Preferences */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <User size={15} color="#5ed6ff" />
          <span style={{ color: 'var(--text-muted)' }}>Client:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{deal.contact_name}</span>
        </div>

        {deal.contact_phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Phone size={15} color="#5ed6ff" />
            <span style={{ color: 'var(--text-muted)' }}>{deal.contact_phone}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <DollarSign size={15} color="#dfba73" />
          <span style={{ color: 'var(--text-muted)' }}>Budget:</span>
          <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>
            {formatPrice(deal.opportunity, currency)}
          </span>
        </div>

        {deal.location_preference && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Compass size={15} color="#5ed6ff" />
            <span style={{ color: 'var(--text-muted)' }}>Pref:</span>
            <span style={{ color: '#fff' }}>{deal.location_preference}</span>
          </div>
        )}

        {deal.bedrooms_preference && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <Bed size={15} color="#5ed6ff" />
            <span style={{ color: 'var(--text-muted)' }}>Beds:</span>
            <span style={{ color: '#fff' }}>{deal.bedrooms_preference}+ BR</span>
          </div>
        )}
      </div>

      {/* Right: Attached Projects & Activity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255,255,255,0.06)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--gold-light)'
        }}>
          <Layers size={14} />
          <span>Attached: <strong>{deal.attachedProjects?.length || 0} Projects</strong></span>
        </div>

        <button
          onClick={onOpenTimeline}
          className="btn-bitrix"
          style={{ padding: '7px 14px', fontSize: '12px' }}
        >
          <History size={14} /> View CRM Timeline
        </button>
      </div>
    </div>
  );
};
