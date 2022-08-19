import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserSignUpValidator from 'App/Validators/UserSignUpValidator'
import AuthService from 'App/Services/AuthService';
import EmailVerificationToken from 'App/Models/EmailVerificationToken';
import Database from '@ioc:Adonis/Lucid/Database';
import { DateTime } from 'luxon';
import User from 'App/Models/User';
import { v4 as uuidv4 } from "uuid"
import ResetPassword from 'App/Mailers/ResetPassword';
import PasswordResetToken from 'App/Models/PasswordResetToken';
import PasswordResetValidator from 'App/Validators/PasswordResetValidator';
import LoginValidator from 'App/Validators/LoginValidator';
import Event from '@ioc:Adonis/Core/Event'

export default class AuthController {
    public async signUp({ request, response }: HttpContextContract) {
        const payload = await request.validate(UserSignUpValidator);
        const user = await AuthService.signUpUser(payload)
        await AuthService.sendVerificationEmail(user)

        return response.created(user.serialize())
    }

    public async resendEmailVerification({ request, response }: HttpContextContract) {
        const { email } = request.params()
        const user = await User.findByOrFail("email", email)
        await AuthService.sendVerificationEmail(user)

        return response.noContent()
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
        const { email } = request.params()
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

    public async resetPassword({ request, response }: HttpContextContract) {
        // Check if url signature is valid
        if (!request.hasValidSignature()) {
            return response.badRequest({
                errors: [
                    { message: "URL signature is missing or URL was tampered with" }
                ]
            })
        }

        const { token } = request.params()
        const payload = await request.validate(PasswordResetValidator)
        const resetToken = await PasswordResetToken.findByOrFail("token", token)
        const user = await resetToken.related("user").query().firstOrFail()
        const now = DateTime.now()

        // Fail if token is expired
        if (now > resetToken.expiresAt) {
            return response.badRequest({
                errors: [
                    { message: "reset token is expired" }
                ]
            })
        }

        // Reset password
        await Database.transaction(async (trx) => {
            user
                .useTransaction(trx)
                .merge(payload)
                .save()
        })

        return response.noContent()
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const { email, password, rememberMe } = await request.validate(LoginValidator)
        const duration = rememberMe ? "7days" : "1days"
        const token = await auth.use("api").attempt(email, password, { expiresIn: duration })

        Event.emit("user:login", { user: auth.user! })

        return response.ok(token.toJSON())
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use("api").revoke()
        return response.noContent()
    }
}
