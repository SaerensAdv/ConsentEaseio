import { db } from "../server/db";
import { analyticsEvents, consentLogs } from "../shared/schema";
import { eq, gte, and } from "drizzle-orm";
import * as fs from "fs";

const WEBSITE_ID = "069abbd3-269a-4215-b99f-80da70487814";

async function exportData() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  
  const analytics = await db.select().from(analyticsEvents)
    .where(and(eq(analyticsEvents.websiteId, WEBSITE_ID), gte(analyticsEvents.timestamp, cutoff)));
  const consents = await db.select().from(consentLogs)
    .where(and(eq(consentLogs.websiteId, WEBSITE_ID), gte(consentLogs.timestamp, cutoff)));
  
  let sql = `DELETE FROM analytics_events WHERE website_id = '${WEBSITE_ID}';\nDELETE FROM consent_logs WHERE website_id = '${WEBSITE_ID}';\n`;

  for (let i = 0; i < analytics.length; i += 500) {
    const batch = analytics.slice(i, i + 500);
    sql += `INSERT INTO analytics_events (id, website_id, event_type, country, timestamp) VALUES ` +
      batch.map(e => `('${e.id}','${e.websiteId}','${e.eventType}','${e.country}','${e.timestamp?.toISOString()}')`).join(',') + ';\n';
  }

  for (let i = 0; i < consents.length; i += 200) {
    const batch = consents.slice(i, i + 200);
    sql += `INSERT INTO consent_logs (id, website_id, visitor_id, action, ip_hash, user_agent, country, region, consent_choices, banner_version, policy_version, timestamp, expires_at) VALUES ` +
      batch.map(c => {
        const e = (s: string | null) => s ? s.replace(/'/g, "''") : '';
        return `('${c.id}','${c.websiteId}','${e(c.visitorId)}','${c.action}','${e(c.ipHash)}','${e(c.userAgent)}','${c.country}',${c.region ? `'${e(c.region)}'` : 'NULL'},'${e(c.consentChoices)}','${c.bannerVersion}','${c.policyVersion}','${c.timestamp?.toISOString()}','${c.expiresAt?.toISOString()}')`;
      }).join(',') + ';\n';
  }

  fs.writeFileSync('prod-demo-week.sql', sql);
  console.log(`prod-demo-week.sql: ${Math.round(sql.length/1024)}KB | Analytics: ${analytics.length} | Consents: ${consents.length}`);
  process.exit(0);
}

exportData().catch(console.error);
