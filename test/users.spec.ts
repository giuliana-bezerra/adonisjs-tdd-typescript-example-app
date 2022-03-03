import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user: {
  email: string
  token: string
  username: string
  bio: string
  image: string
}

test.group('Users', (group) => {
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

  test('it should not authenticate an user', async () => {
    const nullUser = {}
    const emptyUser = { email: '', password: '' }
    const unexistingUser = await UserFactory.make()
    const invalidUserCredentials = await UserFactory.merge({ password: '123456' }).make()

    await supertest(BASE_URL)
      .post('/api/users/login')
      .send({
        user: nullUser,
      })
      .expect(422)
    await supertest(BASE_URL)
      .post('/api/users/login')
      .send({
        user: emptyUser,
      })
      .expect(422)
    await supertest(BASE_URL)
      .post('/api/users/login')
      .send({
        user: unexistingUser,
      })
      .expect(422)
    await supertest(BASE_URL)
      .post('/api/users/login')
      .send({
        user: {
          email: invalidUserCredentials.email,
          password: 'invalid password',
        },
      })
      .expect(400)
  })

  test('it should create an user', async (assert) => {
    const { email, password, username } = await UserFactory.make()

    const { body } = await supertest(BASE_URL)
      .post('/api/users')
      .send({
        user: {
          email,
          password,
          username,
        },
      })
      .expect(201)

    assert.exists(body.user)
    assert.equal(body.user.email, email)
    assert.equal(body.user.username, username)
    assert.exists(body.user.token)
  })

  test('it should not create an invalid user', async () => {
    const nullUser = {}
    const emptyUser = {
      email: '',
      password: '',
      username: '',
    }
    const invalidUser = {
      email: 'test@',
      password: 't',
      username: 't',
    }

    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        user: nullUser,
      })
      .expect(422)
    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        user: emptyUser,
      })
      .expect(422)
    await supertest(BASE_URL)
      .post('/api/users')
      .send({
        user: invalidUser,
      })
      .expect(422)
  })

  test('it should update an user', async (assert) => {
    const [email, bio, image] = ['test@test.com', 'test bio', 'test image']

    const { body } = await supertest(BASE_URL)
      .put('/api/user')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        user: {
          email,
          bio,
          image,
        },
      })
      .expect(200)

    assert.exists(body.user)
    assert.equal(body.user.email, email)
    assert.equal(body.user.bio, bio)
    assert.equal(body.user.image, image)
    assert.equal(body.user.username, user.username)
    assert.exists(body.user.token)
  })

  test('should not update an user with invalid data', async () => {
    const [email, password] = ['test@', 'test']

    await supertest(BASE_URL)
      .put('/api/user')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        user: {
          email,
          password,
        },
      })
      .expect(422)
  })

  group.before(async () => {
    const password = '123456'
    const { email } = await UserFactory.merge({ password }).create()

    const { body } = await supertest(BASE_URL).post('/api/users/login').send({
      user: {
        email,
        password,
      },
    })

    user = body.user
  })
})
