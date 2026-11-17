import { sendSuccess } from '../../utils/response.js'
import * as propertiesService from './properties.service.js'

export async function listProperties(req, res) {
  const result = await propertiesService.listProperties(req.user, req.query)
  return sendSuccess(res, result.properties, { meta: result.meta })
}

export async function getProperty(req, res) {
  const property = await propertiesService.getPropertyById(req.user, req.params.id)
  return sendSuccess(res, property)
}

export async function createProperty(req, res) {
  const property = await propertiesService.createProperty(req.user, req.body)
  return sendSuccess(res, property, { statusCode: 201, message: 'Property created successfully' })
}

export async function updateProperty(req, res) {
  const property = await propertiesService.updateProperty(req.user, req.params.id, req.body)
  return sendSuccess(res, property, { message: 'Property updated successfully' })
}

export async function deleteProperty(req, res) {
  const result = await propertiesService.deleteProperty(req.user, req.params.id)
  return sendSuccess(res, null, { message: result.message })
}
