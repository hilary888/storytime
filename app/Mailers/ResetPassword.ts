import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import PasswordResetToken from 'App/Models/PasswordResetToken'
import User from 'App/Models/User'
import Env from "@ioc:Adonis/Core/Env"
import Route from "@ioc:Adonis/Core/Route"

export default class ResetPassword extends BaseMailer {
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
   * "ResetPassword.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  constructor(private user: User, private resetToken: PasswordResetToken) {
    super()
  }

  public prepare(message: MessageContract) {
    const signedRoute = Route.makeSignedUrl("resetPassword", { token: this.resetToken.token })
    const url = `${Env.get("FE_URL")}${signedRoute}`

    message
      .subject('Storytime - Reset Password')
      .from('noreply@storytime.com')
      .to(this.user.email)
      .htmlView("emails/reset_password", {
        url,
        username: this.user.username
      })
  }
}
