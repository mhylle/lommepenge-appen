# Lommepenge App'en - Comprehensive Test Report

**Date:** 2026-03-18
**Tester:** Claude Code (Automated via Playwright MCP)
**Environment:** Local development (Angular 20 dev server + NestJS backend)
**URL:** http://localhost:4201/app2/
**Resolutions Tested:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x812)

---

## Executive Summary

The application loads and most UI flows are functional. The Danish localization, child-friendly design, and overall UX are well-executed. However, there are several **critical bugs** that prevent core functionality from working, along with a number of medium and low-severity issues.

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 4 |
| Medium | 6 |
| Low | 5 |

---

## Critical Bugs

### BUG-001: Reward/Deduction Transactions Fail (500 Error)
- **Severity:** CRITICAL
- **Screen:** Reward Modal ("Tilføj penge")
- **Steps:** Select child > Choose reward type > Set amount > Click "Giv belønning"
- **Expected:** Transaction created, balance updated
- **Actual:** Server returns 500 Internal Server Error. Error: `NOT NULL constraint violation on createdByUserId`. The `createdByUserId` field is not being set when creating transactions.
- **Impact:** Core functionality broken - cannot add or deduct money from children's accounts
- **Root Cause:** Backend `TransactionsService` does not populate the `createdByUserId` field when creating transaction records
- **Screenshot:** `screenshots/10-reward-modal-desktop.png`

### BUG-002: "Total opsparing" Shows "NaN kr."
- **Severity:** CRITICAL
- **Screen:** Dashboard > Familieoversigt
- **Steps:** Add 2+ children with starting balances
- **Expected:** Shows sum of all children's balances (e.g., "150,00 kr.")
- **Actual:** Shows "NaN kr."
- **Impact:** Key financial metric is broken, makes the dashboard unreliable
- **Root Cause:** Balance summation likely fails due to string/number type mismatch when aggregating `currentBalance` values
- **Screenshot:** `screenshots/09-dashboard-two-children-desktop.png`

### BUG-003: Proxy Configuration Blocks Deep API Paths
- **Severity:** CRITICAL (development environment)
- **File:** `frontend/proxy.conf.json`
- **Issue:** Original pattern `/api/app2/*` only matched single-segment paths. Auth endpoints (`/api/app2/auth/login`, `/api/app2/auth/validate`) and deeply-nested endpoints (`/api/app2/pocket-money-users/children/:id`) returned 404.
- **Fix Applied:** Changed to `/api/app2` (prefix match) which works correctly
- **Impact:** Login/registration completely broken in dev environment without fix

---

## High Severity Bugs

### BUG-004: Login Dialog Persists After Successful Login
- **Severity:** HIGH
- **Screen:** Login > Dashboard transition
- **Steps:** Fill login form > Click "Log ind" > Observe dashboard loads behind dialog
- **Expected:** Login dialog should close automatically after successful authentication
- **Actual:** Login dialog remains open on top of the dashboard, requiring manual close
- **Screenshot:** `screenshots/04-dashboard-first-login-desktop.png`

### BUG-005: Welcome Screen Shows Every Time Dashboard Is Visited
- **Severity:** HIGH
- **Screen:** Dashboard
- **Steps:** Navigate to child dashboard > Click "Tilbage" > Dashboard shows welcome screen again
- **Expected:** Welcome/onboarding screen shown only on first login
- **Actual:** Welcome screen with "Tillykke Test!" appears every time the dashboard component is initialized
- **Impact:** Users must click "Kom i gang!" repeatedly

### BUG-006: Child Age Not Displayed
- **Severity:** HIGH
- **Screen:** Dashboard child cards + Child Dashboard
- **Steps:** Create a child with age 8 > View their card
- **Expected:** Shows "8 år" or "8 år gammel"
- **Actual:** Shows just "år" (on dashboard cards) or "år gammel" (on child dashboard) - the number is missing
- **Impact:** Age information is lost/not rendered
- **Screenshot:** `screenshots/08-child-created-desktop.png`, `screenshots/12-child-dashboard-desktop.png`

