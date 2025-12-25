import { db } from "./db";
import { users, websites, bannerConfigs, analyticsEvents } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Helper to generate random public IDs
function generatePublicId(): string {
  return Array.from({ length: 12 }, () => 
    Math.random().toString(36).substring(2)
  ).join('').substring(0, 12);
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if demo user already exists
  const [existingUser] = await db.select().from(users).where(eq(users.email, "demo@consentease.com"));
  
  let demoUser;
  if (existingUser) {
    console.log("✓ Demo user already exists");
    demoUser = existingUser;
  } else {
    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    [demoUser] = await db.insert(users).values({
      email: "demo@consentease.com",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Johnson",
      plan: "pro",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    }).returning();
    console.log("✓ Created demo user");
  }

  // Check if websites already exist for this user
  const existingWebsites = await db.select().from(websites).where(eq(websites.userId, demoUser.id));
  
  if (existingWebsites.length > 0) {
    console.log("✓ Demo websites already exist");
    return;
  }

  // Create demo websites
  const demoWebsites = [
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "saerensadvertising.com",
      status: "compliant",
      lastScan: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      cookiesFound: 12,
      scriptsFound: 5,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "ecommerce-shop.example",
      status: "compliant",
      lastScan: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      cookiesFound: 18,
      scriptsFound: 7,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "blog.techstartup.io",
      status: "attention",
      lastScan: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      cookiesFound: 8,
      scriptsFound: 3,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "portfolio.designer.com",
      status: "compliant",
      lastScan: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      cookiesFound: 5,
      scriptsFound: 2,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "restaurant-menu.local",
      status: "scanning",
      lastScan: null,
      cookiesFound: 0,
      scriptsFound: 0,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "fitness-tracker.app",
      status: "compliant",
      lastScan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      cookiesFound: 15,
      scriptsFound: 6,
    },
    {
      userId: demoUser.id,
      publicId: generatePublicId(),
      domain: "marketplace.eu",
      status: "compliant",
      lastScan: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      cookiesFound: 22,
      scriptsFound: 9,
    },
  ];

  const createdWebsites = await db.insert(websites).values(demoWebsites).returning();
  console.log(`✓ Created ${createdWebsites.length} demo websites`);

  // Create banner configs for each website
  const bannerConfigsData = createdWebsites.map((website, index) => ({
    websiteId: website.id,
    heading: index === 0 ? "We value your privacy" : "Cookie Notice",
    description: `We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.`,
    acceptText: "Accept All",
    rejectText: "Reject All",
    settingsText: "Preferences",
    position: index % 2 === 0 ? "bottom-left" : "bottom-right",
    theme: "light",
    primaryColor: "#726CEA",
    backgroundColor: "#ffffff",
    textColor: "#1e1e1e",
    borderRadius: 12,
    showIcon: true,
    fontFamily: "Inter",
    fontSize: "medium",
    shadow: "medium",
    backdropBlur: true,
    animation: "slide-up",
    buttonStyle: "filled",
    buttonShape: "rounded",
  }));

  await db.insert(bannerConfigs).values(bannerConfigsData);
  console.log(`✓ Created ${bannerConfigsData.length} banner configs`);

  // Create analytics events for the main website (last 14 days)
  const mainWebsite = createdWebsites[0];
  const analyticsData = [];
  const countries = ["Germany", "France", "United Kingdom", "Netherlands", "Belgium", "Spain", "Italy", "Canada"];
  
  for (let day = 13; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    
    // Generate random events for this day
    const dailyViews = Math.floor(Math.random() * 300) + 200; // 200-500 views per day
    
    for (let i = 0; i < dailyViews; i++) {
      const eventDate = new Date(date);
      eventDate.setHours(Math.floor(Math.random() * 24));
      eventDate.setMinutes(Math.floor(Math.random() * 60));
      
      // Banner shown event
      analyticsData.push({
        websiteId: mainWebsite.id,
        eventType: "banner_shown",
        country: countries[Math.floor(Math.random() * countries.length)],
        timestamp: eventDate,
      });
      
      // 75% accept rate, 20% reject rate, 5% no action
      const action = Math.random();
      if (action < 0.75) {
        analyticsData.push({
          websiteId: mainWebsite.id,
          eventType: "accept",
          country: countries[Math.floor(Math.random() * countries.length)],
          timestamp: new Date(eventDate.getTime() + Math.random() * 30000), // within 30 seconds
        });
      } else if (action < 0.95) {
        analyticsData.push({
          websiteId: mainWebsite.id,
          eventType: "reject",
          country: countries[Math.floor(Math.random() * countries.length)],
          timestamp: new Date(eventDate.getTime() + Math.random() * 30000),
        });
      }
    }
  }

  await db.insert(analyticsEvents).values(analyticsData);
  console.log(`✓ Created ${analyticsData.length} analytics events`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\nDemo user credentials:");
  console.log("  Email: demo@consentease.com");
  console.log("  Password: demo123");
}

seed().catch(console.error).finally(() => process.exit(0));
