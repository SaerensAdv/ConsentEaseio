import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Split heavy/seldom-changing vendor code into its own long-cacheable
    // chunks so visitors only re-download what actually changed between
    // deploys, and so a marketing-page visit doesn't pull in dashboard-only
    // libraries (recharts, framer-motion, date-fns, etc.).
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // Charts — only used by /dashboard/analytics.
          if (id.includes("/recharts/") || id.includes("/d3-")) {
            return "vendor-charts";
          }
          // Animation library — used by hero + a handful of pages.
          if (id.includes("/framer-motion/")) {
            return "vendor-framer";
          }
          // Date helpers — heavy in dashboard, light elsewhere.
          if (id.includes("/date-fns/") || id.includes("/react-day-picker/")) {
            return "vendor-dates";
          }
          // Form / validation stack.
          if (
            id.includes("/react-hook-form/") ||
            id.includes("/@hookform/") ||
            id.includes("/zod/")
          ) {
            return "vendor-forms";
          }
          // Radix primitives — used by shadcn UI components everywhere.
          if (id.includes("/@radix-ui/")) {
            return "vendor-radix";
          }
          // Icon packs.
          if (
            id.includes("/@phosphor-icons/") ||
            id.includes("/lucide-react/") ||
            id.includes("/react-icons/")
          ) {
            return "vendor-icons";
          }
          // NOTE: React itself, react-dom, scheduler, wouter and react-query
          // are intentionally NOT split into a separate chunk. Splitting React
          // across chunks can race with React 19's runtime extensions
          // (`React.Activity` etc.) when the dependent chunk evaluates before
          // the React chunk finishes initialising, producing
          // "Cannot set properties of undefined (setting 'Activity')". Letting
          // them fall through to `vendor-misc` keeps the React module graph
          // contiguous in evaluation order, and they load on every page anyway
          // so a separate chunk gives no bandwidth win.

          // Stripe SDK — only loaded by checkout / billing.
          if (id.includes("/@stripe/")) {
            return "vendor-stripe";
          }
          // Everything else from node_modules.
          return "vendor-misc";
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
