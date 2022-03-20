import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import { getArticle } from '../Mappers/ArticleMapper'

export default class FavoritesController {
  public async favorite({ request, response, auth }: HttpContextContract) {
    const slug = request.param('slug')
    const article = await Article.findByOrFail('slug', slug)
    const user = auth.user!
    await article.related('favorites').attach([user.id])

    return response.ok({ article: await getArticle(article, user) })
  }

  public async unfavorite({ request, response, auth }: HttpContextContract) {
    const slug = request.param('slug')
    const article = await Article.findByOrFail('slug', slug)
    const user = auth.user!
    await article.related('favorites').detach([user.id])

    return response.ok({ article: await getArticle(article, user) })
  }
}
