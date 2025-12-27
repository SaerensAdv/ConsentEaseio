export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isEU: boolean;
  isCalifornia: boolean;
  jurisdiction: 'gdpr' | 'ccpa' | 'both' | 'none';
  flag?: string;
  languages?: string[];
  currency?: string;
}

interface CountryData {
  flag: string;
  languages: string[];
  currency: string;
}

const countryDataCache = new Map<string, CountryData>();

const EU_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'GB', 'IS', 'LI', 'NO', 'CH'
];

const geoCache = new Map<string, { data: GeoLocation; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function getCountryData(countryCode: string): Promise<CountryData | null> {
  if (!countryCode || countryCode === 'XX') return null;
  
  const cached = countryDataCache.get(countryCode);
  if (cached) return cached;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${countryCode}?fields=flag,languages,currencies`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    const countryData: CountryData = {
      flag: data.flag || '',
      languages: data.languages ? Object.values(data.languages) as string[] : [],
      currency: data.currencies ? Object.keys(data.currencies)[0] || '' : ''
    };
    
    countryDataCache.set(countryCode, countryData);
    return countryData;
  } catch {
    return null;
  }
}

export async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: 'Local',
      countryCode: 'XX',
      region: 'Local',
      city: 'Local',
      isEU: true,
      isCalifornia: false,
      jurisdiction: 'gdpr'
    };
  }

  const cached = geoCache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Geolocation API error: ${response.status}`);
      return getDefaultGeoLocation();
    }

    const data = await response.json();
    
    if (data.status !== 'success') {
      console.error('Geolocation lookup failed:', data);
      return getDefaultGeoLocation();
    }

    const countryCode = data.countryCode?.toUpperCase() || '';
    const isEU = EU_COUNTRY_CODES.includes(countryCode);
    const isCalifornia = countryCode === 'US' && data.region === 'CA';

    let jurisdiction: 'gdpr' | 'ccpa' | 'both' | 'none' = 'none';
    if (isEU && isCalifornia) {
      jurisdiction = 'both';
    } else if (isEU) {
      jurisdiction = 'gdpr';
    } else if (isCalifornia) {
      jurisdiction = 'ccpa';
    }

    // Fetch additional country data from REST Countries API (non-blocking)
    const countryData = await getCountryData(countryCode);

    const geoData: GeoLocation = {
      country: data.country || 'Unknown',
      countryCode,
      region: data.regionName || data.region || '',
      city: data.city || '',
      isEU,
      isCalifornia,
      jurisdiction,
      flag: countryData?.flag,
      languages: countryData?.languages,
      currency: countryData?.currency
    };

    geoCache.set(ip, { data: geoData, expires: Date.now() + CACHE_TTL });

    return geoData;
  } catch (error) {
    console.error('Geolocation fetch error:', error);
    return getDefaultGeoLocation();
  }
}

function getDefaultGeoLocation(): GeoLocation {
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: '',
    city: '',
    isEU: true,
    isCalifornia: false,
    jurisdiction: 'gdpr'
  };
}

export function getJurisdictionConfig(jurisdiction: 'gdpr' | 'ccpa' | 'both' | 'none') {
  const configs = {
    gdpr: {
      heading: 'We value your privacy',
      description: 'We use cookies to enhance your experience. Under GDPR, you have the right to choose which cookies you accept.',
      acceptText: 'Accept All',
      rejectText: 'Reject All',
      settingsText: 'Manage Preferences',
      legalBasis: 'GDPR Article 6(1)(a) - Consent',
      showRejectButton: true,
      requireExplicitConsent: true
    },
    ccpa: {
      heading: 'Your Privacy Choices',
      description: 'Under California law (CCPA), you have the right to opt-out of the sale or sharing of your personal information.',
      acceptText: 'Accept',
      rejectText: 'Do Not Sell My Info',
      settingsText: 'Privacy Settings',
      legalBasis: 'CCPA - California Consumer Privacy Act',
      showRejectButton: true,
      requireExplicitConsent: false
    },
    both: {
      heading: 'Your Privacy Rights',
      description: 'We respect your privacy rights under GDPR and CCPA. Choose how we use your data.',
      acceptText: 'Accept All',
      rejectText: 'Reject All',
      settingsText: 'Manage Preferences',
      legalBasis: 'GDPR & CCPA',
      showRejectButton: true,
      requireExplicitConsent: true
    },
    none: {
      heading: 'Cookie Notice',
      description: 'We use cookies to improve your experience on our website.',
      acceptText: 'Accept',
      rejectText: 'Decline',
      settingsText: 'Settings',
      legalBasis: 'Best Practice',
      showRejectButton: true,
      requireExplicitConsent: false
    }
  };

  return configs[jurisdiction];
}
