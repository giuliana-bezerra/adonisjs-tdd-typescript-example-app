import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import LoginValidator from 'App/Validators/LoginValidator'

export default class UsersController {
  public async login({ request, response, auth }: HttpContextContract) {
    const {
      user: { email, password },
    } = await request.validate(LoginValidator)

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '2hours',
    })

    return response.ok(this.getUser(auth, token.token))
  }

  public async me({ response, auth }: HttpContextContract) {
    const token = (await auth.use('api').generate(auth.user!)).token
    return response.ok(this.getUser(auth, token))
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const { user: userPayload } = await request.validate(CreateUserValidator)

    await User.create(userPayload)

    const token = await auth.use('api').attempt(userPayload.email, userPayload.password, {
      expiresIn: '2hours',
    })

    return response.created(this.getUser(auth, token.token))
  }

  private getUser(auth: AuthContract, token: string) {
    return {
      user: {
        email: auth.user!.email,
        token: token,
        username: auth.user!.username,
        bio: auth.user!.bio,
        image: auth.user!.image,
      },
    }
  }
}
