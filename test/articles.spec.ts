import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user: {
  id: number
  email: string
  token: string
  username: string
  bio: string
  image: string
}

test.group('Articles', (group) => {
  test('it should create an article', async (assert) => {
    const { title, description, body } = await ArticleFactory.make()
    const article = { title, description, body, tagList: ['tag'] }

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(201)

    assert.exists(response.body.article)
    assert.equal(response.body.article.title, article.title)
    assert.equal(response.body.article.description, article.description)
    assert.equal(response.body.article.body, article.body)
    assert.deepEqual(response.body.article.tagList, article.tagList)
    assert.equal(response.body.article.author.username, user.username)
    assert.equal(response.body.article.author.bio, user.bio)
    assert.equal(response.body.article.author.image, user.image)
    assert.equal(response.body.article.author.following, false)
  })

  test('it should create an article without tags', async (assert) => {
    const article = await ArticleFactory.make()

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(201)

    assert.exists(response.body.article)
    assert.equal(response.body.article.title, article.title)
    assert.equal(response.body.article.description, article.description)
    assert.equal(response.body.article.body, article.body)
    assert.isEmpty(response.body.article.tagList)
    assert.equal(response.body.article.author.username, user.username)
    assert.equal(response.body.article.author.bio, user.bio)
    assert.equal(response.body.article.author.image, user.image)
    assert.equal(response.body.article.author.following, false)
  })

  test('it should not create an article without required data', async (assert) => {
    const article = { title: '', description: '', body: '', tagList: ['tag'] }

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(422)

    const errors = response.body.errors.body

    assert.exists(errors)
    assert.lengthOf(errors, 3)
    assert.include(errors[0], 'title')
    assert.include(errors[1], 'description')
    assert.include(errors[2], 'body')
  })

  test('it should not create an article with invalid data', async (assert) => {
    const article = { title: 't', description: 'description', body: 'body', tagList: ['tag'] }

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(422)

    const errors = response.body.errors.body

    assert.exists(errors)
    assert.lengthOf(errors, 1)
    assert.include(errors[0], 'title')
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

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
