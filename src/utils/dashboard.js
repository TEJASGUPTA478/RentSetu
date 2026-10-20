// ============================================================
// RentSetu — Dashboard Calculation Utilities
// ============================================================

/**
 * Format number as Indian currency.
 * Example: 245000 -> ₹2,45,000
 */
export function formatCurrency(amount = 0) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Check whether a record matches the selected filters.
 *
 * filters:
 * {
 *   propertyId: 'all' | 'prop-1' | 'prop-2' | 'prop-3',
 *   month: '2026-08' | '2026-09' | '2026-10'
 * }
 */
function matchesFilters(record, filters = {}) {
  const propertyMatch =
    !filters.propertyId ||
    filters.propertyId === 'all' ||
    record.propertyId === filters.propertyId;

  const monthMatch =
    !filters.month ||
    record.month === filters.month;

  return propertyMatch && monthMatch;
}

/**
 * Calculate expected rent for selected property/month.
 */
export function calculateExpectedRent(rentRecords = [], filters = {}) {
  return rentRecords
    .filter(record => matchesFilters(record, filters))
    .reduce((total, record) => total + Number(record.expected || 0), 0);
}

/**
 * Calculate collected rent.
 *
 * Uses actual payments when available.
 * Falls back to rentRecords paid amount if necessary.
 */
export function calculateCollectedRent(
  payments = [],
  rentRecords = [],
  filters = {}
) {
  const filteredPayments = payments.filter(payment =>
    matchesFilters(payment, filters)
  );

  if (filteredPayments.length > 0) {
    return filteredPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );
  }

  return rentRecords
    .filter(record => matchesFilters(record, filters))
    .reduce((total, record) => total + Number(record.paid || 0), 0);
}

/**
 * Calculate pending rent.
 */
export function calculatePendingRent(
  rentRecords = [],
  payments = [],
  filters = {}
) {
  const expected = calculateExpectedRent(rentRecords, filters);
  const collected = calculateCollectedRent(payments, rentRecords, filters);

  return Math.max(0, expected - collected);
}

/**
 * Calculate occupancy percentage.
 */
export function calculateOccupancy(
  units = [],
  tenants = [],
  filters = {}
) {
  let filteredUnits = units;

  if (filters.propertyId && filters.propertyId !== 'all') {
    filteredUnits = units.filter(
      unit => unit.propertyId === filters.propertyId
    );
  }

  if (filteredUnits.length === 0) {
    return 0;
  }

  const activeTenantUnitIds = new Set(
    tenants
      .filter(tenant => tenant.status === 'Active')
      .filter(
        tenant =>
          !filters.propertyId ||
          filters.propertyId === 'all' ||
          tenant.propertyId === filters.propertyId
      )
      .map(tenant => tenant.unitId)
  );

  const occupiedUnits = filteredUnits.filter(unit =>
    activeTenantUnitIds.has(unit.id)
  ).length;

  return Math.round((occupiedUnits / filteredUnits.length) * 100);
}

/**
 * Calculate rent collection for each property.
 */
export function calculatePropertyCollection(
  properties = [],
  rentRecords = [],
  payments = [],
  filters = {}
) {
  return properties
    .filter(
      property =>
        !filters.propertyId ||
        filters.propertyId === 'all' ||
        property.id === filters.propertyId
    )
    .map(property => {
      const propertyFilters = {
        ...filters,
        propertyId: property.id,
      };

      const expected = calculateExpectedRent(
        rentRecords,
        propertyFilters
      );

      const collected = calculateCollectedRent(
        payments,
        rentRecords,
        propertyFilters
      );

      const percentage =
        expected > 0
          ? Math.round((collected / expected) * 100)
          : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        expected,
        collected,
        pending: Math.max(0, expected - collected),
        percentage,
      };
    });
}

/**
 * Calculate maintenance counts.
 */
