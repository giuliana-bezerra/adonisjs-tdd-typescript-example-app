import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

import { signIn } from '../auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Get Article', (group) => {
  test('it should get an article by its slug', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').with('tagList').createMany(5)
    const createdArticle = createdArticles[0]
    const tagList = createdArticle.tagList.map((tag) => tag.name)

    const {
      body: { article },
    } = await supertest(BASE_URL).get(`/api/articles/${createdArticle.slug}`).expect(200)

    assert.exists(article)
    assert.equal(article.title, createdArticle.title)
    assert.equal(article.description, createdArticle.description)
    assert.equal(article.body, createdArticle.body)
    assert.deepEqual(article.tagList, tagList)
    assert.equal(article.author.username, createdArticle.author.username)
    assert.equal(article.author.bio, createdArticle.author.bio)
    assert.equal(article.author.image, createdArticle.author.image)
    assert.equal(article.author.following, false)
    assert.equal(article.favorited, false)
    assert.equal(article.favoritesCount, 0)
  })

  test('it should return 404', async (assert) => {
    await supertest(BASE_URL).get('/api/users/slug').expect(404)
  })

  test('it should get an article with a follower', async (assert) => {
    const author = await UserFactory.with('followers').create()
    const createdArticle = await ArticleFactory.with('author', 1, (factory) => {
      factory.merge({ ...author })
    })
      .with('tagList')
      .create()

    const { token } = await signIn(author.followers[0])

    const {
      body: { article },
    } = await supertest(BASE_URL)
      .get(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const tagList = createdArticle.tagList.map((tag) => tag.name)

    assert.exists(article)
    assert.equal(article.title, createdArticle.title)
    assert.equal(article.description, createdArticle.description)
    assert.equal(article.body, createdArticle.body)
    assert.deepEqual(article.tagList, tagList)
    assert.equal(article.author.username, createdArticle.author.username)
    assert.equal(article.author.bio, createdArticle.author.bio)
    assert.equal(article.author.image, createdArticle.author.image)
    assert.equal(article.author.following, true)
    assert.equal(article.favorited, false)
    assert.equal(article.favoritesCount, 0)
  })

  test('it should get a favorited article', async (assert) => {
    const createdArticle = await ArticleFactory.with('author').with('favorites').create()
    const { token } = await signIn(createdArticle.favorites[0])

    const {
      body: { article },
    } = await supertest(BASE_URL)
      .get(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(article)
    assert.equal(article.title, createdArticle.title)
    assert.equal(article.description, createdArticle.description)
    assert.equal(article.body, createdArticle.body)
    assert.equal(article.author.username, createdArticle.author.username)
    assert.equal(article.author.bio, createdArticle.author.bio)
    assert.equal(article.author.image, createdArticle.author.image)
    assert.equal(article.author.following, false)
    assert.equal(article.favorited, true)
    assert.equal(article.favoritesCount, 1)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
