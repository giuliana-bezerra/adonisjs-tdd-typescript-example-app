import Database from '@ioc:Adonis/Lucid/Database'
import Article from 'App/Models/Article'
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

test.group('Delete Article', (group) => {
  test('it should delete an article', async (assert) => {
    const createdArticle = await ArticleFactory.with('author')
      .with('tagList')
      .with('favorites')
      .create()

    const { token } = await signIn(createdArticle.author)

    await supertest(BASE_URL)
      .delete(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const article = await Article.find(createdArticle.id)
    const favorites = await Database.query()
      .from('favorites')
      .where('article_id', createdArticle.id)
      .andWhere('user_id', createdArticle.favorites[0].id)

    assert.notExists(article)
    assert.isEmpty(favorites)
  })

  test('it should not delete an unexisting article', async () => {
    await supertest(BASE_URL)
      .delete('/api/articles/slug')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should not delete an article that belongs to another user', async () => {
    const createdArticle = await ArticleFactory.with('author')
      .with('tagList')
      .with('favorites')
      .create()

    await supertest(BASE_URL)
      .delete(`/api/articles/${createdArticle.slug}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(403)
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
