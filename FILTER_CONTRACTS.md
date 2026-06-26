# Filter Contracts

This document outlines the expected data shapes and processing complexities for the `useInvoiceFilters` hook, which powers the Liquifact Marketplace searching, filtering, and sorting purely on the client side.

## Current State
The filtering logic has been extracted into a pure, testable React hook (`lib/hooks/useInvoiceFilters.js`) allowing the `InvestMarketplace` page component to remain presentational.

## 1. Invoice Object Schema
The marketplace currently maps to the following object structure. The hook expects this exact shape when performing derived state calculations.

```typescript
type Invoice = {
  id: string;          // e.g. "inv-001"
  issuer: string;      // e.g. "Acme Supplies Ltd"
  amount: string;      // e.g. "12,500" (comma-separated string, not float)
  currency: string;    // e.g. "USD", "EUR"
  dueDate: string;     // ISO Date String e.g. "2026-06-15"
  yield: string;       // e.g. "8.2%" (percentage string, not float)
  status: string;      // e.g. "Open"
};
```

## 2. Filter State (`DEFAULT_FILTERS`)
The `useInvoiceFilters` hook expects the `filters` dependency to match this schema (defined in `components/InvoiceFilters.jsx`):

```typescript
type InvoiceFiltersState = {
  yieldMin: string;     // Float as a string, e.g. "5.0"
  yieldMax: string;     // Float as a string, e.g. "10.0"
  currency: string;     // Exact match string, e.g. "USD"
  maturityFrom: string; // ISO Date String e.g. "2026-06-01"
  maturityTo: string;   // ISO Date String e.g. "2026-12-31"
  sort: string;         // Sort enum: 'yield_desc', 'yield_asc', 'amount_desc', 'amount_asc', 'maturity_asc', 'maturity_desc'
};
```

## 3. Algorithmic Complexity

**Time Complexity:** `O(N log N)`
1. **Filtering:** The hook runs a *single* `Array.prototype.filter()` pass across all `N` invoices. During this pass, all conditional boundaries (search, yield, currency, maturity) are evaluated together. This requires `O(N)` time.
2. **Sorting:** The resulting subset `M` (where `M <= N`) is then sorted using `Array.prototype.sort()`, requiring `O(M log M)` time. At worst case where no invoices are filtered out, the bounds are `O(N log N)`.

**Space Complexity:** `O(N)`
The hook allocates a single new array containing object references to the filtered invoices, consuming at most `O(N)` memory space.

## 4. Extending the Filters
If you need to add a new filter dimension (e.g. `status`):
1. Add the new key to `DEFAULT_FILTERS` in `components/InvoiceFilters.jsx`.
2. Add the corresponding UI field in `InvoiceFilters`.
3. Update the single `.filter()` pass inside `lib/hooks/useInvoiceFilters.js` to process the new condition. Keep string parsing localized to the check, returning early (`false`) to short-circuit expensive operations.
4. Add the new test cases in `useInvoiceFilters.test.tsx`.

## 5. Accessibility & Security
- Announcements: The results of the filters are announced to screen readers via the Live Region in the page component. The counts are passed seamlessly by evaluating `filteredInvoices.length`.
- No side effects: The hook operates deterministically without network calls or DOM mutations.
