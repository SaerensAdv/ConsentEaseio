export interface KnownCookie {
  name: string;
  pattern?: RegExp;
  provider: string;
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  purpose: string;
  expiry: string;
  type: 'first-party' | 'third-party';
}

export const knownCookies: KnownCookie[] = [
  // Google Analytics
  { name: '_ga', provider: 'Google Analytics', category: 'analytics', purpose: 'Used to distinguish users for analytics tracking.', expiry: '2 years', type: 'first-party' },
  { name: '_ga_*', pattern: /^_ga_/, provider: 'Google Analytics', category: 'analytics', purpose: 'Used to persist session state for Google Analytics 4.', expiry: '2 years', type: 'first-party' },
  { name: '_gid', provider: 'Google Analytics', category: 'analytics', purpose: 'Used to distinguish users for 24-hour analytics tracking.', expiry: '24 hours', type: 'first-party' },
  { name: '_gat', provider: 'Google Analytics', category: 'analytics', purpose: 'Used to throttle request rate to Google Analytics.', expiry: '1 minute', type: 'first-party' },
  { name: '_gat_*', pattern: /^_gat_/, provider: 'Google Analytics', category: 'analytics', purpose: 'Used to throttle request rate to Google Analytics.', expiry: '1 minute', type: 'first-party' },
  { name: '__utma', provider: 'Google Analytics (Universal)', category: 'analytics', purpose: 'Used to distinguish users and sessions.', expiry: '2 years', type: 'first-party' },
  { name: '__utmb', provider: 'Google Analytics (Universal)', category: 'analytics', purpose: 'Used to determine new sessions/visits.', expiry: '30 minutes', type: 'first-party' },
  { name: '__utmc', provider: 'Google Analytics (Universal)', category: 'analytics', purpose: 'Used with __utmb to determine new sessions.', expiry: 'Session', type: 'first-party' },
  { name: '__utmz', provider: 'Google Analytics (Universal)', category: 'analytics', purpose: 'Stores traffic source or campaign data.', expiry: '6 months', type: 'first-party' },
  { name: '__utmt', provider: 'Google Analytics (Universal)', category: 'analytics', purpose: 'Used to throttle request rate.', expiry: '10 minutes', type: 'first-party' },

  // Google Ads / Marketing
  { name: '_gcl_au', provider: 'Google Ads', category: 'marketing', purpose: 'Used by Google AdSense for experimenting with advertisement efficiency.', expiry: '3 months', type: 'first-party' },
  { name: '_gcl_aw', provider: 'Google Ads', category: 'marketing', purpose: 'Stores Google Ads click information.', expiry: '90 days', type: 'first-party' },
  { name: 'IDE', provider: 'Google DoubleClick', category: 'marketing', purpose: 'Used by Google DoubleClick to serve targeted advertisements.', expiry: '1 year', type: 'third-party' },
  { name: 'test_cookie', provider: 'Google DoubleClick', category: 'marketing', purpose: 'Used to check if the browser supports cookies.', expiry: '15 minutes', type: 'third-party' },
  { name: 'NID', provider: 'Google', category: 'marketing', purpose: 'Used to show Google ads on non-Google sites.', expiry: '6 months', type: 'third-party' },
  { name: 'ANID', provider: 'Google', category: 'marketing', purpose: 'Used for advertising purposes.', expiry: '2 years', type: 'third-party' },

  // Facebook
  { name: '_fbp', provider: 'Facebook', category: 'marketing', purpose: 'Used by Facebook to deliver advertisements.', expiry: '3 months', type: 'first-party' },
  { name: '_fbc', provider: 'Facebook', category: 'marketing', purpose: 'Stores Facebook click identifier.', expiry: '2 years', type: 'first-party' },
  { name: 'fr', provider: 'Facebook', category: 'marketing', purpose: 'Used by Facebook for advertising and analytics.', expiry: '3 months', type: 'third-party' },
  { name: 'datr', provider: 'Facebook', category: 'functional', purpose: 'Used for security and site integrity.', expiry: '2 years', type: 'third-party' },
  { name: 'sb', provider: 'Facebook', category: 'functional', purpose: 'Used for browser identification for security.', expiry: '2 years', type: 'third-party' },

  // LinkedIn
  { name: 'li_sugr', provider: 'LinkedIn', category: 'marketing', purpose: 'Used for LinkedIn Insight Tag.', expiry: '3 months', type: 'third-party' },
  { name: 'UserMatchHistory', provider: 'LinkedIn', category: 'marketing', purpose: 'Used for LinkedIn Ads ID syncing.', expiry: '30 days', type: 'third-party' },
  { name: 'AnalyticsSyncHistory', provider: 'LinkedIn', category: 'analytics', purpose: 'Used for LinkedIn analytics.', expiry: '30 days', type: 'third-party' },
  { name: 'bcookie', provider: 'LinkedIn', category: 'functional', purpose: 'Browser identifier cookie for LinkedIn.', expiry: '2 years', type: 'third-party' },
  { name: 'lidc', provider: 'LinkedIn', category: 'functional', purpose: 'Used for data center routing.', expiry: '24 hours', type: 'third-party' },
  { name: 'li_gc', provider: 'LinkedIn', category: 'functional', purpose: 'Used to store guest consent.', expiry: '2 years', type: 'third-party' },

  // Twitter/X
  { name: 'guest_id', provider: 'Twitter/X', category: 'marketing', purpose: 'Used by Twitter for advertising.', expiry: '2 years', type: 'third-party' },
  { name: 'personalization_id', provider: 'Twitter/X', category: 'marketing', purpose: 'Used for personalized advertising.', expiry: '2 years', type: 'third-party' },
  { name: 'muc_ads', provider: 'Twitter/X', category: 'marketing', purpose: 'Used for advertising purposes.', expiry: '2 years', type: 'third-party' },

  // Microsoft/Bing
  { name: '_uetsid', provider: 'Microsoft Advertising', category: 'marketing', purpose: 'Used by Microsoft Advertising UET tag.', expiry: '1 day', type: 'first-party' },
  { name: '_uetvid', provider: 'Microsoft Advertising', category: 'marketing', purpose: 'Used by Microsoft Advertising for tracking.', expiry: '1 year', type: 'first-party' },
  { name: 'MUID', provider: 'Microsoft', category: 'marketing', purpose: 'Used by Microsoft for advertising.', expiry: '1 year', type: 'third-party' },

  // Hotjar
  { name: '_hjid', provider: 'Hotjar', category: 'analytics', purpose: 'Hotjar user ID for session tracking.', expiry: '1 year', type: 'first-party' },
  { name: '_hjFirstSeen', provider: 'Hotjar', category: 'analytics', purpose: 'Identifies first session of a new user.', expiry: 'Session', type: 'first-party' },
  { name: '_hjSession_*', pattern: /^_hjSession_/, provider: 'Hotjar', category: 'analytics', purpose: 'Holds current session data.', expiry: '30 minutes', type: 'first-party' },
  { name: '_hjSessionUser_*', pattern: /^_hjSessionUser_/, provider: 'Hotjar', category: 'analytics', purpose: 'Set when a user first lands on a page.', expiry: '1 year', type: 'first-party' },
  { name: '_hjIncludedInPageviewSample', provider: 'Hotjar', category: 'analytics', purpose: 'Determines if user is in pageview sample.', expiry: '2 minutes', type: 'first-party' },
  { name: '_hjIncludedInSessionSample', provider: 'Hotjar', category: 'analytics', purpose: 'Determines if user is in session sample.', expiry: '2 minutes', type: 'first-party' },
  { name: '_hjAbsoluteSessionInProgress', provider: 'Hotjar', category: 'analytics', purpose: 'Detects first pageview session.', expiry: '30 minutes', type: 'first-party' },

  // HubSpot
  { name: '__hssc', provider: 'HubSpot', category: 'analytics', purpose: 'Tracks sessions for HubSpot analytics.', expiry: '30 minutes', type: 'first-party' },
  { name: '__hssrc', provider: 'HubSpot', category: 'analytics', purpose: 'Determines if visitor has restarted browser.', expiry: 'Session', type: 'first-party' },
  { name: '__hstc', provider: 'HubSpot', category: 'analytics', purpose: 'Main HubSpot tracking cookie.', expiry: '13 months', type: 'first-party' },
  { name: 'hubspotutk', provider: 'HubSpot', category: 'analytics', purpose: 'Tracks visitor identity for HubSpot.', expiry: '13 months', type: 'first-party' },

  // Stripe
  { name: '__stripe_mid', provider: 'Stripe', category: 'necessary', purpose: 'Fraud prevention for payment processing.', expiry: '1 year', type: 'first-party' },
  { name: '__stripe_sid', provider: 'Stripe', category: 'necessary', purpose: 'Fraud prevention for payment processing.', expiry: 'Session', type: 'first-party' },

  // Intercom
  { name: 'intercom-id-*', pattern: /^intercom-id-/, provider: 'Intercom', category: 'functional', purpose: 'Anonymous visitor identifier for Intercom.', expiry: '9 months', type: 'first-party' },
  { name: 'intercom-session-*', pattern: /^intercom-session-/, provider: 'Intercom', category: 'functional', purpose: 'Session data for Intercom messenger.', expiry: '1 week', type: 'first-party' },

  // Cloudflare
  { name: '__cf_bm', provider: 'Cloudflare', category: 'necessary', purpose: 'Bot management and security.', expiry: '30 minutes', type: 'first-party' },
  { name: 'cf_clearance', provider: 'Cloudflare', category: 'necessary', purpose: 'Security challenge clearance.', expiry: '1 year', type: 'first-party' },

  // Common CMS/Frameworks
  { name: 'PHPSESSID', provider: 'PHP', category: 'necessary', purpose: 'Session identifier for PHP applications.', expiry: 'Session', type: 'first-party' },
  { name: 'JSESSIONID', provider: 'Java', category: 'necessary', purpose: 'Session identifier for Java applications.', expiry: 'Session', type: 'first-party' },
  { name: 'ASP.NET_SessionId', provider: 'ASP.NET', category: 'necessary', purpose: 'Session identifier for ASP.NET applications.', expiry: 'Session', type: 'first-party' },
  { name: 'wp-settings-*', pattern: /^wp-settings-/, provider: 'WordPress', category: 'functional', purpose: 'WordPress user settings.', expiry: '1 year', type: 'first-party' },
  { name: 'wordpress_logged_in_*', pattern: /^wordpress_logged_in_/, provider: 'WordPress', category: 'necessary', purpose: 'WordPress login state.', expiry: 'Session', type: 'first-party' },

  // Consent Management
  { name: 'cookieconsent_status', provider: 'Cookie Consent', category: 'necessary', purpose: 'Stores cookie consent preferences.', expiry: '1 year', type: 'first-party' },
  { name: 'CookieConsent', provider: 'Cookiebot', category: 'necessary', purpose: 'Stores consent state for Cookiebot.', expiry: '1 year', type: 'first-party' },

  // TikTok
  { name: '_ttp', provider: 'TikTok', category: 'marketing', purpose: 'Used by TikTok for advertising.', expiry: '13 months', type: 'first-party' },
  { name: 'tt_webid', provider: 'TikTok', category: 'marketing', purpose: 'TikTok tracking identifier.', expiry: '1 year', type: 'third-party' },

  // Pinterest
  { name: '_pinterest_ct_ua', provider: 'Pinterest', category: 'marketing', purpose: 'Used by Pinterest for advertising.', expiry: '1 year', type: 'first-party' },
  { name: '_pin_unauth', provider: 'Pinterest', category: 'marketing', purpose: 'Pinterest user identifier.', expiry: '1 year', type: 'first-party' },

  // Segment
  { name: 'ajs_user_id', provider: 'Segment', category: 'analytics', purpose: 'Stores user ID for Segment.', expiry: '1 year', type: 'first-party' },
  { name: 'ajs_anonymous_id', provider: 'Segment', category: 'analytics', purpose: 'Anonymous user ID for Segment.', expiry: '1 year', type: 'first-party' },

  // Mixpanel
  { name: 'mp_*_mixpanel', pattern: /^mp_.*_mixpanel$/, provider: 'Mixpanel', category: 'analytics', purpose: 'Mixpanel analytics tracking.', expiry: '1 year', type: 'first-party' },

  // Amplitude
  { name: 'amplitude_id_*', pattern: /^amplitude_id_/, provider: 'Amplitude', category: 'analytics', purpose: 'Amplitude analytics user identifier.', expiry: '10 years', type: 'first-party' },

  // Zendesk
  { name: '__zlcmid', provider: 'Zendesk', category: 'functional', purpose: 'Zendesk chat widget identifier.', expiry: '1 year', type: 'first-party' },

  // Drift
  { name: 'driftt_aid', provider: 'Drift', category: 'functional', purpose: 'Drift chat anonymous identifier.', expiry: '2 years', type: 'first-party' },
  { name: 'drift_aid', provider: 'Drift', category: 'functional', purpose: 'Drift chat anonymous identifier.', expiry: '2 years', type: 'first-party' },

  // Crisp
  { name: 'crisp-client/*', pattern: /^crisp-client\//, provider: 'Crisp', category: 'functional', purpose: 'Crisp chat client identifier.', expiry: '6 months', type: 'first-party' },

  // Snapchat
  { name: '_scid', provider: 'Snapchat', category: 'marketing', purpose: 'Snapchat advertising cookie.', expiry: '13 months', type: 'first-party' },
  { name: 'sc_at', provider: 'Snapchat', category: 'marketing', purpose: 'Snapchat advertising cookie.', expiry: '1 year', type: 'third-party' },

  // Reddit
  { name: '_rdt_uuid', provider: 'Reddit', category: 'marketing', purpose: 'Reddit advertising tracking.', expiry: '3 months', type: 'first-party' },

  // Quora
  { name: 'm-b', provider: 'Quora', category: 'marketing', purpose: 'Quora advertising tracking.', expiry: '5 years', type: 'third-party' },

  // Taboola
  { name: 't_gid', provider: 'Taboola', category: 'marketing', purpose: 'Taboola advertising identifier.', expiry: '1 year', type: 'third-party' },
  { name: 'taboola_fp_td_user_id', provider: 'Taboola', category: 'marketing', purpose: 'Taboola first-party tracking.', expiry: '1 year', type: 'first-party' },

  // Outbrain
  { name: 'obuid', provider: 'Outbrain', category: 'marketing', purpose: 'Outbrain advertising identifier.', expiry: '3 months', type: 'third-party' },
];

export function classifyCookie(cookieName: string): KnownCookie | null {
  for (const known of knownCookies) {
    if (known.pattern && known.pattern.test(cookieName)) {
      return known;
    }
    if (known.name === cookieName) {
      return known;
    }
  }
  return null;
}

export function guessCookieCategory(cookieName: string): KnownCookie['category'] {
  const name = cookieName.toLowerCase();
  
  if (name.includes('session') || name.includes('csrf') || name.includes('token') || name.includes('auth')) {
    return 'necessary';
  }
  if (name.includes('ad') || name.includes('campaign') || name.includes('utm') || name.includes('fbp') || name.includes('gcl')) {
    return 'marketing';
  }
  if (name.includes('analytics') || name.includes('stat') || name.includes('track') || name.includes('_ga') || name.includes('hj')) {
    return 'analytics';
  }
  if (name.includes('pref') || name.includes('setting') || name.includes('lang') || name.includes('theme')) {
    return 'functional';
  }
  
  return 'functional';
}
