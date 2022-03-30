import Comment from 'App/Models/Comment'
import User from 'App/Models/User'

export const getComment = async (comment: Comment, user: User) => {
  await comment.load('author')

  await comment.author.load('followers', (query) => {
    query.where('follower', user.id)
  })

  const response = comment.serialize({
    fields: {
      omit: ['authorId', 'articleId'],
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
      following: !!comment.author.followers.length,
    },
  }
}
