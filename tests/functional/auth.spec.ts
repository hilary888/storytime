import Mail from '@ioc:Adonis/Addons/Mail';
import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories';
import Route from "@ioc:Adonis/Core/Route"

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
      .with("emailVerificationTokens", 1)
      .create()
    await user.load("emailVerificationTokens")
    const verificationToken = await user.emailVerificationTokens[0]
    const signedRoute = Route.makeSignedUrl("verifyEmail", {
      token: verificationToken.token
    })

    const response = await client.get(signedRoute)

    response.assertStatus(204)
  })

  test("guest cannot verify email without url signature", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationTokens", 1)
      .create()
    await user.load("emailVerificationTokens")
    const verificationToken = await user.emailVerificationTokens[0]
    const route = Route.makeUrl("verifyEmail", {
      token: verificationToken.token
    })
    console.log("route: ", route)

    const response = await client.get(route)

    response.assertStatus(400)
    response.assertAgainstApiSpec()
  })

  test("guest cannot verify email with doctored url", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationTokens", 1)
      .create()
    await user.load("emailVerificationTokens")
    const verificationToken = await user.emailVerificationTokens[0]
    const route = Route.makeSignedUrl("verifyEmail", {
      token: verificationToken.token
    })

    const response = await client.get(route + "3erd")

    response.assertStatus(400)
    response.assertAgainstApiSpec()
  })



})
