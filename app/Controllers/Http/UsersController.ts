import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
    public async show({ auth, bouncer, request, response }: HttpContextContract) {
        const user = auth.user!
        return response.ok(user.serialize())
    }
}
