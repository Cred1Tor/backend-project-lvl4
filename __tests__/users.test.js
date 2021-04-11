// @ts-check

import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
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
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('update', async () => {
    const cookie = await signIn(app, testData.users.existing);
    const { id } = await models.user.query().findOne({ email: testData.users.existing.email });
    const params = testData.users.new;

    const responseUpdate = await app.inject({
      method: 'PATCH',
      url: app.reverse('editUser', { id }),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(responseUpdate.statusCode).toBe(302);
    const updatedUser = await models.user.query().findById(id);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    expect(updatedUser).toMatchObject(expected);
  });

  it('delete', async () => {
    const cookie = await signIn(app, testData.users.existing);
    const { id } = await models.user.query().findOne({ email: testData.users.existing.email });

    const responseDelete = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id }),
      cookies: cookie,
    });

    expect(responseDelete.statusCode).toBe(302);
    const deletedUser = await models.user.query().findById(id);
    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
