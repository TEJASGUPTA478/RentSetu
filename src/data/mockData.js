// RentSetu — Frontend demo data
// Step 2: Dashboard mock data

export const MONTH_OPTIONS = [
  { value: '2026-08', label: 'August 2026' },
  { value: '2026-09', label: 'September 2026' },
  { value: '2026-10', label: 'October 2026' },
];

export const properties = [
  {
    id: 'prop-1',
    name: 'Green Valley Apartments',
    address: 'Sector 62, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
  },
  {
    id: 'prop-2',
    name: 'Sunrise PG',
    address: 'Indirapuram, Ghaziabad',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
  },
  {
    id: 'prop-3',
    name: 'Shanti Residency',
    address: 'Mayur Vihar Phase 1',
    city: 'Delhi',
    state: 'Delhi',
  },
];

export const units = [
  { id: 'unit-1', propertyId: 'prop-1', number: 'A-101', monthlyRent: 14500, status: 'Occupied' },
  { id: 'unit-2', propertyId: 'prop-1', number: 'A-102', monthlyRent: 14000, status: 'Occupied' },
  { id: 'unit-3', propertyId: 'prop-1', number: 'A-103', monthlyRent: 13500, status: 'Occupied' },
  { id: 'unit-4', propertyId: 'prop-1', number: 'A-204', monthlyRent: 15000, status: 'Occupied' },

  { id: 'unit-5', propertyId: 'prop-2', number: 'B-101', monthlyRent: 11000, status: 'Occupied' },
  { id: 'unit-6', propertyId: 'prop-2', number: 'B-102', monthlyRent: 12500, status: 'Occupied' },
  { id: 'unit-7', propertyId: 'prop-2', number: 'B-103', monthlyRent: 12000, status: 'Occupied' },
  { id: 'unit-8', propertyId: 'prop-2', number: 'B-104', monthlyRent: 9500, status: 'Occupied' },

  { id: 'unit-9', propertyId: 'prop-3', number: 'C-101', monthlyRent: 13000, status: 'Occupied' },
  { id: 'unit-10', propertyId: 'prop-3', number: 'C-102', monthlyRent: 16000, status: 'Occupied' },
  { id: 'unit-11', propertyId: 'prop-3', number: 'C-201', monthlyRent: 14000, status: 'Occupied' },
  { id: 'unit-12', propertyId: 'prop-3', number: 'C-202', monthlyRent: 13500, status: 'Vacant' },
];

export const tenants = [
  {
    id: 'tenant-1',
    name: 'Vikram Nair',
    propertyId: 'prop-1',
    unitId: 'unit-1',
    monthlyRent: 14500,
    status: 'Active',
  },
  {
    id: 'tenant-2',
    name: 'Amit Verma',
    propertyId: 'prop-1',
    unitId: 'unit-2',
    monthlyRent: 14000,
    status: 'Active',
  },
  {
    id: 'tenant-3',
    name: 'Kavita Rao',
    propertyId: 'prop-1',
    unitId: 'unit-3',
    monthlyRent: 13500,
    status: 'Active',
  },
  {
    id: 'tenant-4',
    name: 'Rajesh Sharma',
    propertyId: 'prop-1',
    unitId: 'unit-4',
    monthlyRent: 15000,
    status: 'Active',
  },

  {
    id: 'tenant-5',
    name: 'Rohan Kulkarni',
    propertyId: 'prop-2',
    unitId: 'unit-5',
    monthlyRent: 11000,
    status: 'Active',
  },
  {
    id: 'tenant-6',
    name: 'Anita Joshi',
    propertyId: 'prop-2',
    unitId: 'unit-6',
    monthlyRent: 12500,
    status: 'Active',
  },
  {
    id: 'tenant-7',
    name: 'Priya Mehta',
    propertyId: 'prop-2',
    unitId: 'unit-7',
    monthlyRent: 12000,
    status: 'Active',
  },
  {
    id: 'tenant-8',
    name: 'Siddharth Jain',
    propertyId: 'prop-2',
    unitId: 'unit-8',
    monthlyRent: 9500,
    status: 'Active',
  },

  {
    id: 'tenant-9',
    name: 'Neha Singh',
    propertyId: 'prop-3',
    unitId: 'unit-9',
    monthlyRent: 13000,
    status: 'Active',
  },
  {
    id: 'tenant-10',
    name: 'Deepak Malhotra',
    propertyId: 'prop-3',
    unitId: 'unit-10',
    monthlyRent: 16000,
    status: 'Active',
  },
  {
    id: 'tenant-11',
    name: 'Meera Iyer',
    propertyId: 'prop-3',
    unitId: 'unit-11',
    monthlyRent: 14000,
    status: 'Active',
  },
];

