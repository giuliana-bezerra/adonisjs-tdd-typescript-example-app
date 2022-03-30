import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

import { signIn } from '../auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Feed Articles', (group) => {
  test('it should feed articles', async (assert) => {
    const user = await UserFactory.create()
    const { token } = await signIn(user)

    const createdArticle = await ArticleFactory.with('author', 1, (factory) => {
      factory.with('followers', 1, (factory) => {
        factory.merge(user)
      })
    })
      .with('tagList')
      .create()

    const {
      body: { articles, articlesCount },
    } = await supertest(BASE_URL)
      .get('/api/articles/feed')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const tagList = createdArticle.tagList.map((tag) => tag.name)
    const article = articles[0]

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articlesCount, 1)
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

  test('it should feed no articles', async (assert) => {
    const user = await UserFactory.create()
    const { token } = await signIn(user)

    await ArticleFactory.with('author', 1, (factory) => {
      factory.with('followers')
    })
      .with('tagList')
      .create()

    const {
      body: { articles, articlesCount },
    } = await supertest(BASE_URL)
      .get('/api/articles/feed')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 0)
    assert.equal(articlesCount, 0)
  })

  test('it should feed articles with limit and offset', async (assert) => {
    const user = await UserFactory.create()
    const { token } = await signIn(user)

    const createdArticles = await ArticleFactory.with('author', 1, (factory) => {
      factory.with('followers', 1, (factory) => {
        factory.merge(user)
      })
    })
      .with('tagList')
      .createMany(3)

    const {
      body: { articles, articlesCount },
    } = await supertest(BASE_URL)
      .get('/api/articles/feed?offset=1,limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const createdArticle = createdArticles[1]
    const tagList = createdArticle.tagList.map((tag) => tag.name)
    const article = articles[0]

    assert.exists(articles)
    assert.lengthOf(articles, 2)
    assert.equal(articlesCount, 2)
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

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
