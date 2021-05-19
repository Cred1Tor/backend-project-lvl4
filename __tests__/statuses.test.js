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
    cookie = await signIn(app, testData.users.existing1);
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
      name: testData.statuses.existing1.name,
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
    const { id: id1 } = await models.taskStatus.query().findOne({
      name: testData.statuses.existing1.name,
    });

    const responseDelete1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: id1 }),
      cookies: cookie,
    });

    expect(responseDelete1.statusCode).toBe(302);
    const deletedStatus1 = await models.taskStatus.query().findById(id1);
    expect(deletedStatus1).not.toBeUndefined();

    const { id: id2 } = await models.taskStatus.query().findOne({
      name: testData.statuses.existing2.name,
    });

    const responseDelete2 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: id2 }),
      cookies: cookie,
    });

    expect(responseDelete2.statusCode).toBe(302);
    const deletedStatus2 = await models.taskStatus.query().findById(id2);
    expect(deletedStatus2).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
