import type { Browser, Page } from 'puppeteer-core';
import { classifyCookie, guessCookieCategory, type KnownCookie } from './cookie-knowledge-base';
import { execSync } from 'child_process';
import * as https from 'https';
import * as http from 'http';
import * as fsModule from 'fs';

let puppeteerModule: typeof import('puppeteer-core') | null = null;

async function getPuppeteer() {
  if (!puppeteerModule) {
    try {
      puppeteerModule = await import('puppeteer-core');
    } catch (err) {
      throw new ChromiumUnavailableError('puppeteer-core is not available. Cookie scanning requires puppeteer-core to be installed.');
    }
  }
  return puppeteerModule;
}

export class ChromiumUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChromiumUnavailableError';
  }
}

let cachedChromiumPath: string | undefined | null = null;

function findChromiumPath(): string | undefined {
  if (cachedChromiumPath !== null) {
    return cachedChromiumPath || undefined;
  }

  if (process.env.CHROMIUM_PATH) {
    if (fsModule.existsSync(process.env.CHROMIUM_PATH)) {
      cachedChromiumPath = process.env.CHROMIUM_PATH;
      return cachedChromiumPath;
    }
    console.warn(`CHROMIUM_PATH set to ${process.env.CHROMIUM_PATH} but file does not exist`);
  }
  
  try {
    const path = execSync('which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which google-chrome 2>/dev/null || which google-chrome-stable 2>/dev/null', { encoding: 'utf-8', timeout: 5000 }).trim();
    if (path && fsModule.existsSync(path)) {
      cachedChromiumPath = path;
      return cachedChromiumPath;
    }
  } catch {}
  
  const commonPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/local/bin/chromium',
    '/snap/bin/chromium',
  ];
  
  for (const p of commonPaths) {
    if (fsModule.existsSync(p)) {
      cachedChromiumPath = p;
      return cachedChromiumPath;
    }
  }
  
  try {
    const nixPath = execSync('find /nix/store -name "chromium" -type f -path "*/bin/*" 2>/dev/null | head -1', { encoding: 'utf-8', timeout: 10000 }).trim();
    if (nixPath && fsModule.existsSync(nixPath)) {
      cachedChromiumPath = nixPath;
      return cachedChromiumPath;
    }
  } catch {}
  
  cachedChromiumPath = '';
  return undefined;
}

export { findChromiumPath };

export function isChromiumAvailable(): boolean {
  return !!findChromiumPath();
}

function isSecurityChallengePage(html: string, finalUrl: string): boolean {
  const urlLower = finalUrl.toLowerCase();
  // SiteGround IP rate-limit / captcha
  if (urlLower.includes('sgcaptcha') || urlLower.includes('/.well-known/sgcaptcha')) return true;
  // Cloudflare challenge / bot detection
  if (urlLower.includes('/cdn-cgi/challenge-platform')) return true;
  const htmlLower = html.toLowerCase();
  // Cloudflare interstitial markers
  if (htmlLower.includes('cf-please-wait') || htmlLower.includes('cf_captcha_kind') || htmlLower.includes('challenge-form')) return true;
  // Generic CAPTCHA indicators in a suspiciously short page
  if (html.length < 2000 && (htmlLower.includes('captcha') || htmlLower.includes('sgcaptcha') || htmlLower.includes('robot') || htmlLower.includes('automated'))) return true;
  // Meta-refresh to a captcha/challenge URL
  const metaRefresh = html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]*content=["'][^"']*([^"']+)["']/i);
  if (metaRefresh && (metaRefresh[1].toLowerCase().includes('captcha') || metaRefresh[1].toLowerCase().includes('challenge'))) return true;
  return false;
}

const SECURITY_BLOCK_ERROR = 'The website\'s hosting provider is blocking our scanner\'s IP address with a security challenge (e.g. SiteGround, Cloudflare). This is a server-level restriction that prevents automated scanning. To work around this, you can manually add your cookies to the list below.';

