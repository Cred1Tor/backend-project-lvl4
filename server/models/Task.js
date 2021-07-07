// @ts-check

import BaseModel from './BaseModel';

export default class Task extends BaseModel {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: ['integer', 'null'] },
        description: { type: 'string' },
      },
    };
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
      labels: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: 'Label',
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.taskId',
            to: 'tasks_labels.labelId',
          },
          to: 'labels.id',
        },
      },
    };
  }

  static get modifiers() {
    return {
      filterStatus(query, statusId) {
        if (statusId !== null) {
          query.where({ statusId });
        }
      },

      filterExecutor(query, executorId) {
        if (executorId !== null) {
          query.where({ executorId });
        }
      },

      filterLabel(query, labelId) {
        if (labelId !== null) {
          query.where({ labelId });
        }
      },

      filterCreator(query, creatorId) {
        if (creatorId !== null) {
          query.where({ creatorId });
        }
      },
    };
  }
}
