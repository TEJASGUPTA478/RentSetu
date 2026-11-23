export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

const initial = {
  properties: [
    { id: 'demo-property-1', name: 'Maple Residency', address: '24, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', type: 'Apartment', units: 8, occupied: 6, rent: 24500, unitRecords: [{ id: 'demo-unit-1', unitNumber: 'A-302', status: 'OCCUPIED', rent: 24500 }, { id: 'demo-unit-2', unitNumber: 'A-101', status: 'VACANT', rent: 24500 }, { id: 'demo-unit-3', unitNumber: 'B-104', status: 'OCCUPIED', rent: 24500 }] },
    { id: 'demo-property-2', name: 'Lakeview Villa', address: '17, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', type: 'Villa', units: 1, occupied: 1, rent: 42000, unitRecords: [{ id: 'demo-unit-4', unitNumber: 'Full property', status: 'OCCUPIED', rent: 42000 }] },
    { id: 'demo-property-3', name: 'Palm Court', address: '8, Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', type: 'Apartment', units: 12, occupied: 9, rent: 18500, unitRecords: [{ id: 'demo-unit-5', unitNumber: 'C-205', status: 'OCCUPIED', rent: 18500 }, { id: 'demo-unit-6', unitNumber: 'D-101', status: 'VACANT', rent: 18500 }] },
  ],
  tenants: [
    { id: 'demo-tenant-1', leaseId: 'demo-lease-1', name: 'Aarav Sharma', email: 'aarav.s@email.com', phone: '+91 98765 43210', property: 'Maple Residency', unit: 'A-302', lease: '01 Jan 2025 – 31 Dec 2026', monthlyRent: 24500, rentStatus: 'Paid' },
    { id: 'demo-tenant-2', leaseId: 'demo-lease-2', name: 'Priya Nair', email: 'priya.n@email.com', phone: '+91 98450 12345', property: 'Lakeview Villa', unit: 'Full property', lease: '15 Mar 2025 – 14 Mar 2026', monthlyRent: 42000, rentStatus: 'Due' },
    { id: 'demo-tenant-3', leaseId: 'demo-lease-3', name: 'Rohan Mehta', email: 'rohan.m@email.com', phone: '+91 99001 56789', property: 'Maple Residency', unit: 'B-104', lease: '01 Jun 2025 – 31 May 2026', monthlyRent: 24500, rentStatus: 'Paid' },
    { id: 'demo-tenant-4', leaseId: 'demo-lease-4', name: 'Meera Iyer', email: 'meera.i@email.com', phone: '+91 99887 65432', property: 'Palm Court', unit: 'C-205', lease: '10 Feb 2025 – 09 Feb 2026', monthlyRent: 18500, rentStatus: 'Overdue' },
  ],
  payments: [
    { id: 'demo-payment-1', tenant: 'Aarav Sharma', property: 'Maple Residency · A-302', amount: 24500, due: '2026-11-01', paid: '2026-11-01', billingMonth: '2026-11-01', status: 'Paid', method: 'UPI' },
    { id: 'demo-payment-2', tenant: 'Priya Nair', property: 'Lakeview Villa', amount: 42000, due: '2026-11-05', paid: null, billingMonth: '2026-11-01', status: 'Due', method: '—' },
    { id: 'demo-payment-3', tenant: 'Meera Iyer', property: 'Palm Court · C-205', amount: 18500, due: '2026-11-01', paid: null, billingMonth: '2026-11-01', status: 'Overdue', method: '—' },
    { id: 'demo-payment-4', tenant: 'Rohan Mehta', property: 'Maple Residency · B-104', amount: 24500, due: '2026-11-01', paid: '2026-11-02', billingMonth: '2026-11-01', status: 'Paid', method: 'BANK_TRANSFER' },
  ],
  requests: [
    { id: 'demo-request-1', tenant: 'Meera Iyer', property: 'Palm Court · C-205', issue: 'Kitchen tap is leaking', description: 'Kitchen tap is leaking and needs repair.', date: '2026-11-18', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'demo-request-2', tenant: 'Aarav Sharma', property: 'Maple Residency · A-302', issue: 'Air conditioner servicing', description: 'Please arrange annual servicing.', date: '2026-11-16', status: 'OPEN', priority: 'MEDIUM' },
    { id: 'demo-request-3', tenant: 'Priya Nair', property: 'Lakeview Villa', issue: 'Gate lock replacement', description: 'The gate lock is difficult to operate.', date: '2026-11-12', status: 'RESOLVED', priority: 'LOW' },
  ],
}
const storageKey = 'rentsetu-demo-data-v2'
const clone = value => JSON.parse(JSON.stringify(value))
function demoData() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey))
    return stored && stored.properties ? stored : clone(initial)
  } catch { return clone(initial) }
}
function saveDemo(data) { localStorage.setItem(storageKey, JSON.stringify(data)); return data }

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(result.error?.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return result.data
}
const send = (path, token, method, data) => request(path, token, { method, body: JSON.stringify(data) })
const id = () => `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const dateLabel = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const monthStart = () => `${new Date().toISOString().slice(0, 7)}-01`

export async function getDashboard(token, role) {
  if (!useMockData) return request(role === 'TENANT' ? '/dashboard/tenant' : '/dashboard/landlord', token)
  const d = demoData()
  const totalUnits = d.properties.reduce((sum, p) => sum + Number(p.units), 0)
  const occupiedUnits = d.properties.reduce((sum, p) => sum + Number(p.occupied), 0)
  return { totalProperties: d.properties.length, totalUnits, occupiedUnits, vacantUnits: totalUnits - occupiedUnits,
    occupancyRate: totalUnits ? Math.round(occupiedUnits / totalUnits * 100) : 0,
    rentCollectedThisMonth: d.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0),
    expectedRentThisMonth: d.properties.reduce((s, p) => s + Number(p.rent) * Number(p.occupied), 0),
    overdueCount: d.payments.filter(p => p.status === 'Overdue').length,
    overdueAmount: d.payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + Number(p.amount), 0),
    openMaintenanceRequests: d.requests.filter(r => ['OPEN', 'IN_PROGRESS'].includes(r.status)).length,
    recentPayments: d.payments.filter(p => p.status === 'Paid').slice(0, 5),
    rentCollectedByMonth: Array.from({ length: 6 }, (_, i) => ({ billingMonth: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5 + i, 1)).toISOString().slice(0, 10), amount: i === 5 ? d.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0) : 0 })),
  }
}
export async function getTenantDashboard(token) {
  if (!useMockData) return request('/dashboard/tenant', token)
  return { activeLease: { property: 'Maple Residency', unit: 'A-302', address: '24, Indiranagar, Bengaluru', startDate: '2025-01-01', endDate: '2026-12-31' }, monthlyRent: 24500, nextDueDate: monthStart(), currentMonthStatus: 'PENDING', lastPayment: { amount: 24500, paidOn: '2026-10-01', method: 'UPI' }, openMaintenanceRequestCount: 1 }
}
export async function getProperties(token) {
  if (useMockData) return demoData().properties
  const [result, units] = await Promise.all([request('/properties?limit=100', token), getUnits(token)])
  return result.properties.map(p => {
    const propertyUnits = units.filter(u => u.propertyId === p.id)
    return { ...p, units: p.totalUnits, occupied: p.occupiedUnits, rent: propertyUnits.length ? propertyUnits.reduce((s, u) => s + Number(u.rent), 0) / propertyUnits.length : 0, unitRecords: propertyUnits }
  })
}
export async function getUnits(token) { if (useMockData) return []; const result = await request('/units?limit=100', token); return result.units }
export async function getManagers(token) { if (useMockData) return []; return request('/users/managers', token) }
export async function getTenants(token) {
  if (useMockData) return demoData().tenants
  const result = await request('/tenants?limit=100', token)
  return result.tenants.map(t => ({ ...t, leaseLabel: t.lease ? `${dateLabel(t.lease.startDate)} – ${dateLabel(t.lease.endDate)}` : 'No active lease', rentStatus: t.lease?.status === 'ACTIVE' ? 'Active' : 'No lease' }))
}
export async function getPayments(token, role) {
  if (useMockData) return demoData().payments
  const result = await request('/payments?limit=100', token)
  const received = result.payments.map(p => ({ ...p, tenant: p.tenant || 'Tenant', property: p.property || p.unit || '—', paid: p.paidOn, status: 'Paid' }))
  if (role === 'TENANT') return received
  const dashboard = await request('/dashboard/landlord', token)
  const unpaid = (dashboard.outstandingItems || dashboard.overdueItems || []).map(item => ({ ...item, id: `unpaid-${item.leaseId}-${item.billingMonth}`, tenant: item.tenant, property: item.property, amount: item.amount, billingMonth: item.billingMonth, due: item.dueDate, paidOn: null, method: '—', status: item.status || 'Overdue' }))
  return [...unpaid, ...received]
}
export async function getMaintenanceRequests(token) {
  if (useMockData) return demoData().requests
  const result = await request('/maintenance?limit=100', token)
  return result.requests.map(r => ({ ...r, tenant: r.tenantName || r.tenant?.user?.name || 'Tenant', property: r.property ? `${r.property} · ${r.unitNumber || ''}` : r.unit?.property?.name || '—', issue: r.title, date: r.date, status: r.status }))
}
export async function createProperty(token, data) {
  if (useMockData) { const d = demoData(); const propertyId = id(); const count = Number(data.units); const item = { ...data, id: propertyId, units: count, occupied: 0, rent: Number(data.rent), unitRecords: Array.from({ length: count }, (_, index) => ({ id: id(), unitNumber: `Unit ${index + 1}`, status: 'VACANT', rent: Number(data.rent) })) }; d.properties.push(item); saveDemo(d); return item }
  const { units, rent, bedrooms, ...fields } = data
  const property = await send('/properties', token, 'POST', fields)
  for (let index = 1; index <= Number(units); index++) await send('/units', token, 'POST', { propertyId: property.id, unitNumber: `Unit ${index}`, rent: Number(rent), bedrooms: Number(bedrooms || 1) })
  return property
}
export async function updateProperty(token, propertyId, data) {
  if (useMockData) { const d = demoData(); const item = d.properties.find(p => p.id === propertyId); Object.assign(item, data); saveDemo(d); return item }
  const { units, occupied, rent, ...fields } = data
  return send(`/properties/${propertyId}`, token, 'PUT', fields)
}
export async function deleteProperty(token, propertyId) {
  if (useMockData) { const d = demoData(); d.properties = d.properties.filter(p => p.id !== propertyId); saveDemo(d); return }
  return request(`/properties/${propertyId}`, token, { method: 'DELETE' })
}
export async function createTenant(token, data) {
  if (useMockData) {
    const d = demoData(); const profileId = id(); const unit = d.properties.flatMap(p => (p.unitRecords || []).map(u => ({ ...u, property: p }))).find(u => u.id === data.unitId)
    const hasLease = Boolean(unit && data.leaseStart && data.leaseEnd)
    if (hasLease) { unit.property.unitRecords.find(u => u.id === unit.id).status = 'OCCUPIED'; unit.property.occupied += 1 }
    const item = { ...data, id: profileId, leaseId: hasLease ? id() : null, lease: hasLease ? `${dateLabel(data.leaseStart)} – ${dateLabel(data.leaseEnd)}` : null, leaseLabel: hasLease ? `${dateLabel(data.leaseStart)} – ${dateLabel(data.leaseEnd)}` : 'No active lease', monthlyRent: Number(data.monthlyRent || unit?.rent || 0), property: hasLease ? unit.property.name : null, unit: hasLease ? unit.unitNumber : null, rentStatus: hasLease ? 'Active' : 'No lease' }
    d.tenants.push(item); saveDemo(d); return item
  }
  const { propertyId, unitId, leaseStart, leaseEnd, monthlyRent, securityDeposit, dueDay, ...tenantFields } = data
  const tenant = await send('/tenants', token, 'POST', tenantFields)
  if (unitId && leaseStart && leaseEnd) await send('/leases', token, 'POST', { unitId, tenantId: tenant.id, startDate: leaseStart, endDate: leaseEnd, monthlyRent: Number(monthlyRent), securityDeposit: Number(securityDeposit || 0), dueDay: Number(dueDay || 1) })
  return tenant
}
export async function updateTenant(token, tenantId, data) {
  if (useMockData) { const d = demoData(); const item = d.tenants.find(t => t.id === tenantId); Object.assign(item, data); saveDemo(d); return item }
  return send(`/tenants/${tenantId}`, token, 'PUT', data)
}
export async function deleteTenant(token, tenantId) {
  if (useMockData) { const d = demoData(); d.tenants = d.tenants.filter(t => t.id !== tenantId); saveDemo(d); return }
  return request(`/tenants/${tenantId}`, token, { method: 'DELETE' })
}
export async function recordPayment(token, data) {
  if (useMockData) { const d = demoData(); const item = { ...data, id: id(), tenant: data.tenant || 'Demo Tenant', property: data.property || 'Demo Property', paid: data.paidOn, due: data.billingMonth, status: 'Paid' }; d.payments.unshift(item); saveDemo(d); return item }
  return send('/payments', token, 'POST', { ...data, billingMonth: `${data.billingMonth.slice(0, 7)}-01` })
}
export async function updateMaintenance(token, requestId, data) {
  if (useMockData) { const d = demoData(); const item = d.requests.find(r => r.id === requestId); Object.assign(item, data); saveDemo(d); return item }
  return send(`/maintenance/${requestId}`, token, 'PATCH', data)
}
export async function createMaintenance(token, data) {
  if (useMockData) { const d = demoData(); const item = { ...data, id: id(), issue: data.title, date: new Date().toISOString().slice(0, 10), status: 'OPEN' }; d.requests.unshift(item); saveDemo(d); return item }
  return send('/maintenance', token, 'POST', data)
}
