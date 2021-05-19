// @ts-check

exports.up = (knex) => (
  knex.schema.createTable('tasks_labels', (table) => {
    table.increments('id').primary()

    table
      .integer('taskId')
      .unsigned()
      .references('id')
      .inTable('tasks')
      .onDelete('CASCADE')
      .index()

    table
      .integer('labelId')
      .unsigned()
      .references('id')
      .inTable('labels')
      .onDelete('CASCADE')
      .index()
  })
);

exports.down = (knex) => knex.schema.dropTable('tasks_labels');
