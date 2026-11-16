import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

const server = app.listen(env.PORT, () => {
  console.log(`RentSetu API listening on http://localhost:${env.PORT}`)
  console.log(`API docs: http://localhost:${env.PORT}/api/docs`)
})

let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received; shutting down RentSetu API`)
  server.close(async error => {
    try {
      await prisma.$disconnect()
      process.exit(error ? 1 : 0)
    } catch (disconnectError) {
      console.error('Error while disconnecting Prisma:', disconnectError)
      process.exit(1)
    }
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
