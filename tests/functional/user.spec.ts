import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test("user can access their details", async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client
      .get(`/api/v1/user`)
      .loginAs(user)

    response.assertStatus(200)
    response.assertAgainstApiSpec()
  })

  test("guest cannot access user account details", async ({ client }) => {
    const response = await client
      .get(`/api/v1/user`)

    response.assertStatus(401)
    response.assertAgainstApiSpec()
  })
})
