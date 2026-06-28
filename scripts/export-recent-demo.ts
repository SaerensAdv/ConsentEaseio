import { db } from "../server/db";
import { analyticsEvents, consentLogs } from "../shared/schema";
import { eq, gte, and } from "drizzle-orm";
import * as fs from "fs";

const WEBSITE_ID = "069abbd3-269a-4215-b99f-80da70487814";
const DAYS = 14;

async function exportData() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS);
  
  console.log(`Exporting last ${DAYS} days...`);
  
  const analytics = await db.select().from(analyticsEvents)
    .where(and(eq(analyticsEvents.websiteId, WEBSITE_ID), gte(analyticsEvents.timestamp, cutoff)));
  const consents = await db.select().from(consentLogs)
    .where(and(eq(consentLogs.websiteId, WEBSITE_ID), gte(consentLogs.timestamp, cutoff)));
  
  let sql = `-- Demo data (laatste ${DAYS} dagen) voor demo-store.example.com
-- Kopieer dit naar Production SQL Console

DELETE FROM analytics_events WHERE website_id = '${WEBSITE_ID}';
DELETE FROM consent_logs WHERE website_id = '${WEBSITE_ID}';

`;

  for (let i = 0; i < analytics.length; i += 200) {
    const batch = analytics.slice(i, i + 200);
    sql += `INSERT INTO analytics_events (id, website_id, event_type, country, timestamp) VALUES\n`;
    sql += batch.map(e => 
      `('${e.id}','${e.websiteId}','${e.eventType}','${e.country}','${e.timestamp?.toISOString()}')`
    ).join(',\n');
    sql += ';\n';
  }

  for (let i = 0; i < consents.length; i += 100) {
    const batch = consents.slice(i, i + 100);
    sql += `INSERT INTO consent_logs (id, website_id, visitor_id, action, ip_hash, user_agent, country, region, consent_choices, banner_version, policy_version, timestamp, expires_at) VALUES\n`;
    sql += batch.map(c => {
      const esc = (s: string | null) => s ? s.replace(/'/g, "''") : '';
      return `('${c.id}','${c.websiteId}','${esc(c.visitorId)}','${c.action}','${esc(c.ipHash)}','${esc(c.userAgent)}','${c.country}',${c.region ? `'${esc(c.region)}'` : 'NULL'},'${esc(c.consentChoices)}','${c.bannerVersion}','${c.policyVersion}','${c.timestamp?.toISOString()}','${c.expiresAt?.toISOString()}')`;
    }).join(',\n');
    sql += ';\n';
  }

  fs.writeFileSync('production-demo-14days.sql', sql);
  console.log(`Bestand: production-demo-14days.sql (${Math.round(sql.length/1024)}KB)`);
  console.log(`  Analytics: ${analytics.length}`);
  console.log(`  Consents: ${consents.length}`);
  process.exit(0);
}

exportData().catch(console.error);
