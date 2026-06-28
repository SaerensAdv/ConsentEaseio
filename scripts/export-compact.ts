import { db } from "../server/db";
import { analyticsEvents, consentLogs } from "../shared/schema";
import { eq, gte, and } from "drizzle-orm";
import * as fs from "fs";

const WID = "069abbd3-269a-4215-b99f-80da70487814";
const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 3);

async function run() {
  const a = await db.select().from(analyticsEvents).where(and(eq(analyticsEvents.websiteId, WID), gte(analyticsEvents.timestamp, cutoff)));
  const c = await db.select().from(consentLogs).where(and(eq(consentLogs.websiteId, WID), gte(consentLogs.timestamp, cutoff)));
  
  let sql = `DELETE FROM analytics_events WHERE website_id='${WID}';DELETE FROM consent_logs WHERE website_id='${WID}';\n`;
  
  const aChunks = [];
  for (let i = 0; i < a.length; i += 500) {
    aChunks.push(`INSERT INTO analytics_events(id,website_id,event_type,country,timestamp)VALUES` + 
      a.slice(i,i+500).map(e=>`('${e.id}','${e.websiteId}','${e.eventType}','${e.country}','${e.timestamp?.toISOString()}')`).join(',') + ';');
  }
  
  const cChunks = [];
  for (let i = 0; i < c.length; i += 200) {
    const esc = (s:string|null) => s?.replace(/'/g,"''") || '';
    cChunks.push(`INSERT INTO consent_logs(id,website_id,visitor_id,action,ip_hash,user_agent,country,region,consent_choices,banner_version,policy_version,timestamp,expires_at)VALUES` +
      c.slice(i,i+200).map(x=>`('${x.id}','${x.websiteId}','${esc(x.visitorId)}','${x.action}','${esc(x.ipHash)}','${esc(x.userAgent)}','${x.country}',${x.region?`'${esc(x.region)}'`:'NULL'},'${esc(x.consentChoices)}','${x.bannerVersion}','${x.policyVersion}','${x.timestamp?.toISOString()}','${x.expiresAt?.toISOString()}')`).join(',') + ';');
  }
  
  sql += aChunks.join('\n') + '\n' + cChunks.join('\n');
  fs.writeFileSync('prod-3days.sql', sql);
  console.log(`prod-3days.sql: ${Math.round(sql.length/1024)}KB | ${a.length} events | ${c.length} consents`);
  process.exit(0);
}
run();
