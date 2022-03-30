import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

import Article from './Article'
import User from './User'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public body: string

  @column({ columnName: 'author', serializeAs: 'authorId' })
  public authorId: number

  @belongsTo(() => User, {
    foreignKey: 'authorId',
  })
  public author: BelongsTo<typeof User>

  @column({ columnName: 'article', serializeAs: 'articleId' })
  public articleId: number

  @belongsTo(() => Article, {
    foreignKey: 'articleId',
  })
  public article: BelongsTo<typeof Article>

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime
}