### BUG-007: Database Migration Column Name Mismatch
- **Severity:** HIGH (blocks startup)
- **File:** `backend/src/migrations/database-migrations.service.ts`
- **Issue:** Migration referenced `transaction_date` column (snake_case) but TypeORM creates `"transactionDate"` (camelCase)
- **Fix Applied:** Changed to `"transactionDate"` in migration queries
- **Impact:** Backend crashes on first startup with fresh database

---

## Medium Severity Bugs

### BUG-008: Massive NG0100 ExpressionChangedAfterItHasBeenChecked Errors
- **Severity:** MEDIUM
- **Screen:** Every screen, constantly
- **Details:** Console accumulated 100+ `NG0100` errors during testing. These indicate change detection timing issues throughout the app.
- **Impact:** Performance degradation, potential UI glitches, noisy console

### BUG-009: NG0701 Missing Locale Data
- **Severity:** MEDIUM
- **Screen:** Child registration modal (when age changes)
- **Error:** `NG0701: Missing locale data for the locale "da"`
- **Impact:** Danish number/currency formatting may not work correctly

### BUG-010: Child Select Dropdown Formatting
- **Severity:** MEDIUM
- **Screen:** Reward/Deduction modals
- **Issue:** Child dropdown shows `"Emma(100.00 DKK)"` - missing space before parenthesis
- **Expected:** `"Emma (100,00 kr.)"`

### BUG-011: Sound Asset Files Missing (404)
- **Severity:** MEDIUM
- **Files:** `assets/sounds/button-click.mp3`, `coin-drop.mp3`, `celebration-reward.mp3`, `notification-gentle.mp3`, `ui-pop.mp3`
- **Impact:** All sound effects fail to load. Service falls back gracefully but logs errors.

### BUG-012: Confetti Theme 'celebration' Not Found
- **Severity:** MEDIUM
- **Screen:** After creating a child
- **Error:** `Confetti theme 'celebration' not found`
- **Impact:** Celebration animation may not display correctly

### BUG-013: Sticky Header Duplicates on Scroll (Full Page)
- **Severity:** MEDIUM
- **Screen:** Dashboard, Child Dashboard (visible in full-page screenshots)
- **Issue:** The yellow header bar appears to duplicate/re-render when scrolling through the page
- **Screenshot:** `screenshots/08-child-created-desktop.png`, `screenshots/12-child-dashboard-desktop.png`

---

## Low Severity Issues

### BUG-014: Favicon Missing (404)
- **Severity:** LOW
- **File:** `/app2/favicon.ico` returns 404

### BUG-015: Footer Copyright Year Shows 2025
- **Severity:** LOW
- **Screen:** Footer
- **Current:** "© 2025 Lommepenge App'en"
- **Expected:** "© 2026 Lommepenge App'en" (or dynamic)

### BUG-016: Material Icons Render as Text in Settings Modal
- **Severity:** LOW
- **Screen:** Settings modal form labels
- **Issue:** Icons like `home`, `description`, `attach_money` appear as text prefixes instead of Material icons
- **Screenshot:** `screenshots/11-settings-modal-desktop.png`

### BUG-017: Date Format Uses English Day Names
- **Severity:** LOW
- **Screen:** Dashboard header
- **Current:** "Wednesday 18. March 2026"
- **Expected:** "Onsdag 18. marts 2026" (Danish)

### BUG-018: Unused TypeScript Files Warning
- **Severity:** LOW
- **Files:** `confetti-test.service.ts`, `environment.prod.ts`
- **Impact:** Build warnings about unused files in TypeScript compilation

---

## Responsive Design Assessment

### Desktop (1920x1080) - GOOD
- Layout uses space well with centered content
- All modals properly sized and scrollable
- Quick action buttons arranged in a grid
- Child polaroid cards display side-by-side
- **Screenshot:** `screenshots/06-dashboard-main-desktop.png`

