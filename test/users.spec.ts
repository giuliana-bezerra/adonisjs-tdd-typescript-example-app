import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Users', () => {
  test('it should authenticate an user', async (assert) => {
    const password = '123456'
    const { email, username, bio, image } = await UserFactory.merge({ password }).create()
    const { body } = await supertest(BASE_URL)
      .post('/api/users/login')
      .send({
        user: {
          email,
          password,
        },
      })
      .expect(200)

    assert.equal(body.user.email, email)
    assert.equal(body.user.username, username)
    assert.equal(body.user.bio, bio)
    assert.equal(body.user.image, image)
    assert.exists(body.user.token)
  })
})
