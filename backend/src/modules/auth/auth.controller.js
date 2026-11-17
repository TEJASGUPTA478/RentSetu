import { asyncHandler } from '../../utils/asyncHandler.js'
import { sendSuccess } from '../../utils/response.js'
import * as authService from './auth.service.js'

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body)
  return sendSuccess(res, result, {
    statusCode: 201,
    message: 'User registered successfully',
  })
})

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  return sendSuccess(res, result, {
    message: 'Signed in successfully',
  })
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id)
  return sendSuccess(res, user)
})

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body)
  return sendSuccess(res, result)
})
