// @ts-check

import i18next from 'i18next';

export default (app) => {
  const authorizeById = async (req, reply) => {
    const user = await app.objection.models.user.query().findById(req.params.id);
    if (!user) {
      throw app.httpErrors.notFound('User not found.');
    }

    if (req.user.id !== user.id) {
      req.flash('error', i18next.t('flash.users.unauthorized'));
      reply.redirect(app.reverse('users'));
    }
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
        await app.objection.models.user.query().insert(req.body.data);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: err.data });
        return reply;
      }
    })
    .get('/users/:id/edit', { preValidation: [app.authenticate, authorizeById] }, async (req, reply) => {
      const user = await app.objection.models.user.query().findById(req.params.id);
      reply.render('users/edit', { user });
      return reply;
    })
    .patch('/users/:id/edit', { name: 'editUser', preValidation: [app.authenticate, authorizeById] }, async (req, reply) => {
      try {
        const user = await app.objection.models.user.query().findById(req.params.id);
        await user.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user: req.body.data, errors: err.data });
        return reply;
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: [app.authenticate, authorizeById] }, async (req, reply) => {
      try {
        const user = await app.objection.models.user.query().findById(req.params.id);
        const assignedTasks = await user.$relatedQuery('assignedTasks');
        const createdTasks = await user.$relatedQuery('createdTasks');

        if (assignedTasks.length > 0) {
          req.flash('error', i18next.t('flash.users.delete.hasAssignedTasks'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        if (createdTasks.length > 0) {
          req.flash('error', i18next.t('flash.users.delete.hasCreatedTasks'));
          reply.redirect(app.reverse('users'));
          return reply;
        }

        await user.$query().delete();
        req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
    });
};
