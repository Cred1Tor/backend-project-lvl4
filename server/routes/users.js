// @ts-check

import i18next from 'i18next';

export default (app) => {
  const authorizeById = async (req, reply) => {
    const user = await app.objection.models.user.query().findOne({ id: req.params.id });
    if (!user) {
      req.flash('error', i18next.t('flash.users.notFound'));
      reply.redirect(app.reverse('users'));
      return;
    }
    if (!req.isAuthenticated()) {
      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('users'));
    } else if (req.user.id !== user.id) {
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
        const user = await app.objection.models.user.fromJson(req.body.data);
        console.log('----------user email---------');
        console.log(user.email);
        console.log('----------user password----------');
        console.log(req.body.data.password);
        console.log('---------salt---------');
        console.log(user.passwordDigest);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
        console.log('--------USER ADDED-------');
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
        const tasks = await app.objection.models.user.relatedQuery('assignedTasks').for(req.params.id);
        if (tasks.length > 0) {
          req.flash('error', i18next.t('flash.users.delete.hasTasks'));
          reply.redirect(app.reverse('users'));
          return reply;
        }
        await app.objection.models.user.query().deleteById(req.params.id);
        req.logOut();
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
    });
};
