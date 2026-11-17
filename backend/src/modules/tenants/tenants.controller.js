import { sendSuccess } from '../../utils/response.js'
import * as tenantsService from './tenants.service.js'

export async function listTenants(req, res) {
  const result = await tenantsService.listTenants(req.user, req.query)
  return sendSuccess(res, result.tenants, { meta: result.meta })
}

export async function getMyProfile(req, res) {
  const profile = await tenantsService.getMyTenantProfile(req.user)
  return sendSuccess(res, profile)
}

export async function getTenant(req, res) {
  const tenant = await tenantsService.getTenantById(req.user, req.params.id)
  return sendSuccess(res, tenant)
}

export async function createTenant(req, res) {
  const tenant = await tenantsService.createTenant(req.user, req.body)
  return sendSuccess(res, tenant, { statusCode: 201, message: 'Tenant created successfully' })
}

export async function updateTenant(req, res) {
  const tenant = await tenantsService.updateTenant(req.user, req.params.id, req.body)
  return sendSuccess(res, tenant, { message: 'Tenant updated successfully' })
}

export async function deleteTenant(req, res) {
  const result = await tenantsService.deleteTenant(req.user, req.params.id)
  return sendSuccess(res, null, { message: result.message })
}
