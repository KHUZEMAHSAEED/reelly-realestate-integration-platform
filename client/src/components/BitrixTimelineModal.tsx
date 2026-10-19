import React, { useEffect } from 'react';
import {
  X,
  ExternalLink
} from 'lucide-react';
import type { BitrixDealContext, Currency } from '../types';
import { formatPrice } from '../services/api';

interface BitrixTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: BitrixDealContext | null;
  currency: Currency;
  onOpenProject: (projectId: string | number) => void;
}

export const BitrixTimelineModal: React.FC<BitrixTimelineModalProps> = ({
  isOpen,
  onClose,
  deal,
  currency,
  onOpenProject
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !deal) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2200,
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
          maxWidth: '750px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(0, 162, 232, 0.4)',
          overflowY: 'auto',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: 'var(--shadow-luxury)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-bitrix">BITRIX24 CRM DEAL #{deal.deal_id}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timeline & History</span>
            </div>
            <h2 className="font-serif" style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
              {deal.title}
            </h2>
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

        {/* Client & Deal Stats Bar */}
        <div style={{
          background: 'rgba(0, 162, 232, 0.08)',
          border: '1px solid rgba(0, 162, 232, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          fontSize: '13px'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Client</div>
            <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{deal.contact_name}</div>
            <div style={{ color: '#5ed6ff', fontSize: '11px' }}>{deal.contact_phone}</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Opportunity Budget</div>
            <div style={{ color: 'var(--gold-light)', fontWeight: 700, marginTop: '2px' }}>
              {formatPrice(deal.opportunity, currency)}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Assigned Agent</div>
            <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{deal.assigned_agent_name}</div>
          </div>

          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Stage</div>
            <div style={{ color: '#34d399', fontWeight: 600, marginTop: '2px' }}>{deal.stage_id}</div>
          </div>
        </div>

        {/* Attached Projects Section */}
        <div>
          <h3 className="font-serif" style={{ fontSize: '17px', color: '#fff', marginBottom: '12px' }}>
            Attached Off-Plan Projects ({deal.attachedProjects?.length || 0})
          </h3>

          {(!deal.attachedProjects || deal.attachedProjects.length === 0) ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px'
            }}>
              No projects attached to this deal yet. Browse the luxury catalog and click "Attach to Deal".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deal.attachedProjects.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
                      {p.projectName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gold-light)', marginTop: '2px' }}>
                      {p.developer} • {p.district}
                    </div>
                    {p.unit && (
                      <div style={{ fontSize: '12px', color: '#5ed6ff', marginTop: '2px' }}>
                        Selected Unit: <strong>{p.unit.name}</strong> ({formatPrice(p.unit.price_from, currency)})
                      </div>
                    )}
                    {p.agentNotes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                        "{p.agentNotes}"
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenProject(p.projectId);
                    }}
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    View Dossier <ExternalLink size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline Events */}
        <div>
          <h3 className="font-serif" style={{ fontSize: '17px', color: '#fff', marginBottom: '12px' }}>
            CRM Activity Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deal.activityLog && deal.activityLog.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderLeft: act.type === 'PROPOSAL_SENT'
                    ? '3px solid #10b981'
                    : act.type === 'PROJECT_ATTACHED'
                      ? '3px solid var(--gold-light)'
                      : '3px solid #00a2e8'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: act.type === 'PROPOSAL_SENT' ? '#34d399' : '#5ed6ff' }}>
                      {act.type}
                    </strong>
                    <span>{new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#f3f4f8', marginTop: '4px', lineHeight: 1.4 }}>
                    {act.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
