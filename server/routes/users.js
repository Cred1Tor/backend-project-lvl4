// @ts-check

import i18next from 'i18next';

export default (app) => {
  const authorizeById = async (req, reply, done) => {
    const user = await app.objection.models.user.query().findOne({ id: req.params.id });
    if (!user) {
      return done(app.httpErrors.notFound('User not found'));
    }
    if (!req.isAuthenticated() || req.user.id !== user.id) {
      return done(app.httpErrors.unauthorized('You can only edit your own profile'));
    }
    return done();
  };

  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/users/:id/edit', { preValidation: authorizeById }, async (req, reply) => {
      const user = await app.objection.models.user.query().findOne({ id: req.params.id });
      reply.render('users/edit', { user });
      return reply;
    })
    .patch('/users/:id/edit', { name: 'editUser', preValidation: authorizeById }, async (req, reply) => {
      try {
        const user = await app.objection.models.user.query().findOne({ id: req.params.id });
        const updatedUser = await app.objection.models.user.fromJson(req.body.data);
        await user.$query().patch(updatedUser);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (data) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user: req.body.data, errors: data });
        return reply;
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: authorizeById }, async (req, reply) => {
      try {
        await app.objection.models.user.query().deleteById(req.params.id);
        req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.render('users');
        return reply;
      }
    });
};