function httpGet(url: string, timeout: number = 10000, redirectCount: number = 0): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  if (redirectCount > 5) {
    return Promise.reject(new Error('Too many redirects'));
  }
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { 
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const resolvedUrl = new URL(res.headers.location, url).href;
        httpGet(resolvedUrl, timeout, (redirectCount || 0) + 1).then(resolve).catch(reject);
        return;
      }
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode || 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
  });
}

function extractCookiesFromSetCookieHeaders(setCookieHeaders: string | string[] | undefined, targetDomain: string): ClassifiedCookie[] {
  if (!setCookieHeaders) return [];
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  const cookies: ClassifiedCookie[] = [];

  for (const header of headers) {
    const parts = header.split(';').map(p => p.trim());
    const [nameValue] = parts;
    if (!nameValue) continue;
    const eqIndex = nameValue.indexOf('=');
    if (eqIndex < 0) continue;
    const name = nameValue.substring(0, eqIndex).trim();
    if (!name) continue;

    let domain = targetDomain;
    let expires = -1;
    let httpOnly = false;
    let secure = false;
    let sameSite = 'None';

    for (const part of parts.slice(1)) {
      const lower = part.toLowerCase();
      if (lower.startsWith('domain=')) domain = part.substring(7).trim();
      if (lower.startsWith('max-age=')) {
        const maxAge = parseInt(part.substring(8).trim(), 10);
        if (!isNaN(maxAge)) expires = Math.floor(Date.now() / 1000) + maxAge;
      }
      if (lower.startsWith('expires=')) {
        const d = new Date(part.substring(8).trim());
        if (!isNaN(d.getTime())) expires = Math.floor(d.getTime() / 1000);
      }
      if (lower === 'httponly') httpOnly = true;
      if (lower === 'secure') secure = true;
      if (lower.startsWith('samesite=')) sameSite = part.substring(9).trim();
    }

    const detected: DetectedCookie = { name, domain, path: '/', expires, httpOnly, secure, sameSite, value: '' };
    cookies.push(classifyDetectedCookie(detected, targetDomain, `https://${targetDomain}`));
  }

  return cookies;
}

function extractTrackingFromHtml(html: string, baseUrl: string): DetectedScript[] {
  const scripts: DetectedScript[] = [];
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  const seen = new Set<string>();

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const absoluteUrl = new URL(match[1], baseUrl).href;
      if (seen.has(absoluteUrl)) continue;
      seen.add(absoluteUrl);
      const trackingScript = identifyTrackingScript(absoluteUrl);
      if (trackingScript) scripts.push(trackingScript);
    } catch {}
  }

  return scripts;
}

async function lightweightScan(url: string): Promise<ScanResult> {
  const startTime = Date.now();

  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const targetDomain = urlObj.hostname;

    const response = await httpGet(url);

    if (response.statusCode >= 400) {
      return {
        success: false,
        cookies: [],
        error: `Website returned HTTP ${response.statusCode}. Please check if the website is accessible.`,
        scannedAt: new Date(),
        scanDuration: Date.now() - startTime,
        scanMode: 'lightweight',
      };
    }

    if (isSecurityChallengePage(response.body, url)) {
      return {
        success: false,
        cookies: [],
        error: SECURITY_BLOCK_ERROR,
        scannedAt: new Date(),
        scanDuration: Date.now() - startTime,
        scanMode: 'lightweight',
      };
    }

    const cookies = extractCookiesFromSetCookieHeaders(response.headers['set-cookie'], targetDomain);
    const trackingScripts = extractTrackingFromHtml(response.body, url);

    const titleMatch = response.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : undefined;

    return {
      success: true,
      cookies,
      scannedAt: new Date(),
      pageTitle,
      scannedUrls: [url],
      storageItems: [],
      trackingScripts,
      scanDuration: Date.now() - startTime,
      scanMode: 'lightweight',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    let userMessage = `Could not reach the website: ${message}`;
    if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      userMessage = 'Website not found. Please check the domain name is correct and the website is online.';
    } else if (message.includes('ECONNREFUSED')) {
      userMessage = 'Connection refused by the website. Please check if the website is online.';
    } else if (message.includes('timed out') || message.includes('ETIMEDOUT')) {
      userMessage = 'The website took too long to respond. Please try again later.';
    }

    return {
      success: false,
      cookies: [],
      error: userMessage,
      scannedAt: new Date(),
      scanDuration: Date.now() - startTime,
      scanMode: 'lightweight',
    };
  }
}

