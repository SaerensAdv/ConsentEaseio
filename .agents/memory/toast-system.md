---
name: Toast system (both renderers + next-themes crash)
description: App now mounts BOTH the shadcn radix Toaster and sonner's Toaster globally; the sonner wrapper must NOT use next-themes.
---

Both toast systems now render. `App.tsx` mounts the shadcn radix `<Toaster />` (from `@/components/ui/toaster`, fed by `@/hooks/use-toast`) AND sonner's `<Toaster>` (aliased `SonnerToaster`, from `@/components/ui/sonner`, `position="top-right" richColors closeButton`). So `toast({title,description,variant})` from `@/hooks/use-toast` AND `toast.success/.error(...)` from `"sonner"` both work.

**History / why this matters:** sonner's `<Toaster>` was originally NOT mounted anywhere, so every `import { toast } from "sonner"` call (used across login/settings/onboarding/dashboard/*) silently rendered nothing — a confusing app-wide no-op. Mounting it globally surfaced all those previously-silent toasts at once (an intentional, user-approved behavior change).

**next-themes gotcha (do NOT reintroduce):** the stock shadcn `sonner.tsx` wrapper imports `useTheme` from `next-themes`. This app has no `next-themes` ThemeProvider, and the `next-themes` Vite pre-bundle throws `Cannot read properties of null (reading 'useContext')` → "Invalid hook call" → crashes the whole `<Toaster>`. The wrapper was rewritten to derive light/dark from the `.dark` class on `document.documentElement` (tailwind `darkMode:["class"]`) via a `MutationObserver`, with zero `next-themes` dependency. If you regenerate/replace `sonner.tsx`, strip the `next-themes` import again or the Toaster will crash on mount.

**How to apply:** either toast import is fine for new code. Keep `sonner.tsx` free of `next-themes`.
