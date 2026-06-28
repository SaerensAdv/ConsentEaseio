const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

const LIST_IDS = {
  CUSTOMERS: "901522165599",
  SUPPORT_TICKETS: "901522317206",
  FEEDBACK: "901522317207",
  AANVRAGEN: "901522317209",
  BUGS: "901522317210",
  RELEASES: "901522317211",
} as const;

const FOLDER_IDS = {
  KLANTEN_SUPPORT: "901514676336",
  PRODUCT_DEVELOPMENT: "901512713527",
} as const;

const SPACE_ID = "90159033137";
const TEAM_ID = "9015913612";

const CUSTOM_FIELD_IDS = {
  PLAN_TYPE: "e26bba1d-d804-4104-be04-5fdfa3ee6875",
  DOMEIN: "150be3cc-9eda-42c8-b807-f0730e5a340a",
  MRR: "9a196928-8d00-4a5f-bc3b-fc2d6c201371",
  BILLING_INTERVAL: "1dd552f7-0c7f-42c6-962f-23d1364c7cb2",
  REGISTRATIEDATUM: "f49da56b-32c9-4c98-b19a-be891592b3f6",
  EMAIL: "b98f7a89-9808-47be-94ca-c0b2ce11add8",
} as const;

const PLAN_MRR_CENTS: Record<string, number> = {
  starter: 300,
  solo: 700,
  premium: 1200,
  pro: 1900,
  business: 3500,
  agency: 5900,
  agency_pro: 12900,
};

const PLAN_TYPE_INDEX: Record<string, number> = {
  starter: 0,
  solo: 1,
  premium: 2,
  pro: 3,
  business: 4,
  agency: 5,
  agency_pro: 6,
};

const BILLING_INTERVAL_INDEX: Record<string, number> = {
  monthly: 0,
  yearly: 1,
};

function getApiKey(): string | null {
  const key = process.env.CLICKUP_API_KEY;
  if (!key) {
    console.warn("[ClickUp] CLICKUP_API_KEY not set — skipping sync");
    return null;
  }
  return key;
}

async function clickupRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(`${CLICKUP_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[ClickUp] API error ${response.status}: ${error}`);
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("[ClickUp] Request failed:", err);
    return null;
  }
}

function fireAndForget(fn: () => Promise<any>, label: string) {
  fn().catch((err) => {
    console.error(`[ClickUp] ${label} failed:`, err);
  });
}

export function syncNewCustomer(data: {
  email: string;
  domain: string;
  plan: string;
  userId: number | string;
  billingInterval?: string;
}) {
  fireAndForget(async () => {
    const result = await clickupRequest<any>(`/list/${LIST_IDS.CUSTOMERS}/task`, {
      method: "POST",
      body: JSON.stringify({
        name: data.domain,
        description: [
          `**New Customer Registration**`,
          ``,
          `- **Email:** ${data.email}`,
          `- **Domain:** ${data.domain}`,
          `- **Plan:** ${data.plan}`,
          `- **User ID:** ${data.userId}`,
          `- **Registered:** ${new Date().toISOString()}`,
        ].join("\n"),
        status: "not started",
        priority: 3,
        tags: ["auto-sync", "new-registration"],
        custom_fields: [
          { id: CUSTOM_FIELD_IDS.EMAIL, value: data.email },
          ...(PLAN_TYPE_INDEX[data.plan] !== undefined
            ? [{ id: CUSTOM_FIELD_IDS.PLAN_TYPE, value: PLAN_TYPE_INDEX[data.plan] }]
            : []),
          { id: CUSTOM_FIELD_IDS.DOMEIN, value: `https://${data.domain}` },
          { id: CUSTOM_FIELD_IDS.MRR, value: PLAN_MRR_CENTS[data.plan] ?? 0 },
          { id: CUSTOM_FIELD_IDS.REGISTRATIEDATUM, value: Date.now() },
          ...(data.billingInterval && BILLING_INTERVAL_INDEX[data.billingInterval] !== undefined
            ? [{ id: CUSTOM_FIELD_IDS.BILLING_INTERVAL, value: BILLING_INTERVAL_INDEX[data.billingInterval] }]
            : []),
        ],
      }),
    });

    if (result) {
      console.log(`[ClickUp] Customer created for ${data.domain} (task ${result.id})`);
    }
  }, `syncNewCustomer(${data.email})`);
}