export function calculateMaintenanceCounts(
  maintenanceRequests = [],
  filters = {}
) {
  const filtered = maintenanceRequests.filter(record =>
    matchesFilters(record, filters)
  );

  return {
    open: filtered.filter(
      item => item.status === 'Open'
    ).length,

    inProgress: filtered.filter(
      item => item.status === 'In Progress'
    ).length,

    resolved: filtered.filter(
      item => item.status === 'Resolved'
    ).length,
  };
}

/**
 * Get latest rent payments.
 */
export function getRecentPayments(
  payments = [],
  filters = {},
  limit = 5
) {
  return payments
    .filter(payment => matchesFilters(payment, filters))
    .sort(
      (a, b) =>
        new Date(b.date || b.paymentDate) -
        new Date(a.date || a.paymentDate)
    )
    .slice(0, limit);
}

/**
 * Get outstanding rent records.
 */
export function getOutstandingRent(
  rentRecords = [],
  filters = {}
) {
  return rentRecords
    .filter(record => matchesFilters(record, filters))
    .filter(record => Number(record.expected || 0) > Number(record.paid || 0))
    .map(record => ({
      ...record,
      outstanding:
        Number(record.expected || 0) -
        Number(record.paid || 0),
    }));
}

/**
 * Generate dashboard "Needs Attention" items.
 */
export function getAttentionItems(
  rentRecords = [],
  utilityBills = [],
  maintenanceRequests = [],
  filters = {}
) {
  const items = [];

  // Outstanding rent
  const outstandingRent = getOutstandingRent(
    rentRecords,
    filters
  );

  outstandingRent.forEach(record => {
    const isOverdue =
      record.status === 'Overdue';

    items.push({
      id: `rent-${record.id}`,
      type: 'Rent',
      title: isOverdue
        ? 'Rent overdue'
        : 'Payment pending',
      tenantId: record.tenantId,
      propertyId: record.propertyId,
      unitId: record.unitId,
      amount: record.outstanding,
      status: record.status || 'Pending',
    });
  });

  // Pending utility bills
  utilityBills
    .filter(bill => matchesFilters(bill, filters))
    .filter(
      bill =>
        bill.status === 'Pending' ||
        bill.status === 'Overdue'
    )
    .forEach(bill => {
      items.push({
        id: `utility-${bill.id}`,
        type: 'Utility',
        title: `${bill.utilityType || 'Utility'} bill pending`,
        tenantId: bill.tenantId,
        propertyId: bill.propertyId,
        unitId: bill.unitId,
        amount: Number(bill.amount || bill.totalAmount || 0),
        status: bill.status,
      });
    });

  // Open / in-progress maintenance
  maintenanceRequests
    .filter(request => matchesFilters(request, filters))
    .filter(
      request =>
        request.status === 'Open' ||
        request.status === 'In Progress'
    )
    .forEach(request => {
      items.push({
        id: `maintenance-${request.id}`,
        type: 'Maintenance',
        title: request.title,
        propertyId: request.propertyId,
        unitId: request.unitId,
        priority: request.priority,
        status: request.status,
      });
    });

  return items;
}

/**
 * Calculate utility summary.
 */
export function getUtilitySummary(
  meterReadings = [],
  utilityBills = [],
  filters = {}
) {
  const readings = meterReadings.filter(reading =>
    matchesFilters(reading, filters)
  );

  const bills = utilityBills.filter(bill =>
    matchesFilters(bill, filters)
  );

  const totalUnits = readings.reduce(
    (total, reading) =>
      total + Number(
        reading.unitsConsumed ||
        reading.consumption ||
        0
      ),
    0
  );

  const totalAmount = bills.reduce(
    (total, bill) =>
      total +
      Number(
        bill.totalAmount ||
        bill.amount ||
        0
      ),
    0
  );

  return {
    totalUnits,
    totalAmount,
    readings,
    bills,
  };
}

/**
 * Get maintenance requests filtered by property/month.
 */
export function getFilteredMaintenanceRequests(
  maintenanceRequests = [],
  filters = {},
  limit = 5
) {
  return maintenanceRequests
    .filter(request => matchesFilters(request, filters))
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt) -
        new Date(a.date || a.createdAt)
    )
    .slice(0, limit);
}