import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Novel from './Novel'
import CommentFavourite from './CommentFavourite'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public novelId: number

  @column()
  public comment: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Novel)
  public novel: BelongsTo<typeof Novel>

  @hasMany(() => CommentFavourite)
  public commentFavourites: HasMany<typeof CommentFavourite>
}
