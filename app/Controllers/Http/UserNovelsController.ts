import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Novel from 'App/Models/Novel'
import CreateNovelValidator from 'App/Validators/CreateNovelValidator'

export default class UserNovelsController {
    public async create({ auth, bouncer, request, response }: HttpContextContract) {
        const user = auth.user!
        // authorize
        await bouncer.with("PostNovelPolicy").authorize("create")
        // get story
        const validationPayload = await request.validate(CreateNovelValidator)
        // update payload with additional data
        const savePayload = {
            userId: user.id,
            ...validationPayload
        }
        // store novel and send response
        const novel = await Database.transaction(async (trx) => {
            const novel = await Novel.create(savePayload, { client: trx })
            return novel
        })

        return response.created(novel.serialize())
    }
}
