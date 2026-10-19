export interface ReellyPagination<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ReellyMediaItem {
  url: string;
  metadata?: {
    mime?: string;
    size?: number;
    width?: number;
    height?: number;
  };
}

export interface ReellyProjectMarker {
  id: number | string;
  name: string;
  latitude: number;
  longitude: number;
  price_from?: number;
  currency?: string;
  developer_name?: string;
  district?: string;
  cover_url?: string;
  sale_status?: string;
  units_count?: number;
}

export interface ReellyUnitType {
  id: number | string;
  name: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  area_sqm?: number;
  price_from?: number;
  currency?: string;
  floor_plan_url?: string;
}

export interface ReellyProject {
  id: number | string;
  name: string;
  developer: {
    id: number | string;
    name: string;
    logo_url?: string;
  };
  country: string;
  region: string;
  district?: string;
  status: string;
  sale_status: string;
  latitude: number;
  longitude: number;
  polygon?: Array<[number, number]>;
  price_from: number;
  currency: string;
  handover_date?: string;
  floors?: number;
  overview: string;
  photos: ReellyMediaItem[];
  amenities?: string[];
  unit_types?: ReellyUnitType[];
}

export interface ReellyDeveloper {
  id: number | string;
  name: string;
  logo_url?: string;
  description?: string;
  projects_count?: number;
  active_projects?: number;
  established_year?: number;
}

export interface BitrixDealContext {
  deal_id: number | string;
  title: string;
  opportunity: number;
  currency: string;
  stage_id: string;
  location_preference?: string;
  bedrooms_preference?: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  assigned_agent_name?: string;
  attachedProjects?: Array<{
    attachedAt: string;
    projectId: number | string;
    projectName: string;
    developer: string;
    district?: string;
    priceFrom: number;
    currency: string;
    unit: ReellyUnitType | null;
    agentNotes?: string;
  }>;
  activityLog?: Array<{
    id: string;
    date: string;
    type: string;
    text: string;
  }>;
}

export type Currency = 'AED' | 'USD' | 'EUR' | 'GBP';
export type ViewMode = 'split' | 'grid' | 'map';
export type AppMode = 'portal' | 'bitrix';
