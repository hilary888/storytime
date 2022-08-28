import Database from '@ioc:Adonis/Lucid/Database';
import { test } from '@japa/runner'

test.group('Health check', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  })

  test("health check works", async ({ client }) => {
    const response = await client
      .get("/api/v1/health_check")

    response.assertStatus(200)
    response.assertAgainstApiSpec()
  })
})
