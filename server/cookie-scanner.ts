import { chromium, Browser, BrowserContext } from 'playwright';
import { classifyCookie, guessCookieCategory, type KnownCookie } from './cookie-knowledge-base';

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
}

export interface ScanResult {
  success: boolean;
  cookies: ClassifiedCookie[];
  error?: string;
  scannedAt: Date;
  pageTitle?: string;
  screenshotUrl?: string;
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

function classifyDetectedCookie(cookie: DetectedCookie, targetDomain: string): ClassifiedCookie {
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
    };
  }
  
  const guessedCategory = guessCookieCategory(cookie.name);
  
  return {
    name: cookie.name,
    provider: cookieDomain,
    category: guessedCategory,
    purpose: `Cookie set by ${cookieDomain}`,
    expiry: formatExpiry(cookie.expires),
    type: isThirdParty ? 'third-party' : 'first-party',
    domain: cookie.domain,
  };
}

export async function scanWebsite(url: string): Promise<ScanResult> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    const targetDomain = urlObj.hostname;
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    
    context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });
    
    const page = await context.newPage();
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    await page.waitForTimeout(2000);
    
    // Try to find and click cookie consent banner accept button safely
    // Only target elements that look like consent banners (not other page buttons)
    try {
      const consentSelectors = [
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
      ];
      
      for (const selector of consentSelectors) {
        const buttons = await page.$$(selector);
        for (const button of buttons) {
          const text = await button.textContent();
          const isVisible = await button.isVisible().catch(() => false);
          if (isVisible && text && /accept|agree|ok|got it|allow|alle akzeptieren|accepter/i.test(text)) {
            await button.click().catch(() => {});
            await page.waitForTimeout(1000);
            break;
          }
        }
      }
    } catch (e) {
      // Ignore consent banner interaction errors
    }
    
    const cookies = await context.cookies();
    
    const pageTitle = await page.title();
    
    const classifiedCookies: ClassifiedCookie[] = cookies.map(cookie => 
      classifyDetectedCookie({
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
        value: cookie.value,
      }, targetDomain)
    );
    
    const uniqueCookies = classifiedCookies.filter((cookie, index, self) =>
      index === self.findIndex(c => c.name === cookie.name && c.domain === cookie.domain)
    );
    
    return {
      success: true,
      cookies: uniqueCookies,
      scannedAt: new Date(),
      pageTitle,
    };
    
  } catch (error) {
    console.error('Cookie scan error:', error);
    return {
      success: false,
      cookies: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      scannedAt: new Date(),
    };
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

export async function quickScan(domain: string): Promise<ScanResult> {
  return scanWebsite(domain);
}
