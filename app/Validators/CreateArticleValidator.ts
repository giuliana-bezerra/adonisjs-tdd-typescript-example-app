import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'

export default class CreateArticleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    article: schema.object().members({
      title: schema.string({}, [rules.minLength(3)]),
      description: schema.string(),
      body: schema.string(),
      tagList: schema.array.optional().members(schema.string()),
    }),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
