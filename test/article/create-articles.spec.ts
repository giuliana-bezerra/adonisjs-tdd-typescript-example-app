import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import { signIn } from '../auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user: {
  email: string
  token: string
  username: string
  bio: string
  image: string
}

test.group('Create Articles', (group) => {
  test('it should create an article', async (assert) => {
    const { title, description, body } = await ArticleFactory.make()
    const article = { title, description, body, tagList: ['tag'] }

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(201)

    const articleResponse = response.body.article

    assert.exists(articleResponse)
    assert.equal(articleResponse.title, article.title)
    assert.equal(articleResponse.description, article.description)
    assert.equal(articleResponse.body, article.body)
    assert.deepEqual(articleResponse.tagList, article.tagList)
    assert.equal(articleResponse.author.username, user.username)
    assert.equal(articleResponse.author.bio, user.bio)
    assert.equal(articleResponse.author.image, user.image)
    assert.equal(articleResponse.author.following, false)
    assert.equal(articleResponse.favorited, false)
    assert.equal(articleResponse.favoritesCount, 0)
  })

  test('it should create an article without tags', async (assert) => {
    const article = await ArticleFactory.make()

    const response = await supertest(BASE_URL)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ article })
      .expect(201)

    const articleResponse = response.body.article

    assert.exists(articleResponse)
    assert.equal(articleResponse.title, article.title)
    assert.equal(articleResponse.description, article.description)
    assert.equal(articleResponse.body, article.body)
    assert.isEmpty(articleResponse.tagList)
    assert.equal(articleResponse.author.username, user.username)
    assert.equal(articleResponse.author.bio, user.bio)
    assert.equal(articleResponse.author.image, user.image)
    assert.equal(articleResponse.author.following, false)
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
