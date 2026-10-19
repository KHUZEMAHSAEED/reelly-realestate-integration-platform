import { ReellyProject, ReellyDeveloper, ReellyProjectMarker } from './types.js';

export const MOCK_DEVELOPERS: ReellyDeveloper[] = [
  {
    id: 101,
    name: 'Sobha Realty',
    logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Renowned international luxury real estate developer committed to backward integration and master craftsmanship.',
    projects_count: 24,
    active_projects: 18,
    established_year: 1976
  },
  {
    id: 102,
    name: 'Emaar Properties',
    logo_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'The master pioneer behind Downtown Dubai, Burj Khalifa, and Dubai Marina, shaping skyline icons globally.',
    projects_count: 65,
    active_projects: 32,
    established_year: 1997
  },
  {
    id: 103,
    name: 'Binghatti Developers',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Leading hyper-property brand collaborating with Bugatti and Mercedes-Benz for architectural masterpieces.',
    projects_count: 38,
    active_projects: 22,
    established_year: 2008
  },
  {
    id: 104,
    name: 'Omniyat',
    logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Curators of ultra-luxury residences with bespoke architecture by Dame Zaha Hadid and Foster + Partners.',
    projects_count: 16,
    active_projects: 9,
    established_year: 2005
  },
  {
    id: 105,
    name: 'Meraas',
    logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Creator of iconic beachfront lifestyle destinations like Bluewaters, City Walk, and Jumeirah Bay Island.',
    projects_count: 29,
    active_projects: 14,
    established_year: 2007
  }
];

