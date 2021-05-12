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
      required: ['name', 'statusName', 'creatorName'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        statusName: { type: 'string' },
        creatorName: { type: 'string' },
        executorName: { type: ['string', 'null'] },
        description: { type: 'string' },
      },
    };
  }

  set statusName(value) {
    return this;
  }

  set creatorName(value) {
    return this;
  }

  set executorName(value) {
    return this;
  }

  static get relationMappings() {
    return {
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: 'User',
        join: {
          from: 'tasks.creatorId',
          to: 'users.id',
        },
      },
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
