import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UserSignUpValidator {
  constructor(protected ctx: HttpContextContract) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    username: schema.string({ trim: true }, [
      rules.minLength(2),
      rules.maxLength(255),
      rules.unique({ table: "users", column: "username" })
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ table: "users", column: "email" })
    ]),
    password: schema.string({}, [
      rules.minLength(10),
      rules.confirmed("passwordConfirmation")
    ])
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    "username.required": "{{field}} is required",
    "username.minLength": "{{field}} must have at least 2 characters",
    "username.maxLength": "{{field}} cannot have more than 255 characters",
    "email.required": "{{field}} is required",
    "password.required": "{{field}} is required",
    "username.unique": "{{field}} is not available",
    "email.unique": "{{field}} is already used",
    "password.confirmed": "passwords do not match",
    "password.minLength": "password must have at least 10 characters",
    "passwordConfirmation.confirmed": "passwords do not match",
  }
}