export const MOCK_PROJECTS: ReellyProject[] = [
  {
    id: 2001,
    name: 'Sobha SeaHaven - Sky Edition',
    developer: {
      id: 101,
      name: 'Sobha Realty',
      logo_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=120&h=120&q=80'
    },
    country: 'United Arab Emirates',
    region: 'Dubai',
    district: 'Dubai Harbour',
    status: 'Under Construction',
    sale_status: 'Active',
    latitude: 25.0935,
    longitude: 55.1432,
    price_from: 3200000,
    currency: 'AED',
    handover_date: '2026-12-31',
    floors: 67,
    overview: 'Sobha SeaHaven Sky Edition stands as a waterfront crown jewel overlooking Palm Jumeirah and Ain Dubai. Featuring super-luxury nautical architecture, private sky lounges, infinity pools cantilevered over the marina, and smart home automation.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85' }
    ],
    amenities: [
      'Private Yacht Marina Access',
      'Cantilevered Infinity Sky Pool',
      'Valet & Bespoke Concierge',
      'Wellness Spa & Sauna',
      'Private Cinema & Cigar Lounge',
      'Smart Home Ecosystem'
    ],
    unit_types: [
      { id: 'sh-1br', name: '1-Bedroom Luxury Suite', bedrooms: 1, bathrooms: 2, area_sqft: 860, area_sqm: 80, price_from: 3200000, currency: 'AED' },
      { id: 'sh-2br', name: '2-Bedroom Marina Residence', bedrooms: 2, bathrooms: 3, area_sqft: 1420, area_sqm: 132, price_from: 5100000, currency: 'AED' },
      { id: 'sh-3br', name: '3-Bedroom Panoramic Haven', bedrooms: 3, bathrooms: 4, area_sqft: 2200, area_sqm: 204, price_from: 8900000, currency: 'AED' },
      { id: 'sh-sky-penthouse', name: 'Duplex Sky Penthouse', bedrooms: 5, bathrooms: 6, area_sqft: 5400, area_sqm: 502, price_from: 24500000, currency: 'AED' }
    ]
  },
  {
    id: 2002,
    name: 'Bugatti Residences by Binghatti',
    developer: {
      id: 103,
      name: 'Binghatti Developers',
      logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=120&h=120&q=80'
    },
    country: 'United Arab Emirates',
    region: 'Dubai',
    district: 'Business Bay',
    status: 'Under Construction',
    sale_status: 'Presale',
    latitude: 25.1884,
    longitude: 55.2678,
    price_from: 19000000,
    currency: 'AED',
    handover_date: '2026-06-30',
    floors: 52,
    overview: 'The worlds first Bugatti Residences. An avant-garde architectural masterpiece inspired by the French Riviera and Bugatti hyper sports car aerodynamics. Includes bespoke car lifts into private sky penthouses and private riviera beaches.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85' }
    ],
    amenities: [
      'Vehicular Car Elevator to Penthouse',
      'Private French Riviera Sand Beach',
      'VIP Chauffeur & Butler Service',
      'Private Chef Dining Lounge',
      'Bugatti Curated Art Pieces'
    ],
    unit_types: [
      { id: 'bg-cannes', name: 'Riviera Suite (2 BR)', bedrooms: 2, bathrooms: 3, area_sqft: 2100, area_sqm: 195, price_from: 19000000, currency: 'AED' },
      { id: 'bg-saint-tropez', name: 'Sky Mansion (4 BR)', bedrooms: 4, bathrooms: 5, area_sqft: 4800, area_sqm: 446, price_from: 42000000, currency: 'AED' },
      { id: 'bg-la-voiture-noire', name: 'The Sky Penthouse', bedrooms: 6, bathrooms: 7, area_sqft: 9600, area_sqm: 892, price_from: 95000000, currency: 'AED' }
    ]
  },
  {
    id: 2003,
    name: 'The Lana Residences, Dorchester Collection',
    developer: {
      id: 104,
      name: 'Omniyat',
      logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80'
    },
    country: 'United Arab Emirates',
    region: 'Dubai',
    district: 'Downtown Dubai',
    status: 'Completed',
    sale_status: 'Active',
    latitude: 25.1925,
    longitude: 55.2789,
    price_from: 14500000,
    currency: 'AED',
    handover_date: '2024-11-15',
    floors: 30,
    overview: 'Managed by legendary Dorchester Collection, The Lana Residences offer bespoke luxury living adjacent to Burj Khalifa. Architecture designed by Foster + Partners with interiors by Gilles & Boissier.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85' }
    ],
    amenities: [
      'Dorchester Collection 5-Star Hotel Services',
      'Private Rooftop Infinity Pool',
      'Private Yacht Berths on Marasi Bay',
      'Michelin Star In-Residence Catering',
      'Dior Wellness Spa Suites'
    ],
    unit_types: [
      { id: 'lana-2br', name: '2-Bedroom Luxury Suite', bedrooms: 2, bathrooms: 3, area_sqft: 1850, area_sqm: 172, price_from: 14500000, currency: 'AED' },
      { id: 'lana-3br', name: '3-Bedroom Waterfront Haven', bedrooms: 3, bathrooms: 4, area_sqft: 2900, area_sqm: 269, price_from: 22000000, currency: 'AED' },
      { id: 'lana-4br', name: 'Presidential Residence', bedrooms: 4, bathrooms: 5, area_sqft: 4100, area_sqm: 381, price_from: 35000000, currency: 'AED' }
    ]
  },
  {
    id: 2004,
    name: 'Creek Waters 2 at Dubai Creek Harbour',
    developer: {
      id: 102,
      name: 'Emaar Properties',
      logo_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=120&h=120&q=80'
    },
    country: 'United Arab Emirates',
    region: 'Dubai',
    district: 'Dubai Creek Harbour',
    status: 'Under Construction',
    sale_status: 'Active',
    latitude: 25.1989,
    longitude: 55.3512,
    price_from: 1750000,
    currency: 'AED',
    handover_date: '2027-10-31',
    floors: 50,
    overview: 'Creek Waters 2 is a modern luxury waterfront sanctuary in the heart of Dubai Creek Island. Unobstructed views of Burj Khalifa and the Ras Al Khor Wildlife Sanctuary flamingos.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85' }
    ],
    amenities: [
      'Creek Marina Boardwalk Access',
      'Lagoon Pool with Cabanas',
      'Kids Interactive Splash Island',
      'Skate Park & Multi-purpose Sports Courts',
      'Cycling Track to Ras Al Khor Sanctuary'
    ],
    unit_types: [
      { id: 'cw-1br', name: '1-Bedroom Creek View', bedrooms: 1, bathrooms: 1, area_sqft: 750, area_sqm: 70, price_from: 1750000, currency: 'AED' },
      { id: 'cw-2br', name: '2-Bedroom Marina Suite', bedrooms: 2, bathrooms: 2, area_sqft: 1180, area_sqm: 110, price_from: 2550000, currency: 'AED' },
      { id: 'cw-3br', name: '3-Bedroom Family Haven', bedrooms: 3, bathrooms: 3, area_sqft: 1650, area_sqm: 153, price_from: 3950000, currency: 'AED' },
      { id: 'cw-townhouse', name: '3-Bedroom Waterfront Townhouse', bedrooms: 3, bathrooms: 4, area_sqft: 2800, area_sqm: 260, price_from: 6800000, currency: 'AED' }
    ]
  },
  {
    id: 2005,
    name: 'Bvlgari Lighthouse, Jumeirah Bay Island',
    developer: {
      id: 105,
      name: 'Meraas',
      logo_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&h=120&q=80'
    },
    country: 'United Arab Emirates',
    region: 'Dubai',
    district: 'Jumeirah Bay Island',
    status: 'Under Construction',
    sale_status: 'Presale',
    latitude: 25.2152,
    longitude: 55.2415,
    price_from: 65000000,
    currency: 'AED',
    handover_date: '2027-04-30',
    floors: 27,
    overview: 'An ultra-exclusive architectural statement designed by ACPV ARCHITECTS Antonio Citterio Patricia Viel. Positioned on seahorse-shaped Jumeirah Bay Island with private yacht marina and Bvlgari Yacht Club privileges.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85' },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85' }
    ],
    amenities: [
      'Bvlgari Yacht Club Membership',
      'Private 50-Meter Lap Pool',
      'Dedicated Sommelier & Mediterranean Dining',
      'Helipad Access',
      'Private Island Security'
    ],
    unit_types: [
      { id: 'bl-4br', name: '4-Bedroom Bvlgari Residence', bedrooms: 4, bathrooms: 5, area_sqft: 6400, area_sqm: 595, price_from: 65000000, currency: 'AED' },
      { id: 'bl-5br', name: '5-Bedroom Lighthouse Penthouse', bedrooms: 5, bathrooms: 6, area_sqft: 9200, area_sqm: 855, price_from: 115000000, currency: 'AED' },
      { id: 'bl-sky-villa', name: 'The Billionaires Sky Villa', bedrooms: 7, bathrooms: 9, area_sqft: 14000, area_sqm: 1300, price_from: 220000000, currency: 'AED' }
    ]
  }
];

