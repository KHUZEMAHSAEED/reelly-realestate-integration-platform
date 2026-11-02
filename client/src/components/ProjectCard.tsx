import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  PlusCircle,
  CheckCircle2,
  Share2,
  Check,
  BedDouble
} from 'lucide-react';
import type { ReellyProject, Currency, AppMode, BitrixDealContext } from '../types';
import { formatPrice } from '../services/api';

interface ProjectCardProps {
  project: ReellyProject;
  currency: Currency;
  appMode: AppMode;
  activeDeal: BitrixDealContext | null;
  isSelected?: boolean;
  onSelect: () => void;
  onHover?: (hovering: boolean) => void;
  onOpenDetails: () => void;
  onAttachToDeal?: () => void;
  onSendProposal?: () => void;
  isAttachedToDeal?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currency,
  appMode,
  activeDeal,
  isSelected,
  onSelect,
  onHover,
  onOpenDetails,
  onAttachToDeal,
  onSendProposal,
  isAttachedToDeal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate a smart match percentage against the active deal
  const calculateMatchScore = (): number => {
    if (!activeDeal) return 92;
    let score = 70;
    // Budget check
    if (activeDeal.opportunity) {
      if (project.price_from <= activeDeal.opportunity) {
        score += 15;
      } else if (project.price_from <= activeDeal.opportunity * 1.25) {
        score += 5;
      }
    }
    // Location check
    if (activeDeal.location_preference && project.district) {
      const pref = activeDeal.location_preference.toLowerCase();
      const dist = project.district.toLowerCase();
      if (pref.includes(dist) || dist.includes(pref)) {
        score += 15;
      }
    }
    return Math.min(score, 99);
  };

  const matchScore = calculateMatchScore();

  const bedroomCounts = (project.unit_types || [])
    .map(u => u.bedrooms)
    .filter((b): b is number => typeof b === 'number');
  const bedroomLabel = bedroomCounts.length
    ? (Math.min(...bedroomCounts) === Math.max(...bedroomCounts)
      ? `${Math.min(...bedroomCounts)} BR`
      : `${Math.min(...bedroomCounts)}–${Math.max(...bedroomCounts)} BR`)
    : null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}?project=${project.id}${activeDeal ? `&dealId=${activeDeal.deal_id}&mode=bitrix` : ''}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter') onOpenDetails();
        if (e.key === ' ') { e.preventDefault(); onSelect(); }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${project.name} by ${project.developer?.name || 'developer'}, from ${formatPrice(project.price_from, currency)}`}
      aria-pressed={isSelected}
      className={`glass-panel property-card ${isSelected ? 'glass-panel-gold' : ''}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isSelected ? 'var(--shadow-luxury)' : 'var(--shadow-card)',
        borderColor: isSelected ? 'var(--border-gold-bright)' : undefined
      }}
    >
      {/* Cover Image & Badges */}
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-elevated)' }}>
        <img
          loading="lazy"
          decoding="async"
          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
          src={project.photos?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
          alt={project.name || 'Luxury Property'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="card-img"
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10, 11, 16, 0.35) 0%, rgba(10, 11, 16, 0) 28%, rgba(10, 11, 16, 0) 55%, rgba(10, 11, 16, 0.8) 100%)'
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="badge-gold">
            {project.sale_status || 'Active'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {appMode === 'bitrix' && (
              <span style={{
                background: matchScore >= 85 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(0, 162, 232, 0.9)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 9px',
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} /> {matchScore}% Match
              </span>
            )}

            <button
              onClick={handleCopyLink}
              style={{
                background: copiedLink ? 'rgba(16, 185, 129, 0.9)' : 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'var(--transition-smooth)'
              }}
              title={copiedLink ? 'Link Copied!' : 'Copy VIP Client Link'}
              aria-label="Copy VIP Client Link"
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={13} />}
            </button>
          </div>
        </div>

        {/* Bottom District & Developer info overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(0,0,0,0.65)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#e5c583',
              backdropFilter: 'blur(6px)'
            }}>
              <MapPin size={12} />
              {project.district ? `${project.district}, ${project.region || 'UAE'}` : (project.region || 'UAE')}
            </div>
          </div>

          {project.developer?.logo_url && (
            <img
              src={project.developer.logo_url}
              alt={project.developer.name || 'Developer'}
              title={project.developer.name || 'Developer'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1.5px solid var(--border-gold)',
                background: '#fff'
              }}
            />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <div>
          <div className="eyebrow">
            {project.developer?.name || 'Exclusive Developer'}
          </div>
          <h3 className="font-serif" style={{ fontSize: '23px', fontWeight: 600, color: '#fff', marginTop: '4px', lineHeight: 1.15 }}>
            {project.name}
          </h3>
        </div>

        {/* Specs Pill Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
          {project.handover_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
              <Calendar size={13} color="var(--gold-light)" />
              <span>Handover {project.handover_date.substring(0, 7)}</span>
            </div>
          )}

          {bedroomLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
              <BedDouble size={13} color="var(--gold-light)" />
              <span>{bedroomLabel}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
            <Layers size={13} color="var(--gold-light)" />
            <span>{project.unit_types?.length || 4} {project.unit_types?.length === 1 ? 'Unit Plan' : 'Unit Plans'}</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="eyebrow" style={{ fontSize: '9.5px' }}>
              Starting From
            </div>
            <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gold-light)', marginTop: '2px' }}>
              {formatPrice(project.price_from, currency)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails();
              }}
              className="btn-gold"
              style={{ padding: '9px 14px', fontSize: '12px' }}
              aria-label={`Open dossier for ${project.name}`}
            >
              View Dossier <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Bitrix CRM Quick Action Row */}
        {appMode === 'bitrix' && activeDeal && (
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px dashed rgba(0, 162, 232, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onAttachToDeal) onAttachToDeal();
              }}
              disabled={isAttachedToDeal}
              style={{
                flex: 1,
                background: isAttachedToDeal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 162, 232, 0.15)',
                color: isAttachedToDeal ? '#34d399' : '#5ed6ff',
                border: `1px solid ${isAttachedToDeal ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 162, 232, 0.4)'}`,
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: isAttachedToDeal ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              {isAttachedToDeal ? (
                <>
                  <CheckCircle2 size={13} /> Attached to Deal
                </>
              ) : (
                <>
                  <PlusCircle size={13} /> Attach to Deal #{activeDeal.deal_id}
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSendProposal) onSendProposal();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: '1px solid var(--border-light)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Dispatch Client Proposal"
              aria-label="Dispatch Client Proposal"
            >
              <Send size={12} color="#5ed6ff" /> Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
