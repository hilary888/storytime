import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserSignUpValidator from 'App/Validators/UserSignUpValidator'
import AuthService from 'App/Services/AuthService';

export default class AuthController {
    public async signUp({ request, response }: HttpContextContract) {
        const payload = await request.validate(UserSignUpValidator);
        const user = await AuthService.signUpUser(payload)
        await AuthService.sendVerificationEmail(user)

        return response.ok(user.serialize())
    }
}
