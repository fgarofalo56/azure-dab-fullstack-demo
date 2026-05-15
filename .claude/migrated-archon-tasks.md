# Migrated Archon v1 Tasks - Azure DAB Full-Stack Demo

> Frozen export 2026-05-14 during the de-Archon-v1 migration.
> **Archon project ID**: `e98fd171-04e1-442f-810a-8541aa639900`
> **Total tasks captured**: 43

Going forward use TodoWrite (in-session) + GitHub Issues (cross-session).

## status: todo (4)

### Create Azure AD App Registrations
_order: 104 . feature: Setup . id: `9e1cb87c-22f1-4968-8c6c-d0f8d239ee40`_

Create two Azure AD app registrations: 1) DAB Backend App with exposed API scope, 2) Frontend SPA App with API permissions. Grant admin consent for frontend app.

**BLOCKED**: Service principal (95ca491e-f841-43ba-93f2-3315804f55e7) lacks Application.ReadWrite.All permissions. Requires manual creation by user with Application Administrator or Global Admin role.

**Manual Steps Required:**
1. Go to Azure Portal > Azure Active Directory > App registrations
2. Create "DAB-Demo-Backend-API" app with exposed API scope "access_as_user"
3. Create "DAB-Demo-Frontend-SPA" app (SPA) with redirect URIs
4. Add API permission to frontend app for backend scope
5. Grant admin consent
6. Record both App IDs for deployment script

### Verify End-to-End Functionality
_order: 60 . feature: Testing . id: `9bb6eb7f-80fb-41d9-8fa4-02273312aabf`_

Test complete flow: Frontend login with Entra ID, API calls to DAB, data retrieval from Azure SQL. Verify authentication works correctly.

**PARTIALLY COMPLETE**: Infrastructure deployed and containers running.

**Verified Working:**
- ✅ DAB Container App running (responds to requests)
- ✅ Frontend Container App running (HTTP 200)
- ✅ Azure SQL Database with sample data
- ✅ Container Registry with images

**Pending (requires Azure AD app registrations):**
- ❌ Frontend login with Entra ID
- ❌ Authenticated API calls to DAB
- ❌ End-to-end data retrieval

**URLs:**
- DAB API: https://dabfgdemo-dev-ca-dab.lemonpond-c09dcd5d.eastus2.azurecontainerapps.io
- Frontend: https://dabfgdemo-dev-ca-frontend.lemonpond-c09dcd5d.eastus2.azurecontainerapps.io

### 🟡 Security: Use managed identity for SQL connection instead of password
_order: 0 . feature: Security . id: `8e3086f9-860c-44af-b177-9975511e9e23`_

**Category:** 🟡 Needs Refactor
**Severity:** Medium
**File:** `infrastructure/bicep/main.bicep` (line 86)

**Issue:** Connection string uses SQL authentication with username/password stored as Container App secrets. Best practice is managed identity.

**Fix:**
1. Enable system-assigned managed identity on DAB Container App
2. Create SQL user from external provider
3. Use managed identity connection string
4. Run post-deployment script for SQL permissions

**Impact:** Credential management overhead; rotation complexity; security risk.

### 🟢 Add integration tests to CI pipeline
_order: 0 . feature: Testing . id: `d5c2fb33-241f-4664-9942-711c4c0f3d4f`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** `.github/workflows/ci.yml`

**Issue:** Only unit tests run (`npm run test -- --run`). No integration tests against DAB API.

**Recommended additions:**
1. Spin up test database with Docker
2. Run DAB container locally
3. Execute API integration tests
4. Verify frontend-backend contract

**Impact:** API contract changes between frontend and DAB could break in production.

## status: done (39)

### Deploy Azure Infrastructure
_order: 93 . feature: Infrastructure . id: `61f23fc3-5aa4-4f43-9fff-4f996a9c4e16`_

Run deploy.ps1 script to create ACR, Azure SQL, Storage Account, and ACI resources. Configure SQL admin password and Azure AD client IDs.

**COMPLETED**: Base infrastructure deployed via Bicep (deployContainers=false, deployFrontDoor=false).

