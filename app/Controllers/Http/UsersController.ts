import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'

export default class UsersController {
  public async login({ request, response, auth }: HttpContextContract) {
    const {
      user: { email, password },
    } = await request.validate(LoginValidator)

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '2hours',
    })

    return response.ok(this.getUser(auth.user!, token.token))
  }

  public async me({ response, auth }: HttpContextContract) {
    // Generating a new token
    const token = (await auth.use('api').generate(auth.user!)).token

    return response.ok(this.getUser(auth.user!, token))
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const { user: userPayload } = await request.validate(CreateUserValidator)

    await User.create(userPayload)

    const token = await auth.use('api').attempt(userPayload.email, userPayload.password, {
      expiresIn: '2hours',
    })

    return response.created(this.getUser(auth.user!, token.token))
  }

  public async update({ request, response, auth }: HttpContextContract) {
    const { user: userPayload } = await request.validate(UpdateUserValidator)
    let user = auth.user!
    user.merge(userPayload)
    await user.save()

    // Getting existing token from authorization header
    const token = request.headers().authorization!.replace('Bearer ', '')
    return response.ok(this.getUser(user, token))
  }

  private getUser(user: User, token: string) {
    return {
      user: {
        email: user.email,
        token: token,
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    }
  }
}
