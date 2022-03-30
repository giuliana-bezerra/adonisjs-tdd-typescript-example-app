/**
 * Contract source: https://git.io/Jte3T
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */
import Bouncer from '@ioc:Adonis/Addons/Bouncer'
import Article from 'App/Models/Article'
import Comment from 'App/Models/Comment'
import User from 'App/Models/User'

export const { actions } = Bouncer.define('updateArticle', (user: User, article: Article) => {
  return user.id === article.authorId
})
  .define('removeArticle', (user: User, article: Article) => {
    return user.id === article.authorId
  })
  .define('removeComment', (user: User, comment: Comment) => {
    return user.id === comment.authorId
  })

/*
|--------------------------------------------------------------------------
| Bouncer Policies
|--------------------------------------------------------------------------
|
| Policies are self contained actions for a given resource. For example: You
| can create a policy for a "User" resource, one policy for a "Post" resource
| and so on.
|
| The "registerPolicies" accepts a unique policy name and a function to lazy
| import the policy
|
| ```
| 	Bouncer.registerPolicies({
|			UserPolicy: () => import('App/Policies/User'),
| 		PostPolicy: () => import('App/Policies/Post')
| 	})
| ```
|
|****************************************************************
| NOTE: Always export the "policies" const from this file
|****************************************************************
*/
export const { policies } = Bouncer.registerPolicies({})
