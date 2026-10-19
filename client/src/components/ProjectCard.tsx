import React from 'react';
import {
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  PlusCircle,
  CheckCircle2
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
  onOpenDetails,
  onAttachToDeal,
  onSendProposal,
  isAttachedToDeal
}) => {
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

  return (
    <div
      onClick={onSelect}
      className={`glass-panel ${isSelected ? 'glass-panel-gold' : ''}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isSelected ? 'var(--shadow-luxury)' : 'var(--shadow-card)',
        borderColor: isSelected ? 'var(--border-gold-bright)' : undefined
      }}
    >
      {/* Cover Image & Badges */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={project.photos[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'}
          alt={project.name}
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
          background: 'linear-gradient(180deg, rgba(10, 11, 16, 0.2) 0%, rgba(10, 11, 16, 0.85) 100%)'
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
              <Sparkles size={12} /> {matchScore}% Deal Match
            </span>
          )}
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
              background: 'rgba(0,0,0,0.6)',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#e5c583',
              backdropFilter: 'blur(6px)'
            }}>
              <MapPin size={12} />
              {project.district ? `${project.district}, ${project.region}` : project.region}
            </div>
          </div>

          {project.developer.logo_url && (
            <img
              src={project.developer.logo_url}
              alt={project.developer.name}
              title={project.developer.name}
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
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {project.developer.name}
          </div>
          <h3 className="font-serif" style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginTop: '3px', lineHeight: 1.3 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
            <Layers size={13} color="var(--gold-light)" />
            <span>{project.unit_types?.length || 4} Unit Plans</span>
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
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Starting From
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-light)' }}>
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
              style={{ padding: '7px 12px', fontSize: '12px' }}
            >
              Dossier <ArrowRight size={13} />
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
            >
              <Send size={12} color="#5ed6ff" /> Proposal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
