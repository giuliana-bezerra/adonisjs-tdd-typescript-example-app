import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import { signIn } from './auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user: {
  email: string
  token: string
  username: string
  bio: string
  image: string
}

test.group('Profiles', (group) => {
  test('it should get an user profile when unauthenticated', async (assert) => {
    const { body } = await supertest(BASE_URL).get(`/api/profiles/${user.username}`).expect(200)

    assert.exists(body.profile)
    assert.equal(body.profile.username, user.username)
    assert.equal(body.profile.bio, user.bio)
    assert.equal(body.profile.image, user.image)
    assert.equal(body.profile.following, false)
  })

  test('it should get an user profile when authenticated', async (assert) => {
    const { username, bio, image } = await UserFactory.create()
    const { body } = await supertest(BASE_URL)
      .get(`/api/profiles/${username}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200)

    assert.exists(body.profile)
    assert.equal(body.profile.username, username)
    assert.equal(body.profile.bio, bio)
    assert.equal(body.profile.image, image)
    assert.equal(body.profile.following, false)
  })

  test('it should get an user profile that is followed', async (assert) => {
    const follower = await User.findByOrFail('username', user.username)
    const profile = await UserFactory.create()
    profile.related('followers').attach([follower.id])

    const { body } = await supertest(BASE_URL)
      .get(`/api/profiles/${profile.username}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200)

    assert.exists(body.profile)
    assert.equal(body.profile.username, profile.username)
    assert.equal(body.profile.bio, profile.bio)
    assert.equal(body.profile.image, profile.image)
    assert.equal(body.profile.following, true)
  })

  test('it should follow a profile', async (assert) => {
    const profile = await UserFactory.create()

    const { body } = await supertest(BASE_URL)
      .post(`/api/profiles/${profile.username}/follow`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200)

    assert.exists(body.profile)
    assert.equal(body.profile.username, profile.username)
    assert.equal(body.profile.bio, profile.bio)
    assert.equal(body.profile.image, profile.image)
    assert.equal(body.profile.following, true)
  })

  test('it should unfollow a profile', async (assert) => {
    const follower = await User.findByOrFail('username', user.username)
    const profile = await UserFactory.create()
    profile.related('followers').attach([follower.id])

    const { body } = await supertest(BASE_URL)
      .delete(`/api/profiles/${profile.username}/follow`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200)

    assert.exists(body.profile)
    assert.equal(body.profile.username, profile.username)
    assert.equal(body.profile.bio, profile.bio)
    assert.equal(body.profile.image, profile.image)
    assert.equal(body.profile.following, false)
  })

  group.before(async () => {
    const createdUser = await UserFactory.create()
    user = await signIn(createdUser)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
