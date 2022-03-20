import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

import Article from './Article'

export default class Tag extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public name: string

  @manyToMany(() => Article, {
    pivotTable: 'articles_tags',
  })
  public articles: ManyToMany<typeof Article>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime
}