### Tablet (768x1024) - GOOD
- Quick action buttons stack into 2-column grid
- Child cards display as single column
- Statistics cards wrap properly
- Modals fill appropriate width
- **Screenshot:** `screenshots/17-dashboard-tablet-768.png`

### Mobile (375x812) - GOOD with minor issues
- All content is accessible and scrollable
- Quick action buttons stack vertically (single column)
- Modals are nearly full-width and scrollable
- Child cards display full-width
- Login form fits well on mobile
- **Minor:** Breadcrumb text gets truncated ("Famili..." and "Emm...")
- **Screenshots:** `screenshots/13-dashboard-mobile-375.png`, `screenshots/14-reward-modal-mobile-375.png`, `screenshots/15-child-dashboard-mobile-375.png`, `screenshots/16-login-mobile-375.png`

---

## Feature Test Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| App loads at /app2/ | PASS | Requires baseHref configuration |
| Login form displays | PASS | Clean UI with Danish text |
| Login form validation | PASS | Button disabled until fields filled |
| Registration form | PASS | All fields, password confirmation, family name |
| Registration submission | PASS (API) | Works via direct API, UI had proxy issue (fixed) |
| Login authentication | PASS | Local auth service works correctly |
| Session management | PASS | Session expiry notification works, extend fails gracefully |
| Dashboard loads | PASS | All sections render |
| Quick action buttons | PASS | All 5 buttons open correct modals |
| Family statistics | PARTIAL | NaN bug on total savings (BUG-002) |
| Add child | PASS | Full flow works, child appears on dashboard |
| Edit child (✏️ button) | NOT TESTED | Button visible but not tested |
| Child polaroid cards | PASS | Color-coded, show balance and allowance |
| Child dashboard navigation | PASS | Breadcrumbs, back button work |
| Child dashboard content | PASS | Balance, goals, achievements, tips all render |
| Reward modal | PASS (UI) | Beautiful UI, 6 reward types, amount selection |
| Reward submission | FAIL | BUG-001: createdByUserId null |
| Deduction modal | PASS (UI) | 4 deduction types, amount selection, description |
| Deduction submission | NOT TESTED | Expected to fail same as reward (BUG-001) |
| Transaction history | PASS | Modal opens, filter dropdown, empty state |
| Family settings | PASS | Name, description, currency, allowance, frequency |
| Logout | PASS | Button visible and functional |
| Mobile responsiveness | PASS | All screens work at 375px |
| Tablet responsiveness | PASS | All screens work at 768px |
| Desktop layout | PASS | All screens work at 1920px |

---

## Console Error Summary

| Error | Count | Severity |
|-------|-------|----------|
| NG0100 ExpressionChangedAfterItHasBeenChecked | 100+ | Medium |
| NG0701 Missing locale data | 2+ | Medium |
| Sound asset 404s | 5 | Medium |
| Confetti theme not found | 1 | Low |
| Favicon 404 | 1 | Low |

---

## Recommendations

1. **Fix BUG-001 immediately** - Transaction creation must populate `createdByUserId`. This blocks the core money management feature.
2. **Fix BUG-002** - Debug the NaN in total savings calculation. Likely a `parseFloat` on a string/null value.
3. **Fix BUG-006** - Age display is missing. Check the `dateOfBirth` → age calculation in both dashboard and child dashboard components.
4. **Fix BUG-004** - Login dialog should call `dialogRef.close()` on successful login.
5. **Fix BUG-005** - Store a flag (localStorage or service state) indicating welcome has been dismissed.
6. **Address NG0100 errors** - These indicate change detection issues. Consider using `ChangeDetectionStrategy.OnPush` and proper signal patterns.
7. **Add missing sound assets** or remove sound service references.
8. **Register Danish locale** in Angular to fix NG0701 errors.
9. **Commit the proxy.conf.json fix** - Changed `/api/app2/*` to `/api/app2` for proper prefix matching.
10. **Commit the migration fix** - Changed `transaction_date` to `"transactionDate"` in index creation queries.
