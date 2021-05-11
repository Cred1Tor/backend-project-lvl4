// @ts-check

// import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel';

// const unique = objectionUnique({ fields: ['name'] });

export default class Task extends BaseModel {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: ['integer', 'null'] },
        description: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      executor: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'User',
        join: {
          from: 'tasks.executorId',
          to: 'users.id',
        },
      },
      status: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'TaskStatus',
        join: {
          from: 'tasks.statusId',
          to: 'statuses.id',
        },
      },
    };
  }
}
