import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class ProfilesController {
  public async show({ request, response, auth }: HttpContextContract) {
    const follower = auth.user?.id
    const username = request.param('username')

    const profile = await User.query()
      .preload('followers', (query) => {
        query.where('follower', follower || 0)
      })
      .where('username', username)
      .firstOrFail()

    return response.ok(this.getProfile(profile))
  }

  public async follow({ request, response, auth }: HttpContextContract) {
    const follower = auth.user!.id
    const username = request.param('username')

    const profile = await User.findByOrFail('username', username)
    await profile.related('followers').attach([follower])
    await profile.load('followers', (query) => {
      query.where('follower', follower)
    })
    return response.ok(this.getProfile(profile))
  }

  public async unfollow({ request, response, auth }: HttpContextContract) {
    const follower = auth.user!.id
    const username = request.param('username')

    const profile = await User.findByOrFail('username', username)
    await profile.related('followers').detach([follower])
    return response.ok(this.getProfile(profile))
  }

  public getProfile(user: User) {
    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: !!user.followers?.length,
      },
    }
  }
}
