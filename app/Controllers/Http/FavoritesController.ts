import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Article from 'App/Models/Article'
import User from 'App/Models/User'

export default class FavoritesController {
  public async favorite({ request, response, auth }: HttpContextContract) {
    const slug = request.param('slug')
    const article = await Article.findByOrFail('slug', slug)
    const user = auth.user!
    await article.related('favorites').attach([user.id])

    return response.ok({ article: await this.getFavorite(article, user) })
  }

  private async getFavorite(article: Article, user: User) {
    await article.load('author')
    await article.load('tagList')
    await article.author.load('followers', (query) => {
      query.where('follower', user.id)
    })
    const favorites = await article.related('favorites').query()

    const response = article.serialize({
      fields: {
        omit: ['authorId', 'favorites'],
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
      favorited: favorites.some((favorite) => favorite.id === user.id),
      favoritesCount: favorites.length,
    }
  }
}
