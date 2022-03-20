import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, beforeSave, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Article from 'App/Models/Article'
import { DateTime } from 'luxon'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public bio: string | null

  @column()
  public image: string | null

  @column({ serializeAs: null })
  public rememberMeToken?: string

  @manyToMany(() => User, {
    serializeAs: null,
    pivotTable: 'follows',
    pivotForeignKey: 'follower',
    pivotRelatedForeignKey: 'following',
  })
  public followings: ManyToMany<typeof User>

  @manyToMany(() => User, {
    serializeAs: null,
    pivotTable: 'follows',
    pivotForeignKey: 'following',
    pivotRelatedForeignKey: 'follower',
  })
  public followers: ManyToMany<typeof User>

  @manyToMany(() => Article, {
    pivotTable: 'favorites',
  })
  public favorites: ManyToMany<typeof Article>

  @column.dateTime({ autoCreate: true, serializeAs: null })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