const KNOWN_TRACKING_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'googlesyndication.com',
  'doubleclick.net',
  'facebook.net',
  'facebook.com',
  'connect.facebook.net',
  'fbcdn.net',
  'twitter.com',
  'ads-twitter.com',
  'linkedin.com',
  'licdn.com',
  'hotjar.com',
  'hubspot.com',
  'hs-analytics.net',
  'hs-scripts.com',
  'hsforms.net',
  'intercom.io',
  'intercomcdn.com',
  'segment.com',
  'segment.io',
  'mixpanel.com',
  'amplitude.com',
  'heap.io',
  'heapanalytics.com',
  'fullstory.com',
  'mouseflow.com',
  'clarity.ms',
  'crazyegg.com',
  'optimizely.com',
  'tiktok.com',
  'snapchat.com',
  'sc-static.net',
  'pinterest.com',
  'pinimg.com',
  'bing.com',
  'ads.linkedin.com',
  'snap.licdn.com',
  'px.ads.linkedin.com',
  'bat.bing.com',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'googleadservices.com',
  'criteo.com',
  'criteo.net',
  'outbrain.com',
  'taboola.com',
  'quantserve.com',
  'scorecardresearch.com',
  'chartbeat.com',
  'nr-data.net',
  'newrelic.com',
  'sentry.io',
  'bugsnag.com',
  'logrocket.com',
  'datadome.co',
  'cookiebot.com',
  'onetrust.com',
  'trustarc.com',
  'usercentrics.eu',
  'cookieyes.com',
  'iubenda.com',
  'cookiefirst.com',
  'axept.io',
];

const COMMON_PAGES = [
  '/contact',
  '/about',
  '/about-us',
  '/products',
  '/shop',
  '/services',
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/login',
  '/register',
  '/blog',
];

export interface DetectedCookie {
  name: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: string;
  value: string;
}

export interface ClassifiedCookie {
  name: string;
  provider: string;
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  purpose: string;
  expiry: string;
  type: 'first-party' | 'third-party';
  domain: string;
  sourceUrl?: string;
}

export interface StorageItem {
  key: string;
  type: 'localStorage' | 'sessionStorage';
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  provider: string;
}

export interface DetectedScript {
  url: string;
  domain: string;
  category: 'analytics' | 'marketing' | 'functional' | 'unknown';
  provider: string;
}

export interface ScanResult {
  success: boolean;
  cookies: ClassifiedCookie[];
  error?: string;
  scannedAt: Date;
  pageTitle?: string;
  screenshotUrl?: string;
  scannedUrls?: string[];
  storageItems?: StorageItem[];
  trackingScripts?: DetectedScript[];
  scanDuration?: number;
  scanMode?: 'full' | 'lightweight';
}

