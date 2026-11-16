import { sendSuccess } from '../../utils/response.js'
import { getLandlordDashboardData, getTenantDashboardData } from './dashboard.service.js'

export async function getLandlordDashboard(req, res) {
  return sendSuccess(res, await getLandlordDashboardData(req.user))
}

export async function getTenantDashboard(req, res) {
  return sendSuccess(res, await getTenantDashboardData(req.user))
}
