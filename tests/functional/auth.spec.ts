import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'

test.group('Auth', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  })

  test("guest can create signup for account", async ({ client }) => {
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
  })
})
