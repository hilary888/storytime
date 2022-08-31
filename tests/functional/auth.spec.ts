import Mail from '@ioc:Adonis/Addons/Mail';
import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories';
import Route from "@ioc:Adonis/Core/Route"
import { v4 as uuidv4 } from "uuid"

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  })

  test("guest can create account with valid payload", async ({ assert, client }) => {
    const mailer = Mail.fake()
    const newUserPayload = {
      username: "username",
      email: "username@mail.com",
      password: "somepassword",
      passwordConfirmation: "somepassword"
    }

    const response = await client
      .post("/api/v1/signup")
      .json(newUserPayload)

    response.assertStatus(201);
    response.assertAgainstApiSpec();

    // assert onboarding mail has been sent
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === "Welcome Onboard!";
      })
    )
  })


  test("guest cannot create account with invalid payload", async ({ client }, payload) => {
    const response = await client
      .post("/api/v1/signup")
      .json(payload)

    response.assertStatus(422)
    response.assertAgainstApiSpec()
  }).with([
    {
      email: "username@mail.com",
      password: "somepassword",
      passwordConfirmation: "somepassword"
    },
    {
      username: "username",
      password: "somepassword",
      passwordConfirmation: "somepassword"
    },
    {
      username: "username",
      email: "username@mail.com",
      passwordConfirmation: "somepassword"
    },
    {
      username: "username",
      email: "username@mail.com",
      password: "somepassword"
    },
    {
      username: "username",
      email: "username@mail.com",
      password: "some",
      passwordConfirmation: "some"
    }
  ])

  test("guest cannot use existing username/password", async ({ client }, payload) => {
    await UserFactory
      .merge({
        username: "randomUsername",
        email: "randomEmail@mail.com"
      })
      .create()

    const response = await client
      .post("/api/v1/signup")
      .json(payload)

    response.assertStatus(422)
    response.assertAgainstApiSpec()
  }).with([
    {
      username: "randomUsername",
      email: "username@mail.com",
      password: "somepassword",
      passwordConfirmation: "somepassword"
    },
    {
      username: "username",
      email: "randomEmail@mail.com",
      password: "somepassword",
      passwordConfirmation: "somepassword"
    }
  ])

  test("guest can verify email with valid token and signature", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1)
      .create()

    const verificationToken = await user.related("emailVerificationToken").query().firstOrFail()
    const signedRoute = Route.makeSignedUrl("verifyEmail", {
      token: verificationToken.token
    })

    const response = await client.get(signedRoute)

    response.assertStatus(204)
  })

  test("guest cannot verify email with doctored url", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1)
      .create()

    const verificationToken = await user.related("emailVerificationToken").query().firstOrFail()
    const route = Route.makeSignedUrl("verifyEmail", {
      token: verificationToken.token
    })

    const response = await client.get(route + "3erd")

    response.assertStatus(400)
    response.assertAgainstApiSpec()
  })

  test("guest cannot verify email with nonexistent token", async ({ client }) => {
    await UserFactory
      .with("emailVerificationToken", 1)
      .create()
    const signedRoute = Route.makeSignedUrl("verifyEmail", {
      token: uuidv4()
    })

    const response = await client.get(signedRoute)

    response.assertStatus(404)
    response.assertAgainstApiSpec()
  })


  test("guest can request verification email be resent to valid email", async ({ assert, client }) => {
    const mailer = Mail.fake()
    const email = "user.mail@mail.com"
    const user = await UserFactory.merge({ email })
      .with("emailVerificationToken", 1, (verificationToken) => verificationToken.merge({ email }))
      .create()

    const response = await client
      .get(`/api/v1/resend_verification/${encodeURIComponent(user.email)}`)

    response.assertStatus(204)
    // assert onboarding mail is been sent
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === "Welcome Onboard!";
      })
    )
  })

  test("guest cannot verify nonexistent email address", async ({ client }) => {
    const email = "test.user@mail.com"
    const response = await client
      .get(`/api/v1/resend_verification/${encodeURIComponent(email)}`)

    response.assertStatus(404)
    response.assertAgainstApiSpec()
  })

  test("forgot password request works for valid emails", async ({ assert, client }) => {
    const mailer = Mail.fake()
    const user = await UserFactory.create()

    const response = await client
      .get(`/api/v1/forgot_password/${encodeURIComponent(user.email)}`)

    response.assertStatus(204)
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === "Storytime - Reset Password"
      })
    )
  })

  test("forgot password request fails for nonexistent emails", async ({ client }) => {
    const email = "test.user@mail.com"

    const response = await client
      .get(`/api/v1/forgot_password/${encodeURIComponent(email)}`)

    response.assertStatus(404)
    response.assertAgainstApiSpec()
  })

  test("reset password works with valid url", async ({ client }) => {
    const user = await UserFactory
      .with("passwordResetTokens", 1)
      .create()
    await user.load("passwordResetTokens")
    const resetToken = await user.passwordResetTokens[0]
    const signedRoute = Route.makeSignedUrl("resetPassword", {
      token: resetToken.token
    })
    const payload = {
      password: "anotheranother",
      passwordConfirmation: "anotheranother"
    }

    const response = await client
      .post(signedRoute)
      .json(payload)

    response.assertStatus(204)
  })

  test("reset password fails with doctored url", async ({ client }) => {
    const user = await UserFactory
      .with("passwordResetTokens", 1)
      .create()
    const resetToken = await user.related("passwordResetTokens").query().firstOrFail()
    const signedRoute = Route.makeSignedUrl("resetPassword", {
      token: resetToken.token
    })
    const payload = {
      password: "anotheranother",
      passwordConfirmation: "anotheranother"
    }

    const response = await client
      .post(signedRoute + "eea")
      .json(payload)

    response.assertStatus(400)
    response.assertAgainstApiSpec()
  })

  test("reset password fails with nonexistent reset token", async ({ client }) => {
    await UserFactory
      .with("passwordResetTokens", 1)
      .create()

    const signedRoute = Route.makeSignedUrl("resetPassword", {
      token: uuidv4()
    })
    const payload = {
      password: "anotheranother",
      passwordConfirmation: "anotheranother"
    }

    const response = await client
      .post(signedRoute)
      .json(payload)

    response.assertStatus(404)
    response.assertAgainstApiSpec()
  })

  test("login works with valid credentials", async ({ client }) => {
    const user = await UserFactory
      .merge({ password: "somePassword!" })
      .create()
    const signInPayload = {
      email: user.email,
      password: "somePassword!"
    }

    const response = await client
      .post("/api/v1/login")
      .json(signInPayload)

    response.assertStatus(200)
    response.assertAgainstApiSpec()
  })

  test("login fails with invalid credentials", async ({ client }, payload) => {
    await UserFactory
      .merge({
        email: "myUsername@mail.com",
        password: "!someRandomPassword!"
      })
      .create()

    const response = await client
      .post("/api/v1/login")
      .json(payload)

    response.assertStatus(400)
    response.assertAgainstApiSpec()
  }).with([
    {
      email: "myUsername@mail.com",
      password: "fakePassword"
    },
    {
      email: "fakeUsername@mail.com",
      password: "!someRandomPassword!"
    }
  ])

  test("logout works for logged in users", async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .get("/api/v1/logout")
      .loginAs(user)

    response.assertStatus(204)
  })

  test("logout fails for guests", async ({ client }) => {
    const response = await client
      .get("/api/v1/logout")

    response.assertStatus(401)
    response.assertAgainstApiSpec()
  })




})