export const MOCK_PROJECT_MARKERS: ReellyProjectMarker[] = MOCK_PROJECTS.map(p => ({
  id: p.id,
  name: p.name,
  latitude: p.latitude,
  longitude: p.longitude,
  price_from: p.price_from,
  currency: p.currency,
  developer_name: p.developer.name,
  district: p.district,
  cover_url: p.photos[0]?.url,
  sale_status: p.sale_status,
  units_count: p.unit_types?.length || 4
}));

export const MOCK_COUNTRIES = [
  { id: 1, name: 'United Arab Emirates', code: 'AE', projects_count: 1906 },
  { id: 2, name: 'Saudi Arabia', code: 'SA', projects_count: 312 },
  { id: 3, name: 'Qatar', code: 'QA', projects_count: 145 },
  { id: 4, name: 'United Kingdom', code: 'GB', projects_count: 220 }
];

export const MOCK_REGIONS = [
  { id: 10, name: 'Dubai', country_id: 1, projects_count: 1540 },
  { id: 11, name: 'Abu Dhabi', country_id: 1, projects_count: 280 },
  { id: 12, name: 'Ras Al Khaimah', country_id: 1, projects_count: 86 },
  { id: 13, name: 'Riyadh', country_id: 2, projects_count: 210 }
];

export const MOCK_STATUSES = ['Under Construction', 'Completed', 'Off-Plan', 'Announced'];
export const MOCK_SALE_STATUSES = ['Active', 'Presale', 'Sold Out', 'Coming Soon'];
export const MOCK_LANGUAGES = [
  { code: 'en-us', name: 'English', default: true },
  { code: 'ar', name: 'العربية (Arabic)', default: false },
  { code: 'fr', name: 'Français (French)', default: false },
  { code: 'de', name: 'Deutsch (German)', default: false },
  { code: 'ru', name: 'Русский (Russian)', default: false },
  { code: 'zh', name: '中文 (Chinese)', default: false },
  { code: 'tr', name: 'Türkçe (Turkish)', default: false }
];

export const MOCK_UNIT_TYPES = [
  'Studio',
  '1 Bedroom Apartment',
  '2 Bedroom Apartment',
  '3 Bedroom Apartment',
  '4+ Bedroom Apartment',
  'Duplex',
  'Penthouse',
  'Townhouse',
  'Villa'
];