**Resources Created:**
- Resource Group: rg-dab-demo-eastus2
- ACR: acrdabfgdemodev.azurecr.io
- SQL Server: dabfgdemo-dev-sql.database.windows.net
- SQL Database: dabfgdemo-dev-db
- Storage Account: stdabfgdemodev
- File Share: dab-data

**Pending**: Container Apps and Front Door deployment (requires container images first)

### Initialize Azure SQL Database Schema
_order: 82 . feature: Database . id: `d283a1d6-ad78-4ed5-891c-5fe18d44a207`_

Connect to Azure SQL and create Products and Categories tables with sample data. See docs/setup-guide.md for SQL scripts.

**COMPLETED**: Schema and seed data executed successfully.

**Tables Created:**
- Categories (4 records)
- States (51 records)
- RailroadAccidents (300 records)
- Bridges (400 records)
- TransitAgencies (600 records)
- VehicleFatalities (400 records)
- Views: vw_CategorySummary, vw_RailroadAccidentsByState, vw_BridgeConditionByState, vw_TransitSummaryByState, vw_VehicleFatalitiesByState

**Connection String:** Server=dabfgdemo-dev-sql.database.windows.net; Database=dabfgdemo-dev-db

### Build and Push Container Images
_order: 71 . feature: Deployment . id: `f7ba7b15-d72b-4de4-8f0f-44801b6a30cd`_

Build DAB and Frontend Docker containers. Push to Azure Container Registry. Restart ACI instances to pull new images.

**COMPLETED**: Container images built and pushed to ACR, Container Apps deployed.

**Container Images:**
- acrdabfgdemodev.azurecr.io/dab:latest
- acrdabfgdemodev.azurecr.io/frontend:latest

**Container App URLs:**
- DAB API: https://dabfgdemo-dev-ca-dab.lemonpond-c09dcd5d.eastus2.azurecontainerapps.io
- Frontend: https://dabfgdemo-dev-ca-frontend.lemonpond-c09dcd5d.eastus2.azurecontainerapps.io

**Note:** Frontend uses placeholder Azure AD client IDs. Update when real app registrations are created.

### 🔴 CRITICAL: Fix CI/CD branch name mismatch (main vs master)
_order: 0 . feature: CI/CD . id: `fabdc47f-0cac-440c-be14-364ebeebb47f`_

**Category:** 🔴 Broken/Missing
**Severity:** Critical
**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

**Issue:** Both workflows trigger on `main` branch, but repository uses `master` as default branch. CI/CD pipelines will never trigger automatically.

**Fix:** Change all `branches: [main]` to `branches: [master]` in both workflow files.

**Impact:** CI/CD is completely non-functional until fixed.

### 🔴 CRITICAL: Fix CORS wildcard security vulnerability in DAB config
_order: 0 . feature: Security . id: `3978cdce-6d9d-444d-a873-976a91b86188`_

**Category:** 🔴 Broken/Missing
**Severity:** Critical
**File:** `src/dab-config/dab-config.json` (lines 20-21)

**Issue:** CORS configured with wildcard `"origins": ["*"]` allowing any origin to access the API. Significant security vulnerability.

**Additional Issue:** CORS configured in BOTH DAB config and Bicep Container App ingress with conflicting `allow-credentials` values.

**Fix:**
1. Replace wildcard with explicit allowed origins
2. Remove duplicate CORS from either DAB or Bicep (not both)
3. Ensure credentials setting is consistent

**Impact:** API exposed to potential CSRF attacks; any website can attempt authentication flows.

### 🔴 CRITICAL: Fix OData query builder bug affecting pagination
_order: 0 . feature: Frontend . id: `12425ca8-e7d5-4dab-8166-ce6731421b1b`_

**Category:** 🔴 Broken/Missing
**Severity:** Critical
**File:** `src/frontend/src/utils/api.ts` (lines 99-117)

**Issue:** buildODataQuery function has conflicting implementations:
- Uses `$first` (DAB syntax) but parameter is named `top`
- Tests expect `$count=true` but implementation doesn't add it
- All tables fetch 500 records for "client-side pagination" defeating purpose

**Fix:**
1. Decide on pagination strategy (server-side cursor vs client-side)
2. Fix parameter naming consistency
3. Update tests to match implementation
4. Document DAB-specific limitations

