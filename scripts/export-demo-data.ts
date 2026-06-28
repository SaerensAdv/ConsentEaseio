import { db } from "../server/db";
import { analyticsEvents, consentLogs } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

const WEBSITE_ID = "069abbd3-269a-4215-b99f-80da70487814";

async function exportData() {
  console.log("Exporting demo data...");
  
  const analytics = await db.select().from(analyticsEvents).where(eq(analyticsEvents.websiteId, WEBSITE_ID));
  const consents = await db.select().from(consentLogs).where(eq(consentLogs.websiteId, WEBSITE_ID));
  
  let sql = `-- Demo data voor demo-store.example.com
-- Voer dit uit in de PRODUCTION database SQL console

-- Stap 1: Verwijder oude data
DELETE FROM analytics_events WHERE website_id = '${WEBSITE_ID}';
DELETE FROM consent_logs WHERE website_id = '${WEBSITE_ID}';

-- Stap 2: Insert analytics events
`;

  // Batch inserts for analytics
  for (let i = 0; i < analytics.length; i += 100) {
    const batch = analytics.slice(i, i + 100);
    sql += `INSERT INTO analytics_events (id, website_id, event_type, country, timestamp) VALUES\n`;
    sql += batch.map(e => 
      `('${e.id}', '${e.websiteId}', '${e.eventType}', '${e.country}', '${e.timestamp?.toISOString()}')`
    ).join(',\n');
    sql += ';\n\n';
  }

  sql += `-- Stap 3: Insert consent logs\n`;
  
  for (let i = 0; i < consents.length; i += 50) {
    const batch = consents.slice(i, i + 50);
    sql += `INSERT INTO consent_logs (id, website_id, visitor_id, action, ip_hash, user_agent, country, region, consent_choices, banner_version, policy_version, timestamp, expires_at) VALUES\n`;
    sql += batch.map(c => {
      const escape = (s: string | null) => s ? s.replace(/'/g, "''") : '';
      return `('${c.id}', '${c.websiteId}', '${escape(c.visitorId)}', '${c.action}', '${escape(c.ipHash)}', '${escape(c.userAgent)}', '${c.country}', ${c.region ? `'${escape(c.region)}'` : 'NULL'}, '${escape(c.consentChoices)}', '${c.bannerVersion}', '${c.policyVersion}', '${c.timestamp?.toISOString()}', '${c.expiresAt?.toISOString()}')`;
    }).join(',\n');
    sql += ';\n\n';
  }

  fs.writeFileSync('production-demo-data.sql', sql);
  console.log(`Exported to production-demo-data.sql (${Math.round(sql.length/1024)}KB)`);
  console.log(`  Analytics: ${analytics.length} records`);
  console.log(`  Consents: ${consents.length} records`);
  
  process.exit(0);
}

exportData().catch(console.error);