function formatExpiry(expiresTimestamp: number): string {
  if (expiresTimestamp === -1) {
    return 'Session';
  }
  
  const now = Date.now() / 1000;
  const diffSeconds = expiresTimestamp - now;
  
  if (diffSeconds < 0) {
    return 'Expired';
  }
  
  const days = Math.floor(diffSeconds / (60 * 60 * 24));
  
  if (days < 1) {
    const hours = Math.floor(diffSeconds / (60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''}`;
}

function generateUnknownCookiePurpose(
  cookieName: string, 
  cookieDomain: string, 
  category: 'necessary' | 'functional' | 'analytics' | 'marketing',
  isThirdParty: boolean,
  expires: number
): string {
  const name = cookieName.toLowerCase();
  
  const categoryDescriptions: Record<string, string> = {
    necessary: 'essential website functionality',
    functional: 'user preferences and site features',
    analytics: 'visitor analytics and usage tracking',
    marketing: 'advertising and marketing campaigns',
  };
  
  const categoryContext = categoryDescriptions[category] || 'general website operations';
  
  if (name.includes('session') || name.includes('sess') || name.includes('sid')) {
    return `Session management cookie from ${cookieDomain}, used to maintain user session state.`;
  }
  if (name.includes('csrf') || name.includes('xsrf') || name.includes('token')) {
    return `Security token from ${cookieDomain}, used to protect against cross-site request forgery attacks.`;
  }
  if (name.includes('lang') || name.includes('locale') || name.includes('language')) {
    return `Language preference cookie from ${cookieDomain}, used to remember the visitor's language selection.`;
  }
  if (name.includes('theme') || name.includes('dark') || name.includes('mode')) {
    return `Display preference cookie from ${cookieDomain}, used to remember visual theme settings.`;
  }
  if (name.includes('consent') || name.includes('gdpr') || name.includes('cookie_policy')) {
    return `Consent management cookie from ${cookieDomain}, used to store the visitor's cookie consent preferences.`;
  }
  if (name.includes('cart') || name.includes('basket') || name.includes('checkout')) {
    return `E-commerce cookie from ${cookieDomain}, used to maintain shopping cart data.`;
  }
  if (name.includes('auth') || name.includes('login') || name.includes('logged')) {
    return `Authentication cookie from ${cookieDomain}, used to manage user login state.`;
  }
  if (name.includes('track') || name.includes('uid') || name.includes('visitor')) {
    return `Tracking cookie from ${cookieDomain}, used for ${categoryContext}.`;
  }
  if (name.includes('pref') || name.includes('setting')) {
    return `Preference cookie from ${cookieDomain}, used to store user settings and preferences.`;
  }
  
  if (isThirdParty) {
    return `Third-party cookie from ${cookieDomain}, used for ${categoryContext}.`;
  }
  
  if (expires === 0 || expires === -1) {
    return `Session cookie from ${cookieDomain}, used for ${categoryContext}. Deleted when the browser is closed.`;
  }
  
  return `Cookie from ${cookieDomain}, used for ${categoryContext}.`;
}

function classifyDetectedCookie(cookie: DetectedCookie, targetDomain: string, sourceUrl?: string): ClassifiedCookie {
  const known = classifyCookie(cookie.name);
  
  const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
  const isThirdParty = !targetDomain.includes(cookieDomain) && !cookieDomain.includes(targetDomain);
  
  if (known) {
    return {
      name: cookie.name,
      provider: known.provider,
      category: known.category,
      purpose: known.purpose,
      expiry: formatExpiry(cookie.expires),
      type: isThirdParty ? 'third-party' : 'first-party',
      domain: cookie.domain,
      sourceUrl,
    };
  }
  
  const guessedCategory = guessCookieCategory(cookie.name, cookie.domain, cookie.expires > 0 ? cookie.expires - (Date.now() / 1000) : undefined, isThirdParty);
  
  const purpose = generateUnknownCookiePurpose(cookie.name, cookieDomain, guessedCategory, isThirdParty, cookie.expires);
  
  return {
    name: cookie.name,
    provider: cookieDomain,
    category: guessedCategory,
    purpose,
    expiry: formatExpiry(cookie.expires),
    type: isThirdParty ? 'third-party' : 'first-party',
    domain: cookie.domain,
    sourceUrl,
  };
}

function classifyStorageKey(key: string): { category: StorageItem['category']; provider: string } {
  const keyLower = key.toLowerCase();
  
  if (keyLower.includes('_ga') || keyLower.includes('analytics') || keyLower.includes('mixpanel') || 
      keyLower.includes('amplitude') || keyLower.includes('segment') || keyLower.includes('heap') ||
      keyLower.includes('hotjar') || keyLower.includes('_hj') || keyLower.includes('fullstory')) {
    return { category: 'analytics', provider: 'Analytics Tracker' };
  }
  
  if (keyLower.includes('fbp') || keyLower.includes('facebook') || keyLower.includes('_gcl') ||
      keyLower.includes('ad') || keyLower.includes('campaign') || keyLower.includes('utm') ||
      keyLower.includes('linkedin') || keyLower.includes('twitter') || keyLower.includes('tiktok')) {
    return { category: 'marketing', provider: 'Marketing Tracker' };
  }
  
  if (keyLower.includes('theme') || keyLower.includes('language') || keyLower.includes('lang') ||
      keyLower.includes('pref') || keyLower.includes('setting') || keyLower.includes('cart') ||
      keyLower.includes('wishlist')) {
    return { category: 'functional', provider: 'Site Functionality' };
  }
  
  if (keyLower.includes('session') || keyLower.includes('token') || keyLower.includes('auth') ||
      keyLower.includes('csrf') || keyLower.includes('user')) {
    return { category: 'necessary', provider: 'Site Security' };
  }
  
  return { category: 'functional', provider: 'Unknown' };
}

function identifyTrackingScript(scriptUrl: string): DetectedScript | null {
  try {
    const url = new URL(scriptUrl);
    const domain = url.hostname;
    
    for (const trackingDomain of KNOWN_TRACKING_DOMAINS) {
      if (domain.includes(trackingDomain) || domain.endsWith('.' + trackingDomain)) {
        let category: DetectedScript['category'] = 'unknown';
        let provider = trackingDomain;
        
        if (domain.includes('google-analytics') || domain.includes('googletagmanager')) {
          category = 'analytics';
          provider = 'Google Analytics';
        } else if (domain.includes('doubleclick') || domain.includes('googlesyndication') || domain.includes('googleadservices')) {
          category = 'marketing';
          provider = 'Google Ads';
        } else if (domain.includes('facebook') || domain.includes('fbcdn')) {
          category = 'marketing';
          provider = 'Facebook/Meta';
        } else if (domain.includes('hotjar')) {
          category = 'analytics';
          provider = 'Hotjar';
        } else if (domain.includes('hubspot') || domain.includes('hs-')) {
          category = 'analytics';
          provider = 'HubSpot';
        } else if (domain.includes('linkedin') || domain.includes('licdn')) {
          category = 'marketing';
          provider = 'LinkedIn';
        } else if (domain.includes('twitter') || domain.includes('ads-twitter')) {
          category = 'marketing';
          provider = 'Twitter/X';
        } else if (domain.includes('tiktok')) {
          category = 'marketing';
          provider = 'TikTok';
        } else if (domain.includes('clarity')) {
          category = 'analytics';
          provider = 'Microsoft Clarity';
        } else if (domain.includes('segment')) {
          category = 'analytics';
          provider = 'Segment';
        } else if (domain.includes('mixpanel')) {
          category = 'analytics';
          provider = 'Mixpanel';
        } else if (domain.includes('amplitude')) {
          category = 'analytics';
          provider = 'Amplitude';
        } else if (domain.includes('intercom')) {
          category = 'functional';
          provider = 'Intercom';
        } else if (domain.includes('cookiebot') || domain.includes('onetrust') || domain.includes('cookieyes') || domain.includes('iubenda')) {
          category = 'functional';
          provider = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        }
        
        return { url: scriptUrl, domain, category, provider };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

async function extractSameDomainLinks(page: Page, baseUrl: URL, maxLinks: number = 10): Promise<string[]> {
  const links: string[] = [];
  
  try {
    const hrefs = await page.$$eval('a[href]', (anchors) => 
      anchors.map(a => a.getAttribute('href')).filter(Boolean) as string[]
    );
    
    const seenPaths = new Set<string>();
    
    for (const href of hrefs) {
      if (links.length >= maxLinks) break;
      
      try {
        const absoluteUrl = new URL(href, baseUrl.origin);
        
        if (absoluteUrl.hostname !== baseUrl.hostname) continue;
        if (!absoluteUrl.protocol.startsWith('http')) continue;
        if (absoluteUrl.pathname === baseUrl.pathname) continue;
        if (/\.(pdf|jpg|jpeg|png|gif|svg|css|js|xml|json)$/i.test(absoluteUrl.pathname)) continue;
        
        const normalizedPath = absoluteUrl.pathname.replace(/\/$/, '') || '/';
        if (seenPaths.has(normalizedPath)) continue;
        seenPaths.add(normalizedPath);
        
        links.push(absoluteUrl.origin + absoluteUrl.pathname);
      } catch {
      }
    }
  } catch (error) {
    console.error('Error extracting links:', error);
  }
  
  return links;
}

async function tryClickConsentBanner(page: Page): Promise<void> {
  try {
    const consentSelectors = [
      // ConsentEase own banner
      '.ce-btn-accept',
      '.ce-prefs-accept',
      // Other consent managers
      '[class*="cookie"] button',
      '[class*="consent"] button',
      '[class*="gdpr"] button',
      '[class*="privacy"] button',
      '[id*="cookie"] button',
      '[id*="consent"] button',
      '[data-cookieconsent]',
      '[class*="cc-"] button',
      '.cookie-banner button',
      '.consent-banner button',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '#onetrust-accept-btn-handler',
      '[class*="cookieyes"] button',
      '[id*="cookieyes"] button',
    ];
    
    for (const selector of consentSelectors) {
      const buttons = await page.$$(selector);
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent || '');
        const isVisible = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }).catch(() => false);
        if (isVisible && text && /accept|agree|ok|got it|allow|alle akzeptieren|accepter|j'accepte|akkoord/i.test(text)) {
          await button.click().catch(() => {});
          await new Promise(r => setTimeout(r, 500));
          return;
        }
      }
    }
  } catch {
  }
}

async function getStorageItems(page: Page): Promise<StorageItem[]> {
  const items: StorageItem[] = [];
  
  try {
    const localStorageKeys = await page.evaluate(() => Object.keys(localStorage));
    for (const key of localStorageKeys) {
      const { category, provider } = classifyStorageKey(key);
      items.push({ key, type: 'localStorage', category, provider });
    }
    
    const sessionStorageKeys = await page.evaluate(() => Object.keys(sessionStorage));
    for (const key of sessionStorageKeys) {
      const { category, provider } = classifyStorageKey(key);
      items.push({ key, type: 'sessionStorage', category, provider });
    }
  } catch (error) {
    console.error('Error getting storage items:', error);
  }
  
  return items;
}

function puppeteerCookieToDetected(cookie: any): DetectedCookie {
  return {
    name: cookie.name,
    domain: cookie.domain || '',
    path: cookie.path || '/',
    expires: cookie.expires || -1,
    httpOnly: cookie.httpOnly || false,
    secure: cookie.secure || false,
    sameSite: cookie.sameSite || 'None',
    value: cookie.value || '',
  };
}

async function scanSinglePage(
  page: Page,
  url: string,
  targetDomain: string,
  detectedScripts: Set<string>,
  timeout: number = 8000
): Promise<{ cookies: ClassifiedCookie[]; scripts: DetectedScript[]; storageItems: StorageItem[] }> {
  const cookies: ClassifiedCookie[] = [];
  const scripts: DetectedScript[] = [];
  
  try {
    const client = await page.createCDPSession();
    await client.send('Network.enable');
    
    client.on('Network.requestWillBeSent', (params: any) => {
      if (params.type === 'Script') {
        const scriptUrl = params.request.url;
        if (!detectedScripts.has(scriptUrl)) {
          detectedScripts.add(scriptUrl);
          const trackingScript = identifyTrackingScript(scriptUrl);
          if (trackingScript) {
            scripts.push(trackingScript);
          }
        }
      }
    });
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout,
    });
    
    await new Promise(r => setTimeout(r, 3000));
    
    await tryClickConsentBanner(page);
    
    // After accepting consent, GA Consent Mode needs time to fire and set
    // cookies (e.g. _ga, _gid). 4 seconds gives enough headroom for async
    // gtag calls to complete after the consent signal propagates.
    await new Promise(r => setTimeout(r, 4000));
    
    const pageCookies = await page.cookies();
    for (const cookie of pageCookies) {
      cookies.push(classifyDetectedCookie(puppeteerCookieToDetected(cookie), targetDomain, url));
    }
    
    const storageItems = await getStorageItems(page);
    
    await client.detach().catch(() => {});
    
    return { cookies, scripts, storageItems };
  } catch (error) {
    console.error(`Error scanning page ${url}:`, error);
    return { cookies: [], scripts: [], storageItems: [] };
  }
}

