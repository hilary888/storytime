import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Env from "@ioc:Adonis/Core/Env"
import EmailVerificationToken from 'App/Models/EmailVerificationToken'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'

export default class VerifyEmail extends BaseMailer {
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "VerifyEmail.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  constructor(private user: User, private verificationToken: EmailVerificationToken) {
    super()
  }

  public prepare(message: MessageContract) {
    const signedRoute = Route.makeSignedUrl("verifyEmail", { token: this.verificationToken.token });

    const url = `${Env.get("FE_URL")}${signedRoute}`
    const sender = "noreply@storytime.com"

    message
      .subject("Welcome Onboard!")
      .from(sender)
      .to(this.user.email)
      .htmlView("emails/welcome", {
        username: this.user.username,
        url
      })
  }
}
