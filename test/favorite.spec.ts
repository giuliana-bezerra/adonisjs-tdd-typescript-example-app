import Database from '@ioc:Adonis/Lucid/Database'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import { ArticleFactory } from './../database/factories/index'
import { signIn } from './auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user: {
  email: string
  token: string
  username: string
  bio: string
  image: string
}

test.group('Favorites', (group) => {
  test('it should favorite an article', async (assert) => {
    const article = await ArticleFactory.with('author').create()
    const { body } = await supertest(BASE_URL)
      .post(`/api/articles/${article.slug}/favorite`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200)

    assert.exists(body.article)
    assert.equal(body.article.title, article.title)
    assert.equal(body.article.description, article.description)
    assert.equal(body.article.body, article.body)
    assert.equal(body.article.author.username, article.author.username)
    assert.equal(body.article.author.bio, article.author.bio)
    assert.equal(body.article.author.image, article.author.image)
    assert.equal(body.article.author.following, false)
    assert.equal(body.article.favorited, true)
    assert.equal(body.article.favoritesCount, 1)
  })

  test('it should not favorite an unexisting article', async () => {
    await supertest(BASE_URL)
      .post(`/api/articles/any-slug/favorite`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should unfavorite an article', async (assert) => {
    const article = await ArticleFactory.with('author').with('favorites').create()
    const { token } = await signIn(article.favorites[0])

    const { body } = await supertest(BASE_URL)
      .delete(`/api/articles/${article.slug}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(body.article)
    assert.equal(body.article.title, article.title)
    assert.equal(body.article.description, article.description)
    assert.equal(body.article.body, article.body)
    assert.equal(body.article.author.username, article.author.username)
    assert.equal(body.article.author.bio, article.author.bio)
    assert.equal(body.article.author.image, article.author.image)
    assert.equal(body.article.author.following, false)
    assert.equal(body.article.favorited, false)
    assert.equal(body.article.favoritesCount, 0)
  })

  test('it should not unfavorite an unexisting article', async () => {
    await supertest(BASE_URL)
      .delete(`/api/articles/any-slug/favorite`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
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
