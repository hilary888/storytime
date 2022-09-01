import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Novel from 'App/Models/Novel'
import CreateOrUpdateNovelValidator from 'App/Validators/CreateOrUpdateNovelValidator'

export default class UserNovelsController {
    public async create({ auth, bouncer, request, response }: HttpContextContract) {
        const user = auth.user!
        // authorize
        await bouncer.with("NovelPolicy").authorize("create")
        // get payload
        const validationPayload = await request.validate(CreateOrUpdateNovelValidator)
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

    public async update({ bouncer, request, response }: HttpContextContract) {
        // Get novel and authorize
        const { id } = request.params()
        const novel = await Novel.findOrFail(id)
        await bouncer.with("NovelPolicy").authorize("update", novel)

        const savePayload = await request.validate(CreateOrUpdateNovelValidator)
        const updatedNovel = await Database.transaction(async (trx) => {
            const updatedNovel = await novel
                .useTransaction(trx)
                .merge(savePayload)
                .save()

            return updatedNovel
        })

        return response.ok(updatedNovel.serialize())
    }

    public async delete({ bouncer, request, response }: HttpContextContract) {
        // Authorize and get novel
        const { id } = request.params()
        const novel = await Novel.findOrFail(id)
        await bouncer.with("NovelPolicy").authorize("delete", novel)

        await Database.transaction(async (trx) => {
            await novel
                .useTransaction(trx)
                .delete()
        })

        return response.noContent()
    }

    public async show({ bouncer, request, response }: HttpContextContract) {
        const { id } = request.params()
        const novel = await Novel.findOrFail(id)
        await bouncer.with("NovelPolicy").authorize("show", novel)

        return response.ok(novel.serialize())
    }

    public async index({ auth, request, response }: HttpContextContract) {
        const { page, limit } = request.qs()
        const user = auth.user!
        const novels = await user.related("novels").query().paginate(page, limit)

        return response.ok(novels.serialize())
    }
}