export function syncPublicScan(data: {
  domain: string;
  cookiesFound: number;
}) {
  fireAndForget(async () => {
    const result = await clickupRequest(`/list/${LIST_IDS.AANVRAGEN}/task`, {
      method: "POST",
      body: JSON.stringify({
        name: `Scan lead: ${data.domain}`,
        description: [
          `**Public Cookie Scan (Lead)**`,
          ``,
          `- **Domain:** ${data.domain}`,
          `- **Cookies found:** ${data.cookiesFound}`,
          `- **Scanned at:** ${new Date().toISOString()}`,
        ].join("\n"),
        status: "to do",
        priority: 3,
        tags: ["auto-sync", "public-scan", "lead"],
      }),
    });

    if (result) {
      console.log(`[ClickUp] Public scan lead created for ${data.domain} (task ${result.id})`);
    }
  }, `syncPublicScan(${data.domain})`);
}

export function syncCookieScanResult(data: {
  domain: string;
  cookiesFound: number;
  scanMode: string;
  userId: number;
  websiteId: string | number;
}) {
  fireAndForget(async () => {
    const tasks = await clickupRequest<{ tasks: any[] }>(
      `/list/${LIST_IDS.CUSTOMERS}/task?include_closed=false`
    );

    if (!tasks?.tasks) return;

    const customerTask = tasks.tasks.find(
      (t: any) =>
        t.name.toLowerCase() === data.domain.toLowerCase() ||
        t.description?.includes(data.domain)
    );

    if (customerTask) {
      await clickupRequest(`/task/${customerTask.id}/comment`, {
        method: "POST",
        body: JSON.stringify({
          comment_text: [
            `🔍 Cookie Scan Completed`,
            ``,
            `- Domain: ${data.domain}`,
            `- Cookies found: ${data.cookiesFound}`,
            `- Scan mode: ${data.scanMode}`,
            `- Date: ${new Date().toISOString()}`,
          ].join("\n"),
        }),
      });
      console.log(`[ClickUp] Scan comment added to customer ${data.domain}`);
    } else {
      console.log(`[ClickUp] No customer task found for ${data.domain} — skipping scan comment`);
    }
  }, `syncCookieScanResult(${data.domain})`);
}

export async function createSupportTicket(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: number;
  source?: string;
}): Promise<{ success: boolean; taskId?: string }> {
  try {
    const result = await clickupRequest<any>(
      `/list/${LIST_IDS.SUPPORT_TICKETS}/task`,
      {
        method: "POST",
        body: JSON.stringify({
          name: data.subject,
          description: [
            `**Support Ticket**`,
            ``,
            `- **From:** ${data.name} (${data.email})`,
            data.userId ? `- **User ID:** ${data.userId}` : "",
            `- **Source:** ${data.source || "contact-form"}`,
            `- **Created:** ${new Date().toISOString()}`,
            ``,
            `---`,
            ``,
            data.message,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "to do",
          priority: 3,
          tags: ["auto-sync", data.source || "contact-form"],
        }),
      }
    );

    if (result) {
      console.log(`[ClickUp] Support ticket created: ${data.subject} (task ${result.id})`);
      return { success: true, taskId: result.id };
    }
    return { success: false };
  } catch (err) {
    console.error(`[ClickUp] createSupportTicket failed:`, err);
    return { success: false };
  }
}

export async function createFeedbackRequest(data: {
  title: string;
  description: string;
  type: "feedback" | "feature-request" | "improvement";
  email?: string;
  userId?: number;
}): Promise<{ success: boolean; taskId?: string }> {
  try {
    const priorityMap = {
      "feature-request": 2 as const,
      improvement: 3 as const,
      feedback: 4 as const,
    };

    const result = await clickupRequest<any>(
      `/list/${LIST_IDS.FEEDBACK}/task`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `[${data.type}] ${data.title}`,
          description: [
            `**${data.type === "feature-request" ? "Feature Request" : data.type === "improvement" ? "Improvement" : "Feedback"}**`,
            ``,
            data.email ? `- **From:** ${data.email}` : "",
            data.userId ? `- **User ID:** ${data.userId}` : "",
            `- **Created:** ${new Date().toISOString()}`,
            ``,
            `---`,
            ``,
            data.description,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "to do",
          priority: priorityMap[data.type] || 3,
          tags: ["auto-sync", data.type],
        }),
      }
    );

    if (result) {
      console.log(`[ClickUp] Feedback created: ${data.title} (task ${result.id})`);
      return { success: true, taskId: result.id };
    }
    return { success: false };
  } catch (err) {
    console.error(`[ClickUp] createFeedbackRequest failed:`, err);
    return { success: false };
  }
}