**Impact:** Pagination doesn't work correctly; performance issues with large datasets.

### 🔴 CRITICAL: Add accessibility attributes to modals and interactive elements
_order: 0 . feature: Accessibility . id: `05364a69-cb0a-424d-b89f-92a682aaa67b`_

**Category:** 🔴 Broken/Missing
**Severity:** High (legal compliance)
**Files:** `CrudModal.tsx`, `ApiExplorer.tsx`, `GraphQLExplorer.tsx`, `App.tsx`

**Issue:** Minimal ARIA usage across codebase:
- Modals missing `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Icon-only buttons missing `aria-label`
- Status indicators missing `aria-live`
- Data tables missing proper table semantics
- No focus management for modals

**Fix:**
1. Add dialog ARIA attributes to all modals
2. Add `aria-label` to icon-only buttons
3. Add `aria-live="polite"` to loading spinners
4. Implement focus trap and return focus on modal close
5. Add keyboard navigation (Escape to close)

**Impact:** ADA/Section 508 compliance issues; inaccessible to screen reader users.

### 🔴 Security: Disable ACR admin user, use managed identity
_order: 0 . feature: Security . id: `05c7bc8b-65bf-4dd9-8d56-248ef67043ed`_

**Category:** 🔴 Broken/Missing
**Severity:** High
**File:** `infrastructure/bicep/main.bicep` (line 99)

**Issue:** Container Registry has `adminUserEnabled: true` creating persistent username/password. Container Apps should use managed identity instead.

**Fix:**
1. Set `adminUserEnabled: false`
2. Add system-assigned managed identity to Container Apps
3. Grant AcrPull role to Container Apps identity

**Impact:** Credential exposure risk; not following Azure security best practices.

### 🟡 Refactor: Extract components from monolithic App.tsx (1,554 lines)
_order: 0 . feature: Frontend . id: `1587793d-6c5d-4867-a184-1e44ec4d9848`_

**Category:** 🟡 Needs Refactor
**Severity:** High
**File:** `src/frontend/src/App.tsx` (1,554 lines)

**Issue:** App.tsx contains:
- Icon components (lines 53-97)
- Layout components (lines 103-238)
- Authentication components (lines 243-450)
- Data components (lines 456-583)
- Four massive table components with CRUD (lines 674-1535)

**Recommended Structure:**
- `components/icons/` → TrainIcon, BridgeIcon, BusIcon, CarIcon
- `components/layout/` → DOTLogo, LoadingSpinner, EmptyState, Badge
- `components/auth/` → LoginPage
- `components/dashboard/` → CategoryDashboard, DataView
- `components/tables/` → RailroadAccidentTable, BridgeTable, etc.

**Impact:** Difficult to test, maintain, and reuse components; performance issues.

### 🟡 Refactor: Create BaseDataTable to eliminate 472 lines of duplication
_order: 0 . feature: Frontend . id: `cb4da0ce-2519-44fd-9861-dd0b1092f33f`_

**Category:** 🟡 Needs Refactor
**Severity:** Medium
**File:** `App.tsx` lines 674-1535

**Issue:** Four table components share 95% identical code:
- Same CRUD state management (15 lines × 4)
- Same CRUD handlers (70 lines × 4)
- Same modal rendering (15 lines × 4)
- Same loading/error states (10 lines × 4)
- Total duplication: ~472 lines that could be ~120 lines

**Fix:** Create generic `BaseDataTable<T>` component with:
- Shared CRUD logic
- Configurable columns and fields
- Type-safe generic implementation

**Impact:** Code duplication; maintenance burden; inconsistent behavior risk.

### 🟡 Fix dynamic Tailwind classes that break in production builds
_order: 0 . feature: Frontend . id: `d053e1bb-6368-4cc6-b190-e17d3f1f2851`_

**Category:** ⚙️ Misconfigured
**Severity:** Medium
**File:** `App.tsx` (lines 407-410, 518-521, 540-542)

**Issue:** Dynamic Tailwind classes like `bg-${cat.color}-800/40` won't be detected by JIT compiler and will be purged in production builds.

**Fix Options:**
1. Use inline styles for dynamic colors
2. Add safelist to `tailwind.config.js`
3. Document workaround in component comments

**Impact:** Styling breaks in production builds; visual bugs.

### 🟡 Add environment variable validation at app startup
_order: 0 . feature: Configuration . id: `ffcfa85a-6633-4f28-b3bc-7c8376c35b25`_

**Category:** ⚙️ Misconfigured
**Severity:** Medium
**Files:** `authConfig.ts`, `api.ts`, `main.tsx`

**Issue:** Environment variables accessed with fallbacks but never validated:
- MSAL initializes with invalid config if clientId is empty
- Scopes become malformed
- Authentication fails with cryptic errors

**Fix:**
1. Create `config/validateEnv.ts` that checks required variables
2. Call at app startup in `main.tsx`
3. Throw clear error if missing

**Impact:** Cryptic errors during development; hard to debug configuration issues.

### 🟢 Add security scanning to CI/CD pipeline
_order: 0 . feature: CI/CD . id: `ec2929cf-5036-46bc-85f1-4090253531f5`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** `.github/workflows/ci.yml`

**Issue:** No security vulnerability scanning for dependencies or container images.

**Recommended additions:**
1. npm audit for frontend dependencies
2. Container image scanning (Trivy or Azure Defender)
3. SAST scanning for code vulnerabilities
4. Dependency review action for PRs

**Impact:** Vulnerable dependencies may be deployed without detection.

### 🟢 Add WAF policy to Azure Front Door
_order: 0 . feature: Security . id: `641b7217-2fce-4019-b7fe-75f182d7e180`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** `infrastructure/bicep/main.bicep`

**Issue:** Front Door deployed without Web Application Firewall (WAF) policy.

**Fix:** Add WAF policy with Microsoft Default Rule Set for production deployments.

**Impact:** No protection against OWASP top 10 attacks at edge.

### 🟢 Expand test coverage (currently 2 test files)
_order: 0 . feature: Testing . id: `f7c56f04-ceb1-47af-b589-6a5d279b4e58`_

**Category:** 🔴 Broken/Missing
**Severity:** Medium
**Files:** `__tests__/` directory

**Current coverage:**
- `components.test.tsx` - ErrorBoundary, Pagination, CrudModal
- `api.test.ts` - buildODataQuery, format functions

**Missing tests for:**
- useApiToken hook (critical for auth)
- ApiExplorer, GraphQLExplorer components
- All four table components
- CategoryDashboard, DataView, LoginPage
- CRUD operations (createRecord, updateRecord, deleteRecord)

**Target:** 80% line coverage, 70% branch coverage

**Impact:** No confidence in code correctness; regressions go undetected.

### 🟢 Add UpdatedAt triggers to database tables
_order: 0 . feature: Database . id: `7f81b2e4-1e92-4b57-af6a-c91811ddbac2`_

**Category:** 🟡 Needs Refactor
**Severity:** Low
**File:** `src/database/001-schema.sql`

**Issue:** UpdatedAt columns have defaults of `GETUTCDATE()` but no triggers to update them on record modifications. UpdatedAt will never change after initial insert.

**Fix:** Add UPDATE triggers for each table:
```sql
CREATE OR ALTER TRIGGER trg_RailroadAccidents_UpdatedAt
ON dbo.RailroadAccidents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.RailroadAccidents
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.RailroadAccidents t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
```

**Impact:** Audit trail incomplete; can't track when records were last modified.

### 🟢 Disable GraphQL introspection for production
_order: 0 . feature: Security . id: `6ef5ae27-5fad-4807-9e48-3bbfdb1b8372`_

**Category:** 🟡 Needs Refactor
**Severity:** Low
**File:** `src/dab-config/dab-config.json` (line 16)

**Issue:** GraphQL introspection enabled (`"allow-introspection": true`). Exposes entire schema to anyone accessing the endpoint.

**Fix:** Set `"allow-introspection": false` for production or add environment-based configuration.

**Impact:** Attackers can discover all queries, mutations, entity structures.

### ⚙️ Fix CLAUDE.md hosting claim (says ACI, actually Container Apps)
_order: 0 . feature: Documentation . id: `519bceb3-731b-42d9-911c-706b5d7794a9`_

**Category:** ⚙️ Misconfigured
**Severity:** Low
**File:** `CLAUDE.md` (line 77)

**Issue:** States "Hosting: Azure Container Instances" but project actually uses Azure Container Apps.

**Fix:** Update line 77 to "Hosting: Azure Container Apps"

**Impact:** Misleading project metadata.

### 🔴 Security: SQL Server allows public network access
_order: 0 . feature: Security . id: `0701d23c-c174-402c-bc82-4afb0faca1d7`_

**Category:** 🔴 Broken/Missing
**Severity:** High
**File:** `infrastructure/bicep/main.bicep` (line 230)

**Issue:** SQL Server has `publicNetworkAccess: 'Enabled'` with firewall rule allowing all Azure services (`0.0.0.0` to `0.0.0.0`). Any Azure resource in ANY subscription can attempt connection.

**Fix for Production:**
1. Set `publicNetworkAccess: 'Disabled'`
2. Add Private Endpoint for Container Apps
3. Configure Private DNS Zone

**For Demo:** Document that public access is enabled for convenience and should be disabled in production.

**Impact:** Increased attack surface; any Azure resource can attempt database connection.

### 🟡 Fix Frontend Dockerfile - curl missing for health check
_order: 0 . feature: Docker . id: `a49f16ca-a58f-460b-9ac1-bc63c9366b66`_

**Category:** ⚙️ Misconfigured
**Severity:** Medium
**File:** `src/frontend/Dockerfile` (line 46)

**Issue:** Health check uses `curl` but `nginx:alpine` image doesn't include curl by default. Health check will fail.

**Fix:**
```dockerfile
FROM nginx:alpine
RUN apk add --no-cache curl
# ... rest of Dockerfile
```

**Impact:** Container health checks fail; orchestrator may restart healthy containers.

### 🟡 Security: DAB Dockerfile runs as root user
_order: 0 . feature: Security . id: `4eb3426c-5ef1-43e9-bfe3-85e2f1374841`_

**Category:** 🟡 Needs Refactor
**Severity:** Medium
**File:** `src/dab-config/Dockerfile`

**Issue:** No USER directive specified, container runs as root. Security best practice is to run as non-root user.

**Fix:**
```dockerfile
# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /App

