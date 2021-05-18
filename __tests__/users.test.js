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
    const cookie = await signIn(app, testData.users.existing1);
    const { id } = await models.user.query().findOne({ email: testData.users.existing1.email });
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
    const cookie1 = await signIn(app, testData.users.existing1);
    const { id: id1 } = await models.user.query().findOne(
      { email: testData.users.existing1.email },
    );

    const responseDelete1 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: id1 }),
      cookies: cookie1,
    });

    expect(responseDelete1.statusCode).toBe(302);
    const user1 = await models.user.query().findById(id1);
    expect(user1).not.toBeUndefined();

    const cookie2 = await signIn(app, testData.users.existing2);
    const { id: id2 } = await models.user.query().findOne(
      { email: testData.users.existing2.email },
    );

    const responseDelete2 = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: id2 }),
      cookies: cookie2,
    });

    expect(responseDelete2.statusCode).toBe(302);
    const user2 = await models.user.query().findById(id2);
    expect(user2).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
