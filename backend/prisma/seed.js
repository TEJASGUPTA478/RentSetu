import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const password = 'Password@123'

function monthStart(offset = 0) {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1))
}

function monthDay(offset, day) {
  const month = monthStart(offset)
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), day))
}

async function resetDevelopmentData() {
  await prisma.maintenanceRequest.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.lease.deleteMany()
  await prisma.tenantProfile.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()
}

async function main() {
  if ((process.env.NODE_ENV || 'development') !== 'development') {
    throw new Error('The seed script only clears and seeds data when NODE_ENV=development')
  }
  await resetDevelopmentData()
  const passwordHash = await bcrypt.hash(password, 12)

  const [landlordA, landlordB, manager] = await Promise.all([
    prisma.user.create({ data: { name: 'Arjun Kumar', email: 'arjun.landlord@rentsetu.demo', passwordHash, role: 'LANDLORD' } }),
    prisma.user.create({ data: { name: 'Kavya Rao', email: 'kavya.landlord@rentsetu.demo', passwordHash, role: 'LANDLORD' } }),
    prisma.user.create({ data: { name: 'Dev Menon', email: 'dev.manager@rentsetu.demo', passwordHash, role: 'MANAGER' } }),
  ])

  const propertyA = await prisma.property.create({ data: {
    ownerId: landlordA.id, managerId: manager.id, name: 'Maple Residency', address: '24, 12th Main Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', type: 'Apartment',
  } })
  const propertyB = await prisma.property.create({ data: {
    ownerId: landlordA.id, name: 'Lakeview Villa', address: '17, 27th Main Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', type: 'Villa',
  } })
  const propertyC = await prisma.property.create({ data: {
    ownerId: landlordB.id, name: 'Palm Court', address: '8, Hoodi Main Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', type: 'Apartment',
  } })

  const units = {}
  for (const [property, rows] of [
    [propertyA, [['A-302', 24500, 2, 'OCCUPIED'], ['B-104', 24500, 2, 'OCCUPIED'], ['C-201', 22000, 2, 'VACANT']]],
    [propertyB, [['Full property', 42000, 3, 'OCCUPIED']]],
    [propertyC, [['C-205', 18500, 2, 'OCCUPIED'], ['C-206', 18500, 2, 'VACANT'], ['D-101', 20000, 3, 'VACANT'], ['D-102', 20000, 3, 'VACANT']]],
  ]) {
    for (const [unitNumber, rent, bedrooms, status] of rows) {
      units[unitNumber] = await prisma.unit.create({ data: { propertyId: property.id, unitNumber, rent, bedrooms, status } })
    }
  }

  const tenantData = [
    { name: 'Aarav Sharma', email: 'aarav.tenant@rentsetu.demo', phone: '+91 98765 43210', emergencyContactName: 'Neha Sharma', emergencyContactPhone: '+91 98765 43211' },
    { name: 'Priya Nair', email: 'priya.tenant@rentsetu.demo', phone: '+91 98450 12345', emergencyContactName: 'Anil Nair', emergencyContactPhone: '+91 98450 12346' },
    { name: 'Rohan Mehta', email: 'rohan.tenant@rentsetu.demo', phone: '+91 99001 56789', emergencyContactName: 'Mira Mehta', emergencyContactPhone: '+91 99001 56780' },
    { name: 'Meera Iyer', email: 'meera.tenant@rentsetu.demo', phone: '+91 99887 65432', emergencyContactName: 'Ravi Iyer', emergencyContactPhone: '+91 99887 65433' },
  ]
  const tenants = []
  for (const [index, details] of tenantData.entries()) {
    const user = await prisma.user.create({ data: { name: details.name, email: details.email, passwordHash, role: 'TENANT' } })
    const profile = await prisma.tenantProfile.create({ data: {
      userId: user.id,
      createdByLandlordId: index === 3 ? landlordB.id : landlordA.id,
      phone: details.phone,
      emergencyContactName: details.emergencyContactName,
      emergencyContactPhone: details.emergencyContactPhone,
      idProofType: 'AADHAAR',
      idProofNumber: `DEMO-${String(index + 1).padStart(4, '0')}`,
    } })
    tenants.push({ ...profile, name: details.name, email: details.email })
  }

  const leaseSpecs = [
    { tenant: tenants[0], unit: units['A-302'], offset: -2, dueDay: 1 },
    { tenant: tenants[1], unit: units['Full property'], offset: -2, dueDay: 5 },
    { tenant: tenants[2], unit: units['B-104'], offset: -1, dueDay: 20 },
    { tenant: tenants[3], unit: units['C-205'], offset: -2, dueDay: 5 },
  ]
  const leases = []
  for (const spec of leaseSpecs) {
    leases.push(await prisma.lease.create({ data: {
      unitId: spec.unit.id,
      tenantId: spec.tenant.id,
      startDate: monthDay(spec.offset, 1),
      endDate: monthDay(12, 28),
      monthlyRent: spec.unit.rent,
      securityDeposit: Number(spec.unit.rent) * 2,
      dueDay: spec.dueDay,
      status: 'ACTIVE',
    } }))
  }

  // Historical lease for Priya; records are retained even after a later tenancy.
  await prisma.lease.create({ data: {
    unitId: units['C-201'].id,
    tenantId: tenants[1].id,
    startDate: monthDay(-30, 1),
    endDate: monthDay(-18, 28),
    monthlyRent: units['C-201'].rent,
    securityDeposit: Number(units['C-201'].rent) * 2,
    dueDay: 5,
    status: 'ENDED',
  } })

  const paymentRows = []
  // Ten payments in total. Meera deliberately has no payment for last month;
  // the demo date then makes that billing period visibly overdue after due day 5.
  const paymentOffsets = [[-2, -1, 0], [-2, -1, 0], [-1, 0], [-2, 0]]
  for (const [leaseIndex, offsets] of paymentOffsets.entries()) {
    const lease = leases[leaseIndex]
    for (const offset of offsets) {
      paymentRows.push({
        leaseId: lease.id,
        billingMonth: monthStart(offset),
        amount: lease.monthlyRent,
        method: ['UPI', 'BANK_TRANSFER', 'CASH', 'UPI'][leaseIndex],
        paidOn: monthDay(offset, Math.min(lease.dueDay + 1, 28, offset === 0 ? new Date().getUTCDate() : 28)),
        notes: 'Seeded demo payment',
      })
    }
  }
  await prisma.payment.createMany({ data: paymentRows })

  await prisma.maintenanceRequest.createMany({ data: [
    { unitId: units['C-205'].id, leaseId: leases[3].id, tenantId: tenants[3].id, title: 'Kitchen tap is leaking', description: 'The kitchen sink tap drips continuously.', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { unitId: units['A-302'].id, leaseId: leases[0].id, tenantId: tenants[0].id, title: 'Air conditioner servicing', description: 'The bedroom unit needs a seasonal service.', priority: 'LOW', status: 'OPEN' },
    { unitId: units['Full property'].id, leaseId: leases[1].id, tenantId: tenants[1].id, title: 'Gate lock replacement', description: 'Front gate lock was replaced.', priority: 'LOW', status: 'RESOLVED', resolvedAt: new Date() },
  ] })

  console.log('\nRentSetu demo credentials (password for every account: Password@123)')
  console.log('Landlord: arjun.landlord@rentsetu.demo')
  console.log('Landlord: kavya.landlord@rentsetu.demo')
  console.log('Manager:  dev.manager@rentsetu.demo')
  console.log('Tenant:   aarav.tenant@rentsetu.demo')
  console.log('Tenant:   priya.tenant@rentsetu.demo')
  console.log('Tenant:   rohan.tenant@rentsetu.demo')
  console.log('Tenant:   meera.tenant@rentsetu.demo\n')
  console.log('Development header IDs for dashboard curl:')
  console.log(`LANDLORD x-dev-user-id: ${landlordA.id}`)
  console.log(`LANDLORD (second portfolio) x-dev-user-id: ${landlordB.id}`)
  console.log(`MANAGER  x-dev-user-id: ${manager.id}`)
  console.log(`TENANT   x-dev-user-id: ${tenants[0].userId}\n`)
}

main().catch(error => {
  console.error('RentSetu seed failed:', error)
  process.exitCode = 1
}).finally(async () => {
  await prisma.$disconnect()
})
