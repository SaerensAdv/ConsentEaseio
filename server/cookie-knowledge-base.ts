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
  { name: '_tt_enable_cookie', provider: 'TikTok', category: 'marketing', purpose: 'TikTok pixel — indicates if cookies are enabled for the TikTok pixel.', expiry: '1 year', type: 'first-party' },
  { name: 'ttcsid', provider: 'TikTok', category: 'marketing', purpose: 'TikTok pixel session identifier.', expiry: '1 year', type: 'first-party' },
  { name: 'ttcsid_*', pattern: /^ttcsid_/, provider: 'TikTok', category: 'marketing', purpose: 'TikTok pixel session identifier (per pixel).', expiry: '1 year', type: 'first-party' },

  // Twitter / X
  { name: '_twpid', provider: 'Twitter/X', category: 'marketing', purpose: 'Twitter pixel identifier for ad conversion tracking.', expiry: '1 year', type: 'first-party' },

  // Google Tag Manager dynamic cookies
  { name: '_dc_gtm_*', pattern: /^_dc_gtm_/, provider: 'Google Tag Manager', category: 'analytics', purpose: 'Used by Google Tag Manager to throttle requests to Google Analytics.', expiry: '1 minute', type: 'first-party' },

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

  // Microsoft Clarity
  { name: '_clck', provider: 'Microsoft Clarity', category: 'analytics', purpose: 'Persists the Clarity User ID and preferences.', expiry: '1 year', type: 'first-party' },
  { name: '_clsk', provider: 'Microsoft Clarity', category: 'analytics', purpose: 'Connects multiple page views by a user into a single Clarity session.', expiry: '1 day', type: 'first-party' },
  { name: 'CLID', provider: 'Microsoft Clarity', category: 'analytics', purpose: 'Identifies the first-time Clarity saw this user.', expiry: '1 year', type: 'first-party' },
  { name: 'ANONCHK', provider: 'Microsoft Clarity', category: 'analytics', purpose: 'Indicates whether MUID is transferred to ANID.', expiry: '10 minutes', type: 'third-party' },
  { name: 'SM', provider: 'Microsoft Clarity', category: 'analytics', purpose: 'Used in synchronizing the MUID across Microsoft domains.', expiry: 'Session', type: 'third-party' },
  { name: 'MR', provider: 'Microsoft', category: 'analytics', purpose: 'Used to collect information for analytics purposes.', expiry: '7 days', type: 'third-party' },

  // Matomo / Piwik
  { name: '_pk_id.*', pattern: /^_pk_id\./, provider: 'Matomo', category: 'analytics', purpose: 'Stores a unique visitor ID for Matomo analytics.', expiry: '13 months', type: 'first-party' },
  { name: '_pk_ses.*', pattern: /^_pk_ses\./, provider: 'Matomo', category: 'analytics', purpose: 'Short-lived session cookie for Matomo analytics.', expiry: '30 minutes', type: 'first-party' },
  { name: '_pk_ref.*', pattern: /^_pk_ref\./, provider: 'Matomo', category: 'analytics', purpose: 'Stores referrer information for Matomo analytics.', expiry: '6 months', type: 'first-party' },
  { name: 'mtm_consent', provider: 'Matomo', category: 'necessary', purpose: 'Stores cookie consent state for Matomo.', expiry: '30 years', type: 'first-party' },

  // Lucky Orange
  { name: '_lo_uid', provider: 'Lucky Orange', category: 'analytics', purpose: 'Lucky Orange unique user identifier.', expiry: '2 years', type: 'first-party' },
  { name: '_lo_v', provider: 'Lucky Orange', category: 'analytics', purpose: 'Lucky Orange visit tracking.', expiry: '1 year', type: 'first-party' },

  // Adobe Analytics
  { name: 's_cc', provider: 'Adobe Analytics', category: 'analytics', purpose: 'Determines whether cookies are enabled in the browser.', expiry: 'Session', type: 'first-party' },
  { name: 's_sq', provider: 'Adobe Analytics', category: 'analytics', purpose: 'Stores information about the previous link clicked.', expiry: 'Session', type: 'first-party' },
  { name: 's_vi', provider: 'Adobe Analytics', category: 'analytics', purpose: 'Unique visitor ID for Adobe Analytics.', expiry: '2 years', type: 'first-party' },
  { name: 's_fid', provider: 'Adobe Analytics', category: 'analytics', purpose: 'Fallback unique visitor ID for Adobe Analytics.', expiry: '5 years', type: 'first-party' },
  { name: 'AMCV_*', pattern: /^AMCV_/, provider: 'Adobe Experience Cloud', category: 'analytics', purpose: 'Unique visitor ID used across Adobe Experience Cloud solutions.', expiry: '2 years', type: 'first-party' },
  { name: 'AMCVS_*', pattern: /^AMCVS_/, provider: 'Adobe Experience Cloud', category: 'analytics', purpose: 'Session flag for Adobe Experience Cloud.', expiry: 'Session', type: 'first-party' },

  // Shopify
  { name: '_shopify_s', provider: 'Shopify', category: 'analytics', purpose: 'Shopify analytics relating to the current session.', expiry: '30 minutes', type: 'first-party' },
  { name: '_shopify_y', provider: 'Shopify', category: 'analytics', purpose: 'Shopify analytics relating to the user.', expiry: '2 years', type: 'first-party' },
  { name: '_shopify_sa_t', provider: 'Shopify', category: 'marketing', purpose: 'Shopify marketing and referral cookie.', expiry: '30 minutes', type: 'first-party' },
  { name: '_shopify_sa_p', provider: 'Shopify', category: 'marketing', purpose: 'Shopify marketing and referral cookie.', expiry: '30 minutes', type: 'first-party' },
  { name: 'cart', provider: 'Shopify', category: 'necessary', purpose: 'Shopify shopping cart token.', expiry: '14 days', type: 'first-party' },
  { name: 'secure_customer_sig', provider: 'Shopify', category: 'necessary', purpose: 'Used with customer login.', expiry: '20 years', type: 'first-party' },

  // WooCommerce
  { name: 'woocommerce_cart_hash', provider: 'WooCommerce', category: 'necessary', purpose: 'Stores a hash of the shopping cart contents.', expiry: 'Session', type: 'first-party' },
  { name: 'woocommerce_items_in_cart', provider: 'WooCommerce', category: 'necessary', purpose: 'Helps WooCommerce determine when cart contents change.', expiry: 'Session', type: 'first-party' },
  { name: 'wp_woocommerce_session_*', pattern: /^wp_woocommerce_session_/, provider: 'WooCommerce', category: 'necessary', purpose: 'Contains a unique code for each customer session.', expiry: '2 days', type: 'first-party' },

  // Salesforce / Pardot
  { name: 'visitor_id*', pattern: /^visitor_id\d+$/, provider: 'Salesforce Pardot', category: 'marketing', purpose: 'Pardot tracking cookie for visitor identification.', expiry: '10 years', type: 'first-party' },
  { name: 'pi_opt_in*', pattern: /^pi_opt_in/, provider: 'Salesforce Pardot', category: 'necessary', purpose: 'Stores visitor opt-in preference.', expiry: '10 years', type: 'first-party' },
  { name: 'pardot', provider: 'Salesforce Pardot', category: 'marketing', purpose: 'Session cookie for Pardot tracking.', expiry: 'Session', type: 'first-party' },

  // Crazy Egg
  { name: 'is_returning', provider: 'Crazy Egg', category: 'analytics', purpose: 'Determines if user is a returning visitor.', expiry: '5 years', type: 'first-party' },
  { name: '_ceir', provider: 'Crazy Egg', category: 'analytics', purpose: 'Crazy Egg analytics cookie for session tracking.', expiry: '5 years', type: 'first-party' },
  { name: 'cebs', provider: 'Crazy Egg', category: 'analytics', purpose: 'Crazy Egg analytics session cookie.', expiry: 'Session', type: 'first-party' },
  { name: '_CEFT', provider: 'Crazy Egg', category: 'analytics', purpose: 'Crazy Egg analytics for tracking page visits.', expiry: '1 year', type: 'first-party' },

  // FullStory
  { name: 'fs_uid', provider: 'FullStory', category: 'analytics', purpose: 'FullStory user identifier for session recordings.', expiry: '1 year', type: 'first-party' },
  { name: '_fs_uid', provider: 'FullStory', category: 'analytics', purpose: 'FullStory user identifier.', expiry: '1 year', type: 'first-party' },

  // Mouseflow
  { name: 'mf_*', pattern: /^mf_/, provider: 'Mouseflow', category: 'analytics', purpose: 'Mouseflow analytics and heatmap tracking.', expiry: '90 days', type: 'first-party' },

  // Consent Management Platforms (more)
  { name: 'euconsent-v2', provider: 'IAB TCF', category: 'necessary', purpose: 'Stores IAB Transparency and Consent Framework consent string.', expiry: '1 year', type: 'first-party' },
  { name: 'OptanonConsent', provider: 'OneTrust', category: 'necessary', purpose: 'Stores consent preferences set by OneTrust.', expiry: '1 year', type: 'first-party' },
  { name: 'OptanonAlertBoxClosed', provider: 'OneTrust', category: 'necessary', purpose: 'Stores when user dismissed the OneTrust cookie banner.', expiry: '1 year', type: 'first-party' },
  { name: 'cookieyes-consent', provider: 'CookieYes', category: 'necessary', purpose: 'Stores consent state for CookieYes.', expiry: '1 year', type: 'first-party' },

  // Common Framework Cookies
  { name: 'connect.sid', provider: 'Express.js', category: 'necessary', purpose: 'Default session identifier for Express.js applications.', expiry: 'Session', type: 'first-party' },
  { name: 'laravel_session', provider: 'Laravel', category: 'necessary', purpose: 'Session identifier for Laravel applications.', expiry: '2 hours', type: 'first-party' },
  { name: 'XSRF-TOKEN', provider: 'Laravel/Angular', category: 'necessary', purpose: 'CSRF protection token.', expiry: '2 hours', type: 'first-party' },
  { name: '_csrf', provider: 'Web Framework', category: 'necessary', purpose: 'Cross-Site Request Forgery prevention token.', expiry: 'Session', type: 'first-party' },
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

