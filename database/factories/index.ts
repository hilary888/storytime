import Factory from '@ioc:Adonis/Lucid/Factory'
import EmailVerificationToken from 'App/Models/EmailVerificationToken'
import PasswordResetToken from 'App/Models/PasswordResetToken'
import User from 'App/Models/User'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from "uuid"

export const UserFactory = Factory
    .define(User, ({ faker }) => {
        return {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        }
    })
    .relation("emailVerificationTokens", () => EmailVerificationTokenFactory)
    .relation("passwordResetTokens", () => PasswordResetTokenFactory)
    .build()

export const EmailVerificationTokenFactory = Factory
    .define(EmailVerificationToken, ({ faker }) => {
        return {
            email: faker.internet.email(),
            token: uuidv4()
        }
    })
    .build()

export const PasswordResetTokenFactory = Factory
    .define(PasswordResetToken, ({ faker }) => {
        return {
            token: uuidv4(),
            expiresAt: DateTime.now().plus({ minutes: 10 })
        }
    })
    .build()