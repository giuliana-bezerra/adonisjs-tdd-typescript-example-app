import Database from '@ioc:Adonis/Lucid/Database'
import { ArticleFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'

import { signIn } from '../auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Update Article', (group) => {
  test('it should update an article', async (assert) => {
    const createdArticle = await ArticleFactory.with('author').with('tagList').create()
    const updatePayload = { title: 'title', description: 'description', body: 'body' }
    const tagList = createdArticle.tagList.map((tag) => tag.name)

    const { token } = await signIn(createdArticle.author)

    const {
      body: { article },
    } = await supertest(BASE_URL)
      .put(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ article: updatePayload })
      .expect(200)

    await createdArticle.refresh()

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

  test('it should partially update an article', async (assert) => {
    const createdArticle = await ArticleFactory.with('author').with('tagList').create()
    const updatePayload = { title: 'title' }
    const tagList = createdArticle.tagList.map((tag) => tag.name)

    const { token } = await signIn(createdArticle.author)

    const {
      body: { article },
    } = await supertest(BASE_URL)
      .put(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ article: updatePayload })
      .expect(200)

    await createdArticle.refresh()

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

  test('it should return 403 if user is not the author of the article', async () => {
    const user = await UserFactory.create()
    const createdArticle = await ArticleFactory.with('author').with('tagList').create()
    const updatePayload = { title: 'title' }

    const { token } = await signIn(user)

    await supertest(BASE_URL)
      .put(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ article: updatePayload })
      .expect(403)
  })

  test('it should update an article with empty payload', async (assert) => {
    const createdArticle = await ArticleFactory.with('author').with('tagList').create()
    const updatePayload = {}
    const tagList = createdArticle.tagList.map((tag) => tag.name)

    const { token } = await signIn(createdArticle.author)

    const {
      body: { article },
    } = await supertest(BASE_URL)
      .put(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ article: updatePayload })
      .expect(200)

    await createdArticle.refresh()

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

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })
})
