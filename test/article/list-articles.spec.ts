import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

import { signIn } from '../auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('List Articles', (group) => {
  test('it should list all articles', async (assert) => {
    const createdArticle = await ArticleFactory.with('author').with('tagList').create()

    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles').expect(200)

    const tagList = createdArticle.tagList.map((tag) => tag.name)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, createdArticle.title)
    assert.equal(articles[0].description, createdArticle.description)
    assert.equal(articles[0].body, createdArticle.body)
    assert.deepEqual(articles[0].tagList, tagList)
    assert.equal(articles[0].author.username, createdArticle.author.username)
    assert.equal(articles[0].author.bio, createdArticle.author.bio)
    assert.equal(articles[0].author.image, createdArticle.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  test('it should list no articles', async (assert) => {
    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles').expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 0)
  })

  test('it should list an article with a follower', async (assert) => {
    const author = await UserFactory.with('followers').create()
    const createdArticle = await ArticleFactory.with('author', 1, (factory) => {
      factory.merge({ ...author })
    })
      .with('tagList')
      .create()

    const { token } = await signIn(author.followers[0])

    const {
      body: { articles },
    } = await supertest(BASE_URL)
      .get('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const tagList = createdArticle.tagList.map((tag) => tag.name)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, createdArticle.title)
    assert.equal(articles[0].description, createdArticle.description)
    assert.equal(articles[0].body, createdArticle.body)
    assert.deepEqual(articles[0].tagList, tagList)
    assert.equal(articles[0].author.username, createdArticle.author.username)
    assert.equal(articles[0].author.bio, createdArticle.author.bio)
    assert.equal(articles[0].author.image, createdArticle.author.image)
    assert.equal(articles[0].author.following, true)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  test('it should list a favorited article', async (assert) => {
    const article = await ArticleFactory.with('author').with('favorites').create()
    const { token } = await signIn(article.favorites[0])

    const {
      body: { articles },
    } = await supertest(BASE_URL)
      .get('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.exists(articles[0])
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, true)
    assert.equal(articles[0].favoritesCount, 1)
  })

  test('it should list an article by tag', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').with('tagList').createMany(5)
    const article = createdArticles[0]
    const tagList = article.tagList.map((tag) => tag.name)

    const {
      body: { articles },
    } = await supertest(BASE_URL).get(`/api/articles?tag=${tagList[0]}`).expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.deepEqual(articles[0].tagList, tagList)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  test('it should list an article by author', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').createMany(5)
    const article = createdArticles[0]

    const {
      body: { articles },
    } = await supertest(BASE_URL).get(`/api/articles?author=${article.author.username}`).expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  test('it should list an article favorited by an user', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').with('favorites').createMany(5)
    const article = createdArticles[0]

    const {
      body: { articles },
    } = await supertest(BASE_URL)
      .get(`/api/articles?favorited=${article.favorites[0].username}`)
      .expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 1)
  })

  test('it should list 20 articles', async (assert) => {
    await ArticleFactory.with('author').with('tagList').createMany(40)

    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles').expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 20)
  })

  test('it should list articles with limit', async (assert) => {
    await ArticleFactory.with('author').with('tagList').createMany(40)

    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles?limit=10').expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 10)
  })

  test('it should list articles with offset', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').createMany(2)
    const article = createdArticles[1]

    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles?offset=1').expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 1)
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  test('it should list articles with limit and offset', async (assert) => {
    const createdArticles = await ArticleFactory.with('author').createMany(3)
    const article = createdArticles[1]

    const {
      body: { articles },
    } = await supertest(BASE_URL).get('/api/articles?offset=1&limit=2').expect(200)

    assert.exists(articles)
    assert.lengthOf(articles, 2)
    assert.equal(articles[0].title, article.title)
    assert.equal(articles[0].description, article.description)
    assert.equal(articles[0].body, article.body)
    assert.equal(articles[0].author.username, article.author.username)
    assert.equal(articles[0].author.bio, article.author.bio)
    assert.equal(articles[0].author.image, article.author.image)
    assert.equal(articles[0].author.following, false)
    assert.equal(articles[0].favorited, false)
    assert.equal(articles[0].favoritesCount, 0)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
