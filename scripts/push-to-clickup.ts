const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const FOLDER_ID = '901512713527';

interface Task {
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4;
  tags: string[];
  status: string;
}

interface Category {
  name: string;
  tasks: Task[];
}

const backlog: Category[] = [
  {
    name: "Public Pages",
    tasks: [
      { name: "Privacy Policy pagina", description: "Juridisch vereiste pagina met privacy beleid. Momenteel placeholder link in footer.", priority: 2, tags: ["legal", "high-priority"], status: "TO DO" },
      { name: "Terms of Service pagina", description: "Juridisch vereiste pagina met algemene voorwaarden. Momenteel placeholder link.", priority: 2, tags: ["legal", "high-priority"], status: "TO DO" },
      { name: "Cookie Policy pagina", description: "Pagina met cookie beleid - ironisch dat een consent tool dit mist.", priority: 2, tags: ["legal", "high-priority"], status: "TO DO" },
      { name: "Prijzen standalone pagina", description: "Aparte /pricing route voor directe links en marketing.", priority: 3, tags: ["marketing"], status: "TO DO" },
      { name: "Blog/Resources sectie", description: "Content marketing voor SEO en thought leadership.", priority: 3, tags: ["marketing", "seo"], status: "TO DO" },
      { name: "FAQ pagina", description: "Veelgestelde vragen over het platform.", priority: 3, tags: ["support"], status: "TO DO" },
      { name: "Contact pagina", description: "Contactformulier en support informatie.", priority: 3, tags: ["support"], status: "TO DO" },
      { name: "Documentatie/Help Center", description: "Uitleg hoe de embed code te installeren op verschillende platforms.", priority: 3, tags: ["documentation"], status: "TO DO" },
      { name: "Case studies pagina", description: "Social proof met klantresultaten en testimonials.", priority: 4, tags: ["marketing"], status: "TO DO" },
      { name: "Affiliate/Partner pagina", description: "Partnerprogramma informatie en aanmelding.", priority: 4, tags: ["growth"], status: "TO DO" },
      { name: "Status pagina", description: "Uptime monitoring weergave voor klanten.", priority: 4, tags: ["support"], status: "TO DO" },
    ]
  },
  {
    name: "Dashboard Features",
    tasks: [
      { name: "Cookie categorieën beheer", description: "Gebruiker moet cookies kunnen categoriseren (Marketing, Analytics, Functional, etc.)", priority: 2, tags: ["feature", "high-priority"], status: "TO DO" },
      { name: "Handmatige cookie toevoegen", description: "Eigen cookies kunnen definiëren naast automatische scan.", priority: 2, tags: ["feature", "high-priority"], status: "TO DO" },
      { name: "Cookie beschrijvingen", description: "Uitleg per cookie voor website bezoekers in consent banner.", priority: 2, tags: ["feature", "high-priority"], status: "TO DO" },
      { name: "Granular consent opties", description: "Marketing, Analytics, Functional apart laten accepteren.", priority: 2, tags: ["feature", "compliance"], status: "TO DO" },
      { name: "Re-scan website functie", description: "Website opnieuw scannen op nieuwe cookies.", priority: 3, tags: ["feature"], status: "TO DO" },
      { name: "A/B testing voor banners", description: "Verschillende banner versies testen op conversie.", priority: 3, tags: ["feature", "analytics"], status: "TO DO" },
      { name: "Export analytics data", description: "CSV/Excel export van consent data.", priority: 3, tags: ["feature"], status: "TO DO" },
      { name: "Team members toevoegen", description: "Agency plan feature voor team beheer.", priority: 3, tags: ["feature", "agency"], status: "TO DO" },
      { name: "Cookie scanner historie", description: "Wijzigingen in cookies over tijd bekijken.", priority: 3, tags: ["feature"], status: "TO DO" },
      { name: "Custom CSS voor banner", description: "Geavanceerde styling voor power users.", priority: 4, tags: ["feature", "agency"], status: "TO DO" },
      { name: "Multi-taal banner", description: "Vertalingen voor internationale websites.", priority: 4, tags: ["feature", "i18n"], status: "TO DO" },
      { name: "Consent log export", description: "GDPR compliance bewijsvoering exporteren.", priority: 4, tags: ["feature", "compliance"], status: "TO DO" },
      { name: "Dashboard dark mode", description: "Thema voorkeur voor dashboard.", priority: 4, tags: ["ux"], status: "TO DO" },
    ]
  },
  {
    name: "Authenticatie & Beveiliging",
    tasks: [
      { name: "Wachtwoord vergeten flow", description: "Reset wachtwoord via email link.", priority: 2, tags: ["auth", "high-priority"], status: "TO DO" },
      { name: "Email verificatie", description: "Account bevestiging via email na registratie.", priority: 2, tags: ["auth", "high-priority"], status: "TO DO" },
      { name: "2FA (twee-factor authenticatie)", description: "Extra beveiliging optie met TOTP.", priority: 3, tags: ["auth", "security"], status: "TO DO" },
      { name: "OAuth (Google/GitHub login)", description: "Social login opties.", priority: 3, tags: ["auth"], status: "TO DO" },
      { name: "Session management", description: "Actieve sessies bekijken en beëindigen.", priority: 3, tags: ["security"], status: "TO DO" },
      { name: "Rate limiting implementeren", description: "API bescherming tegen misbruik (al in dependencies).", priority: 2, tags: ["security", "high-priority"], status: "TO DO" },
      { name: "Audit log", description: "Acties bijhouden voor compliance.", priority: 4, tags: ["security", "compliance"], status: "TO DO" },
    ]
  },
  {
    name: "Stripe & Billing",
    tasks: [
      { name: "Gratis proefperiode implementatie", description: "7-day trial in Stripe configureren voor Solo plan.", priority: 2, tags: ["billing", "high-priority"], status: "TO DO" },
      { name: "Upgrade/downgrade bevestiging", description: "Duidelijke UX bij plan wijziging met prijs voorvertoning.", priority: 3, tags: ["billing", "ux"], status: "TO DO" },
      { name: "Factuur historie in dashboard", description: "Facturen bekijken zonder Stripe portal.", priority: 3, tags: ["billing"], status: "TO DO" },
      { name: "Jaarlijkse prijzen (korting)", description: "Annual billing optie met korting.", priority: 3, tags: ["billing", "growth"], status: "TO DO" },
      { name: "Coupon codes ondersteuning", description: "Promocodes voor marketing campagnes.", priority: 4, tags: ["billing", "marketing"], status: "TO DO" },
      { name: "Referral programma", description: "Korting bij aanbrengen van nieuwe klanten.", priority: 4, tags: ["growth"], status: "TO DO" },
    ]
  },
  {
    name: "Analytics & Rapportage",
    tasks: [
      { name: "Echte geo-locatie tracking", description: "IP naar land detectie voor consent events.", priority: 3, tags: ["analytics"], status: "TO DO" },
      { name: "Device/browser breakdown", description: "Desktop vs mobiel statistieken.", priority: 3, tags: ["analytics"], status: "TO DO" },
      { name: "Trend grafieken", description: "Week/maand/jaar vergelijking van consent rates.", priority: 3, tags: ["analytics"], status: "TO DO" },
      { name: "Real-time dashboard", description: "Live consent events stream.", priority: 4, tags: ["analytics"], status: "TO DO" },
      { name: "Email rapporten", description: "Wekelijkse/maandelijkse samenvatting per email.", priority: 4, tags: ["analytics"], status: "TO DO" },
      { name: "Anomalie detectie", description: "Alerts bij ongewone consent patronen.", priority: 4, tags: ["analytics", "security"], status: "TO DO" },
    ]
  },
  {
    name: "Technische Verbeteringen",
    tasks: [
      { name: "Background jobs voor scanning", description: "Nu setTimeout, moet job queue worden (Bull/Redis).", priority: 2, tags: ["tech-debt", "high-priority"], status: "TO DO" },
      { name: "Echte cookie scanner", description: "Nu gesimuleerd, moet daadwerkelijk website crawlen.", priority: 2, tags: ["tech-debt", "high-priority"], status: "TO DO" },
      { name: "CDN voor banner script", description: "Snellere laadtijden voor klant websites.", priority: 3, tags: ["performance"], status: "TO DO" },
      { name: "Script caching", description: "Performance optimalisatie voor banner script.", priority: 3, tags: ["performance"], status: "TO DO" },
      { name: "Webhook retry mechanisme", description: "Mislukte Stripe webhooks opnieuw proberen.", priority: 3, tags: ["reliability"], status: "TO DO" },
      { name: "Database indices optimaliseren", description: "Query performance verbeteren.", priority: 3, tags: ["performance"], status: "TO DO" },
      { name: "Automated testing", description: "Unit/integration tests toevoegen.", priority: 3, tags: ["quality"], status: "TO DO" },
      { name: "Staging environment", description: "Test omgeving voor nieuwe features.", priority: 4, tags: ["devops"], status: "TO DO" },
    ]
  },
  {
    name: "Compliance & Features",
    tasks: [
      { name: "TCF 2.2 ondersteuning", description: "IAB Transparency & Consent Framework integratie.", priority: 3, tags: ["compliance"], status: "TO DO" },
      { name: "Consent preferences center", description: "Bezoekers kunnen consent achteraf wijzigen.", priority: 3, tags: ["compliance", "ux"], status: "TO DO" },
      { name: "Do Not Track respect", description: "Browser DNT signaal respecteren.", priority: 3, tags: ["compliance"], status: "TO DO" },
      { name: "Cookie wall optie", description: "Optie om toegang te blokkeren zonder consent.", priority: 4, tags: ["feature"], status: "TO DO" },
      { name: "GPC (Global Privacy Control)", description: "Nieuwe browser privacy standaard ondersteunen.", priority: 4, tags: ["compliance"], status: "TO DO" },
    ]
  },
  {
    name: "Groei & Integraties",
    tasks: [
      { name: "WordPress plugin", description: "Makkelijke installatie voor WordPress sites.", priority: 2, tags: ["integration", "high-priority"], status: "TO DO" },
      { name: "Shopify app", description: "E-commerce integratie voor Shopify stores.", priority: 3, tags: ["integration"], status: "TO DO" },
      { name: "Google Tag Manager template", description: "GTM community template voor makkelijke setup.", priority: 3, tags: ["integration"], status: "TO DO" },
      { name: "Zapier integratie", description: "Automations met andere tools.", priority: 4, tags: ["integration"], status: "TO DO" },
      { name: "Slack notificaties", description: "Team alerts naar Slack.", priority: 4, tags: ["integration"], status: "TO DO" },
      { name: "API documentatie", description: "Swagger/OpenAPI docs voor Agency API feature.", priority: 3, tags: ["documentation", "agency"], status: "TO DO" },
    ]
  },
  {
    name: "UX Verbeteringen",
    tasks: [
      { name: "Onboarding verbeteren", description: "Meer handholding voor nieuwe gebruikers.", priority: 3, tags: ["ux"], status: "TO DO" },
      { name: "In-app help/tooltips", description: "Contextuele hulp bij complexe features.", priority: 3, tags: ["ux"], status: "TO DO" },
      { name: "Keyboard shortcuts", description: "Power user features voor sneller werken.", priority: 4, tags: ["ux"], status: "TO DO" },
      { name: "Mobile responsive dashboard", description: "Dashboard beter bruikbaar op telefoon.", priority: 3, tags: ["ux", "mobile"], status: "TO DO" },
      { name: "Banner preview op eigen website", description: "Iframe preview met echte klant website.", priority: 3, tags: ["feature", "ux"], status: "TO DO" },
    ]
  },
  {
    name: "Business & Marketing",
    tasks: [
      { name: "Affiliate programma", description: "Partners belonen voor nieuwe klanten.", priority: 3, tags: ["growth"], status: "TO DO" },
      { name: "White-label reseller setup", description: "Volledige white-label voor agencies.", priority: 4, tags: ["agency"], status: "TO DO" },
      { name: "Live chat support", description: "Intercom/Crisp integratie voor support.", priority: 3, tags: ["support"], status: "TO DO" },
      { name: "NPS surveys", description: "Klanttevredenheid meten.", priority: 4, tags: ["analytics"], status: "TO DO" },
      { name: "Productboard integratie", description: "Feature requests van klanten verzamelen.", priority: 4, tags: ["product"], status: "TO DO" },
    ]
  },
];

