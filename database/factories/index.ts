import Factory from '@ioc:Adonis/Lucid/Factory'
import EmailVerificationToken from 'App/Models/EmailVerificationToken'
import Novel from 'App/Models/Novel'
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
    .relation("emailVerificationToken", () => EmailVerificationTokenFactory)
    .relation("passwordResetTokens", () => PasswordResetTokenFactory)
    .relation("novels", () => NovelFactory)
    .build()

export const EmailVerificationTokenFactory = Factory
    .define(EmailVerificationToken, ({ faker }) => {
        return {
            email: faker.internet.email(),
            token: uuidv4()
        }
    })
    .state("verified", (token) => {
        token.isVerified = true
        token.verifiedAt = DateTime.now()
        return token
    })
    .build()

export const PasswordResetTokenFactory = Factory
    .define(PasswordResetToken, () => {
        return {
            token: uuidv4(),
            expiresAt: DateTime.now().plus({ minutes: 10 })
        }
    })
    .build()

export const NovelFactory = Factory
    .define(Novel, ({ faker }) => {
        return {
            title: faker.lorem.sentence(),
            content: [
                {
                    title: faker.lorem.sentence(),
                    content: faker.lorem.paragraphs(10)
                },
                {
                    title: faker.lorem.sentence(),
                    content: faker.lorem.paragraphs(5)
                }
            ],
            tags: [faker.lorem.word(), faker.lorem.word()],
        }
    })
    .build()