// @ts-check

import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
];

export default (app) => controllers.forEach((f) => f(app));
