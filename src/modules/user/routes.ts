import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { initORM } from '../../database'
import { User } from './user.entity'
import z from 'zod'
import { createToken } from '../../lib/token'
import { authorizationPreParsingHandler } from '../../lib/authorizationPreParsingHandler'

const user: FastifyPluginAsync = async (fastify) => {
  const db = await initORM()
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.post(
    '/token',
    {
      schema: {
        tags: ['user'],
        summary: 'Get user bearer token',
        response: {
          201: z.object({
            token: z.string()
          })
        }
      }
    },
    async (_, reply) => {
      const user = new User()
      await db.em.persistAndFlush(user)
      const token = createToken(user.id)
      reply.status(201).send({ token })
    }
  )

  app.get(
    '/',
    {
      preParsing: authorizationPreParsingHandler,
      schema: {
        tags: ['user'],
        summary: 'Get user',
        headers: z.object({
          authorization: z.string().includes('Bearer ')
        }),
        response: {
          200: z.object({
            id: z.number(),
            createdAt: z.date(),
            updatedAt: z.date()
          }),
          401: z.object({
            message: z.literal('Unauthorized')
          })
        }
      }
    },
    async (request, reply) => {
      reply.send(request.user)
    }
  )
}

export default user
