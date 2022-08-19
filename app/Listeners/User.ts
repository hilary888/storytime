import type { EventsList } from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class User {
    public async onUserLogin(userObj: EventsList["login:user"]) {
        const { user } = userObj

        await Database.transaction(async (trx) => {
            await user
                .merge({ lastLoginAt: DateTime.now() })
                .useTransaction(trx)
                .save()
        })
    }
}
