import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { slugify } from '@ioc:Adonis/Addons/LucidSlugify'
import User from './User'
import Comment from './Comment'
import NovelFavourite from './NovelFavourite'
import Hash from '@ioc:Adonis/Core/Hash'

export default class Novel extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public title: string

  @column(
    {
      prepare: (value) => JSON.stringify(value)
    }
  )
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
    {
      prepare: (value) => JSON.stringify(value)
    }
  )
  public tags: object

  @column()
  public hash: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async generateNovelHash(novel: Novel) {
    if (novel.$dirty.content) {
      novel.hash = await Hash.make(JSON.stringify(novel.content))
    }
  }

  @beforeSave()
  public static async savePublishDetails(novel: Novel) {
    if (novel.$dirty.isPublished && novel.$dirty.isPublished === true) {
      novel.publishedAt = DateTime.now()
    } else {
      novel.publishedAt = undefined
    }
  }

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasMany(() => NovelFavourite)
  public novelFavourites: HasMany<typeof NovelFavourite>
}
