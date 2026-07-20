## What changed

<!-- Describe the user-visible or technical change in plain language. -->

## Why

<!-- What problem does this solve, and why now? -->

## Scope guard

- [ ] This is an incremental change, not a rebuild or broad redesign.
- [ ] I verified the active website context is preserved across navigation.
- [ ] Database schema and production data are untouched, or migrations and rollback are documented below.
- [ ] Stripe checkout, billing, and webhook behavior are untouched, or explicitly documented below.
- [ ] Customer embed behavior is untouched, or compatibility and rollback are documented below.
- [ ] No secret, credential, runtime queue, generated bundle, or local-only file is committed.

## Verification

- [ ] `npm run check:core` passes.
- [ ] `npm run build` passes.
- [ ] Loading, empty, error, and success states were considered.
- [ ] Keyboard focus and narrow-screen behavior were checked for UI changes.
- [ ] The change was tested against the selected website, not only the first website in the account.

## Risk and rollback

**Risk:**

**Rollback:**

## Evidence

<!-- Screenshots, before/after notes, test output, or relevant links. -->