// Monthly rent obligations
export const rentRecords = [
  // August
  { id: 'rent-aug-1', month: '2026-08', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', expected: 14500, paid: 14500, status: 'Paid' },
  { id: 'rent-aug-2', month: '2026-08', tenantId: 'tenant-2', propertyId: 'prop-1', unitId: 'unit-2', expected: 14000, paid: 14000, status: 'Paid' },
  { id: 'rent-aug-3', month: '2026-08', tenantId: 'tenant-3', propertyId: 'prop-1', unitId: 'unit-3', expected: 13500, paid: 10000, status: 'Partial' },
  { id: 'rent-aug-4', month: '2026-08', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', expected: 15000, paid: 15000, status: 'Paid' },

  { id: 'rent-aug-5', month: '2026-08', tenantId: 'tenant-5', propertyId: 'prop-2', unitId: 'unit-5', expected: 11000, paid: 11000, status: 'Paid' },
  { id: 'rent-aug-6', month: '2026-08', tenantId: 'tenant-6', propertyId: 'prop-2', unitId: 'unit-6', expected: 12500, paid: 12500, status: 'Paid' },
  { id: 'rent-aug-7', month: '2026-08', tenantId: 'tenant-7', propertyId: 'prop-2', unitId: 'unit-7', expected: 12000, paid: 12000, status: 'Paid' },
  { id: 'rent-aug-8', month: '2026-08', tenantId: 'tenant-8', propertyId: 'prop-2', unitId: 'unit-8', expected: 9500, paid: 8000, status: 'Partial' },

  { id: 'rent-aug-9', month: '2026-08', tenantId: 'tenant-9', propertyId: 'prop-3', unitId: 'unit-9', expected: 13000, paid: 13000, status: 'Paid' },
  { id: 'rent-aug-10', month: '2026-08', tenantId: 'tenant-10', propertyId: 'prop-3', unitId: 'unit-10', expected: 16000, paid: 16000, status: 'Paid' },
  { id: 'rent-aug-11', month: '2026-08', tenantId: 'tenant-11', propertyId: 'prop-3', unitId: 'unit-11', expected: 14000, paid: 14000, status: 'Paid' },

  // September
  { id: 'rent-sep-1', month: '2026-09', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', expected: 14500, paid: 14500, status: 'Paid' },
  { id: 'rent-sep-2', month: '2026-09', tenantId: 'tenant-2', propertyId: 'prop-1', unitId: 'unit-2', expected: 14000, paid: 14000, status: 'Paid' },
  { id: 'rent-sep-3', month: '2026-09', tenantId: 'tenant-3', propertyId: 'prop-1', unitId: 'unit-3', expected: 13500, paid: 13500, status: 'Paid' },
  { id: 'rent-sep-4', month: '2026-09', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', expected: 15000, paid: 15000, status: 'Paid' },

  { id: 'rent-sep-5', month: '2026-09', tenantId: 'tenant-5', propertyId: 'prop-2', unitId: 'unit-5', expected: 11000, paid: 11000, status: 'Paid' },
  { id: 'rent-sep-6', month: '2026-09', tenantId: 'tenant-6', propertyId: 'prop-2', unitId: 'unit-6', expected: 12500, paid: 10000, status: 'Partial' },
  { id: 'rent-sep-7', month: '2026-09', tenantId: 'tenant-7', propertyId: 'prop-2', unitId: 'unit-7', expected: 12000, paid: 12000, status: 'Paid' },
  { id: 'rent-sep-8', month: '2026-09', tenantId: 'tenant-8', propertyId: 'prop-2', unitId: 'unit-8', expected: 9500, paid: 9500, status: 'Paid' },

  { id: 'rent-sep-9', month: '2026-09', tenantId: 'tenant-9', propertyId: 'prop-3', unitId: 'unit-9', expected: 13000, paid: 13000, status: 'Paid' },
  { id: 'rent-sep-10', month: '2026-09', tenantId: 'tenant-10', propertyId: 'prop-3', unitId: 'unit-10', expected: 16000, paid: 16000, status: 'Paid' },
  { id: 'rent-sep-11', month: '2026-09', tenantId: 'tenant-11', propertyId: 'prop-3', unitId: 'unit-11', expected: 14000, paid: 12000, status: 'Partial' },

  // October
  { id: 'rent-oct-1', month: '2026-10', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', expected: 14500, paid: 14500, status: 'Paid' },
  { id: 'rent-oct-2', month: '2026-10', tenantId: 'tenant-2', propertyId: 'prop-1', unitId: 'unit-2', expected: 14000, paid: 14000, status: 'Paid' },
  { id: 'rent-oct-3', month: '2026-10', tenantId: 'tenant-3', propertyId: 'prop-1', unitId: 'unit-3', expected: 13500, paid: 8500, status: 'Partial' },
  { id: 'rent-oct-4', month: '2026-10', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', expected: 15000, paid: 15000, status: 'Paid' },

  { id: 'rent-oct-5', month: '2026-10', tenantId: 'tenant-5', propertyId: 'prop-2', unitId: 'unit-5', expected: 11000, paid: 11000, status: 'Paid' },
  { id: 'rent-oct-6', month: '2026-10', tenantId: 'tenant-6', propertyId: 'prop-2', unitId: 'unit-6', expected: 12500, paid: 0, status: 'Pending' },
  { id: 'rent-oct-7', month: '2026-10', tenantId: 'tenant-7', propertyId: 'prop-2', unitId: 'unit-7', expected: 12000, paid: 12000, status: 'Paid' },
  { id: 'rent-oct-8', month: '2026-10', tenantId: 'tenant-8', propertyId: 'prop-2', unitId: 'unit-8', expected: 9500, paid: 9500, status: 'Paid' },

  { id: 'rent-oct-9', month: '2026-10', tenantId: 'tenant-9', propertyId: 'prop-3', unitId: 'unit-9', expected: 13000, paid: 6500, status: 'Partial' },
  { id: 'rent-oct-10', month: '2026-10', tenantId: 'tenant-10', propertyId: 'prop-3', unitId: 'unit-10', expected: 16000, paid: 16000, status: 'Paid' },
  { id: 'rent-oct-11', month: '2026-10', tenantId: 'tenant-11', propertyId: 'prop-3', unitId: 'unit-11', expected: 14000, paid: 14000, status: 'Paid' },
];

// Payment transactions
export const payments = [
  { id: 'pay-1', rentRecordId: 'rent-aug-1', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', month: '2026-08', amount: 14500, date: '2026-08-05', status: 'Paid' },
  { id: 'pay-2', rentRecordId: 'rent-aug-4', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', month: '2026-08', amount: 15000, date: '2026-08-04', status: 'Paid' },
  { id: 'pay-3', rentRecordId: 'rent-aug-6', tenantId: 'tenant-6', propertyId: 'prop-2', unitId: 'unit-6', month: '2026-08', amount: 12500, date: '2026-08-06', status: 'Paid' },
  { id: 'pay-4', rentRecordId: 'rent-aug-8', tenantId: 'tenant-8', propertyId: 'prop-2', unitId: 'unit-8', month: '2026-08', amount: 8000, date: '2026-08-09', status: 'Partial' },

  { id: 'pay-5', rentRecordId: 'rent-sep-1', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', month: '2026-09', amount: 14500, date: '2026-09-04', status: 'Paid' },
  { id: 'pay-6', rentRecordId: 'rent-sep-4', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', month: '2026-09', amount: 15000, date: '2026-09-05', status: 'Paid' },
  { id: 'pay-7', rentRecordId: 'rent-sep-6', tenantId: 'tenant-6', propertyId: 'prop-2', unitId: 'unit-6', month: '2026-09', amount: 10000, date: '2026-09-08', status: 'Partial' },
  { id: 'pay-8', rentRecordId: 'rent-sep-11', tenantId: 'tenant-11', propertyId: 'prop-3', unitId: 'unit-11', month: '2026-09', amount: 12000, date: '2026-09-10', status: 'Partial' },

  { id: 'pay-9', rentRecordId: 'rent-oct-1', tenantId: 'tenant-1', propertyId: 'prop-1', unitId: 'unit-1', month: '2026-10', amount: 14500, date: '2026-10-05', status: 'Paid' },
  { id: 'pay-10', rentRecordId: 'rent-oct-2', tenantId: 'tenant-2', propertyId: 'prop-1', unitId: 'unit-2', month: '2026-10', amount: 14000, date: '2026-10-16', status: 'Paid' },
  { id: 'pay-11', rentRecordId: 'rent-oct-3', tenantId: 'tenant-3', propertyId: 'prop-1', unitId: 'unit-3', month: '2026-10', amount: 8500, date: '2026-10-12', status: 'Partial' },
  { id: 'pay-12', rentRecordId: 'rent-oct-4', tenantId: 'tenant-4', propertyId: 'prop-1', unitId: 'unit-4', month: '2026-10', amount: 15000, date: '2026-10-18', status: 'Paid' },

  { id: 'pay-13', rentRecordId: 'rent-oct-5', tenantId: 'tenant-5', propertyId: 'prop-2', unitId: 'unit-5', month: '2026-10', amount: 11000, date: '2026-10-10', status: 'Paid' },
  { id: 'pay-14', rentRecordId: 'rent-oct-7', tenantId: 'tenant-7', propertyId: 'prop-2', unitId: 'unit-7', month: '2026-10', amount: 12000, date: '2026-10-17', status: 'Paid' },
  { id: 'pay-15', rentRecordId: 'rent-oct-8', tenantId: 'tenant-8', propertyId: 'prop-2', unitId: 'unit-8', month: '2026-10', amount: 9500, date: '2026-10-08', status: 'Paid' },

  { id: 'pay-16', rentRecordId: 'rent-oct-9', tenantId: 'tenant-9', propertyId: 'prop-3', unitId: 'unit-9', month: '2026-10', amount: 6500, date: '2026-10-15', status: 'Partial' },
  { id: 'pay-17', rentRecordId: 'rent-oct-10', tenantId: 'tenant-10', propertyId: 'prop-3', unitId: 'unit-10', month: '2026-10', amount: 16000, date: '2026-10-14', status: 'Paid' },
  { id: 'pay-18', rentRecordId: 'rent-oct-11', tenantId: 'tenant-11', propertyId: 'prop-3', unitId: 'unit-11', month: '2026-10', amount: 14000, date: '2026-10-11', status: 'Paid' },
];

// Electricity meter readings
export const meterReadings = [
  // August
  { id: 'meter-aug-1', month: '2026-08', propertyId: 'prop-1', unitId: 'unit-1', tenantId: 'tenant-1', prevReading: 980, currReading: 1090, unitsConsumed: 110 },
  { id: 'meter-aug-2', month: '2026-08', propertyId: 'prop-1', unitId: 'unit-2', tenantId: 'tenant-2', prevReading: 1050, currReading: 1165, unitsConsumed: 115 },
  { id: 'meter-aug-3', month: '2026-08', propertyId: 'prop-1', unitId: 'unit-3', tenantId: 'tenant-3', prevReading: 890, currReading: 1010, unitsConsumed: 120 },
  { id: 'meter-aug-4', month: '2026-08', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', prevReading: 1000, currReading: 1125, unitsConsumed: 125 },

  // September
  { id: 'meter-sep-1', month: '2026-09', propertyId: 'prop-1', unitId: 'unit-1', tenantId: 'tenant-1', prevReading: 1090, currReading: 1195, unitsConsumed: 105 },
  { id: 'meter-sep-2', month: '2026-09', propertyId: 'prop-1', unitId: 'unit-2', tenantId: 'tenant-2', prevReading: 1165, currReading: 1280, unitsConsumed: 115 },
  { id: 'meter-sep-3', month: '2026-09', propertyId: 'prop-1', unitId: 'unit-3', tenantId: 'tenant-3', prevReading: 1010, currReading: 1128, unitsConsumed: 118 },
  { id: 'meter-sep-4', month: '2026-09', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', prevReading: 1125, currReading: 1240, unitsConsumed: 115 },

  // October
  { id: 'meter-oct-1', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-1', tenantId: 'tenant-1', prevReading: 1195, currReading: 1310, unitsConsumed: 115 },
  { id: 'meter-oct-2', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-2', tenantId: 'tenant-2', prevReading: 1280, currReading: 1390, unitsConsumed: 110 },
  { id: 'meter-oct-3', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-3', tenantId: 'tenant-3', prevReading: 1128, currReading: 1245, unitsConsumed: 117 },
  { id: 'meter-oct-4', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', prevReading: 1240, currReading: 1368, unitsConsumed: 128 },

  { id: 'meter-oct-5', month: '2026-10', propertyId: 'prop-2', unitId: 'unit-5', tenantId: 'tenant-5', prevReading: 700, currReading: 805, unitsConsumed: 105 },
  { id: 'meter-oct-6', month: '2026-10', propertyId: 'prop-2', unitId: 'unit-6', tenantId: 'tenant-6', prevReading: 810, currReading: 920, unitsConsumed: 110 },
  { id: 'meter-oct-7', month: '2026-10', propertyId: 'prop-2', unitId: 'unit-7', tenantId: 'tenant-7', prevReading: 640, currReading: 745, unitsConsumed: 105 },
  { id: 'meter-oct-8', month: '2026-10', propertyId: 'prop-2', unitId: 'unit-8', tenantId: 'tenant-8', prevReading: 520, currReading: 610, unitsConsumed: 90 },

  { id: 'meter-oct-9', month: '2026-10', propertyId: 'prop-3', unitId: 'unit-9', tenantId: 'tenant-9', prevReading: 900, currReading: 1005, unitsConsumed: 105 },
  { id: 'meter-oct-10', month: '2026-10', propertyId: 'prop-3', unitId: 'unit-10', tenantId: 'tenant-10', prevReading: 1100, currReading: 1225, unitsConsumed: 125 },
  { id: 'meter-oct-11', month: '2026-10', propertyId: 'prop-3', unitId: 'unit-11', tenantId: 'tenant-11', prevReading: 830, currReading: 940, unitsConsumed: 110 },
];

export const utilityBills = [
  { id: 'bill-1', month: '2026-08', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', type: 'Electricity', unitsConsumed: 125, ratePerUnit: 8, amount: 1000, status: 'Pending' },
  { id: 'bill-2', month: '2026-09', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', type: 'Electricity', unitsConsumed: 115, ratePerUnit: 8, amount: 920, status: 'Paid' },
  { id: 'bill-3', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-4', tenantId: 'tenant-4', type: 'Electricity', unitsConsumed: 128, ratePerUnit: 8, amount: 1024, status: 'Pending' },

  { id: 'bill-4', month: '2026-10', propertyId: 'prop-1', unitId: 'unit-1', tenantId: 'tenant-1', type: 'Electricity', unitsConsumed: 115, ratePerUnit: 8, amount: 920, status: 'Paid' },
  { id: 'bill-5', month: '2026-10', propertyId: 'prop-2', unitId: 'unit-6', tenantId: 'tenant-6', type: 'Electricity', unitsConsumed: 110, ratePerUnit: 8, amount: 880, status: 'Pending' },
  { id: 'bill-6', month: '2026-10', propertyId: 'prop-3', unitId: 'unit-10', tenantId: 'tenant-10', type: 'Electricity', unitsConsumed: 125, ratePerUnit: 8, amount: 1000, status: 'Paid' },
];

export const maintenanceRequests = [
  {
    id: 'maint-1',
    month: '2026-10',
    propertyId: 'prop-1',
    unitId: 'unit-4',
    title: 'AC not cooling',
    priority: 'High',
    status: 'Open',
    date: '2026-10-19',
  },
  {
    id: 'maint-2',
    month: '2026-10',
    propertyId: 'prop-2',
    unitId: 'unit-6',
    title: 'Water leakage',
    priority: 'Medium',
    status: 'In Progress',
    date: '2026-10-18',
  },
  {
    id: 'maint-3',
    month: '2026-10',
    propertyId: 'prop-1',
    unitId: 'unit-3',
    title: 'Water leakage',
    priority: 'High',
    status: 'Open',
    date: '2026-10-17',
  },
  {
    id: 'maint-4',
    month: '2026-10',
    propertyId: 'prop-3',
    unitId: 'unit-9',
    title: 'Bathroom tap repair',
    priority: 'Low',
    status: 'Resolved',
    date: '2026-10-15',
  },
  {
    id: 'maint-5',
    month: '2026-09',
    propertyId: 'prop-1',
    unitId: 'unit-2',
    title: 'Fan replacement',
    priority: 'Medium',
    status: 'Resolved',
    date: '2026-09-22',
  },
  {
    id: 'maint-6',
    month: '2026-09',
    propertyId: 'prop-2',
    unitId: 'unit-5',
    title: 'Door lock repair',
    priority: 'Medium',
    status: 'Resolved',
    date: '2026-09-20',
  },
  {
    id: 'maint-7',
    month: '2026-08',
    propertyId: 'prop-3',
    unitId: 'unit-11',
    title: 'Water heater issue',
    priority: 'High',
    status: 'In Progress',
    date: '2026-08-18',
  },
];

export const expenses = [
  { id: 'exp-1', month: '2026-08', propertyId: 'prop-1', category: 'Plumbing repair', amount: 3500 },
  { id: 'exp-2', month: '2026-08', propertyId: 'prop-2', category: 'Security guard salary', amount: 12000 },
  { id: 'exp-3', month: '2026-08', propertyId: 'prop-3', category: 'Water tank cleaning', amount: 2500 },

  { id: 'exp-4', month: '2026-09', propertyId: 'prop-1', category: 'Common area electricity', amount: 4200 },
  { id: 'exp-5', month: '2026-09', propertyId: 'prop-2', category: 'Plumbing repair', amount: 2800 },
  { id: 'exp-6', month: '2026-09', propertyId: 'prop-3', category: 'Security guard salary', amount: 12000 },

  { id: 'exp-7', month: '2026-10', propertyId: 'prop-1', category: 'Plumbing repair', amount: 4500 },
  { id: 'exp-8', month: '2026-10', propertyId: 'prop-2', category: 'Common area electricity', amount: 3900 },
  { id: 'exp-9', month: '2026-10', propertyId: 'prop-3', category: 'Water tank cleaning', amount: 3000 },
];

// Aliases for clarity/compatibility
export const rent_records = rentRecords;
export const rentRecordsData = rentRecords;