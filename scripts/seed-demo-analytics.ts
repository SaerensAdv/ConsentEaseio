import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { analyticsEvents, consentLogs } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";
import * as schema from "../shared/schema";

const connectionString = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: No database URL found. Set PROD_DATABASE_URL or DATABASE_URL.");
  process.exit(1);
}

console.log("[SeedDemo] Connecting to database...");
const pool = new pg.Pool({ connectionString });
const db = drizzle(pool, { schema });

const WEBSITE_ID = "069abbd3-269a-4215-b99f-80da70487814";

const COUNTRIES = [
  { code: "BE", weight: 55 },
  { code: "NL", weight: 20 },
  { code: "FR", weight: 10 },
  { code: "DE", weight: 8 },
  { code: "US", weight: 4 },
  { code: "GB", weight: 3 },
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.0",
];

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * total;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[0];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

async function seedAnalytics() {
  console.log("Seeding realistic analytics data for demo-store.example.com...");
  
  const analyticsRecords: typeof analyticsEvents.$inferInsert[] = [];
  const consentRecords: typeof consentLogs.$inferInsert[] = [];
  
  const now = new Date();
  const daysToGenerate = 42;
  
  for (let dayOffset = daysToGenerate; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let baseImpressions = isWeekend ? randomInt(180, 280) : randomInt(320, 480);
    
    if (dayOffset >= 21 && dayOffset <= 28) {
      baseImpressions = Math.round(baseImpressions * 1.25);
    }
    
    if (dayOffset <= 3) {
      baseImpressions = Math.round(baseImpressions * (1 - dayOffset * 0.15));
    }
    
    const hourlyDistribution = [
      { hour: 0, weight: 2 }, { hour: 1, weight: 1 }, { hour: 2, weight: 1 },
      { hour: 3, weight: 1 }, { hour: 4, weight: 1 }, { hour: 5, weight: 2 },
      { hour: 6, weight: 4 }, { hour: 7, weight: 6 }, { hour: 8, weight: 10 },
      { hour: 9, weight: 12 }, { hour: 10, weight: 14 }, { hour: 11, weight: 13 },
      { hour: 12, weight: 15 }, { hour: 13, weight: 14 }, { hour: 14, weight: 12 },
      { hour: 15, weight: 11 }, { hour: 16, weight: 10 }, { hour: 17, weight: 9 },
      { hour: 18, weight: 11 }, { hour: 19, weight: 14 }, { hour: 20, weight: 16 },
      { hour: 21, weight: 12 }, { hour: 22, weight: 7 }, { hour: 23, weight: 4 },
    ];
    
    for (let i = 0; i < baseImpressions; i++) {
      const hour = pickWeighted(hourlyDistribution).hour;
      const timestamp = new Date(date);
      timestamp.setHours(hour, randomInt(0, 59), randomInt(0, 59), randomInt(0, 999));
      
      const country = pickWeighted(COUNTRIES).code;
      const visitorId = `v_${hashString(`${date.toISOString()}-${i}-${Math.random()}`)}`;
      const userAgent = USER_AGENTS[randomInt(0, USER_AGENTS.length - 1)];
      const ipHash = hashString(`${country}-${visitorId}-${Math.random()}`);
      
      analyticsRecords.push({
        id: uuidv4(),
        websiteId: WEBSITE_ID,
        eventType: "banner_shown",
        country,
        timestamp,
      });
      
      const random = Math.random();
      let action: string;
      let consentChoices: Record<string, boolean>;
      
      if (random < 0.78) {
        action = "accept_all";
        consentChoices = { necessary: true, functional: true, analytics: true, marketing: true };
        
        analyticsRecords.push({
          id: uuidv4(),
          websiteId: WEBSITE_ID,
          eventType: "accept",
          country,
          timestamp: new Date(timestamp.getTime() + randomInt(500, 8000)),
        });
      } else if (random < 0.88) {
        action = "reject_all";
        consentChoices = { necessary: true, functional: false, analytics: false, marketing: false };
        
        analyticsRecords.push({
          id: uuidv4(),
          websiteId: WEBSITE_ID,
          eventType: "reject",
          country,
          timestamp: new Date(timestamp.getTime() + randomInt(500, 5000)),
        });
      } else if (random < 0.94) {
        action = "save_preferences";
        const includeAnalytics = Math.random() < 0.65;
        const includeMarketing = Math.random() < 0.35;
        const includeFunctional = Math.random() < 0.72;
        consentChoices = { 
          necessary: true, 
          functional: includeFunctional,
          analytics: includeAnalytics, 
          marketing: includeMarketing 
        };
        
        analyticsRecords.push({
          id: uuidv4(),
          websiteId: WEBSITE_ID,
          eventType: "settings_click",
          country,
          timestamp: new Date(timestamp.getTime() + randomInt(300, 3000)),
        });
        analyticsRecords.push({
          id: uuidv4(),
          websiteId: WEBSITE_ID,
          eventType: "accept",
          country,
          timestamp: new Date(timestamp.getTime() + randomInt(8000, 25000)),
        });
      } else {
        continue;
      }
      
      const expiresAt = new Date(timestamp);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      consentRecords.push({
        id: uuidv4(),
        websiteId: WEBSITE_ID,
        visitorId,
        action,
        ipHash,
        userAgent,
        country,
        region: country === "BE" ? ["Brussels", "Antwerp", "Ghent", "Bruges", "Leuven"][randomInt(0, 4)] :
                country === "NL" ? ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag"][randomInt(0, 3)] :
                country === "FR" ? ["Paris", "Lyon", "Marseille", "Lille"][randomInt(0, 3)] :
                country === "DE" ? ["Berlin", "Munich", "Hamburg", "Cologne"][randomInt(0, 3)] :
                country === "US" ? ["New York", "Los Angeles", "Chicago", "Houston"][randomInt(0, 3)] :
                country === "GB" ? ["London", "Manchester", "Birmingham"][randomInt(0, 2)] : null,
        consentChoices: JSON.stringify(consentChoices),
        bannerVersion: "1.0.0",
        policyVersion: "2024-01",
        timestamp,
        expiresAt,
      });
    }
    
    console.log(`Day -${dayOffset}: ${baseImpressions} impressions generated`);
  }
  
  console.log(`\nInserting ${analyticsRecords.length} analytics events...`);
  for (let i = 0; i < analyticsRecords.length; i += 500) {
    const batch = analyticsRecords.slice(i, i + 500);
    await db.insert(analyticsEvents).values(batch);
    console.log(`  Inserted analytics batch ${Math.floor(i/500) + 1}/${Math.ceil(analyticsRecords.length/500)}`);
  }
  
  console.log(`\nInserting ${consentRecords.length} consent logs...`);
  for (let i = 0; i < consentRecords.length; i += 500) {
    const batch = consentRecords.slice(i, i + 500);
    await db.insert(consentLogs).values(batch);
    console.log(`  Inserted consent batch ${Math.floor(i/500) + 1}/${Math.ceil(consentRecords.length/500)}`);
  }
  
  console.log("\nDone! Summary:");
  console.log(`  Total analytics events: ${analyticsRecords.length}`);
  console.log(`  Total consent logs: ${consentRecords.length}`);
  console.log(`  Date range: ${daysToGenerate} days`);
  
  process.exit(0);
}

seedAnalytics().catch(console.error);
