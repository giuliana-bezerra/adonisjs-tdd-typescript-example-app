import supertest from 'supertest'

import User from 'App/Models/User'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
const password = '123456'

export const signIn = async (user: User) => {
  const { email } = user

  const {
    body: { user: authenticatedUser },
  } = await supertest(BASE_URL).post('/api/users/login').send({
    user: {
      email,
      password,
    },
  })

  return authenticatedUser
}
