import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BitrixBar } from './components/BitrixBar';
import { FilterBar } from './components/FilterBar';
import type { FilterState } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { MapView } from './components/MapView';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { BitrixTimelineModal } from './components/BitrixTimelineModal';
import { SkeletonCard } from './components/SkeletonCard';
import { EmptyState } from './components/EmptyState';
import type {
  Currency,
  ViewMode,
  AppMode,
  ReellyProject,
  BitrixDealContext
} from './types';
import { api, formatPrice, isDemoMode } from './services/api';
import { CheckCircle2, Map as MapIcon, List } from 'lucide-react';

export function App() {
  // Query param detection for Bitrix iframe / embedded mode
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode: AppMode = searchParams.get('mode') === 'bitrix' ? 'bitrix' : 'portal';
  const initialDealId = searchParams.get('dealId') || '101';

  const [appMode, setAppMode] = useState<AppMode>(initialMode);
  const [currency, setCurrency] = useState<Currency>('AED');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const [projects, setProjects] = useState<ReellyProject[]>([]);
  const [developers, setDevelopers] = useState<Array<{ id: string | number; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<ReellyProject | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | number | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [activeModalProject, setActiveModalProject] = useState<ReellyProject | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ isConfigured: boolean; maskedKey: string | null; hasEnvKey?: boolean }>({
    isConfigured: false,
    maskedKey: null
  });

  const [bitrixDeals, setBitrixDeals] = useState<BitrixDealContext[]>([]);
  const [activeDealId, setActiveDealId] = useState<string>(initialDealId);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    developer: '',
    status: '',
    region: '',
    maxPrice: 100000000,
    quickTag: ''
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      developer: '',
      status: '',
      region: '',
      maxPrice: 100000000,
      quickTag: ''
    });
  };

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [keyRes, dealsRes, devsRes, projRes] = await Promise.all([
        api.getApiKeyStatus().catch(() => ({ isConfigured: false, maskedKey: null, hasEnvKey: false })),
        api.getBitrixDeals().catch(() => []),
        api.getDevelopers().catch(() => ({ results: [] })),
        api.getProjects({ limit: 100 }).catch(() => ({ results: [] }))
      ]);

      setApiKeyStatus(keyRes);
      setBitrixDeals(dealsRes);
      setDevelopers(devsRes.results || []);
      setProjects(projRes.results || []);
      setDemoMode(isDemoMode());
    } catch (err: any) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Current active Bitrix deal
  const activeDeal = useMemo(() => {
    return bitrixDeals.find(d => String(d.deal_id) === String(activeDealId)) || bitrixDeals[0] || null;
  }, [bitrixDeals, activeDealId]);

  // Client-side filtering across curated collections and user controls
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesName = p.name ? p.name.toLowerCase().includes(q) : false;
        const matchesDev = p.developer?.name ? p.developer.name.toLowerCase().includes(q) : false;
        const matchesDist = p.district ? p.district.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDev && !matchesDist) return false;
      }
      // Developer
      if (filters.developer && p.developer?.name?.toLowerCase() !== filters.developer.toLowerCase()) {
        return false;
      }
      // Status
      if (filters.status && p.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      // Region
      if (filters.region && p.region?.toLowerCase() !== filters.region.toLowerCase()) {
        return false;
      }
      // Price
      if (filters.maxPrice < 100000000 && p.price_from > filters.maxPrice) {
        return false;
      }
      // Quick tags
      if (filters.quickTag === 'waterfront') {
        const text = `${p.name || ''} ${p.district || ''} ${p.overview || ''}`.toLowerCase();
        if (!text.includes('harbour') && !text.includes('marina') && !text.includes('waterfront') && !text.includes('bay') && !text.includes('sea')) {
          return false;
        }
      } else if (filters.quickTag === 'branded') {
        const text = `${p.name || ''} ${p.overview || ''}`.toLowerCase();
        if (!text.includes('bugatti') && !text.includes('bvlgari') && !text.includes('dorchester')) {
          return false;
        }
      } else if (filters.quickTag === 'penthouse') {
        const hasPenthouse = p.unit_types?.some(u => u.name.toLowerCase().includes('penthouse') || u.name.toLowerCase().includes('sky'));
        if (!hasPenthouse) return false;
      } else if (filters.quickTag === 'yield') {
        if (p.price_from > 15000000) return false;
      }

      return true;
    });
  }, [projects, filters]);

  const lowestPrice = useMemo(() => {
    const prices = filteredProjects.map(p => p.price_from).filter(Boolean);
    return prices.length ? Math.min(...prices) : null;
  }, [filteredProjects]);

  const renderCard = (p: ReellyProject) => {
    const isAttached = activeDeal?.attachedProjects?.some(ap => String(ap.projectId) === String(p.id)) || false;
    return (
      <ProjectCard
        key={p.id}
        project={p}
        currency={currency}
        appMode={appMode}
        activeDeal={activeDeal}
        isSelected={selectedProject?.id === p.id}
        onSelect={() => setSelectedProject(p)}
        onHover={(hovering) => setHoveredProjectId(hovering ? p.id : null)}
        onOpenDetails={() => setActiveModalProject(p)}
        onAttachToDeal={() => handleAttachToDeal(p.id)}
        onSendProposal={() => handleSendProposal(p.id, 'whatsapp', 'Luxury Portfolio review')}
        isAttachedToDeal={isAttached}
      />
    );
  };

  // Bitrix attach action
  const handleAttachToDeal = async (projectId: string | number, unitId?: string | number, notes?: string) => {
    if (!activeDeal) return;
    try {
      const res = await api.attachProjectToDeal({
        dealId: activeDeal.deal_id,
        projectId,
        unitId,
        agentNotes: notes
      });
      // update local deal state
      setBitrixDeals(prev => prev.map(d => String(d.deal_id) === String(activeDeal.deal_id) ? res.deal : d));
      showToast(res.message || `Project attached to Bitrix Deal #${activeDeal.deal_id}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Bitrix proposal send action
  const handleSendProposal = async (projectId: string | number, channel: 'whatsapp' | 'email', customMsg: string) => {
    if (!activeDeal) return;
    try {
      const res = await api.sendProposal({
        dealId: activeDeal.deal_id,
        projectId,
        channel,
        customMessage: customMsg
      });
      setBitrixDeals(prev => prev.map(d => String(d.deal_id) === String(activeDeal.deal_id) ? res.deal : d));
      showToast(`VIP Proposal dispatched via ${channel.toUpperCase()} to ${activeDeal.contact_name}!`);
    } catch (err: any) {
      showToast(`Error sending proposal: ${err.message}`);
    }
  };

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      <div aria-live="polite">
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} color="var(--gold-light)" style={{ flexShrink: 0 }} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Top Navbar */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        currency={currency}
        setCurrency={setCurrency}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKeyStatus={apiKeyStatus}
        bitrixDeals={bitrixDeals}
        activeDealId={activeDealId}
        setActiveDealId={setActiveDealId}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        isDemoMode={demoMode}
      />

      {/* Bitrix CRM Deal Status Bar (shown when in Bitrix Mode) */}
      {appMode === 'bitrix' && (
        <BitrixBar
          deal={activeDeal}
          currency={currency}
          onOpenTimeline={() => setIsTimelineOpen(true)}
        />
      )}

      {/* Filters & Curated Collections */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        developers={developers}
        currency={currency}
        totalCount={filteredProjects.length}
      />

      {/* Main View Area - Full Flex Containment (No Double Scrollbars) */}
      <main className="app-main">
        {loading ? (
          <div className="card-grid">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <EmptyState onReset={handleResetFilters} searchQuery={filters.search} />
        ) : (
          <>
            {/* View Mode 1: Split View (Map on Right, Scrollable Cards on Left) */}
            {viewMode === 'split' && (
              <div className={`split-layout ${showMobileMap ? 'show-map' : ''}`}>
                {/* Scrollable Project Cards List */}
                <div className="split-list">
                  <div className="list-summary">
                    <div>
                      <div className="eyebrow">Curated Collection</div>
                      <div className="font-serif" style={{ fontSize: '22px', color: '#fff', marginTop: '2px' }}>
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'Residence' : 'Residences'}
                      </div>
                    </div>
                    {lowestPrice !== null && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="eyebrow">From</div>
                        <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold-light)', marginTop: '2px' }}>
                          {formatPrice(lowestPrice, currency)}
                        </div>
                      </div>
                    )}
                  </div>
                  {filteredProjects.map(renderCard)}
                </div>

                {/* Interactive Leaflet Map */}
                <div className="split-map">
                  <MapView
                    projects={filteredProjects}
                    selectedProject={selectedProject}
                    hoveredProjectId={hoveredProjectId}
                    onSelectProject={(p) => setSelectedProject(p)}
                    onOpenDetails={(p) => setActiveModalProject(p)}
                    currency={currency}
                  />
                </div>

                {/* Mobile list/map switch */}
                <button
                  className="btn-gold mobile-map-toggle"
                  onClick={() => setShowMobileMap(v => !v)}
                  aria-label={showMobileMap ? 'Show list of residences' : 'Show residences on map'}
                >
                  {showMobileMap ? <><List size={16} /> List</> : <><MapIcon size={16} /> Map</>}
                </button>
              </div>
            )}

            {/* View Mode 2: Grid View (All Luxury Cards in Responsive Grid) */}
            {viewMode === 'grid' && (
              <div className="card-grid">
                {filteredProjects.map(renderCard)}
              </div>
            )}

            {/* View Mode 3: Map Only View */}
            {viewMode === 'map' && (
              <div style={{ flex: 1, height: '100%', minHeight: 0 }}>
                <MapView
                  projects={filteredProjects}
                  selectedProject={selectedProject}
                  hoveredProjectId={hoveredProjectId}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onOpenDetails={(p) => setActiveModalProject(p)}
                  currency={currency}
                  scrollWheelZoom
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Project Dossier Modal */}
      <ProjectModal
        project={activeModalProject}
        isOpen={!!activeModalProject}
        onClose={() => setActiveModalProject(null)}
        currency={currency}
        appMode={appMode}
        activeDeal={activeDeal}
        onAttachToDeal={async (unitId, notes) => {
          if (activeModalProject) {
            await handleAttachToDeal(activeModalProject.id, unitId, notes);
          }
        }}
        onSendProposal={async (channel, message) => {
          if (activeModalProject) {
            await handleSendProposal(activeModalProject.id, channel, message);
          }
        }}
        isAttached={activeDeal?.attachedProjects?.some(ap => String(ap.projectId) === String(activeModalProject?.id)) || false}
      />

      {/* Settings & Reelly API Key Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeyStatus={apiKeyStatus}
        onStatusUpdated={loadData}
      />

      {/* Bitrix24 Deal Timeline & CRM History Modal */}
      <BitrixTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        deal={activeDeal}
        currency={currency}
        onOpenProject={async (projId) => {
          const found = projects.find(p => String(p.id) === String(projId));
          if (found) {
            setActiveModalProject(found);
          } else {
            const fetched = await api.getProject(projId);
            setActiveModalProject(fetched);
          }
        }}
      />
    </div>
  );
}

export default App;
