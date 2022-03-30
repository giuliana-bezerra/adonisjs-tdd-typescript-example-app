import Article from 'App/Models/Article'
import User from 'App/Models/User'

interface ArticleResponse {
  author: {
    username: string
    bio: string
    image: string
    following: boolean
  }
  tagList: string[]
  favorited: boolean
  favoritesCount: number
}

export const getArticles = async (articles: Article[], user: User | undefined) => {
  const mappedArticles = [] as ArticleResponse[]
  for (let i = 0; i < articles.length; i++) mappedArticles.push(await getArticle(articles[i], user))
  return { articles: mappedArticles, articlesCount: mappedArticles.length }
}

export const getArticle = async (article: Article, user: User | undefined) => {
  await article.load('author')
  await article.load('tagList')

  await article.author.load('followers', (query) => {
    query.where('follower', user?.id || 0)
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
      following: !!article.author.followers.length,
    },
    tagList: article.tagList.map((tag) => tag.name),
    favorited: favorites.some((favorite) => favorite.id === user?.id),
    favoritesCount: favorites.length,
  }
}
