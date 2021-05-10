
exports.up = (knex) => (
  knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('name');

    table.string('statusId')
      .unsigned()
      .references('id')
      .inTable('statuses')
      .onDelete('SET NULL')
      .index();

    table.string('assignedUserId')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .index();

    table.string('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

exports.down = (knex) => knex.schema.dropTable('tasks');