# Switch to non-root user
USER appuser
```

**Impact:** Container compromise gives attacker root access.

### 🟡 Security: Add Content-Security-Policy header to nginx
_order: 0 . feature: Security . id: `c53dc03d-c79b-404f-b910-8db2bb3eeded`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** `src/frontend/nginx.conf`

**Issue:** No Content-Security-Policy (CSP) header configured. Other security headers (X-Frame-Options, X-XSS-Protection) are present.

**Fix:** Add CSP header:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.azurefd.net https://*.azurecontainerapps.io https://login.microsoftonline.com;" always;
```

**Impact:** XSS attacks not mitigated at browser level.

### 🟡 Frontend: Remove type safety gaps (any usage)
_order: 0 . feature: Frontend . id: `d9119bb0-9393-420d-b1c1-474264660074`_

**Category:** 🟡 Needs Refactor
**Severity:** Medium
**Files:** `App.tsx` (lines 605, 739, 820, 950, 1044, 1163, 1248, 1372, 1474)

**Issue:** Several instances of `any` type that reduce type safety:
- `states?.map((s: any) => [s.Id, s])`
- `paginatedData.map((accident: any, idx: number)`
- `(selectedRecord as any).Id`

**Root Cause:** DAB returns PascalCase but TypeScript types have both cases defined.

