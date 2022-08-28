import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'email_verification_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("user_id").notNullable().references("users.id").onDelete("CASCADE")
      table.string("email").notNullable().index()
      table.uuid("token").notNullable().index()
      table.boolean("is_verified").notNullable().defaultTo(false)
      table.timestamp("verified_at", { useTz: true })

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
