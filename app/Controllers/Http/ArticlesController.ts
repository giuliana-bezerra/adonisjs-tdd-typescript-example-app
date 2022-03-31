import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import Tag from 'App/Models/Tag'
import CreateArticleValidator from 'App/Validators/CreateArticleValidator'
import UpdateArticleValidator from 'App/Validators/UpdateArticleValidator'

import { getArticle, getArticles } from '../Mappers/ArticleMapper'

const LIMIT = 20

export default class ArticlesController {
  public async show({ request, response, auth }: HttpContextContract) {
    const slug = request.param('slug')
    const article = await Article.findByOrFail('slug', slug)

    return response.ok({ article: await getArticle(article, auth.user) })
  }

  public async index({ request, response, auth }: HttpContextContract) {
    const { tag, author, favorited, limit, offset } = request.qs()

    const articles = await Article.query()
      .if(tag, (query) =>
        query.whereHas('tagList', (query) => query.where('name', 'like', `%${tag}%`))
      )
      .if(author, (query) => query.whereHas('author', (query) => query.where('username', author)))
      .if(favorited, (query) =>
        query.whereHas('favorites', (query) => query.where('username', favorited))
      )
      .orderBy('updatedAt', 'desc')
      .limit(limit || LIMIT)
      .offset(offset || 0)

    return response.ok(await getArticles(articles, auth.user))
  }

  public async feed({ request, response, auth }: HttpContextContract) {
    const { limit, offset } = request.qs()
    const user = auth.user!
    user.related('followings')

    const articles = await Article.query()
      .whereHas('author', (query) => {
        query.whereHas('followers', (query) => {
          query.where('id', user.id)
        })
      })
      .orderBy('updatedAt', 'desc')
      .limit(limit || LIMIT)
      .offset(offset || 0)

    return response.ok(await getArticles(articles, auth.user))
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user!
    const { article: articlePayload } = await request.validate(CreateArticleValidator)
    const tagListPayload = articlePayload.tagList

    const article = await Article.create({ ...articlePayload, authorId: user.id })
    await this.createTagsForArticle(article, tagListPayload)

    return response.created({ article: await getArticle(article, user) })
  }

  public async update({ request, response, auth, bouncer }: HttpContextContract) {
    const slug = request.param('slug')
    const { article: articlePayload } = await request.validate(UpdateArticleValidator)

    const article = await Article.findByOrFail('slug', slug)
    await bouncer.authorize('updateArticle', article)

    const articleUpdated = await article.merge(articlePayload).save()

    return response.ok({ article: await getArticle(articleUpdated, auth.user) })
  }

  public async destroy({ request, response, bouncer }: HttpContextContract) {
    const slug = request.param('slug')
    const article = await Article.findByOrFail('slug', slug)

    await bouncer.authorize('removeArticle', article)

    await article.related('favorites').detach()
    await article.delete()
    return response.noContent()
  }

  private async createTagsForArticle(article: Article, tagListPayload: string[] | undefined) {
    if (!!tagListPayload) {
      const tagList = tagListPayload.map((tag: string) => {
        return {
          name: tag,
        }
      })
      await Tag.fetchOrCreateMany('name', tagList)
      await article.related('tagList').attach(tagListPayload)
    }
  }
}
