import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
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

test.group('Comments', (group) => {
  test('it should add comment to an article', async (assert) => {
    const article = await ArticleFactory.with('author').create()

    const commentPayload = {
      comment: {
        body: 'comment',
      },
    }

    const {
      body: { comment },
    } = await supertest(BASE_URL)
      .post(`/api/articles/${article.slug}/comments`)
      .send(commentPayload)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(201)

    assert.exists(comment)
    assert.equal(comment.id, 1)
    assert.equal(comment.body, commentPayload.comment.body)
    assert.equal(comment.author.username, user.username)
    assert.equal(comment.author.bio, user.bio)
    assert.equal(comment.author.image, user.image)
    assert.equal(comment.author.following, false)
  })

  test('it should not add comment to an unexisting article', async () => {
    const commentPayload = {
      comment: {
        body: 'comment',
      },
    }

    await supertest(BASE_URL)
      .post(`/api/articles/slug/comments`)
      .send(commentPayload)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should not add an empty comment to article', async () => {
    const commentPayload = {
      comment: {},
    }

    await supertest(BASE_URL)
      .post(`/api/articles/slug/comments`)
      .send(commentPayload)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(422)
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
