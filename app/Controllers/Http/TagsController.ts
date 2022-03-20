import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tag from 'App/Models/Tag'

export default class TagsController {
  public async index({ response }: HttpContextContract) {
    const tags = await Tag.query().orderBy('name')

    return response.ok({ tags: this.getTags(tags) })
  }

  private getTags(tags: Tag[]) {
    return tags.map((tag) => tag.name)
  }
}
