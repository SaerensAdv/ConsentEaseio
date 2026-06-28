import { translations, getTranslation } from "@shared/translations";

// These MUST match exactly with translations.en in shared/translations.ts
const englishDefaults = {
  heading: "We value your privacy",
  description: "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
  acceptText: "Accept All",
  rejectText: "Reject All",
  settingsText: "Preferences",
  privacyPolicyText: "Privacy Policy",
  cookiePolicyText: "Cookie Policy",
};

// Common variations of English defaults that should also trigger translation
const englishVariants: Record<string, string[]> = {
  heading: [
    "We value your privacy",
  ],
  description: [
    "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
    "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
    "We use cookies to enhance your browsing experience and analyze site traffic. By clicking \"Accept All\", you consent to our use of cookies.",
    "We use cookies to enhance your browsing experience and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
  ],
  acceptText: ["Accept All", "Accept all"],
  rejectText: ["Reject All", "Reject all", "Decline All", "Decline all"],
  settingsText: ["Preferences", "Settings", "Customize"],
  privacyPolicyText: ["Privacy Policy"],
  cookiePolicyText: ["Cookie Policy"],
};

function isCustomValue(
  configValue: string | null | undefined,
  defaultValue: string,
  fieldName?: string
): boolean {
  if (!configValue) return false;
  if (configValue === defaultValue) return false;
  if (fieldName && englishVariants[fieldName]) {
    const variants = englishVariants[fieldName];
    if (variants.some(variant => configValue === variant)) return false;
  }
  return true;
}

function useTranslationOrCustom(
  configValue: string | null | undefined, 
  translationValue: string, 
  defaultValue: string,
  fieldName?: string
): string {
  if (!configValue) {
    return translationValue;
  }
  
  // Check if the value matches the default
  if (configValue === defaultValue) {
    return translationValue;
  }
  
  // Check if the value matches any known English variant
  if (fieldName && englishVariants[fieldName]) {
    const variants = englishVariants[fieldName];
    if (variants.some(variant => configValue === variant)) {
      return translationValue;
    }
  }
  
  return configValue;
}

