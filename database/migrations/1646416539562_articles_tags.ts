import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ArticlesTags extends BaseSchema {
  protected tableName = 'articles_tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.unique(['article_id', 'tag_name'])
      table.integer('article_id').unsigned().references('id').inTable('articles').notNullable()
      table.integer('tag_name').unsigned().references('name').inTable('tags').notNullable()

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
