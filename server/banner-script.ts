import { storage } from "./storage";

export function generateBannerScript(config: any, publicId: string): string {
  const script = `
(function() {
  'use strict';
  
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
  })};
  
  var CONSENT_KEY = 'ce_consent_' + CONFIG.publicId;
  var API_URL = window.location.origin;
  
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
  
  function trackEvent(eventType) {
    try {
      fetch(API_URL + '/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: CONFIG.publicId,
          eventType: eventType,
          country: null
        })
      });
    } catch (e) {}
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
      .ce-banner-content {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .ce-banner-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .ce-banner-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: \${CONFIG.primaryColor}15;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ce-banner-icon svg {
        width: 20px;
        height: 20px;
        fill: \${CONFIG.primaryColor};
      }
      .ce-banner-text h3 {
        margin: 0 0 4px 0;
        font-size: 1.1em;
        font-weight: 600;
      }
      .ce-banner-text p {
        margin: 0;
        opacity: 0.8;
        line-height: 1.5;
      }
      .ce-banner-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      .ce-btn {
        padding: 8px 16px;
        font-size: 0.9em;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .ce-btn-settings {
        background: transparent;
        color: \${CONFIG.primaryColor};
      }
      .ce-btn-reject {
        background: transparent;
        border: 1px solid \${CONFIG.primaryColor};
        color: \${CONFIG.primaryColor};
      }
      .ce-btn-accept {
        background: \${CONFIG.primaryColor};
        color: #fff;
      }
      .ce-btn:hover {
        opacity: 0.9;
      }
    \`;
    style.textContent += \`
      .ce-btn { border-radius: \${CONFIG.buttonShape === 'pill' ? '999px' : CONFIG.buttonShape === 'rounded' ? '8px' : '0'}; }
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
    \`;
    
    overlay.appendChild(banner);
    document.body.appendChild(overlay);
    
    banner.querySelector('.ce-btn-accept').addEventListener('click', function() {
      handleConsent('accept');
    });
    
    banner.querySelector('.ce-btn-reject').addEventListener('click', function() {
      handleConsent('reject');
    });
    
    trackEvent('banner_shown');
  }
  
  function handleConsent(consent) {
    storeConsent(consent);
    trackEvent(consent);
    var banner = document.getElementById('ce-consent-banner');
    if (banner) {
      banner.style.transition = 'opacity 0.3s';
      banner.style.opacity = '0';
      setTimeout(function() {
        banner.remove();
      }, 300);
    }
    
    if (consent === 'accept') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'consent_update',
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  }
  
  function init() {
    if (getStoredConsent()) {
      return;
    }
    
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
  
  init();
})();
`;

  return script;
}
