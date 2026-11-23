import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import {
  createMaintenance, createProperty, createTenant, deleteProperty, deleteTenant,
  getDashboard, getMaintenanceRequests, getPayments, getProperties, getTenantDashboard,
  getManagers, getTenants, recordPayment, updateMaintenance, updateProperty, updateTenant, useMockData,
} from './services/api.js'

const nav = [['Dashboard', '▦'], ['Properties', '⌂'], ['Tenants', '♙'], ['Rent & Payments', '₹'], ['Maintenance', '⚒']]
const money = n => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const dateLabel = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const initials = value => String(value || 'RS').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase()
const prettyStatus = value => String(value || '—').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

function Icon({ children }) { return <span className="nav-icon" aria-hidden="true">{children}</span> }
function Sidebar({ page, setPage, mobileOpen, setMobileOpen, user, logout }) {
  const [accountOpen, setAccountOpen] = useState(false)
  const tenant = user?.role === 'TENANT'
  const links = tenant ? [['Dashboard', '▦'], ['Rent & Payments', '₹'], ['Maintenance', '⚒']] : nav
  return <><aside className={`sidebar ${mobileOpen ? 'show' : ''}`}>
    <div className="brand"><div className="brand-mark">R</div><div><b>RentSetu</b><small>{tenant ? 'TENANT PORTAL' : `${user?.role || 'OWNER'} PORTAL`}</small></div></div>
    <div className="nav-label">WORKSPACE</div>
    <nav>{links.map(([label, icon]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => { setPage(label); setMobileOpen(false) }}><Icon>{icon}</Icon>{label}</button>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">?</div><b>Need a hand?</b><p>Manage your rental home from one place.</p><button onClick={() => window.alert('Use the sidebar to view your dashboard, payments, and maintenance requests.')}>View guide <span>↗</span></button></div><div className="user-mini"><div className="avatar">{initials(user?.name || user?.email)}</div><div className="user-meta"><b>{user?.name || user?.email}</b><small>{prettyStatus(user?.role)}</small></div><button className="dots" onClick={() => setAccountOpen(!accountOpen)} aria-label="Account options" title="Account options">···</button>{accountOpen && <div className="account-menu"><button onClick={() => { setAccountOpen(false); window.dispatchEvent(new Event('rentsetu:change-password')) }}>Change password</button><button onClick={logout}>Sign out</button></div>}</div></div>
  </aside>{mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}</>
}
function Header({ title, subtitle, action, onAction, onMenu, busy }) { return <header className="page-header"><button className="menu-button" onClick={onMenu} aria-label="Open navigation">☰</button><div><div className="breadcrumbs">Workspace <span>/</span> {title}</div><h1>{title}</h1><p>{subtitle}</p></div><div className="header-actions">{action && <button className="primary-btn" disabled={busy} onClick={onAction}><span>＋</span> {action}</button>}</div></header> }
function Badge({ children }) { return <span className={`badge ${String(children).toLowerCase().replaceAll(' ', '-').replaceAll('_', '-')}`}>{prettyStatus(children)}</span> }
function StatCard({ label, value, hint, icon, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><strong>{value}</strong><div className="stat-hint">{hint}</div></div> }
function Field({ label, name, type = 'text', placeholder, required = false, select, options = [], defaultValue, value, onChange, min, step, minLength }) {
  return <label className="field"><span>{label}</span>{select ? <select name={name} defaultValue={value === undefined ? defaultValue ?? options[0]?.value ?? '' : undefined} value={value} onChange={onChange} required={required}>{options.map(option => typeof option === 'string' ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue ?? ''} min={min} step={step} minLength={minLength} />}</label>
}
function Modal({ type, item, close, submit, properties, tenants, managers, role }) {
  const property = type === 'property'
  const tenant = type === 'tenant'
  const payment = type === 'payment'
  const maintenance = type === 'maintenance'
  const password = type === 'password'
  const title = password ? 'Change password' : `${item ? 'Edit' : payment ? 'Record' : maintenance ? 'Create' : 'Add'} ${property ? 'property' : tenant ? 'tenant' : payment ? 'payment' : 'maintenance request'}`
  const units = properties.flatMap(p => (p.unitRecords || []).map(u => ({ value: u.id, label: `${p.name} · ${u.unitNumber} (${prettyStatus(u.status)})` })))
  const freeUnits = units.filter((_, i) => !properties.flatMap(p => p.unitRecords || []).some(u => u.id === units[i]?.value && u.status === 'OCCUPIED'))
  const onSubmit = async event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await submit(values) }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && close()}><form className="modal" onSubmit={onSubmit}>
    <div className="modal-head"><div><h2>{title}</h2><p>{item ? 'Update the details and save your changes.' : 'Enter the details below to continue.'}</p></div><button type="button" className="close-btn" onClick={close} aria-label="Close">×</button></div>
    {property && <>
      <Field label="Property name" name="name" placeholder="Maple Residency" required defaultValue={item?.name} />
      <Field label="Street address" name="address" placeholder="24, Indiranagar" required defaultValue={item?.address} />
      <div className="form-row"><Field label="City" name="city" required defaultValue={item?.city} /><Field label="State" name="state" required defaultValue={item?.state} /></div>
      <div className="form-row"><Field label="Pincode" name="pincode" required defaultValue={item?.pincode} /><Field label="Property type" name="type" select options={['Apartment', 'Villa', 'Independent house', 'Studio', 'Commercial']} defaultValue={item?.type} /></div>
      {role === 'LANDLORD' && <Field label="Assigned manager" name="managerId" select options={[{ value: '', label: 'No manager assigned' }, ...managers.map(m => ({ value: m.id, label: `${m.name} · ${m.email}` }))]} defaultValue={item?.managerId || ''} />}
      {!item && <div className="form-row"><Field label="Number of units" name="units" type="number" min="1" required defaultValue="1" /><Field label="Rent per unit (₹)" name="rent" type="number" min="1" step="0.01" required defaultValue="20000" /></div>}
      {!item && <Field label="Bedrooms per unit" name="bedrooms" type="number" min="0" defaultValue="1" />}
    </>}
    {tenant && <>
      <Field label="Full name" name="name" required defaultValue={item?.name} />
      <div className="form-row"><Field label="Email address" name="email" type="email" required defaultValue={item?.email} /><Field label="Phone number" name="phone" required defaultValue={item?.phone} /></div>
      {!item && <><Field label="Temporary account password" name="password" type="password" required minLength="8" defaultValue="Password@123" /><p className="form-section-label">Lease details (optional)</p><Field label="Vacant unit" name="unitId" select options={[{ value: '', label: 'Create tenant without a lease' }, ...freeUnits]} />
        <div className="form-row"><Field label="Lease starts" name="leaseStart" type="date" /><Field label="Lease ends" name="leaseEnd" type="date" /></div>
        <div className="form-row"><Field label="Monthly rent (₹)" name="monthlyRent" type="number" min="1" step="0.01" defaultValue="20000" /><Field label="Due day (1–28)" name="dueDay" type="number" min="1" max="28" defaultValue="1" /></div>
        <Field label="Security deposit (₹)" name="securityDeposit" type="number" min="0" defaultValue="0" />
      </>}
    </>}
    {payment && <>
      <Field label="Tenant / lease" name="leaseId" select required options={tenants.filter(t => (t.lease?.id || t.leaseId) && (useMockData || t.lease?.status === 'ACTIVE')).map(t => ({ value: t.lease?.id || t.leaseId, label: `${t.name} · ${t.property || 'Property'} · ${money(t.lease?.monthlyRent || t.monthlyRent)}` }))} />
      <div className="form-row"><Field label="Billing month" name="billingMonth" type="month" required defaultValue={new Date().toISOString().slice(0, 7)} /><Field label="Amount (₹)" name="amount" type="number" min="1" step="0.01" required /></div>
      <div className="form-row"><Field label="Payment method" name="method" select options={['UPI', 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD']} /><Field label="Paid on" name="paidOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
    </>}
    {maintenance && <>
      <Field label="Issue title" name="title" required placeholder="Leaking kitchen tap" />
      <Field label="Description" name="description" required placeholder="Describe the issue and where it is happening" />
      <Field label="Priority" name="priority" select options={['LOW', 'MEDIUM', 'HIGH', 'URGENT']} />
      {role === 'TENANT' || useMockData ? null : <><Field label="Tenant" name="tenantId" select required options={tenants.map(t => ({ value: t.id, label: t.name }))} /><Field label="Unit" name="unitId" select required options={properties.flatMap(p => (p.unitRecords || []).map(u => ({ value: u.id, label: `${p.name} · ${u.unitNumber}` })))} /></>}
    </>}
    {password && <><Field label="Current password" name="currentPassword" type="password" required /><Field label="New password" name="newPassword" type="password" required minLength="8" /><Field label="Confirm new password" name="confirmPassword" type="password" required minLength="8" /></>}
    <div className="modal-footer"><button type="button" className="secondary-btn" onClick={close}>Cancel</button><button className="primary-btn" type="submit">Save</button></div>
  </form></div>
}
function Search({ value, setValue, placeholder = 'Search...' }) { return <label className="search"><span>⌕</span><input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder} /></label> }
function Empty({ text }) { return <div className="empty"><span>⌕</span><p>{text}</p></div> }

function Dashboard({ data, payments, requests, setPage }) {
  const units = data?.totalUnits ?? 0
  const collected = data?.rentCollectedThisMonth ?? 0
  const expected = data?.expectedRentThisMonth ?? 0
  return <><div className="stats-grid">
    <StatCard label="Total properties" value={data?.totalProperties ?? 0} hint="Across your portfolio" icon="⌂" tone="blue" />
    <StatCard label="Occupied units" value={`${data?.occupiedUnits ?? 0} / ${units}`} hint={`${data?.occupancyRate ?? 0}% occupancy`} icon="▣" tone="green" />
    <StatCard label="Vacant units" value={data?.vacantUnits ?? 0} hint="Ready to be rented" icon="⌂" tone="amber" />
    <StatCard label="Rent collected" value={money(collected)} hint="Received this month" icon="₹" tone="purple" />
    <StatCard label="Overdue rent" value={money(data?.overdueAmount ?? Math.max(0, expected - collected))} hint={`${data?.overdueCount ?? 0} overdue lease-months`} icon="◷" tone="red" />
  </div>
  <div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h2>Rent overview</h2><p>Collection summary for {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p></div></div><div className="overview-numbers"><div><small>Collected</small><strong>{money(collected)}</strong></div><div><small>Expected</small><strong>{money(expected)}</strong></div></div><div className="chart"><div className="chart-y"><span>{money(expected)}</span><span>{money(expected * .66)}</span><span>{money(expected * .33)}</span><span>₹0</span></div><div className="chart-area"><div className="chart-grid"><i /><i /><i /><i /></div><div className="collection-bars">{(data?.rentCollectedByMonth || []).map((m, i) => <div className="collection-bar-wrap" key={m.billingMonth}><i style={{ height: `${expected ? Math.max(5, Math.min(100, m.amount / expected * 100)) : 5}%` }} /><small>{new Date(`${m.billingMonth}T00:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</small></div>)}</div></div></div></section>
    <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent payments</h2><p>Latest received rent</p></div><button className="text-link" onClick={() => setPage('Rent & Payments')}>View all →</button></div>{(data?.recentPayments || payments.slice(0, 4)).slice(0, 4).map((p, i) => <div className="activity-row" key={p.id || i}><div className={`activity-avatar color-${i}`}>{initials(p.tenant)}</div><div className="activity-main"><b>{p.tenant}</b><small>{p.property}</small></div><div className="activity-side"><b>{money(p.amount)}</b><small>{dateLabel(p.paidOn || p.paid)}</small></div></div>)}{!(data?.recentPayments?.length || payments.length) && <Empty text="No payments recorded yet." />}</section></div>
  <section className="panel recent-panel"><div className="panel-heading"><div><h2>Maintenance</h2><p>{data?.openMaintenanceRequests ?? requests.filter(r => ['OPEN', 'IN_PROGRESS'].includes(r.status)).length} open requests</p></div><button className="text-link" onClick={() => setPage('Maintenance')}>View requests →</button></div>{requests.slice(0, 3).map((r, i) => <div className="feed-item" key={r.id}><div className={`feed-mark mark-${i}`}>⚒</div><p><b>{r.tenant}</b> · {r.issue}<small>{r.property} · {dateLabel(r.date)}</small></p><Badge>{r.status}</Badge></div>)}{!requests.length && <Empty text="No maintenance requests." />}</section></>
}
function Properties({ items, onAdd, onEdit, onDelete, role }) {
  const [query, setQuery] = useState('')
  const filtered = items.filter(p => `${p.name} ${p.address} ${p.city} ${p.type}`.toLowerCase().includes(query.toLowerCase()))
  return <><div className="toolbar"><Search value={query} setValue={setQuery} placeholder="Search properties..." /><span className="results-count">{filtered.length} properties</span></div><div className="property-grid">{filtered.map(p => <article className="property-card" key={p.id}><div className={`property-cover cover-${String(p.id).length % 3}`}><span className="cover-label">{p.type}</span><span className="cover-art">⌂</span></div><div className="property-info"><div className="property-title"><div><h2>{p.name}</h2><p>⌖ {[p.address, p.city, p.state].filter(Boolean).join(', ')}</p></div></div><div className="property-metrics"><div><small>Average rent</small><b>{money(p.rent)}<span> / unit</span></b></div><div><small>Occupancy</small><b>{p.occupied || 0} <span>/ {p.units || 0} units</span></b></div></div><div className="occupancy-track"><i style={{ width: `${p.units ? Math.round((p.occupied || 0) / p.units * 100) : 0}%` }} /></div>{role !== 'TENANT' && <div className="row-actions"><button className="text-link" onClick={() => onEdit(p)}>Edit details</button>{role === 'LANDLORD' && <button className="text-link danger-link" onClick={() => onDelete(p)}>Delete</button>}</div>}</div></article>)}{role === 'LANDLORD' && <button className="add-property-card" onClick={onAdd}><span>＋</span><b>Add a property</b><small>Add a new property and units</small></button>}</div>{!filtered.length && <Empty text="No properties match your search." />}</>
}
function Tenants({ items, onAdd, onEdit, onDelete, role }) {
  const [query, setQuery] = useState('')
  const filtered = items.filter(t => `${t.name} ${t.email} ${t.property} ${t.unit}`.toLowerCase().includes(query.toLowerCase()))
  return <><div className="toolbar"><Search value={query} setValue={setQuery} placeholder="Search tenants..." /><span className="results-count">{filtered.length} tenants</span></div><div className="table-wrap"><table><thead><tr><th>TENANT</th><th>PROPERTY / UNIT</th><th>LEASE PERIOD</th><th>MONTHLY RENT</th><th>LEASE STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filtered.map((t, i) => <tr key={t.id}><td><div className="person"><div className={`avatar avatar-${i % 4}`}>{initials(t.name)}</div><div><b>{t.name}</b><small>{t.email}<br />{t.phone}</small></div></div></td><td><b>{t.property || '—'}</b><small className="subline">{t.unit || 'No unit assigned'}</small></td><td>{t.leaseLabel || (t.lease?.startDate ? `${dateLabel(t.lease.startDate)} – ${dateLabel(t.lease.endDate)}` : t.lease || 'No active lease')}</td><td>{money(t.lease?.monthlyRent || t.monthlyRent)}</td><td><Badge>{t.lease?.status || t.rentStatus || 'No lease'}</Badge></td><td><div className="row-actions"><button className="text-link" onClick={() => onEdit(t)}>Edit</button>{role === 'LANDLORD' && <button className="text-link danger-link" onClick={() => onDelete(t)}>Delete</button>}</div></td></tr>)}</tbody></table>{!filtered.length && <Empty text="No tenants match your search." />}</div></>
}
function Payments({ items, tenants, role, onRecord }) {
  const [filter, setFilter] = useState('All')
  const statuses = ['All', 'Due', 'Paid', 'Overdue']
  const rows = items.filter(p => filter === 'All' || p.status === filter)
  return <><div className="toolbar"><div className="tabs">{statuses.map(x => <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)}>{x}</button>)}</div><span className="results-count">{rows.length} payments</span>{role !== 'TENANT' && <button className="primary-btn" onClick={onRecord}>＋ Record payment</button>}</div><div className="table-wrap"><table><thead><tr><th>TENANT</th><th>PROPERTY / UNIT</th><th>BILLING MONTH</th><th>PAID DATE</th><th>AMOUNT</th><th>METHOD</th><th>STATUS</th></tr></thead><tbody>{rows.map((p, i) => <tr key={p.id}><td><div className="person"><div className={`avatar avatar-${i % 4}`}>{initials(p.tenant)}</div><b>{p.tenant}</b></div></td><td>{p.property}</td><td>{dateLabel(p.billingMonth || p.due)}</td><td>{dateLabel(p.paidOn || p.paid)}</td><td><b>{money(p.amount)}</b></td><td>{prettyStatus(p.method)}</td><td><Badge>{p.status}</Badge></td></tr>)}</tbody></table>{!rows.length && <Empty text="No payments in this category yet." />}</div>{role === 'TENANT' && <p className="payment-note">For a rent payment, contact your property manager. Payment records are shown here.</p>}</>
}
function Maintenance({ items, role, onAdd, onUpdate }) {
  const [filter, setFilter] = useState('All')
  const rows = items.filter(r => filter === 'All' || prettyStatus(r.status) === filter)
  return <><div className="toolbar"><div className="tabs">{['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(x => <button key={x} className={filter === x ? 'selected' : ''} onClick={() => setFilter(x)}>{x}</button>)}</div><span className="results-count">{rows.length} requests</span>{role === 'TENANT' && <button className="primary-btn" onClick={onAdd}>＋ Report an issue</button>}</div><div className="request-grid">{rows.map((r, i) => <article className="request-card" key={r.id}><div className="request-top"><div className={`request-icon req-${i % 3}`}>⚒</div><Badge>{r.status}</Badge></div><h2>{r.issue}</h2><p className="request-property">⌂ {r.property}</p><div className="request-bottom"><div className="person"><div className={`avatar avatar-${i % 4}`}>{initials(r.tenant)}</div><div><b>{r.tenant}</b><small>{dateLabel(r.date)} · {prettyStatus(r.priority)}</small></div></div>{role !== 'TENANT' && <select className="request-status-select" aria-label={`Update ${r.issue} status`} value={r.status} onChange={e => onUpdate(r, e.target.value)}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>}</div></article>)}</div>{!rows.length && <Empty text="No maintenance requests in this category." />}</>
}
function TenantDashboard({ data, payments, requests, setPage }) {
  const lease = data?.activeLease
  return <><div className="stats-grid"><StatCard label="Monthly rent" value={money(data?.monthlyRent)} hint="As per your active lease" icon="₹" tone="blue" /><StatCard label="Next rent due" value={dateLabel(data?.nextDueDate)} hint={prettyStatus(data?.currentMonthStatus)} icon="◷" tone="amber" /><StatCard label="Maintenance requests" value={data?.openMaintenanceRequestCount ?? 0} hint="Open or in progress" icon="⚒" tone="purple" /><StatCard label="Last payment" value={money(data?.lastPayment?.amount)} hint={dateLabel(data?.lastPayment?.paidOn)} icon="✓" tone="green" /></div><section className="panel recent-panel"><div className="panel-heading"><div><h2>Your current lease</h2><p>Property and tenancy details</p></div></div>{lease ? <div className="tenant-lease"><h2>{lease.property} · {lease.unit}</h2><p>{lease.address}</p><p>Lease period: {dateLabel(lease.startDate)} – {dateLabel(lease.endDate)}</p><Badge>{data.currentMonthStatus}</Badge></div> : <Empty text="There is no active lease on your account." />}<div className="tenant-actions"><button className="primary-btn" onClick={() => setPage('Rent & Payments')}>View payments</button><button className="secondary-btn" onClick={() => setPage('Maintenance')}>View maintenance</button></div></section><section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your payment and maintenance history</p></div></div>{[...payments.slice(0, 2).map(p => ({ text: `Payment of ${money(p.amount)} recorded`, date: p.paidOn || p.paid })), ...requests.slice(0, 2).map(r => ({ text: `Maintenance: ${r.issue} · ${prettyStatus(r.status)}`, date: r.date }))].map((x, i) => <div className="feed-item" key={i}><div className="feed-mark">{i < 2 ? '₹' : '⚒'}</div><p>{x.text}<small>{dateLabel(x.date)}</small></p></div>)}</section></>
}
function Login({ onLogin, onRegister, authError, demoMode }) {
  const [error, setError] = useState(authError || '')
  const [busy, setBusy] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [demoRole, setDemoRole] = useState('LANDLORD')
  const submit = async event => { event.preventDefault(); setError(''); setBusy(true); const form = new FormData(event.currentTarget); try { if (registering) await onRegister({ name: form.get('name'), email: form.get('email'), password: form.get('password') }); else await onLogin(form.get('email'), form.get('password'), demoRole) } catch (e) { setError(e.message || 'Sign in failed.') } finally { setBusy(false) } }
  return <main className="login-page"><div className="login-brand"><div className="brand-mark">R</div><b>RentSetu</b></div><div className="login-card"><div className="login-symbol">R</div><h1>{registering ? 'Create your account' : 'Welcome back'}</h1><p>{registering ? 'Start managing your rental portfolio' : 'Sign in to manage your rental account'}</p><form onSubmit={submit}>{registering && <Field label="Full name" name="name" placeholder="Your name" required minLength="2" />}<Field label="Email address" name="email" type="email" placeholder="you@example.com" required /><Field label="Password" name="password" type="password" placeholder={registering ? 'At least 8 characters' : 'Enter your password'} required minLength={registering ? '8' : undefined} />{demoMode && !registering && <Field label="Demo view" name="demoRole" select options={[{ value: 'LANDLORD', label: 'Landlord' }, { value: 'MANAGER', label: 'Property manager' }, { value: 'TENANT', label: 'Tenant' }]} value={demoRole} onChange={event => setDemoRole(event.target.value)} />}{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary-btn login-submit" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create account' : <>Sign in <span>→</span></>}</button></form><button className="text-link auth-switch" onClick={() => { setRegistering(!registering); setError('') }}>{registering ? 'Already have an account? Sign in' : 'Create a landlord account'}</button><div className="demo-hint">{demoMode ? 'Demo mode: any email and password works. Changes are saved in this browser.' : 'Use a landlord account or a seeded demo account.'}</div></div><div className="login-foot">© {new Date().getFullYear()} RentSetu · Making renting simpler</div></main>
}

export default function App() {
  const { user, token, loading, authError, login, logout, register, changePassword } = useAuth()
  const [page, setPage] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [properties, setProperties] = useState([])
  const [managers, setManagers] = useState([])
  const [tenants, setTenants] = useState([])
  const [payments, setPayments] = useState([])
  const [requests, setRequests] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [tenantDashboard, setTenantDashboard] = useState(null)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isTenant = user?.role === 'TENANT'
  const isManager = user?.role === 'MANAGER'
  const loadData = useCallback(async () => {
    if (!user) return
    setBusy(true); setError('')
    try {
      if (user.role === 'TENANT') {
        const [overview, paymentsResult, requestsResult] = await Promise.all([getTenantDashboard(token), getPayments(token, user.role), getMaintenanceRequests(token)])
        setTenantDashboard(overview); setPayments(paymentsResult); setRequests(requestsResult); setProperties([]); setTenants([])
      } else {
        const [overview, propertyResult, tenantResult, paymentResult, requestResult, managerResult] = await Promise.all([getDashboard(token, user.role), getProperties(token), getTenants(token), getPayments(token, user.role), getMaintenanceRequests(token), user.role === 'LANDLORD' ? getManagers(token) : []])
        setDashboard(overview); setProperties(propertyResult); setTenants(tenantResult); setPayments(paymentResult); setRequests(requestResult); setManagers(managerResult)
      }
    } catch (e) { setError(e.message || 'Could not load your RentSetu data.') }
    finally { setBusy(false) }
  }, [token, user])
  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    const open = () => setModal({ type: 'password' })
    window.addEventListener('rentsetu:change-password', open)
    return () => window.removeEventListener('rentsetu:change-password', open)
  }, [])
  useEffect(() => { if (isTenant && !['Dashboard', 'Rent & Payments', 'Maintenance'].includes(page)) setPage('Dashboard') }, [isTenant, page])

  const titles = { Dashboard: 'Dashboard', Properties: 'Properties', Tenants: 'Tenants', 'Rent & Payments': 'Rent & Payments', Maintenance: 'Maintenance requests' }
  const subtitles = { Dashboard: isTenant ? 'Your rent, lease, and maintenance at a glance.' : 'Live summary of your rental portfolio.', Properties: 'Manage properties, units, and occupancy.', Tenants: 'Manage tenant profiles and their active leases.', 'Rent & Payments': 'Review rent receipts and outstanding rent.', Maintenance: 'Track and update property maintenance requests.' }
  const action = page === 'Properties' && user.role === 'LANDLORD' ? 'Add property' : page === 'Tenants' && user.role === 'LANDLORD' ? 'Add tenant' : null
  const mutate = async fn => { setBusy(true); setError(''); try { await fn(); setModal(null); await loadData() } catch (e) { setError(e.message || 'The change could not be saved.') } finally { setBusy(false) } }
  const onModalSubmit = values => mutate(async () => {
    if (modal.type === 'property') {
      const payload = { name: values.name, address: values.address, city: values.city, state: values.state, pincode: values.pincode, type: values.type, managerId: values.managerId || null, units: values.units, rent: values.rent, bedrooms: values.bedrooms }
      if (modal.item) await updateProperty(token, modal.item.id, payload)
      else await createProperty(token, payload)
    } else if (modal.type === 'tenant') {
      const payload = { ...values }
      if (!payload.unitId || !payload.leaseStart || !payload.leaseEnd) { delete payload.unitId; delete payload.leaseStart; delete payload.leaseEnd; delete payload.monthlyRent; delete payload.securityDeposit; delete payload.dueDay }
      if (modal.item) await updateTenant(token, modal.item.id, { name: payload.name, phone: payload.phone })
      else await createTenant(token, payload)
    } else if (modal.type === 'payment') {
      const tenant = tenants.find(t => (t.lease?.id || t.leaseId) === values.leaseId)
      await recordPayment(token, { ...values, amount: Number(values.amount), tenant: tenant?.name, property: tenant?.property })
    } else if (modal.type === 'maintenance') await createMaintenance(token, values)
    else if (modal.type === 'password') {
      if (values.newPassword !== values.confirmPassword) throw new Error('The new passwords do not match.')
      await changePassword(values.currentPassword, values.newPassword)
    }
  })

  if (loading) return <main className="login-page"><p role="status">Checking your session…</p></main>
  if (!user) return <Login authError={authError} onLogin={login} onRegister={register} demoMode={import.meta.env.VITE_USE_MOCK_DATA !== 'false'} />
  const pageKey = page === 'Rent & Payments' ? 'Rent & Payments' : page
  return <div className="app-shell">
    <Sidebar page={pageKey} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} logout={logout} />
    <main className="main"><Header title={titles[pageKey]} subtitle={subtitles[pageKey]} action={action} onAction={() => setModal({ type: pageKey === 'Properties' ? 'property' : 'tenant' })} onMenu={() => setMobileOpen(true)} busy={busy} />
      <div className="content">{error && <div className="notice error-notice" role="alert"><span>{error}</span><button onClick={loadData}>Retry</button></div>}{busy && !dashboard && !tenantDashboard && <p className="loading-copy" role="status">Loading your data…</p>}
        {pageKey === 'Dashboard' && (isTenant ? <TenantDashboard data={tenantDashboard} payments={payments} requests={requests} setPage={setPage} /> : <Dashboard data={dashboard || {}} payments={payments} requests={requests} setPage={setPage} />)}
        {pageKey === 'Properties' && !isTenant && <Properties items={properties} role={user.role} onAdd={() => setModal({ type: 'property' })} onEdit={item => setModal({ type: 'property', item })} onDelete={item => window.confirm(`Delete ${item.name}? This can only succeed when no units or leases reference it.`) && mutate(() => deleteProperty(token, item.id))} />}
        {pageKey === 'Tenants' && !isTenant && <Tenants items={tenants} role={user.role} onAdd={() => setModal({ type: 'tenant' })} onEdit={item => setModal({ type: 'tenant', item })} onDelete={item => window.confirm(`Delete tenant ${item.name}? Historical leases may prevent deletion.`) && mutate(() => deleteTenant(token, item.id))} />}
        {pageKey === 'Rent & Payments' && <Payments items={payments} tenants={tenants} role={user.role} onRecord={() => setModal({ type: 'payment' })} />}
        {pageKey === 'Maintenance' && <Maintenance items={requests} role={user.role} onAdd={() => setModal({ type: 'maintenance' })} onUpdate={(r, status) => mutate(() => updateMaintenance(token, r.id, { status }))} />}
      </div><footer>© {new Date().getFullYear()} RentSetu <span>·</span> Rental management made simpler</footer>
    </main>
    {modal && <Modal type={modal.type} item={modal.item} close={() => setModal(null)} submit={onModalSubmit} properties={properties} tenants={tenants} managers={managers} role={user.role} />}
  </div>
}
