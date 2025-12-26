export function generateBannerScript(config: any, publicId: string, showBranding: boolean = true): string {
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
  var CONFIG = ${JSON.stringify({
    publicId,
    heading: config.heading,
    description: config.description,
    acceptText: config.acceptText,
    rejectText: config.rejectText,
    settingsText: config.settingsText,
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
  })};
  
  var CONSENT_KEY = 'ce_consent_' + CONFIG.publicId;
  var categories = [];
  
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() { window.dataLayer.push(arguments); };
  }
  var gtag = window.gtag;
  
  function getStoredConsent() {
    try {
      var stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        var data = JSON.parse(stored);
        if (data.expires > Date.now()) {
          return data.consent;
        }
      }
    } catch (e) {}
    return null;
  }
  
  function storeConsent(consent) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        consent: consent,
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
      }));
    } catch (e) {}
  }
  
  function trackEvent(eventType, details) {
    try {
      fetch(API_BASE + '/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: CONFIG.publicId,
          eventType: eventType,
          country: null,
          details: details || null
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
    
    window.dispatchEvent(new CustomEvent('consentEaseUpdate', {
      detail: { consent: consent }
    }));
  }
  
  var existingConsent = getStoredConsent();
  if (existingConsent) {
    updateGoogleConsent(existingConsent);
  }
  
  function fetchCategories() {
    return fetch(API_BASE + '/api/consent/' + CONFIG.publicId + '/categories')
      .then(function(res) { return res.json(); })
      .then(function(data) { 
        categories = data.filter(function(c) { return c.isEnabled; });
        return categories;
      })
      .catch(function() { return []; });
  }
  
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = \`
      .ce-banner-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        font-family: \${CONFIG.fontFamily}, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: \${CONFIG.fontSize === 'small' ? '13px' : CONFIG.fontSize === 'large' ? '16px' : '14px'};
        \${CONFIG.position === 'center' ? 'background: rgba(0,0,0,0.4);' : ''}
        \${CONFIG.backdropBlur && CONFIG.position === 'center' ? 'backdrop-filter: blur(4px);' : ''}
        display: flex;
        \${CONFIG.position === 'bottom' ? 'align-items: flex-end;' : ''}
        \${CONFIG.position === 'bottom-left' ? 'align-items: flex-end; justify-content: flex-start; padding: 16px;' : ''}
        \${CONFIG.position === 'bottom-right' ? 'align-items: flex-end; justify-content: flex-end; padding: 16px;' : ''}
        \${CONFIG.position === 'center' ? 'align-items: center; justify-content: center; padding: 16px;' : ''}
        \${CONFIG.position === 'top-bar' ? 'align-items: flex-start;' : ''}
      }
      .ce-banner {
        background: \${CONFIG.backgroundColor};
        color: \${CONFIG.textColor};
        border-radius: \${CONFIG.position === 'bottom' || CONFIG.position === 'top-bar' ? '0' : CONFIG.borderRadius + 'px'};
        box-shadow: \${CONFIG.shadow === 'none' ? 'none' : CONFIG.shadow === 'small' ? '0 4px 12px rgba(0,0,0,0.08)' : CONFIG.shadow === 'medium' ? '0 8px 30px rgba(0,0,0,0.12)' : '0 25px 50px rgba(0,0,0,0.25)'};
        \${CONFIG.backdropBlur ? 'backdrop-filter: blur(8px);' : ''}
        \${CONFIG.position === 'bottom' || CONFIG.position === 'top-bar' ? 'width: 100%;' : 'max-width: 420px;'}
        animation: ce-slide-in 0.4s ease-out;
      }
      @keyframes ce-slide-in {
        from {
          opacity: 0;
          \${CONFIG.animation === 'slide-up' ? 'transform: translateY(20px);' : ''}
          \${CONFIG.animation === 'zoom' ? 'transform: scale(0.9);' : ''}
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .ce-banner-content { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
      .ce-banner-header { display: flex; align-items: flex-start; gap: 12px; }
      .ce-banner-icon { width: 40px; height: 40px; border-radius: 8px; background: \${CONFIG.primaryColor}15; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .ce-banner-icon svg { width: 20px; height: 20px; fill: \${CONFIG.primaryColor}; }
      .ce-banner-text h3 { margin: 0 0 4px 0; font-size: 1.1em; font-weight: 600; }
      .ce-banner-text p { margin: 0; opacity: 0.8; line-height: 1.5; }
      .ce-banner-buttons { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
      .ce-btn { padding: 8px 16px; font-size: 0.9em; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; border-radius: \${CONFIG.buttonShape === 'pill' ? '999px' : CONFIG.buttonShape === 'rounded' ? '8px' : '0'}; }
      .ce-btn-settings { background: transparent; color: \${CONFIG.primaryColor}; }
      .ce-btn-reject { background: transparent; border: 1px solid \${CONFIG.primaryColor}; color: \${CONFIG.primaryColor}; }
      .ce-btn-accept { background: \${CONFIG.primaryColor}; color: #fff; }
      .ce-btn:hover { opacity: 0.9; }
      .ce-branding { padding: 8px 20px 12px; text-align: center; border-top: 1px solid rgba(0,0,0,0.05); font-size: 11px; opacity: 0.6; }
      .ce-branding a { color: inherit; text-decoration: none; }
      .ce-branding a:hover { text-decoration: underline; }
      
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
      .ce-prefs-footer { padding: 16px 20px; border-top: 1px solid rgba(0,0,0,0.1); display: flex; gap: 8px; justify-content: flex-end; }
      
      .ce-toggle { position: relative; width: 44px; height: 24px; background: rgba(0,0,0,0.2); border-radius: 12px; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
      .ce-toggle.active { background: \${CONFIG.primaryColor}; }
      .ce-toggle.disabled { opacity: 0.5; cursor: not-allowed; }
      .ce-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      .ce-toggle.active::after { transform: translateX(20px); }
    \`;
    document.head.appendChild(style);
  }
  
  function createBanner() {
    var overlay = document.createElement('div');
    overlay.className = 'ce-banner-overlay';
    overlay.id = 'ce-consent-banner';
    
    var banner = document.createElement('div');
    banner.className = 'ce-banner';
    
    var iconHtml = CONFIG.showIcon ? \`
      <div class="ce-banner-icon">
        <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
    \` : '';
    
    var brandingHtml = CONFIG.showBranding ? \`
      <div class="ce-branding">
        <a href="https://consentease.com" target="_blank" rel="noopener">Powered by ConsentEase</a>
      </div>
    \` : '';
    
    banner.innerHTML = \`
      <div class="ce-banner-content">
        <div class="ce-banner-header">
          \${iconHtml}
          <div class="ce-banner-text">
            <h3>\${CONFIG.heading}</h3>
            <p>\${CONFIG.description}</p>
          </div>
        </div>
        <div class="ce-banner-buttons">
          <button class="ce-btn ce-btn-settings">\${CONFIG.settingsText}</button>
          <button class="ce-btn ce-btn-reject">\${CONFIG.rejectText}</button>
          <button class="ce-btn ce-btn-accept">\${CONFIG.acceptText}</button>
        </div>
      </div>
      \${brandingHtml}
    \`;
    
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    
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
  }
  
  function showPreferencesModal() {
    var prefsOverlay = document.createElement('div');
    prefsOverlay.className = 'ce-prefs-overlay';
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
            return '<div class="ce-prefs-cookie"><span class="ce-prefs-cookie-name">' + cookie.name + '</span><span class="ce-prefs-cookie-expiry">' + (cookie.expiry || 'Session') + '</span></div>';
          }).join('');
          cookiesHtml = '<div class="ce-prefs-cookies"><div class="ce-prefs-cookies-title">Cookies (' + cat.cookies.length + ')</div>' + cookiesList + '</div>';
        }
        
        var toggleClass = 'ce-toggle' + (categoryStates[cat.name] ? ' active' : '') + (cat.isRequired ? ' disabled' : '');
        var requiredBadge = cat.isRequired ? '<span class="ce-required">Required</span>' : '';
        
        return '<div class="ce-prefs-category" data-category="' + cat.name + '">' +
          '<div class="ce-prefs-cat-header">' +
            '<div class="ce-prefs-cat-name">' + cat.displayName + requiredBadge + '</div>' +
            '<div class="' + toggleClass + '" data-toggle="' + cat.name + '"></div>' +
          '</div>' +
          '<div class="ce-prefs-cat-desc">' + cat.description + '</div>' +
          cookiesHtml +
        '</div>';
      }).join('');
    }
    
    prefsOverlay.innerHTML = \`
      <div class="ce-prefs-modal">
        <div class="ce-prefs-header">
          <h3>Cookie Preferences</h3>
          <p>Customize your cookie preferences below. Required cookies are necessary for the website to function properly.</p>
        </div>
        <div class="ce-prefs-body">
          \${renderCategories()}
        </div>
        <div class="ce-prefs-footer">
          <button class="ce-btn ce-btn-reject" id="ce-prefs-reject">Reject All</button>
          <button class="ce-btn ce-btn-accept" id="ce-prefs-accept">Accept All</button>
          <button class="ce-btn ce-btn-accept" id="ce-prefs-save">Save Preferences</button>
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
      trackEvent('preferences_saved', consent);
      
      closePrefs();
      closeBanner();
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
  }
  
  function handleConsent(consent) {
    if (consent === 'accept') {
      var fullConsent = { necessary: true, functional: true, analytics: true, marketing: true };
      storeConsent(fullConsent);
      updateGoogleConsent(fullConsent);
    } else {
      var minConsent = { necessary: true, functional: false, analytics: false, marketing: false };
      storeConsent(minConsent);
      updateGoogleConsent(minConsent);
    }
    trackEvent(consent);
    closeBanner();
  }
  
  window.ConsentEase = {
    getConsent: getStoredConsent,
    updateConsent: function(consent) {
      storeConsent(consent);
      updateGoogleConsent(consent);
      trackEvent('consent_updated');
    },
    showBanner: function() {
      if (!document.getElementById('ce-consent-banner')) {
        fetchCategories().then(function() {
          injectStyles();
          createBanner();
        });
      }
    },
    showPreferences: function() {
      fetchCategories().then(function() {
        if (!document.getElementById('ce-prefs-modal')) {
          injectStyles();
          showPreferencesModal();
        }
      });
    },
    getCategories: function() { return categories; }
  };
  
  function init() {
    var existingConsent = getStoredConsent();
    if (existingConsent) {
      return;
    }
    
    fetchCategories().then(function() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          injectStyles();
          createBanner();
        });
      } else {
        injectStyles();
        createBanner();
      }
    });
  }
  
  init();
})();
`;

  return script;
}
