import { sendSuccess } from '../../utils/response.js'
import * as maintenanceService from './maintenance.service.js'

export async function listMaintenanceRequests(req, res) {
  const result = await maintenanceService.listMaintenanceRequests(req.user, req.query)
  return sendSuccess(res, result.requests, { meta: result.meta })
}

export async function getMaintenanceRequest(req, res) {
  const request = await maintenanceService.getMaintenanceRequestById(req.user, req.params.id)
  return sendSuccess(res, request)
}

export async function createMaintenanceRequest(req, res) {
  const request = await maintenanceService.createMaintenanceRequest(req.user, req.body)
  return sendSuccess(res, request, { statusCode: 201, message: 'Maintenance request created successfully' })
}

export async function updateMaintenanceRequest(req, res) {
  const request = await maintenanceService.updateMaintenanceRequest(req.user, req.params.id, req.body)
  return sendSuccess(res, request, { message: 'Maintenance request updated successfully' })
}

export async function deleteMaintenanceRequest(req, res) {
  await maintenanceService.deleteMaintenanceRequest(req.user, req.params.id)
  return sendSuccess(res, null, { message: 'Maintenance request deleted' })
}
