// @ts-check

import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel';

const unique = objectionUnique({ fields: ['name'] });

export default class Task extends unique(BaseModel) {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        statusId: { type: 'integer' },
        assignedUserId: { type: ['integer', 'null'] },
        description: { type: 'string' },
      },
    };
  }

  static relationMappings: {
    assignedUser: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'User',
      join: {
        from: 'tasks.assignedUserId',
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
