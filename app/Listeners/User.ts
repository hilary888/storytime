import type { EventsList } from '@ioc:Adonis/Core/Event'
import { DateTime } from 'luxon'

export default class User {
    public async onUserLogin(userObj: EventsList["login:user"]) {
        const { user } = userObj

        await user
            .merge({ lastLoginAt: DateTime.now() })
            .save()
    }
}
