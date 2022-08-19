import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserSignUpValidator from 'App/Validators/UserSignUpValidator'
import AuthService from 'App/Services/AuthService';
import EmailVerificationToken from 'App/Models/EmailVerificationToken';
import Database from '@ioc:Adonis/Lucid/Database';
import { DateTime } from 'luxon';
import User from 'App/Models/User';
import { v4 as uuidv4 } from "uuid"
import ResetPassword from 'App/Mailers/ResetPassword';

export default class AuthController {
    public async signUp({ request, response }: HttpContextContract) {
        const payload = await request.validate(UserSignUpValidator);
        const user = await AuthService.signUpUser(payload)
        await AuthService.sendVerificationEmail(user)

        return response.created(user.serialize())
    }

    public async verifyEmail({ request, response }: HttpContextContract) {
        // Check if url signature is valid
        if (!request.hasValidSignature()) {
            return response.badRequest({
                errors: [
                    { message: "URL signature is missing or URL was tampered with" }
                ]
            })
        }

        const { token } = request.params()
        const verificationToken = await EmailVerificationToken.findByOrFail("token", token)
        // Mark token as verified
        await Database.transaction(async (trx) => {
            await verificationToken
                .useTransaction(trx)
                .merge({
                    isVerified: true,
                    verifiedAt: DateTime.now()
                })
                .save()
        })

        return response.noContent()
    }

    public async getPasswordResetToken({ request, response }: HttpContextContract) {
        const { email } = request.params();
        const user = await User.findByOrFail("email", email)

        // Make entry into password reset table
        const resetToken = await Database.transaction(async (trx) => {
            const savePayload = {
                token: uuidv4()
            }
            const token = await user.related("passwordResetTokens")
                .updateOrCreate({}, savePayload, { client: trx })
            return token
        })

        // Mail reset token to user
        await new ResetPassword(user, resetToken).sendLater()

        return response.noContent()
    }
}