async function makeRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': CLICKUP_API_KEY!,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

async function getListsInFolder(folderId: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/folder/${folderId}/list`);
  return data.lists;
}

async function createList(folderId: string, name: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/folder/${folderId}/list`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return data;
}

async function createTask(listId: string, task: Task) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: 'POST',
    body: JSON.stringify({
      name: task.name,
      description: task.description,
      priority: task.priority,
      tags: task.tags,
      status: task.status,
    }),
  });
  return data;
}

async function updateTaskStatus(taskId: string, status: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data;
}

async function getTasksInList(listId: string) {
  const data = await makeRequest(`https://api.clickup.com/api/v2/list/${listId}/task`);
  return data.tasks || [];
}

async function main() {
  if (!CLICKUP_API_KEY) {
    console.error('CLICKUP_API_KEY is not set');
    process.exit(1);
  }

  console.log('🚀 Starting ClickUp backlog import...\n');

  // Get existing lists
  console.log('📋 Fetching existing lists in folder...');
  const existingLists = await getListsInFolder(FOLDER_ID);
  console.log(`Found ${existingLists.length} existing lists\n`);

  const listMap = new Map<string, string>();
  for (const list of existingLists) {
    listMap.set(list.name, list.id);
  }

  let totalTasks = 0;
  let createdTasks = 0;

  for (const category of backlog) {
    console.log(`\n📁 Processing category: ${category.name}`);
    
    // Check if list exists, create if not
    let listId = listMap.get(category.name);
    if (!listId) {
      console.log(`  Creating new list: ${category.name}`);
      const newList = await createList(FOLDER_ID, category.name);
      listId = newList.id as string;
      listMap.set(category.name, listId);
    } else {
      console.log(`  Using existing list: ${category.name}`);
    }

    // Create tasks
    for (const task of category.tasks) {
      totalTasks++;
      try {
        await createTask(listId!, task);
        createdTasks++;
        const priorityEmoji = task.priority === 2 ? '🔴' : task.priority === 3 ? '🟡' : '⚪';
        console.log(`  ${priorityEmoji} Created: ${task.name}`);
        
        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`  ❌ Failed to create: ${task.name}`, error);
      }
    }
  }

  console.log(`\n✅ Done! Created ${createdTasks}/${totalTasks} tasks in ClickUp.`);
}

main().catch(console.error);