export async function scanWebsite(url: string, onProgress?: (progress: { phase: string; pagesScanned: number; totalPages: number; currentUrl?: string }) => void): Promise<ScanResult> {
  const startTime = Date.now();
  let browser: Browser | null = null;
  
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    const targetDomain = urlObj.hostname;
    const baseUrl = urlObj.origin;
    
    // Pre-flight HTTP check: detect IP blocks / security challenges before
    // launching the browser (saves ~10s of startup time on blocked sites).
    try {
      const preCheck = await httpGet(url, 8000);
      if (isSecurityChallengePage(preCheck.body, url)) {
        return {
          success: false,
          cookies: [],
          error: SECURITY_BLOCK_ERROR,
          scannedAt: new Date(),
          scanDuration: Date.now() - startTime,
          scanMode: 'puppeteer',
        };
      }
    } catch {
      // If pre-check fails (e.g. timeout) just continue and let the browser try
    }

    const chromiumPath = findChromiumPath();
    if (!chromiumPath) {
      console.warn('Chromium not available, falling back to lightweight HTTP-only scan');
      onProgress?.({ phase: 'Running lightweight scan (no browser available)', pagesScanned: 0, totalPages: 1, currentUrl: url });
      const fallbackResult = await lightweightScan(url);
      onProgress?.({ phase: 'Finalizing results', pagesScanned: 1, totalPages: 1 });
      return fallbackResult;
    }
    
    const puppeteer = await getPuppeteer();
    browser = await puppeteer.default.launch({
      headless: true,
      executablePath: chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-extensions', '--disable-background-networking'],
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    onProgress?.({ phase: 'Scanning homepage', pagesScanned: 0, totalPages: 1, currentUrl: url });
    const detectedScripts = new Set<string>();
    const allCookies: ClassifiedCookie[] = [];
    const allScripts: DetectedScript[] = [];
    const allStorageItems: StorageItem[] = [];
    const scannedUrls: string[] = [];
    
    const homeResult = await scanSinglePage(page, url, targetDomain, detectedScripts, 15000);
    allCookies.push(...homeResult.cookies);
    allScripts.push(...homeResult.scripts);
    allStorageItems.push(...homeResult.storageItems);
    scannedUrls.push(url);
    
    const pageTitle = await page.title().catch(() => undefined);
    
    const extractedLinks = await extractSameDomainLinks(page, urlObj, 15);
    
    const pagesToScan = new Set<string>();
    
    for (const commonPage of COMMON_PAGES) {
      const fullUrl = baseUrl + commonPage;
      if (!scannedUrls.includes(fullUrl)) {
        pagesToScan.add(fullUrl);
      }
    }
    
    for (const link of extractedLinks) {
      if (!scannedUrls.includes(link)) {
        pagesToScan.add(link);
      }
    }
    
    const maxAdditionalPages = 5;
    const maxTotalTime = 55000;
    let additionalPagesScanned = 0;
    const totalExpectedPages = 1 + Math.min(Array.from(pagesToScan).length, maxAdditionalPages);
    
    for (const pageUrl of Array.from(pagesToScan)) {
      if (additionalPagesScanned >= maxAdditionalPages) break;
      if (Date.now() - startTime > maxTotalTime) break;
      
      try {
        onProgress?.({ phase: 'Scanning subpages', pagesScanned: 1 + additionalPagesScanned, totalPages: totalExpectedPages, currentUrl: pageUrl });
        const newPage = await browser.newPage();
        await newPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await newPage.setViewport({ width: 1920, height: 1080 });
        
        const response = await newPage.goto(pageUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 8000,
        }).catch(() => null);
        
        if (response && response.status() < 400) {
          await new Promise(r => setTimeout(r, 2000));
          
          const pageCookies = await newPage.cookies();
          for (const cookie of pageCookies) {
            allCookies.push(classifyDetectedCookie(puppeteerCookieToDetected(cookie), targetDomain, pageUrl));
          }
          
          const pageScripts = await newPage.$$eval('script[src]', scripts => 
            scripts.map(s => s.getAttribute('src')).filter(Boolean) as string[]
          );
          
          for (const scriptSrc of pageScripts) {
            try {
              const absoluteUrl = new URL(scriptSrc, pageUrl).href;
              if (!detectedScripts.has(absoluteUrl)) {
                detectedScripts.add(absoluteUrl);
                const trackingScript = identifyTrackingScript(absoluteUrl);
                if (trackingScript) {
                  allScripts.push(trackingScript);
                }
              }
            } catch {}
          }
          
          const pageStorage = await getStorageItems(newPage);
          allStorageItems.push(...pageStorage);
          
          scannedUrls.push(pageUrl);
          additionalPagesScanned++;
        }
        
        await newPage.close().catch(() => {});
      } catch (error) {
      }
    }
    
    const uniqueCookies = allCookies.filter((cookie, index, self) =>
      index === self.findIndex(c => c.name === cookie.name && c.domain === cookie.domain)
    );
    
    const uniqueScripts = allScripts.filter((script, index, self) =>
      index === self.findIndex(s => s.url === script.url)
    );
    
    const uniqueStorageItems = allStorageItems.filter((item, index, self) =>
      index === self.findIndex(s => s.key === item.key && s.type === item.type)
    );
    
    onProgress?.({ phase: 'Finalizing results', pagesScanned: scannedUrls.length, totalPages: scannedUrls.length });
    
    const scanDuration = Date.now() - startTime;
    
    return {
      success: true,
      cookies: uniqueCookies,
      scannedAt: new Date(),
      pageTitle,
      scannedUrls,
      storageItems: uniqueStorageItems,
      trackingScripts: uniqueScripts,
      scanDuration,
      scanMode: 'full',
    };
    
  } catch (error) {
    console.error('Cookie scan error:', error);
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    const isBrowserError = errorMsg.includes('WS endpoint') || 
                           errorMsg.includes('Failed to launch') || 
                           errorMsg.includes('spawn') ||
                           errorMsg.includes('ENOENT') ||
                           errorMsg.includes('chromium') ||
                           errorMsg.includes('Chromium') ||
                           error instanceof ChromiumUnavailableError;
    
    if (isBrowserError) {
      console.warn('Browser launch failed, attempting lightweight fallback scan...');
      if (browser) await browser.close().catch(() => {});
      browser = null;
      
      try {
        onProgress?.({ phase: 'Browser unavailable, running lightweight scan', pagesScanned: 0, totalPages: 1, currentUrl: url });
        const fallbackResult = await lightweightScan(url);
        onProgress?.({ phase: 'Finalizing results', pagesScanned: 1, totalPages: 1 });
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Lightweight scan also failed:', fallbackError);
      }
    }
    
    let userMessage = errorMsg;
    if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
      userMessage = 'Website not found. Please check the domain name is correct and the website is online.';
    } else if (errorMsg.includes('ECONNREFUSED')) {
      userMessage = 'Connection refused by the website. Please check if the website is online.';
    } else if (errorMsg.includes('timed out') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('Timed out')) {
      userMessage = 'The scan timed out. The website may be slow to respond or blocking automated access. Please try again later.';
    } else if (isBrowserError) {
      userMessage = 'The scanner could not start. This is a temporary server issue. Please try again later.';
    }
    
    return {
      success: false,
      cookies: [],
      error: userMessage,
      scannedAt: new Date(),
      scannedUrls: [],
      scanDuration: Date.now() - startTime,
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export async function quickScan(domain: string): Promise<ScanResult> {
  return scanWebsite(domain);
}