export function logBug(data: {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  source?: string;
  userId?: number;
}) {
  fireAndForget(async () => {
    const priorityMap = {
      critical: 1 as const,
      high: 2 as const,
      medium: 3 as const,
      low: 4 as const,
    };

    const result = await clickupRequest<any>(
      `/list/${LIST_IDS.BUGS}/task`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `[Bug] ${data.title}`,
          description: [
            `**Bug Report**`,
            ``,
            `- **Severity:** ${data.severity}`,
            data.userId ? `- **Reported by User ID:** ${data.userId}` : "",
            `- **Source:** ${data.source || "system"}`,
            `- **Created:** ${new Date().toISOString()}`,
            ``,
            `---`,
            ``,
            data.description,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "to do",
          priority: priorityMap[data.severity],
          tags: ["auto-sync", "bug", data.severity],
        }),
      }
    );

    if (result) {
      console.log(`[ClickUp] Bug logged: ${data.title} (task ${result.id})`);
    }
  }, `logBug(${data.title})`);
}

export function updateCustomerStatus(data: {
  email: string;
  domain?: string;
  status: "active" | "inactive" | "in progress";
  plan?: string;
  billingInterval?: string;
}) {
  fireAndForget(async () => {
    const tasks = await clickupRequest<{ tasks: any[] }>(
      `/list/${LIST_IDS.CUSTOMERS}/task?include_closed=true`
    );

    if (!tasks?.tasks) return;

    const customerTask = tasks.tasks.find(
      (t: any) =>
        t.description?.includes(data.email) ||
        (data.domain &&
          t.name.toLowerCase() === data.domain.toLowerCase())
    );

    if (!customerTask) {
      console.log(`[ClickUp] No customer task found for ${data.email} — skipping status update`);
      return;
    }

    const failures: string[] = [];

    const statusResult = await clickupRequest(`/task/${customerTask.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: data.status }),
    });
    if (!statusResult) failures.push("status");

    if (data.plan) {
      const planIndex = PLAN_TYPE_INDEX[data.plan];
      if (planIndex !== undefined) {
        const planResult = await clickupRequest(
          `/task/${customerTask.id}/field/${CUSTOM_FIELD_IDS.PLAN_TYPE}`,
          { method: "POST", body: JSON.stringify({ value: planIndex }) }
        );
        if (!planResult) failures.push("plan_type");
      }

      const mrr = PLAN_MRR_CENTS[data.plan] ?? 0;
      const mrrResult = await clickupRequest(
        `/task/${customerTask.id}/field/${CUSTOM_FIELD_IDS.MRR}`,
        { method: "POST", body: JSON.stringify({ value: mrr }) }
      );
      if (!mrrResult) failures.push("mrr");
    }

    if (data.billingInterval) {
      const intervalIndex = BILLING_INTERVAL_INDEX[data.billingInterval];
      if (intervalIndex !== undefined) {
        const intervalResult = await clickupRequest(
          `/task/${customerTask.id}/field/${CUSTOM_FIELD_IDS.BILLING_INTERVAL}`,
          { method: "POST", body: JSON.stringify({ value: intervalIndex }) }
        );
        if (!intervalResult) failures.push("billing_interval");
      }
    }

    if (failures.length > 0) {
      console.warn(`[ClickUp] Customer ${data.email} partially updated — failed fields: ${failures.join(", ")}`);
    } else {
      console.log(`[ClickUp] Customer ${data.email} status updated to "${data.status}"`);
    }
  }, `updateCustomerStatus(${data.email})`);
}

export function logRelease(data: {
  version: string;
  title: string;
  changes: string[];
  type?: "feature" | "bugfix" | "improvement" | "major";
}) {
  fireAndForget(async () => {
    const priorityMap = {
      major: 1 as const,
      feature: 2 as const,
      improvement: 3 as const,
      bugfix: 4 as const,
    };

    const result = await clickupRequest<any>(
      `/list/${LIST_IDS.RELEASES}/task`,
      {
        method: "POST",
        body: JSON.stringify({
          name: `v${data.version} — ${data.title}`,
          description: [
            `**Release v${data.version}**`,
            ``,
            `**Type:** ${data.type || "feature"}`,
            `**Date:** ${new Date().toISOString()}`,
            ``,
            `---`,
            ``,
            `### Changes`,
            ...data.changes.map((c) => `- ${c}`),
          ].join("\n"),
          status: "complete",
          priority: priorityMap[data.type || "feature"],
          tags: ["auto-sync", "release", data.type || "feature"],
        }),
      }
    );

    if (result) {
      console.log(`[ClickUp] Release logged: v${data.version} (task ${result.id})`);
    }
  }, `logRelease(v${data.version})`);
}

export const clickup = {
  syncNewCustomer,
  syncPublicScan,
  syncCookieScanResult,
  createSupportTicket,
  createFeedbackRequest,
  logBug,
  updateCustomerStatus,
  logRelease,
  LIST_IDS,
  FOLDER_IDS,
  SPACE_ID,
  TEAM_ID,
  CUSTOM_FIELD_IDS,
};
