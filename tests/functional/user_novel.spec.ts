import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { UserFactory } from 'Database/factories'

test.group('User novels', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test(" verified user can upload novel", async ({ client }) => {
    const payload = {
      title: "someRandomTitle",
      content: [
        {
          title: "A new day",
          content: "Once there was an innocent man..."
        },
        {
          title: "At dawn's end",
          content: "... but alas, everything comes to an end."
        }
      ],
      tags: ["self-discovery", "romance"]
    }

    const user = await UserFactory
      .with("emailVerificationTokens", 1, (token) => token.apply("verified"))
      .create()

    const response = await client
      .post("/api/v1/user/novels")
      .json(payload)
      .loginAs(user)

    response.assertStatus(201)
    response.assertAgainstApiSpec()
  })

  test("verified user can upload novel", async ({ client }) => {
    const payload = {
      title: "someRandomTitle",
      content: [
        {
          title: "A new day",
          content: "Once there was an innocent man..."
        },
        {
          title: "At dawn's end",
          content: "... but alas, everything comes to an end."
        }
      ],
      tags: ["self-discovery", "romance"]
    }

    const user = await UserFactory
      .with("emailVerificationTokens", 1)
      .create()

    const response = await client
      .post("/api/v1/user/novels")
      .json(payload)
      .loginAs(user)

    response.assertStatus(403)
    response.assertAgainstApiSpec()
  })

  test("guest cannot upload novel", async ({ client }) => {
    const payload = {
      title: "someRandomTitle",
      content: [
        {
          title: "A new day",
          content: "Once there was an innocent man..."
        },
        {
          title: "At dawn's end",
          content: "... but alas, everything comes to an end."
        }
      ],
      tags: ["self-discovery", "adventure"]
    }

    const response = await client
      .post("/api/v1/user/novels")
      .json(payload)

    response.assertStatus(401)
    response.assertAgainstApiSpec()
  })

  test("verified user can update their novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationTokens", 1, (token) => token.apply("verified"))
      .with("novels", 1)
      .create()

    const novel = await user.related("novels").query().firstOrFail()

    const payload = {
      title: "someRandomTitle",
      content: [
        {
          title: "A new day",
          content: "Once there was an innocent man..."
        },
        {
          title: "At dawn's end",
          content: "... but alas, everything comes to an end."
        }
      ],
      tags: ["self-discovery", "adventure"]
    }

    const response = await client
      .put(`/api/v1/user/novels/${novel.id}`)
      .json(payload)
      .loginAs(user)

    response.assertStatus(200)
    response.assertAgainstApiSpec()
  })

})
