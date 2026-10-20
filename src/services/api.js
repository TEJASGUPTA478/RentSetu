// Replace mock data with fetch calls here when the project backend is available.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const initialProperties = [
  { id: 1, name: 'Maple Residency', address: '24, Indiranagar, Bengaluru', type: 'Apartment', units: 8, occupied: 6, rent: 24500 },
  { id: 2, name: 'Lakeview Villa', address: '17, HSR Layout, Bengaluru', type: 'Villa', units: 1, occupied: 1, rent: 42000 },
  { id: 3, name: 'Palm Court', address: '8, Whitefield, Bengaluru', type: 'Apartment', units: 12, occupied: 9, rent: 18500 },
]
export const initialTenants = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav.s@email.com', phone: '+91 98765 43210', property: 'Maple Residency', unit: 'A-302', lease: '01 Jan 2025 – 31 Dec 2025', rentStatus: 'Paid' },
  { id: 2, name: 'Priya Nair', email: 'priya.n@email.com', phone: '+91 98450 12345', property: 'Lakeview Villa', unit: 'Full property', lease: '15 Mar 2025 – 14 Mar 2026', rentStatus: 'Due' },
  { id: 3, name: 'Rohan Mehta', email: 'rohan.m@email.com', phone: '+91 99001 56789', property: 'Maple Residency', unit: 'B-104', lease: '01 Jun 2025 – 31 May 2026', rentStatus: 'Paid' },
  { id: 4, name: 'Meera Iyer', email: 'meera.i@email.com', phone: '+91 99887 65432', property: 'Palm Court', unit: 'C-205', lease: '10 Feb 2025 – 09 Feb 2026', rentStatus: 'Overdue' },
]
export const payments = [
  { id: 1, tenant: 'Aarav Sharma', property: 'Maple Residency · A-302', amount: 24500, due: '01 Oct 2025', paid: '01 Oct 2025', status: 'Paid' },
  { id: 2, tenant: 'Priya Nair', property: 'Lakeview Villa', amount: 42000, due: '05 Oct 2025', paid: '—', status: 'Due' },
  { id: 3, tenant: 'Meera Iyer', property: 'Palm Court · C-205', amount: 18500, due: '01 Oct 2025', paid: '—', status: 'Overdue' },
  { id: 4, tenant: 'Rohan Mehta', property: 'Maple Residency · B-104', amount: 24500, due: '01 Oct 2025', paid: '02 Oct 2025', status: 'Paid' },
]
export const requests = [
  { id: 1, tenant: 'Meera Iyer', property: 'Palm Court · C-205', issue: 'Kitchen tap is leaking', date: '18 Oct 2025', status: 'In progress' },
  { id: 2, tenant: 'Aarav Sharma', property: 'Maple Residency · A-302', issue: 'Air conditioner servicing', date: '16 Oct 2025', status: 'Open' },
  { id: 3, tenant: 'Priya Nair', property: 'Lakeview Villa', issue: 'Gate lock replacement', date: '12 Oct 2025', status: 'Resolved' },
]

// Demo-friendly service functions; replace each implementation with backend requests.
export async function getProperties() { return initialProperties }
export async function getTenants() { return initialTenants }
export async function getPayments() { return payments }
export async function getMaintenanceRequests() { return requests }
