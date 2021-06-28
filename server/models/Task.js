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
        name: { type: 'string', minLength: 1 },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: ['integer', 'null'] },
        labelIds: {
          type: 'array',
          items: {
            type: 'integer',
          },
        },
        description: { type: 'string' },
      },
    };
  }

  set labelIds(value) {
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
          query.where('statusId', statusId);
        }
      },

      filterExecutor(query, executorId) {
        if (executorId !== null) {
          query.where('executorId', executorId);
        }
      },

      filterLabel(query, labelId) {
        if (labelId !== null) {
          query.whereJsonSupersetOf('labelIds', [labelId]); // FIXME: SQLITE_ERROR: unrecognized token: "#"
        }
      },

      filterCreator(query, creatorId) {
        if (creatorId !== null) {
          query.where('creatorId', creatorId);
        }
      },
    };
  }
}
