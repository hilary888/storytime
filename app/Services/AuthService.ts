import Database, { TransactionClientContract } from "@ioc:Adonis/Lucid/Database"
import VerifyEmail from "App/Mailers/VerifyEmail"
import User from "App/Models/User"
import { v4 as uuidv4 } from "uuid"

export default class AuthService {
    public static async signUpUser(payload: NewUser) {
        const user = await Database.transaction(async (trx) => {
            const user = await User.create(payload, { client: trx })
            await this.updateOrCreateEmailVerificationToken(user, trx)
            return user
        })
        return user
    }

    public static async updateOrCreateEmailVerificationToken(user: User, trx: TransactionClientContract) {
        const searchPayload = { email: user.email }
        const savePayload = {
            token: uuidv4(),
            email: user.email
        }

        const verificationToken = await user
            .related("emailVerificationToken")
            .updateOrCreate(searchPayload, savePayload, { client: trx })

        return verificationToken
    }

    public static async sendVerificationEmail(user: User) {
        const verificationToken = await user
            .related("emailVerificationToken")
            .query()
            .where("email", user.email)
            .firstOrFail()
        await new VerifyEmail(user, verificationToken).sendLater()
    }
}

interface NewUser {
    username: string
    email: string
    password: string
}