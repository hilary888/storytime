import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasMany, HasMany, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import EmailVerificationToken from './EmailVerificationToken'
import PasswordResetToken from './PasswordResetToken'
import Novel from './Novel'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'
import CommentFavourite from './CommentFavourite'
import Comment from './Comment'
import NovelFavourite from './NovelFavourite'
import Admin from './Admin'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @attachment()
  public avatar: AttachmentContract

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public lastLoginAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasMany(() => EmailVerificationToken)
  public emailVerificationTokens: HasMany<typeof EmailVerificationToken>

  @hasMany(() => PasswordResetToken)
  public passwordResetTokens: HasMany<typeof PasswordResetToken>

  @hasMany(() => Novel)
  public novels: HasMany<typeof Novel>

  @hasMany(() => NovelFavourite)
  public novelFavourites: HasMany<typeof NovelFavourite>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>

  @hasMany(() => CommentFavourite)
  public commentFavourites: HasMany<typeof CommentFavourite>

  @hasOne(() => Admin)
  public admin: HasOne<typeof Admin>
}
