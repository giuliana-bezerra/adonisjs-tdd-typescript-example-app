import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import Tag from 'App/Models/Tag'
import CreateArticleValidator from 'App/Validators/CreateArticleValidator'
import { getArticle } from '../Mappers/ArticleMapper'

export default class ArticlesController {
  public async store({ request, response, auth }: HttpContextContract) {
    const user = auth.user!
    const { article: articlePayload } = await request.validate(CreateArticleValidator)
    const tagListPayload = articlePayload.tagList

    const article = await Article.create({ ...articlePayload, authorId: user.id })
    await this.createTagsForArticle(article, tagListPayload)

    return response.created({ article: await getArticle(article, user) })
  }

  public async createTagsForArticle(article: Article, tagListPayload: string[] | undefined) {
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
