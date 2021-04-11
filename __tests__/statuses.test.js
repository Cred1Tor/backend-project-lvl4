// @ts-check

import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
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

  it('unauthorized', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
    });

    expect(response.statusCode).toBe(401);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.statuses.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statuses'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const taskStatus = await models.taskStatus.query().findOne({ name: params.name });
    expect(taskStatus).toMatchObject(params);
  });

  it('update', async () => {
    const { id } = await models.taskStatus.query().findOne({
      name: testData.statuses.existing.name,
    });
    const params = testData.statuses.new;

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('editStatus', { id }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseUpdate.statusCode).toBe(302);
    const updatedStatus = await models.taskStatus.query().findById(id);
    expect(updatedStatus).toMatchObject(params);
  });

  it('delete', async () => {
    const { id } = await models.taskStatus.query().findOne({
      name: testData.statuses.existing.name,
    });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    const deletedStatus = await models.taskStatus.query().findById(id);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
