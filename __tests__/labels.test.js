// @ts-check

import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(params);
  });

  it('update', async () => {
    const { id } = await models.label.query().findOne({
      name: testData.labels.existing1.name,
    });
    const params = testData.labels.new;

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('editLabel', { id }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseUpdate.statusCode).toBe(302);
    const updatedLabel = await models.label.query().findById(id);
    expect(updatedLabel).toMatchObject(params);
  });

  it('delete', async () => {
    const { id: id1 } = await models.label.query().findOne({
      name: testData.labels.existing1.name,
    });

    const responseDelete1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: id1 }),
      cookies: cookie,
    });

    expect(responseDelete1.statusCode).toBe(302);
    const deletedLabel1 = await models.label.query().findById(id1);
    expect(deletedLabel1).not.toBeUndefined();

    const { id: id2 } = await models.label.query().findOne({
      name: testData.labels.existing2.name,
    });

    const responseDelete2 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: id2 }),
      cookies: cookie,
    });

    expect(responseDelete2.statusCode).toBe(302);
    const deletedLabel2 = await models.label.query().findById(id2);
    expect(deletedLabel2).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
