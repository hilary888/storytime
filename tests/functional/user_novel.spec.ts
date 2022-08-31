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
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
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
      .with("emailVerificationToken", 1)
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
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
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

  test("unverified user cannot update novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1)
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

    response.assertStatus(403)
    response.assertAgainstApiSpec()
  })

  test("guest cannot update their novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
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

    response.assertStatus(401)
    response.assertAgainstApiSpec()
  })

  test("verified user can delete their novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("novels", 5)
      .create()

    const novel = await user.related("novels").query().firstOrFail()

    const response = await client
      .delete(`/api/v1/user/novels/${novel.id}`)
      .loginAs(user)

    response.assertStatus(204)
  })

  test("verified user cannot delete non-existent novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create()

    const response = await client
      .delete(`/api/v1/user/novels/1`)
      .loginAs(user)

    response.assertStatus(404)
    response.assertAgainstApiSpec()
  })

  test("verified non-owner cannot delete novel", async ({ client }) => {
    const owner = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("novels", 3)
      .create()
    const nonOwner = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .create()

    const novel = await owner.related("novels").query().firstOrFail()

    const response = await client
      .delete(`/api/v1/user/novels/${novel.id}`)
      .loginAs(nonOwner)

    response.assertStatus(403)
    response.assertAgainstApiSpec()
  })

  test("unverified user cannot delete novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1)
      .with("novels", 2)
      .create()

    const novel = await user.related("novels").query().firstOrFail()

    const response = await client
      .delete(`/api/v1/user/novels/${novel.id}`)
      .loginAs(user)

    response.assertStatus(403)
    response.assertAgainstApiSpec()
  })

  test("guest cannot delete novel", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("novels", 1)
      .create()

    const novel = await user.related("novels").query().firstOrFail()

    const response = await client
      .delete(`/api/v1/user/novels/${novel.id}`)

    response.assertStatus(401)
    response.assertAgainstApiSpec()
  })

  test("verified user can get details of their novels", async ({ client }) => {
    const user = await UserFactory
      .with("emailVerificationToken", 1, (token) => token.apply("verified"))
      .with("novels", 1)
      .create()

    const novel = await user.related("novels").query().firstOrFail()

    const response = await client
      .get(`/api/v1/user/novels/${novel.id}`)
      .loginAs(user)

    response.assertStatus(200)
    response.assertAgainstApiSpec()
  })

})