export function generateBannerScript(config: any, publicId: string, showBranding: boolean = true, clarityProjectId?: string | null, excludedPaths?: string[] | null, primaryDomain?: string, allowedDomains?: string[] | null): string {
  // Get translations for the configured language
  const lang = config.language || 'en';
  const t = getTranslation(lang);
  
  // Pre-calculate button CSS based on buttonStyle
  const buttonStyle = config.buttonStyle || 'outline';
  const primaryColor = config.primaryColor || '#726CEA';
  const secondaryButtonColor = config.secondaryButtonColor || '#6b7280';
  const buttonShape = config.buttonShape || 'rounded';
  const buttonBorderRadius = buttonShape === 'pill' ? '999px' : buttonShape === 'rounded' ? '8px' : '0';
  
  // Settings button CSS
  const settingsButtonCss = buttonStyle === 'filled' 
    ? `background: ${primaryColor}; color: #fff;`
    : `background: transparent; color: ${secondaryButtonColor};${buttonStyle === 'outline' ? ` border: 1px solid ${primaryColor};` : ''}`;
  
  // Reject button CSS  
  const rejectButtonCss = buttonStyle === 'filled'
    ? `background: ${secondaryButtonColor}; color: #fff;`
    : `background: transparent; color: ${secondaryButtonColor};${buttonStyle === 'outline' ? ` border: 1px solid ${primaryColor};` : ''}`;
  
  // Accept button CSS
  const acceptButtonCss = `background: ${primaryColor}; color: #fff;`;
  
  // Apply translations to text fields, preserving custom values
  const heading = useTranslationOrCustom(config.heading, t.heading, englishDefaults.heading, 'heading');
  const description = useTranslationOrCustom(config.description, t.description, englishDefaults.description, 'description');
  const acceptText = useTranslationOrCustom(config.acceptText, t.acceptText, englishDefaults.acceptText, 'acceptText');
  const rejectText = useTranslationOrCustom(config.rejectText, t.rejectText, englishDefaults.rejectText, 'rejectText');
  const settingsText = useTranslationOrCustom(config.settingsText, t.settingsText, englishDefaults.settingsText, 'settingsText');
  const privacyPolicyText = useTranslationOrCustom(config.privacyPolicyText, t.privacyPolicyText, englishDefaults.privacyPolicyText, 'privacyPolicyText');
  const cookiePolicyText = useTranslationOrCustom(config.cookiePolicyText, t.cookiePolicyText, englishDefaults.cookiePolicyText, 'cookiePolicyText');
  
  const customizedFields: string[] = [];
  const fieldsToTrack = ['heading', 'description', 'acceptText', 'rejectText', 'settingsText', 'privacyPolicyText', 'cookiePolicyText'] as const;
  for (const field of fieldsToTrack) {
    if (isCustomValue(config[field], englishDefaults[field], field)) {
      customizedFields.push(field);
    }
  }
  
  // Prioritize custom domain (consentease.io) if available
  let apiBaseUrl = 'https://consentease.io';
  
  if (process.env.REPLIT_DOMAINS) {
    const domains = process.env.REPLIT_DOMAINS.split(',');
    // Look for custom domain first (not .replit.app)
    const customDomain = domains.find(d => !d.includes('.replit.app') && !d.includes('replit.dev'));
    if (customDomain) {
      apiBaseUrl = `https://${customDomain}`;
    } else {
      apiBaseUrl = `https://${domains[0]}`;
    }
  } else if (process.env.REPLIT_DEV_DOMAIN) {
    apiBaseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }

  const script = `
(function() {
  'use strict';
  
  var API_BASE = "${apiBaseUrl}";
  
  // Auto-detect language if enabled
  function detectLanguage() {
    if (!${config.autoDetectLanguage ?? false}) return '${lang}';
    var browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0].toLowerCase();
    var supportedLangs = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'ar', 'he'];
    return supportedLangs.indexOf(browserLang) !== -1 ? browserLang : '${lang}';
  }
  var detectedLang = detectLanguage();
  
  var CONFIG = ${JSON.stringify({
    publicId,
    heading,
    description,
    acceptText,
    rejectText,
    settingsText,
    position: config.position,
    primaryColor: config.primaryColor,
    backgroundColor: config.backgroundColor,
    textColor: config.textColor,
    borderRadius: config.borderRadius,
    showIcon: config.showIcon,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
    shadow: config.shadow,
    backdropBlur: config.backdropBlur,
    animation: config.animation,
    buttonStyle: config.buttonStyle,
    buttonShape: config.buttonShape,
    showBranding: showBranding,
    borderColor: config.borderColor ?? '#e5e7eb',
    borderWidth: config.borderWidth ?? 1,
    secondaryButtonColor: config.secondaryButtonColor ?? '#6b7280',
    maxWidth: config.maxWidth ?? 400,
    showOverlay: config.showOverlay ?? false,
    overlayOpacity: config.overlayOpacity ?? 50,
    logoUrl: config.logoUrl,
    displayDelay: config.displayDelay ?? 0,
    autoHideDelay: config.autoHideDelay ?? 0,
    showCloseButton: config.showCloseButton ?? false,
    reconsentDays: config.reconsentDays ?? 365,
    respectDnt: config.respectDnt ?? false,
    privacyPolicyUrl: config.privacyPolicyUrl,
    privacyPolicyText,
    cookiePolicyUrl: config.cookiePolicyUrl,
    cookiePolicyText,
    customFooter: config.customFooter,
    language: lang,
    excludedPaths: excludedPaths || [],
    buttonLayout: config.buttonLayout ?? 'auto',
    autoDetectLanguage: config.autoDetectLanguage ?? false,
    headingFontSize: config.headingFontSize ?? 'medium',
    descriptionFontSize: config.descriptionFontSize ?? 'medium',
    fontWeight: config.fontWeight ?? 'medium',
    direction: t.direction ?? 'ltr',
    showRevisitButton: config.showRevisitButton ?? true,
    revisitButtonPosition: config.revisitButtonPosition ?? 'bottom-left',
    revisitButtonColor: config.revisitButtonColor ?? config.primaryColor ?? '#726CEA',
    revisitButtonLogoUrl: config.revisitButtonLogoUrl ?? null,
    revisitButtonShape: config.revisitButtonShape ?? 'circle',
    customizedFields: customizedFields,
    primaryDomain: primaryDomain || '',
    allowedDomains: allowedDomains || [],
  })};
  
  var ALL_TRANSLATIONS = ${JSON.stringify(translations)};
  var TRANSLATIONS = ALL_TRANSLATIONS[detectedLang] || ALL_TRANSLATIONS['${lang}'] || ALL_TRANSLATIONS.en;
  if (TRANSLATIONS.direction) CONFIG.direction = TRANSLATIONS.direction;
  var CONSENT_KEY = 'ce_consent_' + CONFIG.publicId;
  
  // Check if current page/subdomain should be excluded from analytics
  function isExcludedPath() {
    if (!CONFIG.excludedPaths || CONFIG.excludedPaths.length === 0) return false;
    var currentPath = window.location.pathname;
    var currentHost = window.location.hostname;
    
    for (var i = 0; i < CONFIG.excludedPaths.length; i++) {
      var pattern = CONFIG.excludedPaths[i].trim();
      if (!pattern) continue;
      
      // Check for subdomain pattern (contains a dot but no slash)
      if (pattern.indexOf('.') !== -1 && pattern.indexOf('/') === -1) {
        if (currentHost.indexOf(pattern) !== -1) return true;
      }
      // Check for path pattern (starts with /)
      else if (pattern.indexOf('/') === 0) {
        if (currentPath.indexOf(pattern) === 0) return true;
      }
      // Check for partial path match
      else {
        if (currentPath.indexOf(pattern) !== -1 || currentHost.indexOf(pattern) !== -1) return true;
      }
    }
    return false;
  }
  
  // XSS protection: escape HTML entities
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Safe URL validation
  function isSafeUrl(url) {
    if (!url) return false;
    try {
      var parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (e) {
      return false;
    }
  }
  var categories = [];
  var CLARITY_ID = ${clarityProjectId ? `"${clarityProjectId}"` : 'null'};
  var clarityInjected = false;
  
  // Inject Microsoft Clarity only when analytics consent is granted
  function injectClarityIfConsented(consent) {
    if (!CLARITY_ID || clarityInjected) return;
    
    // Check if analytics or marketing consent is granted
    var hasAnalyticsConsent = false;
    if (typeof consent === 'string') {
      hasAnalyticsConsent = consent === 'accept';
    } else if (typeof consent === 'object' && consent !== null) {
      hasAnalyticsConsent = consent.analytics === true || consent.marketing === true;
    }
    
    if (!hasAnalyticsConsent) return;
    
    clarityInjected = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }
  
  // Check if user already consented and inject Clarity if appropriate
  var existingConsentForClarity = getStoredConsent();
  if (existingConsentForClarity) {
    injectClarityIfConsented(existingConsentForClarity);
  }
  
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() { window.dataLayer.push(arguments); };
  }
  var gtag = window.gtag;
  
  // Google Consent Mode v2: Set default consent BEFORE any tags fire
  // This is CRITICAL - must be called before gtag/GTM loads
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  
  
  function getStoredConsent() {
    try {
      // Try localStorage first
      var stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        var data = JSON.parse(stored);
        if (data.expires > Date.now()) {
          return data.consent;
        }
      }
      
      // Fallback to cross-domain cookie (for Shopify checkout)
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(CONSENT_KEY + '=') === 0) {
          var cookieData = JSON.parse(decodeURIComponent(cookie.substring(CONSENT_KEY.length + 1)));
          if (cookieData.expires > Date.now()) {
            // Sync back to localStorage
            localStorage.setItem(CONSENT_KEY, JSON.stringify(cookieData));
            return cookieData.consent;
          }
        }
      }
    } catch (e) {}
    return null;
  }
  
  function storeConsent(consent) {
    try {
      var reconsentMs = CONFIG.reconsentDays * 24 * 60 * 60 * 1000;
      var consentData = JSON.stringify({
        consent: consent,
        expires: Date.now() + reconsentMs
      });
      localStorage.setItem(CONSENT_KEY, consentData);
      
      // Cross-domain cookie for Shopify checkout compatibility
      var domain = getRootDomain();
      document.cookie = CONSENT_KEY + '=' + encodeURIComponent(consentData) + 
        ';path=/;max-age=' + Math.floor(reconsentMs / 1000) + 
        ';domain=' + domain + ';SameSite=Lax;Secure';
    } catch (e) {}
    
    // Sync to all platform consent APIs
    syncToPlatforms(consent);
  }
  
  function getRootDomain() {
    var parts = window.location.hostname.split('.');
    if (parts.length > 2) {
      return '.' + parts.slice(-2).join('.');
    }
    return '.' + window.location.hostname;
  }
  
  function syncToShopify(consent) {
    if (!window.Shopify) return;
    
    function doShopifySync() {
      if (window.Shopify.customerPrivacy && 
          typeof window.Shopify.customerPrivacy.setTrackingConsent === 'function') {
        try {
          window.Shopify.customerPrivacy.setTrackingConsent({
            marketing: consent.marketing === true,
            analytics: consent.analytics === true,
            preferences: consent.functional === true,
            sale_of_data: consent.marketing === true
          }, function(error) {
            if (error) {
              console.warn('ConsentEase: Shopify sync error:', error);
            }
          });
        } catch (e) {
          console.warn('ConsentEase: Failed to sync with Shopify:', e);
        }
      }
    }
    
    // Try loading Shopify's consent tracking API first
    if (typeof window.Shopify.loadFeatures === 'function') {
      try {
        window.Shopify.loadFeatures(
          [{ name: 'consent-tracking-api', version: '0.1' }],
          function(error) {
            if (!error) {
              doShopifySync();
            } else {
              // Fallback: try direct API call
              doShopifySync();
            }
          }
        );
      } catch (e) {
        // Fallback: try direct API call without loadFeatures
        doShopifySync();
      }
    } else {
      doShopifySync();
    }
  }
  
  function syncToWix(consent) {
    // Wix Consent Policy API integration
    if (window.Wix && window.Wix.Utils) {
      // Wix SDK environment (Velo)
      try {
        if (typeof window.consentPolicy !== 'undefined' && 
            typeof window.consentPolicy.setConsentPolicy === 'function') {
          window.consentPolicy.setConsentPolicy({
            essential: true,
            functional: consent.functional === true,
            analytics: consent.analytics === true,
            advertising: consent.marketing === true,
            dataToThirdParty: consent.marketing === true
          });
        }
      } catch (e) {
        console.warn('ConsentEase: Failed to sync with Wix:', e);
      }
    }
    
    // Also check for Wix window-level consent policy (non-Velo)
    if (window.consentPolicyManager && 
        typeof window.consentPolicyManager.setConsentPolicy === 'function') {
      try {
        window.consentPolicyManager.setConsentPolicy({
          essential: true,
          functional: consent.functional === true,
          analytics: consent.analytics === true,
          advertising: consent.marketing === true,
          dataToThirdParty: consent.marketing === true
        });
      } catch (e) {
        console.warn('ConsentEase: Failed to sync with Wix consent manager:', e);
      }
    }
  }
  
  function syncToWordPress(consent) {
    // WordPress Consent API integration
    // Set consent cookies in the format WP Consent API expects
    try {
      var consentTypes = {
        'functional': consent.functional === true ? 'allow' : 'deny',
        'statistics': consent.analytics === true ? 'allow' : 'deny',
        'statistics-anonymous': consent.analytics === true ? 'allow' : 'deny',
        'marketing': consent.marketing === true ? 'allow' : 'deny',
        'preferences': consent.functional === true ? 'allow' : 'deny'
      };
      
      // Set WP Consent API cookies
      for (var type in consentTypes) {
        document.cookie = 'wp_consent_' + type + '=' + consentTypes[type] + 
          ';path=/;max-age=' + (CONFIG.reconsentDays * 86400) + ';SameSite=Lax';
      }
      
      // Dispatch WordPress consent change event — only when the WP Consent API
      // has fully initialised (wp_consent_categories must exist). Firing this
      // event before the API is ready crashes wp-consent-api.mjs because it
      // tries to read wp_consent_categories[key] which is still undefined.
      if (typeof document.dispatchEvent === 'function' && typeof window.wp_consent_categories !== 'undefined') {
        document.dispatchEvent(new Event('wp_listen_for_consent_change'));
        
        // Also fire the more specific event with consent data
        try {
          document.dispatchEvent(new CustomEvent('wp_consent_type_change', {
            detail: consentTypes
          }));
        } catch (e) {}
      }
      
      // Call WP Consent API function if available
      if (typeof window.wp_set_consent === 'function') {
        for (var wpType in consentTypes) {
          window.wp_set_consent(wpType, consentTypes[wpType]);
        }
      }
    } catch (e) {
      console.warn('ConsentEase: Failed to sync with WordPress:', e);
    }
  }
  
  function syncToPlatforms(consent) {
    syncToShopify(consent);
    syncToWix(consent);
    syncToWordPress(consent);
  }
  
  function shouldRespectDNT() {
    if (!CONFIG.respectDnt) return false;
    var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === '1' || dnt === 'yes';
  }
  
  function getVisitorId() {
    var key = 'ce_visitor_' + CONFIG.publicId;
    var stored = localStorage.getItem(key);
    if (stored) return stored;
    var id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, id);
    return id;
  }
  
  var geoData = null;
  var webVitals = { lcp: null, cls: null, inp: null, fcp: null, ttfb: null };
  var bannerShownTime = null;
  var bannerInteractionTime = null;
  
  // Web Vitals measurement functions
  function measureWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        var lcpObserver = new PerformanceObserver(function(list) {
          var entries = list.getEntries();
          if (entries.length > 0) {
            webVitals.lcp = Math.round(entries[entries.length - 1].startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // First Contentful Paint (FCP)
        var fcpObserver = new PerformanceObserver(function(list) {
          var entries = list.getEntries();
          entries.forEach(function(entry) {
            if (entry.name === 'first-contentful-paint') {
              webVitals.fcp = Math.round(entry.startTime);
            }
          });
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
        
        // Cumulative Layout Shift (CLS)
        var clsValue = 0;
        var clsObserver = new PerformanceObserver(function(list) {
          list.getEntries().forEach(function(entry) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              webVitals.cls = Math.round(clsValue * 1000) / 1000;
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Interaction to Next Paint (INP)
        var inpValue = 0;
        var inpObserver = new PerformanceObserver(function(list) {
          list.getEntries().forEach(function(entry) {
            if (entry.duration > inpValue) {
              inpValue = entry.duration;
              webVitals.inp = Math.round(inpValue);
            }
          });
        });
        inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
      } catch (e) {}
      
      // Time to First Byte (TTFB)
      try {
        var navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
          webVitals.ttfb = Math.round(navEntry.responseStart);
        }
      } catch (e) {}
    }
  }
  
  // Vitals dedupe guard: visibilitychange + pagehide + the timeout fallback
  // could each fire reportWebVitals for the same page load, which previously
  // produced 2-3x inflation in the vitals table. We send exactly once per page.
  var vitalsReported = false;

  function reportWebVitals() {
    if (vitalsReported) return;
    // Skip analytics for excluded paths/subdomains
    if (isExcludedPath()) return;

    // Only report if we have meaningful data. Use == null (catches null +
    // undefined) instead of !value so that legitimate "0" measurements
    // (cls=0 is a perfect score, inp=0 means no interaction yet) still count
    // as data worth sending. Previously a single-page visit with cls=0 and
    // pagehide before LCP captured would be silently dropped.
    if (webVitals.lcp == null && webVitals.cls == null && webVitals.inp == null) return;

    vitalsReported = true;

    var bannerDelay = bannerInteractionTime && bannerShownTime
      ? bannerInteractionTime - bannerShownTime
      : null;

    var payload = JSON.stringify({
      websiteId: CONFIG.publicId,
      lcp: webVitals.lcp,
      cls: webVitals.cls,
      inp: webVitals.inp,
      fcp: webVitals.fcp,
      ttfb: webVitals.ttfb,
      bannerDelay: bannerDelay
      // country is intentionally omitted: the server derives it from the
      // request IP so it cannot be spoofed by the client.
    });

    // sendBeacon is the only reliable way to deliver a POST during page unload
    // — fetch() gets aborted on pagehide in most browsers. We fall back to
    // fetch with keepalive when sendBeacon is not available or returns false.
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        var blob = new Blob([payload], { type: 'text/plain' });
        if (navigator.sendBeacon(API_BASE + '/api/analytics/vitals', blob)) {
          return;
        }
      }
      fetch(API_BASE + '/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      });
    } catch (e) {}
  }

  // Start measuring immediately
  measureWebVitals();

  // Report vitals when the page is actually going away (pagehide is the
  // canonical unload event modern browsers fire reliably). We also keep the
  // visibilitychange and timeout as belt-and-braces; the dedupe guard above
  // ensures only one POST is sent regardless of which fires first.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        reportWebVitals();
      }
    });
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', reportWebVitals);
    }
    setTimeout(reportWebVitals, 60000);
  }
  
  function trackEvent(eventType) {
    // Skip analytics for excluded paths/subdomains.
    if (isExcludedPath()) return;

    // B9: stripped the "details" field (was JSON-stringified consent choices);
    // the server has never persisted it and accepting arbitrary client payload
    // on a public endpoint is asking for log bloat or worse. Consent choices
    // already go to /api/consent/log with proper validation.
    // B4: stripped the "country" field — server derives it from request IP,
    // anything the client sends is ignored or actively distrusted.
    try {
      fetch(API_BASE + '/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: CONFIG.publicId,
          eventType: eventType
        })
      });
    } catch (e) {}
  }
  
  function fetchWithTimeout(url, options, timeoutMs) {
    return new Promise(function(resolve, reject) {
      var timer = setTimeout(function() {
        reject(new Error('Request timed out after ' + timeoutMs + 'ms'));
      }, timeoutMs);
      fetch(url, options).then(function(res) {
        clearTimeout(timer);
        resolve(res);
      }).catch(function(err) {
        clearTimeout(timer);
        reject(err);
      });
    });
  }
  
  function fetchGeoLocation() {
    return fetchWithTimeout(API_BASE + '/api/geo', {}, 5000)
      .then(function(res) { 
        if (!res.ok) {
          throw new Error('Geo lookup failed with status ' + res.status);
        }
        return res.json(); 
      })
      .then(function(data) {
        geoData = data;
        return data;
      })
      .catch(function(err) { 
        console.warn('ConsentEase: Geo lookup failed (' + (err.message || 'network error') + '). Defaulting to GDPR.');
        geoData = { 
          jurisdiction: 'gdpr', 
          country: 'Unknown',
          countryCode: 'XX',
          isEU: true,
          flag: '',
          languages: [],
          config: {
            rejectText: 'Reject All',
            legalBasis: 'GDPR'
          }
        };
        return geoData;
      });
  }
  
  // Get preferred language based on geo and browser
  function getPreferredLanguage() {
    // First check browser language
    var browserLang = navigator.language || navigator.userLanguage;
    if (browserLang) {
      var langCode = browserLang.split('-')[0].toLowerCase();
      return langCode;
    }
    // Fall back to geo-detected language
    if (geoData && geoData.languages && geoData.languages.length > 0) {
      return geoData.languages[0].toLowerCase().split(' ')[0];
    }
    return 'en';
  }
  
  function logConsentProof(action, consentChoices) {
    try {
      // Calculate GCM signal values for audit trail
      var gcmSignals = {};
      if (typeof consentChoices === 'object' && consentChoices !== null) {
        gcmSignals = {
          ad_storage: consentChoices.marketing ? 'granted' : 'denied',
          ad_user_data: consentChoices.marketing ? 'granted' : 'denied',
          ad_personalization: consentChoices.marketing ? 'granted' : 'denied',
          analytics_storage: consentChoices.analytics ? 'granted' : 'denied',
          functionality_storage: consentChoices.functional ? 'granted' : 'denied',
          personalization_storage: consentChoices.functional ? 'granted' : 'denied',
          security_storage: 'granted'
        };
      } else if (typeof consentChoices === 'string') {
        var grantAll = consentChoices === 'accept';
        gcmSignals = {
          ad_storage: grantAll ? 'granted' : 'denied',
          ad_user_data: grantAll ? 'granted' : 'denied',
          ad_personalization: grantAll ? 'granted' : 'denied',
          analytics_storage: grantAll ? 'granted' : 'denied',
          functionality_storage: grantAll ? 'granted' : 'denied',
          personalization_storage: grantAll ? 'granted' : 'denied',
          security_storage: 'granted'
        };
      }
      
      fetch(API_BASE + '/api/consent/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: CONFIG.publicId,
          visitorId: getVisitorId(),
          action: action,
          consentChoices: consentChoices,
          gcmSignals: gcmSignals,
          bannerVersion: '1.0',
          policyVersion: null
        })
      });
    } catch (e) {}
  }
  
  function updateGoogleConsent(consent) {
    var consentUpdate = {
      'security_storage': 'granted'
    };
    
    if (typeof consent === 'string') {
      var grantAll = consent === 'accept';
      consentUpdate['ad_storage'] = grantAll ? 'granted' : 'denied';
      consentUpdate['ad_user_data'] = grantAll ? 'granted' : 'denied';
      consentUpdate['ad_personalization'] = grantAll ? 'granted' : 'denied';
      consentUpdate['analytics_storage'] = grantAll ? 'granted' : 'denied';
      consentUpdate['functionality_storage'] = grantAll ? 'granted' : 'denied';
      consentUpdate['personalization_storage'] = grantAll ? 'granted' : 'denied';
    } else if (typeof consent === 'object') {
      consentUpdate['ad_storage'] = consent.marketing ? 'granted' : 'denied';
      consentUpdate['ad_user_data'] = consent.marketing ? 'granted' : 'denied';
      consentUpdate['ad_personalization'] = consent.marketing ? 'granted' : 'denied';
      consentUpdate['analytics_storage'] = consent.analytics ? 'granted' : 'denied';
      consentUpdate['functionality_storage'] = consent.functional ? 'granted' : 'denied';
      consentUpdate['personalization_storage'] = consent.functional ? 'granted' : 'denied';
    }
    
    gtag('consent', 'update', consentUpdate);
    
    // Inject Clarity if consent was granted
    injectClarityIfConsented(consent);
    
    window.dispatchEvent(new CustomEvent('consentEaseUpdate', {
      detail: { consent: consent }
    }));
  }
  
  var existingConsent = getStoredConsent();
  if (existingConsent) {
    updateGoogleConsent(existingConsent);
  }
  
  function fetchCategories() {
    return fetchWithTimeout(API_BASE + '/api/consent/' + CONFIG.publicId + '/categories', {}, 5000)
      .then(function(res) { 
        if (!res.ok) {
          throw new Error('Categories fetch failed with status ' + res.status);
        }
        return res.json(); 
      })
      .then(function(data) { 
        categories = data.filter(function(c) { return c.isEnabled; });
        return categories;
      })
      .catch(function(err) { 
        console.warn('ConsentEase: Failed to load cookie categories (' + (err.message || 'network error') + '). Banner will show without category details.');
        return []; 
      });
  }
  
  function injectStyles() {
    if (document.getElementById('ce-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'ce-banner-styles';
    style.textContent = \`
      .ce-banner-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        font-family: \${CONFIG.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: \${CONFIG.fontSize === 'small' ? '13px' : CONFIG.fontSize === 'large' ? '16px' : '14px'};
        \${CONFIG.position === 'center' ? 'background: rgba(0,0,0,0.4);' : 'pointer-events: none;'}
        \${CONFIG.backdropBlur && CONFIG.position === 'center' ? 'backdrop-filter: blur(4px);' : ''}
        display: flex;
        \${CONFIG.position === 'bottom' || CONFIG.position === 'bottom-bar' ? 'align-items: flex-end;' : ''}
        \${CONFIG.position === 'bottom-left' ? 'align-items: flex-end; justify-content: flex-start; padding: 16px;' : ''}
        \${CONFIG.position === 'bottom-right' ? 'align-items: flex-end; justify-content: flex-end; padding: 16px;' : ''}
        \${CONFIG.position === 'center' ? 'align-items: center; justify-content: center; padding: 16px;' : ''}
        \${CONFIG.position === 'top-bar' ? 'align-items: flex-start;' : ''}
      }
      .ce-banner {
        background: \${CONFIG.backdropBlur ? CONFIG.backgroundColor + 'dd' : CONFIG.backgroundColor};
        color: \${CONFIG.textColor};
        border-radius: \${CONFIG.position === 'bottom' || CONFIG.position === 'bottom-bar' || CONFIG.position === 'top-bar' ? '0' : CONFIG.borderRadius + 'px'};
        box-shadow: \${CONFIG.shadow === 'none' ? 'none' : CONFIG.shadow === 'small' ? '0 4px 12px rgba(0,0,0,0.08)' : CONFIG.shadow === 'medium' ? '0 8px 30px rgba(0,0,0,0.12)' : '0 25px 50px rgba(0,0,0,0.25)'};
        \${CONFIG.backdropBlur ? 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' : ''}
        \${CONFIG.position === 'bottom' || CONFIG.position === 'bottom-bar' || CONFIG.position === 'top-bar' ? 'width: 100%;' : 'max-width: ' + CONFIG.maxWidth + 'px;'}
        border: \${CONFIG.borderWidth}px solid \${CONFIG.borderColor};
        animation: ce-slide-in 0.4s ease-out;
        pointer-events: auto;
      }
      @keyframes ce-slide-in {
        from {
          opacity: 0;
          \${CONFIG.animation === 'slide-up' ? 'transform: translateY(20px);' : ''}
          \${CONFIG.animation === 'slide-down' ? 'transform: translateY(-20px);' : ''}
          \${CONFIG.animation === 'zoom' ? 'transform: scale(0.9);' : ''}
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .ce-banner-content { padding: 20px; display: flex; flex-direction: column; gap: 16px; overflow: hidden; word-wrap: break-word; }
      .ce-banner-header { display: flex; align-items: flex-start; gap: 12px; }
      .ce-banner-icon { width: 40px; height: 40px; border-radius: 8px; background: \${CONFIG.primaryColor}15; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
      .ce-banner-icon img { width: 24px; height: 24px; object-fit: contain; }
      .ce-banner-text h3 { margin: 0 0 4px 0; font-size: \${CONFIG.headingFontSize === 'small' ? '1em' : CONFIG.headingFontSize === 'large' ? '1.3em' : '1.1em'}; font-weight: \${CONFIG.fontWeight === 'normal' ? '500' : CONFIG.fontWeight === 'semibold' ? '700' : '600'}; word-break: break-word; overflow-wrap: break-word; }
      .ce-banner-text p { margin: 0; opacity: 0.8; line-height: 1.5; font-size: \${CONFIG.descriptionFontSize === 'small' ? '0.85em' : CONFIG.descriptionFontSize === 'large' ? '1.05em' : '0.95em'}; word-break: break-word; overflow-wrap: break-word; }
      .ce-banner-buttons { display: flex; gap: 8px; justify-content: flex-end; \${CONFIG.buttonLayout === 'stacked' ? 'flex-direction: column;' : 'flex-wrap: nowrap;'} }
      .ce-btn { padding: 8px 16px; font-size: 0.9em; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; border-radius: ${buttonBorderRadius}; white-space: nowrap; }
      .ce-btn-settings { ${settingsButtonCss} }
      .ce-btn-reject { ${rejectButtonCss} }
      .ce-btn-accept { ${acceptButtonCss} }
      .ce-btn:hover { opacity: 0.9; }
      \${CONFIG.buttonLayout === 'stacked' ? '.ce-btn { width: 100%; text-align: center; }' : ''}
      @media (max-width: 480px) {
        .ce-banner-content { padding: 14px; gap: 10px; }
        .ce-banner-header { flex-direction: column; }
        \${CONFIG.buttonLayout === 'auto' ? '.ce-banner-buttons { flex-direction: column; } .ce-btn { width: 100%; text-align: center; }' : '.ce-banner-buttons { gap: 6px; flex-wrap: wrap; } .ce-btn { padding: 8px 12px; font-size: 0.85em; text-align: center; min-width: fit-content; }'}
        .ce-prefs-footer { flex-direction: column; } .ce-prefs-footer .ce-btn { width: 100%; text-align: center; }
      }
      .ce-branding { padding: 10px 20px 12px; display: flex; justify-content: center; border-top: 1px solid rgba(0,0,0,0.05); }
      .ce-branding a { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 6px; border-radius: 6px; background: rgba(114,108,234,0.08); color: #726CEA; text-decoration: none; font-size: 11px; font-weight: 500; transition: background 0.2s, transform 0.15s; }
      .ce-branding a:hover { background: rgba(114,108,234,0.15); transform: translateY(-1px); }
      .ce-branding svg { flex-shrink: 0; }
      
      .ce-prefs-overlay { position: fixed; inset: 0; z-index: 1000000; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
      .ce-prefs-modal { background: \${CONFIG.backgroundColor}; color: \${CONFIG.textColor}; border-radius: \${CONFIG.borderRadius}px; max-width: 500px; width: 100%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: ce-slide-in 0.3s ease-out; }
      .ce-prefs-header { padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.1); }
      .ce-prefs-header h3 { margin: 0 0 4px 0; font-size: 1.2em; font-weight: 600; }
      .ce-prefs-header p { margin: 0; opacity: 0.7; font-size: 0.9em; }
      .ce-prefs-body { flex: 1; overflow-y: auto; padding: 0; }
      .ce-prefs-category { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); }
      .ce-prefs-category:last-child { border-bottom: none; }
      .ce-prefs-cat-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
      .ce-prefs-cat-name { font-weight: 600; display: flex; align-items: center; gap: 8px; }
      .ce-prefs-cat-name .ce-required { background: \${CONFIG.primaryColor}20; color: \${CONFIG.primaryColor}; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 500; }
      .ce-prefs-cat-desc { opacity: 0.7; font-size: 0.85em; line-height: 1.4; }
      .ce-prefs-cookies { margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(0,0,0,0.1); }
      .ce-prefs-cookies-title { font-size: 0.75em; text-transform: uppercase; opacity: 0.5; margin-bottom: 8px; letter-spacing: 0.5px; }
      .ce-prefs-cookie { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85em; }
      .ce-prefs-cookie-name { font-family: monospace; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; }
      .ce-prefs-cookie-expiry { opacity: 0.5; }
      .ce-prefs-footer { padding: 16px 20px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
      
      .ce-toggle { position: relative; width: 44px; height: 24px; background: rgba(0,0,0,0.2); border-radius: 12px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
      .ce-toggle.active { background: \${CONFIG.primaryColor}; }
      .ce-toggle.disabled { opacity: 0.5; cursor: not-allowed; }
      .ce-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .ce-toggle.active::after { transform: translateX(20px); }
      
      .ce-revisit-btn { position: fixed; z-index: 999997; width: 40px; height: 40px; border-radius: \${CONFIG.revisitButtonShape === 'circle' ? '50%' : CONFIG.revisitButtonShape === 'rounded' ? '8px' : '0'}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s, box-shadow 0.2s; background: \${CONFIG.revisitButtonColor}; color: #fff; }
      .ce-revisit-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
      .ce-revisit-btn svg { width: 20px; height: 20px; }
      \${CONFIG.revisitButtonPosition === 'bottom-left' ? '.ce-revisit-btn { bottom: 16px; left: 16px; }' : '.ce-revisit-btn { bottom: 16px; right: 16px; }'}
      @keyframes ce-revisit-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
    \`;
    document.head.appendChild(style);
  }
  
  function createBanner() {
    var overlay = document.createElement('div');
    overlay.className = 'ce-banner-overlay';
    overlay.setAttribute('dir', CONFIG.direction);
    overlay.setAttribute('data-nosnippet', '');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cookie consent');
    overlay.id = 'ce-consent-banner';
    
    var banner = document.createElement('div');
    banner.className = 'ce-banner';
    
    // Use geo-based config if available, otherwise fall back to user config
    var geoConfig = geoData && geoData.config ? geoData.config : {};
    var heading = CONFIG.customizedFields.indexOf('heading') === -1 ? (TRANSLATIONS.heading || CONFIG.heading) : CONFIG.heading;
    var description = CONFIG.customizedFields.indexOf('description') === -1 ? (TRANSLATIONS.description || CONFIG.description) : CONFIG.description;
    var acceptText = CONFIG.customizedFields.indexOf('acceptText') === -1 ? (TRANSLATIONS.acceptText || CONFIG.acceptText) : CONFIG.acceptText;
    var rejectText = CONFIG.customizedFields.indexOf('rejectText') === -1 ? (TRANSLATIONS.rejectText || CONFIG.rejectText) : CONFIG.rejectText;
    var settingsText = CONFIG.customizedFields.indexOf('settingsText') === -1 ? (TRANSLATIONS.settingsText || CONFIG.settingsText) : CONFIG.settingsText;
    var privacyPolicyText = CONFIG.customizedFields.indexOf('privacyPolicyText') === -1 ? (TRANSLATIONS.privacyPolicyText || CONFIG.privacyPolicyText) : CONFIG.privacyPolicyText;
    var cookiePolicyText = CONFIG.customizedFields.indexOf('cookiePolicyText') === -1 ? (TRANSLATIONS.cookiePolicyText || CONFIG.cookiePolicyText) : CONFIG.cookiePolicyText;
    
    // Add jurisdiction badge with flag if detected
    var jurisdictionBadge = '';
    if (geoData && geoData.jurisdiction && geoData.jurisdiction !== 'none') {
      var flag = geoData.flag || '';
      var badgeText = geoData.jurisdiction === 'gdpr' ? 'GDPR' : geoData.jurisdiction === 'ccpa' ? 'CCPA' : 'GDPR & CCPA';
      jurisdictionBadge = '<span style="display:inline-block;background:' + CONFIG.primaryColor + '20;color:' + CONFIG.primaryColor + ';font-size:10px;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:500;">' + (flag ? flag + ' ' : '') + badgeText + '</span>';
    }
    
    var defaultLogoUrl = API_BASE + '/favicon.png';
    var iconHtml = '';
    if (CONFIG.showIcon) {
      var logoSrc = CONFIG.logoUrl ? (CONFIG.logoUrl.indexOf('/') === 0 ? API_BASE + CONFIG.logoUrl : CONFIG.logoUrl) : defaultLogoUrl;
      iconHtml = '<div class="ce-banner-icon"><img src="' + logoSrc + '" alt="Logo" style="width:24px;height:24px;object-fit:contain;" /></div>';
    }
    
    var logoHtml = '';
    
    var closeButtonHtml = CONFIG.showCloseButton ? \`
      <button class="ce-close-btn" aria-label="Close" style="position:absolute;top:8px;right:8px;background:transparent;border:none;cursor:pointer;padding:4px;opacity:0.5;transition:opacity 0.2s;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    \` : '';
    
    var policyLinksHtml = '';
    if (CONFIG.privacyPolicyUrl || CONFIG.cookiePolicyUrl) {
      var links = [];
      if (CONFIG.privacyPolicyUrl && isSafeUrl(CONFIG.privacyPolicyUrl)) {
        links.push('<a href="' + escapeHtml(CONFIG.privacyPolicyUrl) + '" target="_blank" rel="noopener nofollow" style="color:' + escapeHtml(CONFIG.primaryColor) + ';text-decoration:underline;">' + escapeHtml(privacyPolicyText) + '</a>');
      }
      if (CONFIG.cookiePolicyUrl && isSafeUrl(CONFIG.cookiePolicyUrl)) {
        links.push('<a href="' + escapeHtml(CONFIG.cookiePolicyUrl) + '" target="_blank" rel="noopener nofollow" style="color:' + escapeHtml(CONFIG.primaryColor) + ';text-decoration:underline;">' + escapeHtml(cookiePolicyText) + '</a>');
      }
      policyLinksHtml = '<div style="font-size:0.75em;margin-top:8px;opacity:0.7;">' + links.join(' • ') + '</div>';
    }
    
    var customFooterHtml = CONFIG.customFooter ? \`
      <div style="font-size:0.75em;margin-top:8px;opacity:0.7;">\${escapeHtml(CONFIG.customFooter)}</div>
    \` : '';
    
    var brandingHtml = CONFIG.showBranding ? \`
      <div class="ce-branding">
        <a href="https://consentease.io/powered-by?utm_source=banner&utm_medium=branding&utm_campaign=powered_by" target="_blank" rel="noopener nofollow noindex">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#726CEA"/><text x="8" y="11.5" text-anchor="middle" fill="#fff" font-size="10" font-weight="700" font-family="Arial,sans-serif">C</text></svg>
          <span style="display:flex;flex-direction:column;line-height:1.1;"><span style="font-size:8px;opacity:0.7;">Powered by</span><span>ConsentEase</span></span>
        </a>
      </div>
    \` : '';
    
    // Apply custom border styling
    banner.style.border = CONFIG.borderWidth + 'px solid ' + CONFIG.borderColor;
    // Only apply maxWidth for non-bar positions (bottom-bar and top-bar should be full width)
    if (CONFIG.position !== 'bottom' && CONFIG.position !== 'bottom-bar' && CONFIG.position !== 'top-bar') {
      banner.style.maxWidth = CONFIG.maxWidth + 'px';
    }
    
    banner.innerHTML = \`
      \${closeButtonHtml}
      <div class="ce-banner-content">
        \${logoHtml}
        <div class="ce-banner-header">
          \${iconHtml}
          <div class="ce-banner-text">
            <h3>\${escapeHtml(heading)}\${jurisdictionBadge}</h3>
            <p>\${escapeHtml(description)}</p>
            \${policyLinksHtml}
            \${customFooterHtml}
          </div>
        </div>
        <div class="ce-banner-buttons">
          <button class="ce-btn ce-btn-settings">\${escapeHtml(settingsText)}</button>
          <button class="ce-btn ce-btn-reject">\${escapeHtml(rejectText)}</button>
          <button class="ce-btn ce-btn-accept">\${escapeHtml(acceptText)}</button>
        </div>
      </div>
      \${brandingHtml}
    \`;
    
    // Add overlay if enabled
    if (CONFIG.showOverlay) {
      var backdropOverlay = document.createElement('div');
      backdropOverlay.id = 'ce-backdrop-overlay';
      backdropOverlay.style.cssText = 'position:fixed;inset:0;z-index:999998;background:rgba(0,0,0,' + (CONFIG.overlayOpacity / 100) + ');transition:opacity 0.3s;';
      document.body.appendChild(backdropOverlay);
    }
    
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    
    // Handle close button
    if (CONFIG.showCloseButton) {
      var closeBtn = banner.querySelector('.ce-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('mouseenter', function() { this.style.opacity = '1'; });
        closeBtn.addEventListener('mouseleave', function() { this.style.opacity = '0.5'; });
        closeBtn.addEventListener('click', function() {
          var minConsent = { necessary: true, functional: false, analytics: false, marketing: false };
          storeConsent(minConsent);
          updateGoogleConsent(minConsent);
          logConsentProof('dismissed', minConsent);
          trackEvent('banner_dismissed');
          closeBanner();
          setTimeout(createRevisitButton, 500);
        });
      }
    }
    
    // Auto-hide timer
    if (CONFIG.autoHideDelay && CONFIG.autoHideDelay > 0) {
      setTimeout(function() {
        hideBanner();
      }, CONFIG.autoHideDelay * 1000);
    }
    
    banner.querySelector('.ce-btn-accept').addEventListener('click', function() {
      handleConsent('accept');
    });
    
    banner.querySelector('.ce-btn-reject').addEventListener('click', function() {
      handleConsent('reject');
    });
    
    banner.querySelector('.ce-btn-settings').addEventListener('click', function() {
      showPreferencesModal();
    });
    
    trackEvent('banner_shown');
    bannerShownTime = performance.now();
  }
  
  function showPreferencesModal() {
    var prefsOverlay = document.createElement('div');
    prefsOverlay.className = 'ce-prefs-overlay';
    prefsOverlay.setAttribute('dir', CONFIG.direction);
    prefsOverlay.setAttribute('data-nosnippet', '');
    prefsOverlay.setAttribute('role', 'dialog');
    prefsOverlay.setAttribute('aria-modal', 'true');
    prefsOverlay.setAttribute('aria-label', 'Cookie preferences');
    prefsOverlay.id = 'ce-prefs-modal';
    
    var storedConsent = getStoredConsent();
    var categoryStates = {};
    categories.forEach(function(cat) {
      if (cat.isRequired) {
        categoryStates[cat.name] = true;
      } else if (storedConsent && typeof storedConsent === 'object') {
        categoryStates[cat.name] = storedConsent[cat.name] !== false;
      } else {
        categoryStates[cat.name] = true;
      }
    });
    
    function renderCategories() {
      return categories.map(function(cat) {
        var cookiesHtml = '';
        if (cat.cookies && cat.cookies.length > 0) {
          var cookiesList = cat.cookies.map(function(cookie) {
            return '<div class="ce-prefs-cookie"><span class="ce-prefs-cookie-name">' + escapeHtml(cookie.name) + '</span><span class="ce-prefs-cookie-expiry">' + escapeHtml(cookie.expiry || TRANSLATIONS.session) + '</span></div>';
          }).join('');
          cookiesHtml = '<div class="ce-prefs-cookies"><div class="ce-prefs-cookies-title">' + escapeHtml(TRANSLATIONS.cookies) + ' (' + cat.cookies.length + ')</div>' + cookiesList + '</div>';
        }
        
        var toggleClass = 'ce-toggle' + (categoryStates[cat.name] ? ' active' : '') + (cat.isRequired ? ' disabled' : '');
        var requiredBadge = cat.isRequired ? '<span class="ce-required">' + escapeHtml(TRANSLATIONS.required) + '</span>' : '';
        
        return '<div class="ce-prefs-category" data-category="' + escapeHtml(cat.name) + '">' +
          '<div class="ce-prefs-cat-header">' +
            '<div class="ce-prefs-cat-name">' + escapeHtml(cat.displayName) + requiredBadge + '</div>' +
            '<div class="' + toggleClass + '" data-toggle="' + escapeHtml(cat.name) + '"></div>' +
          '</div>' +
          '<div class="ce-prefs-cat-desc">' + escapeHtml(cat.description) + '</div>' +
          cookiesHtml +
        '</div>';
      }).join('');
    }
    
    prefsOverlay.innerHTML = \`
      <div class="ce-prefs-modal">
        <div class="ce-prefs-header">
          <h3>\${escapeHtml(TRANSLATIONS.preferencesTitle)}</h3>
          <p>\${escapeHtml(TRANSLATIONS.preferencesDescription)}</p>
        </div>
        <div class="ce-prefs-body">
          \${renderCategories()}
        </div>
        <div class="ce-prefs-footer">
          <button class="ce-btn ce-btn-reject" id="ce-prefs-reject">\${escapeHtml(TRANSLATIONS.rejectAll)}</button>
          <button class="ce-btn ce-btn-accept" id="ce-prefs-accept">\${escapeHtml(TRANSLATIONS.acceptAll)}</button>
          <button class="ce-btn ce-btn-accept" id="ce-prefs-save">\${escapeHtml(TRANSLATIONS.savePreferences)}</button>
        </div>
      </div>
    \`;
    
    document.body.appendChild(prefsOverlay);
    
    prefsOverlay.querySelectorAll('.ce-toggle:not(.disabled)').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        var catName = this.getAttribute('data-toggle');
        categoryStates[catName] = !categoryStates[catName];
        this.classList.toggle('active', categoryStates[catName]);
      });
    });
    
    prefsOverlay.querySelector('#ce-prefs-reject').addEventListener('click', function() {
      categories.forEach(function(cat) {
        if (!cat.isRequired) categoryStates[cat.name] = false;
      });
      savePreferences();
    });
    
    prefsOverlay.querySelector('#ce-prefs-accept').addEventListener('click', function() {
      categories.forEach(function(cat) {
        categoryStates[cat.name] = true;
      });
      savePreferences();
    });
    
    prefsOverlay.querySelector('#ce-prefs-save').addEventListener('click', function() {
      savePreferences();
    });
    
    function savePreferences() {
      var consent = {
        necessary: true,
        functional: categoryStates.functional !== false,
        analytics: categoryStates.analytics !== false,
        marketing: categoryStates.marketing !== false
      };
      
      storeConsent(consent);
      updateGoogleConsent(consent);
      logConsentProof('custom', consent);
      trackEvent('preferences_saved', consent);
      
      closePrefs();
      closeBanner();
      setTimeout(createRevisitButton, 500);
    }
    
    function closePrefs() {
      var modal = document.getElementById('ce-prefs-modal');
      if (modal) {
        modal.style.transition = 'opacity 0.3s';
        modal.style.opacity = '0';
        setTimeout(function() { modal.remove(); }, 300);
      }
    }
    
    prefsOverlay.addEventListener('click', function(e) {
      if (e.target === prefsOverlay) closePrefs();
    });
  }
  
  function closeBanner() {
    var banner = document.getElementById('ce-consent-banner');
    if (banner) {
      banner.style.transition = 'opacity 0.3s';
      banner.style.opacity = '0';
      setTimeout(function() { banner.remove(); }, 300);
    }
    var backdrop = document.getElementById('ce-backdrop-overlay');
    if (backdrop) {
      backdrop.style.opacity = '0';
      setTimeout(function() { backdrop.remove(); }, 300);
    }
  }
  
  function hideBanner() {
    closeBanner();
    trackEvent('banner_dismissed');
  }
  
  function createRevisitButton() {
    if (!CONFIG.showRevisitButton) return;
    if (document.getElementById('ce-revisit-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'ce-revisit-btn';
    btn.className = 'ce-revisit-btn';
    btn.setAttribute('aria-label', 'Cookie preferences');
    btn.setAttribute('title', 'Cookie preferences');
    btn.setAttribute('data-nosnippet', '');
    btn.style.animation = 'ce-revisit-in 0.3s ease-out';
    var revisitLogoSrc = CONFIG.revisitButtonLogoUrl ? (CONFIG.revisitButtonLogoUrl.indexOf('/') === 0 ? API_BASE + CONFIG.revisitButtonLogoUrl : CONFIG.revisitButtonLogoUrl) : (API_BASE + '/consentease-logo.webp');
    btn.innerHTML = '<img src="' + revisitLogoSrc + '" alt="Cookie preferences" style="width:20px;height:20px;object-fit:contain;pointer-events:none;" />';
    btn.addEventListener('click', function() {
      btn.remove();
      Promise.all([fetchGeoLocation(), fetchCategories()]).then(function() {
        injectStyles();
        showPreferencesModal();
      }).catch(function(err) {
        console.error('ConsentEase: Error loading preferences (' + (err.message || 'unknown') + '). Showing with defaults.');
        injectStyles();
        showPreferencesModal();
      });
    });
    document.body.appendChild(btn);
  }
  
  function handleConsent(consent) {
    bannerInteractionTime = performance.now();
    if (consent === 'accept') {
      var fullConsent = { necessary: true, functional: true, analytics: true, marketing: true };
      storeConsent(fullConsent);
      updateGoogleConsent(fullConsent);
      logConsentProof('accept_all', fullConsent);
    } else {
      var minConsent = { necessary: true, functional: false, analytics: false, marketing: false };
      storeConsent(minConsent);
      updateGoogleConsent(minConsent);
      logConsentProof('reject_all', minConsent);
    }
    trackEvent(consent);
    closeBanner();
    setTimeout(createRevisitButton, 500);
  }
  
  window.ConsentEase = {
    getConsent: getStoredConsent,
    getGeoData: function() { return geoData; },
    getLanguage: getPreferredLanguage,
    getWebVitals: function() { return webVitals; },
    isShopify: function() { 
      return !!(window.Shopify && window.Shopify.customerPrivacy); 
    },
    syncShopify: function() {
      var consent = getStoredConsent();
      if (consent) syncToShopify(consent);
    },
    isWix: function() {
      return !!(window.Wix || window.consentPolicyManager);
    },
    syncWix: function() {
      var consent = getStoredConsent();
      if (consent) syncToWix(consent);
    },
    isWordPress: function() {
      return !!(document.querySelector('meta[name="generator"][content*="WordPress"]') || window.wp || document.body.classList.contains('wp-site'));
    },
    syncWordPress: function() {
      var consent = getStoredConsent();
      if (consent) syncToWordPress(consent);
    },
    syncAllPlatforms: function() {
      var consent = getStoredConsent();
      if (consent) syncToPlatforms(consent);
    },
    getPlatform: function() {
      if (window.Shopify && window.Shopify.customerPrivacy) return 'shopify';
      if (window.Wix || window.consentPolicyManager) return 'wix';
      if (document.querySelector('meta[name="generator"][content*="WordPress"]') || window.wp) return 'wordpress';
      if (document.querySelector('meta[name="generator"][content*="Squarespace"]')) return 'squarespace';
      if (window.__WEBFLOW_CURRENCY_SETTINGS || document.querySelector('html[data-wf-site]')) return 'webflow';
      return 'unknown';
    },
    updateConsent: function(consent) {
      storeConsent(consent);
      updateGoogleConsent(consent);
      trackEvent('consent_updated');
    },
    showBanner: function() {
      if (!document.getElementById('ce-consent-banner')) {
        Promise.all([fetchGeoLocation(), fetchCategories()]).then(function() {
          injectStyles();
          createBanner();
        }).catch(function(err) {
          console.error('ConsentEase: Error showing banner (' + (err.message || 'unknown') + '). Showing with defaults.');
          injectStyles();
          createBanner();
        });
      }
    },
    showPreferences: function() {
      Promise.all([fetchGeoLocation(), fetchCategories()]).then(function() {
        if (!document.getElementById('ce-prefs-modal')) {
          injectStyles();
          showPreferencesModal();
        }
      }).catch(function(err) {
        console.error('ConsentEase: Error loading preferences (' + (err.message || 'unknown') + '). Showing with defaults.');
        injectStyles();
        showPreferencesModal();
      });
    },
    getCategories: function() { return categories; },
    getJurisdiction: function() { return geoData ? geoData.jurisdiction : null; },
    getFlag: function() { return geoData ? geoData.flag : null; }
  };
  
  function isDomainAuthorized() {
    var host = window.location.hostname.toLowerCase().replace(/^www\./, '').replace(/:\\d+$/, '');
    var primary = (CONFIG.primaryDomain || '').toLowerCase().replace(/^www\\./, '').replace(/^https?:\\/\\//, '').split('/')[0];
    
    // Always allow dev/localhost
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1' ||
        host.indexOf('.localhost') !== -1 || host.indexOf('.local') !== -1 || 
        host.indexOf('.test') !== -1 || host.indexOf('.replit.dev') !== -1 || host.indexOf('.repl.co') !== -1) {
      return true;
    }
    
    // If no primary domain configured, allow (backward compatibility)
    if (!primary) return true;
    
    // Match primary domain or subdomain (proper endsWith logic)
    if (host === primary || (host.indexOf('.' + primary) !== -1 && host.indexOf('.' + primary) === host.length - primary.length - 1)) {
      return true;
    }
    
    // Check allowedDomains
    var allowed = CONFIG.allowedDomains || [];
    for (var i = 0; i < allowed.length; i++) {
      var pattern = allowed[i].toLowerCase().replace(/^www\\./, '').replace(/^https?:\\/\\//, '').split('/')[0];
      if (pattern.indexOf('*.') === 0) {
        var base = pattern.substring(2);
        if (host === base || (host.indexOf('.' + base) !== -1 && host.indexOf('.' + base) === host.length - base.length - 1)) {
          return true;
        }
      } else if (host === pattern) {
        return true;
      }
    }
    
    return false;
  }
  
  function init() {
    console.info('ConsentEase: Initializing banner for ' + CONFIG.publicId + ' on ' + window.location.hostname);
    
    if (isExcludedPath()) {
      console.info('ConsentEase: Current page is excluded. Banner and revisit button will not be shown.');
      var existingConsentExcluded = getStoredConsent();
      if (existingConsentExcluded) {
        syncToPlatforms(existingConsentExcluded);
        updateGoogleConsent(existingConsentExcluded);
      }
      return;
    }
    
    if (shouldRespectDNT()) {
      console.info('ConsentEase: Do Not Track is enabled. Setting minimal consent automatically.');
      var dntConsent = { necessary: true, functional: false, analytics: false, marketing: false };
      storeConsent(dntConsent);
      updateGoogleConsent(dntConsent);
      return;
    }
    
    var existingConsent = getStoredConsent();
    if (existingConsent) {
      console.info('ConsentEase: Existing consent found. Showing revisit button.');
      syncToPlatforms(existingConsent);
      updateGoogleConsent(existingConsent);
      injectStyles();
      createRevisitButton();
      return;
    }
    
    function showBannerNow() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          injectStyles();
          createBanner();
        });
      } else {
        injectStyles();
        createBanner();
      }
    }
    
    Promise.all([fetchGeoLocation(), fetchCategories()]).then(function() {
      console.info('ConsentEase: Data loaded. Showing banner.');
      if (CONFIG.displayDelay && CONFIG.displayDelay > 0) {
        setTimeout(showBannerNow, CONFIG.displayDelay * 1000);
      } else {
        showBannerNow();
      }
    }).catch(function(err) {
      console.error('ConsentEase: Error during initialization (' + (err.message || 'unknown') + '). Showing banner with defaults.');
      showBannerNow();
    });
  }
  
  if (isDomainAuthorized()) {
    init();
  } else {
    console.warn('ConsentEase: Banner not authorized for domain "' + window.location.hostname + '". Expected domain: "' + (CONFIG.primaryDomain || 'not configured') + '". Allowed domains: ' + JSON.stringify(CONFIG.allowedDomains || []) + '. Add this domain in your ConsentEase dashboard under Settings > Allowed Domains.');
  }
})();
`;

  return script;
}
