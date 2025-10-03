# Fix Plan - Example App 2 Critical Issues
## Based on E2E Test Report - October 3, 2025

### Issue Priority Matrix

| Priority | Issue | Impact | Effort | Timeline |
|----------|-------|--------|--------|----------|
| 🔴 CRITICAL | Database schema mismatch (balance_after) | Complete transaction system failure | Medium | Immediate |
| 🟡 HIGH | Missing notification.mp3 | Audio notifications broken | Low | Short-term |
| 🟡 HIGH | Angular Firebase warnings | Potential auth issues | Low | Short-term |
| 🟢 MEDIUM | Add error handling | Better UX for failures | Medium | Medium-term |
| 🟢 LOW | Add monitoring/alerting | Prevention | High | Long-term |

---

## Implementation Plan

### Phase 1: Critical Database Schema Fix (Immediate - 30 minutes)

#### Root Cause Analysis
- **Problem**: TypeORM Transaction entity uses snake_case field names (`balance_after`)
- **Database**: Uses camelCase column names (`balanceAfter`)
- **Impact**: All transaction operations return 500 errors

#### Solution Strategy
**Chosen Approach**: Update TypeORM entity to match existing database schema (camelCase)
- ✅ **Pros**: No database migration needed, faster deployment, less risk
- ❌ **Cons**: Slightly less conventional (most TypeORM uses snake_case)

#### Implementation Steps:
1. **Identify All Column Mismatches** in Transaction entity
2. **Update @Column() decorators** to match database schema exactly
3. **Verify Entity-Database Alignment** with existing data
4. **Test Transaction Operations** locally
5. **Deploy and Validate** in production

### Phase 2: Resource and Configuration Fixes (15 minutes)

#### 2.1 Missing Audio File
- **Issue**: `notification.mp3` returns 404
- **Solution**: Add placeholder audio file or remove references
- **Implementation**: Create/copy audio file to frontend assets

#### 2.2 Angular Firebase Configuration
- **Issue**: `NG0701: No provider for InjectionToken AngularFireAuthSettings`
- **Solution**: Properly configure or remove Firebase dependencies
- **Implementation**: Update Angular module imports

### Phase 3: Validation and Testing (20 minutes)

#### 3.1 Transaction API Validation
- Test all transaction endpoints:
  - POST `/api/app2/transactions` (create)
  - GET `/api/app2/transactions/family-stats/:id`
  - GET `/api/app2/transactions/recent/:id`
  - GET `/api/app2/transactions/child/:userId`

#### 3.2 End-to-End Validation
- Run complete E2E test suite
- Verify transaction flow works end-to-end
- Confirm dashboard statistics display correctly

---

## Technical Implementation Details

### 1. Transaction Entity Schema Fix

**Current Entity Issues** (from analysis):
```typescript
// Current (BROKEN) - expecting snake_case in database
@Entity('transactions')
export class Transaction {
  @Column({ name: 'balance_after' })  // ❌ Database has 'balanceAfter'
  balanceAfter: number;

  @Column({ name: 'transaction_date' }) // ❌ Database has 'transactionDate'
  transactionDate: Date;
}
```

**Required Fix** (match database):
```typescript
// Fixed - match actual database schema
@Entity('transactions')
export class Transaction {
  @Column({ name: 'balanceAfter' })  // ✅ Match database exactly
  balanceAfter: number;

  @Column({ name: 'transactionDate' }) // ✅ Match database exactly
  transactionDate: Date;
}
```

### 2. Database Column Mapping
Based on server analysis, correct database schema:
```sql
-- Actual database columns (camelCase)
balanceAfter         -- NOT balance_after
transactionDate      -- NOT transaction_date
createdAt           -- NOT created_at
updatedAt           -- NOT updated_at
userId              -- NOT user_id
familyId            -- NOT family_id
```

### 3. Verification Strategy
- **Local Testing**: Verify with dev database
- **Production Validation**: Monitor server logs after deployment
- **E2E Confirmation**: Re-run Playwright tests

---

## Risk Assessment

### Critical Fix Risks
- **Low Risk**: Updating entity column mappings (no database changes)
- **Medium Risk**: Deployment timing (requires restart)
- **Mitigation**: Deploy during low-traffic period, monitor closely

### Rollback Plan
- **If Issues**: Revert TypeORM entity changes
- **Validation**: Server logs and health endpoints
- **Timeline**: 5-minute rollback window

---

## Success Criteria

### Phase 1 Success Metrics
- ✅ Transaction creation returns 200 (not 500)
- ✅ Family statistics API returns data
- ✅ Recent transactions display correctly
- ✅ E2E test passes completely

### Phase 2 Success Metrics
- ✅ No 404 errors for notification.mp3
- ✅ Angular console warnings eliminated
- ✅ Clean browser console (no errors)

### Overall Success
- ✅ Core pocket money functionality works end-to-end
- ✅ Users can add/subtract money from children
- ✅ Dashboard displays statistics correctly
- ✅ No critical errors in production logs

---

## Implementation Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|---------------|
| 1.1 | Analyze current Transaction entity | 5 min | - |
| 1.2 | Fix column mapping in entity | 10 min | 1.1 |
| 1.3 | Test locally with dev database | 10 min | 1.2 |
| 1.4 | Deploy to production | 5 min | 1.3 |
| 2.1 | Fix notification.mp3 issue | 5 min | - |
| 2.2 | Fix Angular Firebase warnings | 10 min | - |
| 3.1 | Validate all transaction APIs | 10 min | 1.4 |
| 3.2 | Run E2E test suite | 10 min | 3.1 |

**Total Estimated Time**: 65 minutes
**Critical Path**: Database schema fix (30 minutes)

---

## Next Steps

1. **Start with Phase 1** (Critical database fix)
2. **Monitor production logs** during deployment
3. **Immediate validation** with E2E tests
4. **Phase 2 fixes** once core functionality restored
5. **Long-term improvements** (monitoring, error handling)

This plan prioritizes restoring core application functionality first, then addressing secondary issues for a complete resolution.