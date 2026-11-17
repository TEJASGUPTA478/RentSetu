import { sendSuccess } from '../../utils/response.js'
import * as leasesService from './leases.service.js'

export async function listLeases(req, res) {
  const result = await leasesService.listLeases(req.user, req.query)
  return sendSuccess(res, result.leases, { meta: result.meta })
}

export async function getLease(req, res) {
  const lease = await leasesService.getLeaseById(req.user, req.params.id)
  return sendSuccess(res, lease)
}

export async function createLease(req, res) {
  const lease = await leasesService.createLease(req.user, req.body)
  return sendSuccess(res, lease, { statusCode: 201, message: 'Lease created successfully' })
}

export async function updateLease(req, res) {
  const lease = await leasesService.updateLease(req.user, req.params.id, req.body)
  return sendSuccess(res, lease, { message: 'Lease updated successfully' })
}

export async function deleteLease(req, res) {
  const result = await leasesService.deleteLease(req.user, req.params.id)
  return sendSuccess(res, null, { message: result.message })
}