export function guessCookieCategory(cookieName: string, cookieDomain?: string, expirySeconds?: number, isThirdParty?: boolean): KnownCookie['category'] {
  const name = cookieName.toLowerCase();
  
  if (cookieDomain) {
    const domain = cookieDomain.toLowerCase().replace(/^\./, '');
    
    if (domain.includes('doubleclick.net') || domain.includes('googlesyndication.com') || 
        domain.includes('googleadservices.com') || domain.includes('facebook.com') || 
        domain.includes('fbcdn.net') || domain.includes('ads-twitter.com') ||
        domain.includes('linkedin.com') || domain.includes('tiktok.com') ||
        domain.includes('snapchat.com') || domain.includes('pinterest.com') ||
        domain.includes('criteo.com') || domain.includes('criteo.net') ||
        domain.includes('outbrain.com') || domain.includes('taboola.com') ||
        domain.includes('adservice.google.com')) {
      return 'marketing';
    }
    
    if (domain.includes('google-analytics.com') || domain.includes('googletagmanager.com') ||
        domain.includes('hotjar.com') || domain.includes('clarity.ms') ||
        domain.includes('heapanalytics.com') || domain.includes('mixpanel.com') ||
        domain.includes('amplitude.com') || domain.includes('segment.com') ||
        domain.includes('fullstory.com') || domain.includes('mouseflow.com') ||
        domain.includes('crazyegg.com') || domain.includes('nr-data.net') ||
        domain.includes('newrelic.com') || domain.includes('sentry.io') ||
        domain.includes('logrocket.com') || domain.includes('chartbeat.com') ||
        domain.includes('scorecardresearch.com')) {
      return 'analytics';
    }
    
    if (domain.includes('intercom.io') || domain.includes('hubspot.com') ||
        domain.includes('zendesk.com') || domain.includes('drift.com') ||
        domain.includes('crisp.chat')) {
      return 'functional';
    }
    
    if (domain.includes('cloudflare.com') || domain.includes('datadome.co') ||
        domain.includes('stripe.com') || domain.includes('recaptcha.net')) {
      return 'necessary';
    }
  }
  
  if (name.includes('session') || name.includes('csrf') || name.includes('xsrf') ||
      name.includes('token') || name.includes('auth') || name.includes('logged_in') ||
      name.includes('connect.sid') || name === 'sid' || name.includes('security') ||
      name.includes('cart') || name.includes('checkout') || name.includes('consent') ||
      name.includes('gdpr') || name.includes('cookie_policy') || name.includes('euconsent') ||
      name.includes('optanon') || name.includes('cookieyes') || name.includes('cc_cookie') ||
      name.startsWith('__cf') || name.startsWith('__stripe') || name.includes('woocommerce')) {
    return 'necessary';
  }
  
  if (name.includes('_fbp') || name.includes('_fbc') || name.includes('_gcl') ||
      name.includes('campaign') || name.includes('utm_') || name.includes('_ttp') ||
      name.includes('_scid') || name.includes('_rdt_') || name.includes('muc_ads') ||
      name.includes('personalization_id') || name.includes('guest_id') ||
      name.includes('li_sugr') || name.includes('usermatchhistory') ||
      name.includes('_pin_') || name.includes('_derived_epik') ||
      name.includes('IDE') || name.includes('NID') || name.includes('ANID') ||
      name.includes('pardot') || name.includes('visitor_id') ||
      (name.includes('ad') && (name.includes('id') || name.includes('track')))) {
    return 'marketing';
  }
  
  if (name.includes('_ga') || name.includes('_gid') || name.includes('_gat') ||
      name.includes('analytics') || name.includes('stat') || name.includes('_hj') ||
      name.includes('_pk_') || name.includes('_clck') || name.includes('_clsk') ||
      name.includes('amplitude') || name.includes('mixpanel') || name.includes('segment') ||
      name.includes('heap') || name.includes('fullstory') || name.includes('fs_uid') ||
      name.includes('mouseflow') || name.includes('mf_') || name.includes('crazyegg') ||
      name.includes('_ceir') || name.includes('_ceft') || name.includes('cebs') ||
      name.includes('__hssc') || name.includes('__hssrc') || name.includes('__hstc') ||
      name.includes('hubspotutk') || name.includes('_lo_') || name.includes('track') ||
      name.includes('s_cc') || name.includes('s_sq') || name.includes('s_vi') ||
      name.includes('amcv_')) {
    return 'analytics';
  }
  
  if (name.includes('pref') || name.includes('setting') || name.includes('lang') ||
      name.includes('language') || name.includes('theme') || name.includes('dark_mode') ||
      name.includes('locale') || name.includes('timezone') || name.includes('currency') ||
      name.includes('region') || name.includes('country') || name.includes('wishlist') ||
      name.includes('recently_viewed') || name.includes('compare') ||
      name.includes('intercom') || name.includes('drift') || name.includes('crisp') ||
      name.includes('zendesk') || name.includes('__zlcmid')) {
    return 'functional';
  }
  
  if (isThirdParty === true) {
    if (expirySeconds !== undefined && expirySeconds > 86400 * 90) {
      return 'marketing';
    }
    return 'analytics';
  }
  
  return 'functional';
}
