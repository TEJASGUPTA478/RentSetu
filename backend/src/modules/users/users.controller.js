import { sendSuccess } from '../../utils/response.js'
import * as usersService from './users.service.js'

export async function listManagers(req, res) {
  return sendSuccess(res, await usersService.listManagers())
}
