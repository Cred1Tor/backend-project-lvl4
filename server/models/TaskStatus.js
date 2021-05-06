// @ts-check

import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel';

const unique = objectionUnique({ fields: ['name'] });

export default class TaskStatus extends unique(BaseModel) {
  static get tableName() {
    return 'statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
      },
    };
  }

  static relationMappings: {
    tasks: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'Task',
      join: {
        from: 'statuses.id',
        to: 'tasks.StatusId',
      },
    },
  };
}
