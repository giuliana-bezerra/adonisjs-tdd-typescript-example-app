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
