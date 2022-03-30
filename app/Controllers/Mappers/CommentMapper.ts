import Comment from 'App/Models/Comment'
import User from 'App/Models/User'

interface CommentResponse {
  id: number
  createdAt: string
  updatedAt: string
  body: string
  author: {
    username: string
    bio: string
    image: string
    following: boolean
  }
}

export const getComments = async (comments: Comment[], user: User | undefined) => {
  const mappedComments = [] as CommentResponse[]
  for (let i = 0; i < comments.length; i++) mappedComments.push(await getComment(comments[i], user))
  return { comments: mappedComments }
}

export const getComment = async (comment: Comment, user: User | undefined) => {
  await comment.load('author')

  await comment.author.load('followers', (query) => {
    query.where('follower', user?.id || 0)
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
  } as CommentResponse
}
