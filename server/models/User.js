// @ts-check

import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel';

import encrypt from '../lib/secure.js';

const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(BaseModel) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }

  get name() {
    return `${this.firstName} ${this.lastName}`;
  }

  static get relationMappings() {
    return {
      createdTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task',
        join: {
          from: 'users.id',
          to: 'tasks.creatorId',
        },
      },
      assignedTasks: {
        relation: BaseModel.HasManyRelation,
        modelClass: 'Task',
        join: {
          from: 'users.id',
          to: 'tasks.executorId',
        },
      },
    };
  }
}
