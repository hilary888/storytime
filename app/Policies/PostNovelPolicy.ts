import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Novel from 'App/Models/Novel'

export default class PostNovelPolicy extends BasePolicy {
	public async create(user: User) {
		const verificationToken = await user.related("emailVerificationTokens").query().firstOrFail()
		return verificationToken.isVerified
	}
	public async update(user: User, novel: Novel) { }
}
