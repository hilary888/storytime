import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import User from './User'
import Comment from './Comment'
import NovelFavourite from './NovelFavourite'

export default class Novel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public title: string

  @column()
  public content: object

  @column()
  @slugify({
    strategy: "dbIncrement",
    fields: ["title"]
  })
  public slug: string

  @column()
  public isPublished: boolean

  @column()
  public publishedAt?: DateTime

  @column(
    // {
    //   prepare: (value) => JSON.stringify(value)
    // }
  )
  public tags: object

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasMany(() => NovelFavourite)
  public novelFavourites: HasMany<typeof NovelFavourite>
}