**Fix:**
1. Decide on single casing strategy (match DAB's PascalCase OR transform responses)
2. Remove all `any` casts
3. Add type assertion helpers

**Impact:** Compile-time type checking bypassed; runtime errors possible.

### 🟡 Frontend: Improve React Query cache invalidation
_order: 0 . feature: Frontend . id: `0ce97e46-b2a9-4601-a97f-70f43935d702`_

**Category:** 🟡 Needs Refactor
**Severity:** Low
**Files:** `App.tsx` (lines 742, 953, 1166, 1375)

**Issue:** After CRUD operations, only the specific table's query is invalidated. Related queries (categorySummaries, states) are not refreshed.

**Current:**
```typescript
queryClient.invalidateQueries({ queryKey: ['railroadAccidents'] });
```

**Fix:**
```typescript
queryClient.invalidateQueries({ queryKey: ['railroadAccidents'] });
queryClient.invalidateQueries({ queryKey: ['categorySummaries'] });
```

**Impact:** Users must refresh page to see updated category counts.

### 🟢 Frontend: Add keyboard navigation to modals
_order: 0 . feature: Accessibility . id: `d67d8bfa-4024-4090-901a-137169458747`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**Files:** `CrudModal.tsx`, `ApiExplorer.tsx`, `GraphQLExplorer.tsx`

**Issue:** Modals don't implement:
- Escape key to close
- Focus trap (Tab should cycle within modal)
- Auto-focus on first input
- Return focus to trigger element on close

**Fix:**
1. Add escape key handler with useEffect
2. Implement focus trap using `focus-trap-react` package
3. Auto-focus first input on open
4. Store and restore focus on close

**Impact:** Poor keyboard accessibility; fails WCAG 2.1.2 Keyboard.

### 🟢 Frontend: Add client-side field validation
_order: 0 . feature: Frontend . id: `e7a90255-9abf-4edf-9089-ead88e3cb138`_

**Category:** 🟢 New/Addition
**Severity:** Low
**File:** `CrudModal.tsx` (lines 68-79)

**Issue:** Validation only checks `required` fields. No validation for:
- Date formats
- Number ranges (e.g., bridge condition 0-9)
- String length limits
- Email formats
- Custom business rules

**Fix:**
1. Add type-specific validation in validate() function
2. Add field-level validators to Field interface
3. Consider using Zod or Yup for schema validation

**Impact:** Invalid data submitted to API; server rejects with poor error messages.

### 🟢 Frontend: Fix color contrast for WCAG AA compliance
_order: 0 . feature: Accessibility . id: `8ef45411-830d-4cd0-a33a-9eca89115f8e`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**Files:** Multiple components

**Issue:** Several color combinations may not meet WCAG AA contrast ratio of 4.5:1:
- `text-blue-300` on `bg-blue-800/40` (LoginPage line 413)
- `text-slate-400` on `bg-slate-100` (EmptyState line 147)
- `text-slate-500` on white backgrounds

**Fix:**
1. Use contrast checker tool on all text/background combinations
2. Adjust colors to meet WCAG AA minimum:
   - Normal text: 4.5:1 ratio
   - Large text (18pt+): 3:1 ratio
3. Document approved color pairs

**Impact:** Text difficult to read for users with visual impairments.

### 🟢 Frontend: Add responsive table design for mobile
_order: 0 . feature: Frontend . id: `d97a28ff-76e0-4a17-8c52-5e63ee0d7552`_

**Category:** 🟢 New/Addition
**Severity:** Low
**Files:** All table components in App.tsx

**Issue:** Tables use `overflow-x-auto` for horizontal scrolling on mobile, but:
- Horizontal scrolling is poor UX
- No column priority (all columns equal)
- No card view for mobile

**Fix Options:**
1. Add responsive card view for mobile:
   ```tsx
   <div className="md:hidden">{/* Card view */}</div>
   <div className="hidden md:block">{/* Table view */}</div>
   ```
2. Or hide non-essential columns on small screens
3. Mark essential columns with priority classes

**Impact:** Poor mobile experience; data hard to read on phones.

### 🔴 Fix api.test.ts - tests don't match implementation
_order: 0 . feature: Testing . id: `4ff4f018-8e73-455d-ad73-45f85e88d974`_

**Category:** 🔴 Broken/Missing
**Severity:** Medium
**File:** `__tests__/api.test.ts` (lines 15-47)

**Issue:** Tests don't match actual implementation:
- Test expects `buildODataQuery({}).toBe('?$count=true')` but implementation returns empty string
- Tests expect `$top` but implementation uses `$first`

**Fix:**
1. Update tests to match actual implementation, OR
2. Fix implementation to match test expectations

**Impact:** Tests pass but don't validate actual behavior; false confidence.

### 🟢 Add composite indexes for common query patterns
_order: 0 . feature: Database . id: `764208a4-67cd-4ad0-927a-bbccc869673b`_

**Category:** 🟢 New/Addition
**Severity:** Low
**File:** `src/database/001-schema.sql`

**Issue:** Several query patterns would benefit from composite indexes:

**Recommended Indexes:**
```sql
-- Filter by State and Date
CREATE INDEX IX_RailroadAccidents_StateId_AccidentDate 
ON dbo.RailroadAccidents(StateId, AccidentDate);

-- Filter by State and Condition
CREATE INDEX IX_Bridges_StateId_OverallCondition 
ON dbo.Bridges(StateId, OverallCondition);

-- Filter by State and Year
CREATE INDEX IX_VehicleFatalities_StateId_CrashYear 
ON dbo.VehicleFatalities(StateId, CrashYear);
```

**Impact:** Views like vw_RailroadAccidentsByState will perform better.

### 🟢 Add password validation in deployment script
_order: 0 . feature: Deployment . id: `0770bc9c-440f-4d00-8d77-b06f3da350e0`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** `infrastructure/scripts/deploy.ps1` (lines 188-195)

**Issue:** SQL password is accepted without validation for Azure SQL complexity requirements.

**Fix:** Add validation:
```powershell
if ($sqlPassword) {
    if ($sqlPassword.Length -lt 12) {
        Write-Host "ERROR: SQL password must be at least 12 characters" -ForegroundColor Red
        exit 1
    }
    if ($sqlPassword -notmatch '[A-Z]' -or $sqlPassword -notmatch '[a-z]' -or 
        $sqlPassword -notmatch '[0-9]' -or $sqlPassword -notmatch '[^a-zA-Z0-9]') {
        Write-Host "ERROR: Password must contain uppercase, lowercase, number, and special character" -ForegroundColor Red
        exit 1
    }
}
```

**Impact:** Deployment fails with cryptic Azure error if password doesn't meet requirements.

### 🟢 Add cleanup/rollback script for deployments
_order: 0 . feature: Deployment . id: `40bb7363-7ada-42de-bf93-f8a0a5e570d4`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** New file: `infrastructure/scripts/cleanup.ps1`

**Issue:** No rollback or cleanup functionality. If deployment fails partway, resources are left in inconsistent state.

**Fix:** Create cleanup.ps1:
```powershell
param(
    [string]$ResourceGroupName,
    [switch]$Force
)

if (-not $Force) {
    Write-Warning "This will DELETE resource group $ResourceGroupName and ALL resources"
    $confirm = Read-Host "Type 'DELETE' to confirm"
    if ($confirm -ne 'DELETE') { exit }
}

az group delete --name $ResourceGroupName --yes --no-wait
```

**Impact:** Manual cleanup required after failed deployments.

### 🟢 Add pre-flight validation checks to deploy.ps1
_order: 0 . feature: Deployment . id: `64fce6d3-73a0-41fe-bfdb-80647ffac550`_

**Category:** 🟢 New/Addition
**Severity:** Low
**File:** `infrastructure/scripts/deploy.ps1`

**Issue:** Script doesn't validate prerequisites before starting:
- Bicep CLI version
- Azure CLI version
- Required Azure providers registered
- Sufficient subscription quota

**Fix:** Add pre-flight section:
```powershell
Write-Step "Validating prerequisites..."

# Check Azure CLI version
$azVersion = (az version --output json | ConvertFrom-Json).'azure-cli'
Write-Info "Azure CLI: $azVersion"

# Validate providers
$requiredProviders = @('Microsoft.App', 'Microsoft.ContainerRegistry', 'Microsoft.Sql')
foreach ($provider in $requiredProviders) {
    $status = az provider show --namespace $provider --query "registrationState" -o tsv
    if ($status -ne 'Registered') {
        az provider register --namespace $provider --wait
    }

### ⚙️ Fix GitHub clone URLs - use actual repo instead of placeholder
_order: 0 . feature: Documentation . id: `9afbef29-b614-483f-8cfe-910bfe69ff51`_

**Category:** ⚙️ Misconfigured
**Severity:** Low
**File:** `README.md` (line 132)

**Issue:** Git clone instructions use placeholder URL:
`https://github.com/<your-username>/azure-dab-fullstack-demo.git`

Should be: `https://github.com/fgarofalo56/azure-dab-fullstack-demo.git`

**Fix:** Update all clone instructions to use actual repository URL, or add clear note to replace placeholder.

**Impact:** Copy-paste confusion for users.

### ⚙️ Update .env.example with missing CI/CD variables
_order: 0 . feature: Documentation . id: `92d259f3-5926-4a1e-abf6-3e3228872431`_

**Category:** ⚙️ Misconfigured
**Severity:** Medium
**File:** `.env.example`

**Issue:** Missing environment variables used in CI/CD:
- `AZURE_CLIENT_ID` (used in deploy.yml line 116)
- `DAB_CONTAINER_APP_NAME` (used in deploy.yml line 42)
- `FRONTEND_CONTAINER_APP_NAME` (used in deploy.yml line 43)

**Fix:** Add these variables to .env.example with explanatory comments.

**Impact:** Users following Quick Start won't have all required variables.

### 🟢 Create API reference documentation
_order: 0 . feature: Documentation . id: `d9ff9964-57d5-436d-ae0e-7a659115d46e`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** New: `docs/api-reference.md`

**Issue:** While README mentions API endpoints, there's no comprehensive API documentation with:
- Request/response schemas
- Error codes and meanings
- Rate limiting policies
- Authentication flow details
- OData query examples

**Fix:** Create `docs/api-reference.md` with:
1. OpenAPI/Swagger export from DAB
2. Example requests/responses
3. Error code reference
4. Authentication guide

**Impact:** Developers lack complete API contract documentation.

### 🟢 Create monitoring and alerting setup guide
_order: 0 . feature: Documentation . id: `40b5714f-9e59-4b9a-8cd8-d72b05a985b4`_

**Category:** 🟢 New/Addition
**Severity:** Low
**File:** New: `docs/monitoring-guide.md`

**Issue:** Architecture includes comprehensive monitoring (Log Analytics, App Insights), but no guide on:
- Setting up Azure Monitor alerts
- Creating dashboards
- Defining SLOs/SLIs
- Alert notification configuration

**Fix:** Create `docs/monitoring-guide.md` with:
1. Recommended alerts (CPU, memory, errors, latency)
2. Dashboard templates
3. SLO definitions
4. Alert routing to email/Teams/PagerDuty

**Impact:** Users deploy monitoring but don't know how to use it effectively.

### 🟢 Document database migration strategy
_order: 0 . feature: Documentation . id: `8973a995-3d40-4b23-a897-9b80c2680f4b`_

**Category:** 🟢 New/Addition
**Severity:** Medium
**File:** Add section to `docs/deployment-guide-scripts.md`

**Issue:** Database initialization scripts exist, but no documentation on:
- How to handle schema changes in production
- Migration tool recommendations (Flyway, Liquibase, DbUp)
- Rollback procedures for database changes
- Version tracking

**Fix:** Add database migration section covering:
1. Recommended migration approach
2. Schema versioning strategy
3. Rollback procedures
4. Testing migrations locally

**Impact:** Schema changes in production are risky without defined strategy.

### 🟢 Add Container Apps diagnostic settings
_order: 0 . feature: Infrastructure . id: `147f1622-2bc5-4bc8-b32c-184a57b2c50f`_

**Category:** 🟢 New/Addition
**Severity:** Low
**File:** `infrastructure/bicep/main.bicep`

**Issue:** While Log Analytics is configured for Container Apps Environment, individual Container App resources don't have diagnostic settings for platform logs.

**Fix:** Add diagnostic settings for each Container App:
```bicep
resource dabContainerAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${dabContainerAppName}-diagnostics'
  scope: dabContainerApp
  properties: {
    workspaceId: logAnalyticsWorkspaceId
    logs: [{ categoryGroup: 'allLogs', enabled: true }]
    metrics: [{ category: 'AllMetrics', enabled: true }]
  }
}
```

**Impact:** Missing granular container-level logs for troubleshooting.
