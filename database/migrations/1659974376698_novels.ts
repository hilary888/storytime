import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'novels'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer("user_id").notNullable().references("users.id").onDelete("CASCADE");

      table.string("title").notNullable()
      table.jsonb("content").notNullable()
      table.string("slug").notNullable()
      table.boolean("is_published").notNullable().defaultTo(false)
      table.timestamp("published_at").nullable()
      table.jsonb("tags")

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
