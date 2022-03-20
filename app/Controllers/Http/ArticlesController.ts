import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import Tag from 'App/Models/Tag'
import User from 'App/Models/User'

export default class ArticlesController {
  public async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user!
    let articlePayload = request.only(['title', 'description', 'body'])
    articlePayload['authorId'] = user.id
    const tagListPayload = request.input('tagList')

    const article = await Article.create(articlePayload)
    await this.createTagsForArticle(article, tagListPayload)

    return response.created({ article: await this.getArticle(article, user) })
  }

  public async createTagsForArticle(article: Article, tagListPayload: string[]) {
    const tagList = tagListPayload.map((tag: string) => {
      return {
        name: tag,
      }
    })
    await Tag.fetchOrCreateMany('name', tagList)
    await article.related('tagList').attach(tagListPayload)
  }

  public async getArticle(article: Article, user: User) {
    await article.load('author')
    await article.load('tagList')
    await article.author.load('followers', (query) => {
      query.where('follower', user.id)
    })

    const response = article.serialize({
      fields: {
        omit: ['authorId'],
      },
      relations: {
        author: {
          fields: {
            omit: ['id', 'email', 'followers'],
          },
        },
      },
    })

    return {
      ...response,
      author: {
        ...response.author,
        following: !!user.followers?.length,
      },
      tagList: article.tagList.map((tag) => tag.name),
    }
  }
}
