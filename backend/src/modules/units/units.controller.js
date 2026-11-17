import { sendSuccess } from '../../utils/response.js'
import * as unitsService from './units.service.js'

export async function listUnits(req, res) {
  const result = await unitsService.listUnits(req.user, req.query)
  return sendSuccess(res, result.units, { meta: result.meta })
}

export async function getUnit(req, res) {
  const unit = await unitsService.getUnitById(req.user, req.params.id)
  return sendSuccess(res, unit)
}

export async function createUnit(req, res) {
  const unit = await unitsService.createUnit(req.user, req.body)
  return sendSuccess(res, unit, { statusCode: 201, message: 'Unit created successfully' })
}

export async function updateUnit(req, res) {
  const unit = await unitsService.updateUnit(req.user, req.params.id, req.body)
  return sendSuccess(res, unit, { message: 'Unit updated successfully' })
}

export async function deleteUnit(req, res) {
  const result = await unitsService.deleteUnit(req.user, req.params.id)
  return sendSuccess(res, null, { message: result.message })
}
