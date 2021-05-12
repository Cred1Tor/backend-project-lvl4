// @ts-check

import _ from 'lodash';
import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
    cookie = await signIn(app, testData.users.existing);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const task = await models.task.query().findOne({ name: params.name });
    const { statusName, executorName } = params;
    const { id: statusId } = await app.objection.models.taskStatus.query()
      .findOne({ name: statusName });
    const { id: assignedUserId } = await app.objection.models.user.query()
      .findOne({ email: executorName });
    const data = {
      ..._.omit(params, ['executorName', 'statusName']),
      statusId: statusId.toString(),
      assignedUserId: assignedUserId.toString(),
    };
    expect(task).toMatchObject(data);
  });

  it('update', async () => {
    const { id } = await models.task.query().findOne({
      name: testData.tasks.existing.name,
    });
    const params = testData.tasks.new;

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('editTask', { id }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseUpdate.statusCode).toBe(302);
    const updatedTask = await models.task.query().findById(id);
    const { statusName, executorName } = params;
    const { id: statusId } = await app.objection.models.taskStatus.query()
      .findOne({ name: statusName });
    const { id: assignedUserId } = await app.objection.models.user.query()
      .findOne({ email: executorName });
    const data = {
      ..._.omit(params, ['executorName', 'statusName']),
      statusId: statusId.toString(),
      assignedUserId: assignedUserId.toString(),
    };
    expect(updatedTask).toMatchObject(data);
  });

  it('delete', async () => {
    const { id } = await models.task.query().findOne({
      name: testData.tasks.existing.name,
    });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    const deletedTask = await models.task.query().findById(id);
    expect(deletedTask).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
