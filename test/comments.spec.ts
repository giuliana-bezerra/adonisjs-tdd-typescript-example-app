import Database from '@ioc:Adonis/Lucid/Database'
import Comment from 'App/Models/Comment'
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
      .post('/api/articles/slug/comments')
      .send(commentPayload)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should not add an empty comment to article', async () => {
    const commentPayload = {
      comment: {},
    }

    await supertest(BASE_URL)
      .post('/api/articles/slug/comments')
      .send(commentPayload)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(422)
  })

  test('it should get comments from an article', async (assert) => {
    const createdArticle = await ArticleFactory.with('author')
      .with('comments', 1, (factory) => factory.with('author'))
      .create()
    const createdComment = createdArticle.comments[0]

    const {
      body: { comments },
    } = await supertest(BASE_URL).get(`/api/articles/${createdArticle.slug}/comments`).expect(200)

    const comment = comments[0]

    assert.lengthOf(comments, 1)
    assert.equal(comment.id, 1)
    assert.equal(comment.body, createdComment.body)
    assert.equal(comment.author.username, createdComment.author.username)
    assert.equal(comment.author.bio, createdComment.author.bio)
    assert.equal(comment.author.image, createdComment.author.image)
    assert.equal(comment.author.following, false)
  })

  test('it should get no comments from an unexisting article', async () => {
    await supertest(BASE_URL).get('/api/articles/slug/comments').expect(404)
  })

  test('it should get no comments from article', async (assert) => {
    const { slug } = await ArticleFactory.with('author').create()

    const {
      body: { comments },
    } = await supertest(BASE_URL).get(`/api/articles/${slug}/comments`).expect(200)

    assert.lengthOf(comments, 0)
  })

  test('it should get comments from an article with a followed author', async (assert) => {
    const author = await UserFactory.with('followers').create()

    const createdArticle = await ArticleFactory.with('author')
      .with('comments', 1, (factory) =>
        factory.with('author', 1, (factory) => {
          factory.merge(author)
        })
      )
      .create()

    const createdComment = createdArticle.comments[0]
    const follower = author.followers[0]
    const { token } = await signIn(follower)

    const {
      body: { comments },
    } = await supertest(BASE_URL)
      .get(`/api/articles/${createdArticle.slug}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const comment = comments[0]

    assert.lengthOf(comments, 1)
    assert.equal(comment.id, 1)
    assert.equal(comment.body, createdComment.body)
    assert.equal(comment.author.username, createdComment.author.username)
    assert.equal(comment.author.bio, createdComment.author.bio)
    assert.equal(comment.author.image, createdComment.author.image)
    assert.equal(comment.author.following, true)
  })

  test('it should delete a comment from an article', async (assert) => {
    const article = await ArticleFactory.with('author')
      .with('comments', 1, (factory) => factory.with('author'))
      .create()
    const comment = article.comments[0]
    const { token } = await signIn(comment.author)

    await supertest(BASE_URL)
      .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const deletedComment = await Comment.find(comment.id)
    assert.notExists(deletedComment)
  })

  test('it should not delete a comment from an unexisting article', async () => {
    await supertest(BASE_URL)
      .delete('/api/articles/slug/comments/1')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should not delete an unexisting comment from an article', async () => {
    const article = await ArticleFactory.with('author').create()

    await supertest(BASE_URL)
      .delete(`/api/articles/${article.slug}/comments/1`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404)
  })

  test('it should delete a comment from another user', async () => {
    const article = await ArticleFactory.with('author')
      .with('comments', 1, (factory) => factory.with('author'))
      .create()

    const comment = article.comments[0]

    await supertest(BASE_URL)
      .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
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
