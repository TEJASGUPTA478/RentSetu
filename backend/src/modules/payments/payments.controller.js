import { sendSuccess } from '../../utils/response.js'
import * as paymentsService from './payments.service.js'

export async function listPayments(req, res) {
  const result = await paymentsService.listPayments(req.user, req.query)
  return sendSuccess(res, result.payments, { meta: result.meta })
}

export async function getPayment(req, res) {
  const payment = await paymentsService.getPaymentById(req.user, req.params.id)
  return sendSuccess(res, payment)
}

export async function recordPayment(req, res) {
  const payment = await paymentsService.recordPayment(req.user, req.body)
  return sendSuccess(res, payment, { statusCode: 201, message: 'Payment recorded successfully' })
}

export async function updatePayment(req, res) {
  const payment = await paymentsService.updatePayment(req.user, req.params.id, req.body)
  return sendSuccess(res, payment, { message: 'Payment updated successfully' })
}
