// @ts-check

import i18next from 'i18next';

export default (app) => {
  const authorize = async (req, reply, done) => {
    if (!req.isAuthenticated()) {
      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return reply;
    }
    return done();
  };

  const verifyStatusId = async (req, reply, done) => {
    const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
    if (!status) {
      req.flash('error', i18next.t('flash.statuses.notFound'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    }
    return done();
  };

  app
    .get('/statuses', { name: 'statuses', preValidation: authorize }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: authorize }, (req, reply) => {
      const status = new app.objection.models.taskStatus();
      reply.render('statuses/new', { status });
    })
    .post('/statuses', { preValidation: authorize }, async (req, reply) => {
      try {
        const status = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(status);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/statuses/:id/edit', { preValidation: [authorize, verifyStatusId] }, async (req, reply) => {
      const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
      reply.render('statuses/edit', { status });
      return reply;
    })
    .patch('/statuses/:id/edit', { name: 'editStatus', preValidation: [authorize, verifyStatusId] }, async (req, reply) => {
      try {
        const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
        const updatedStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await status.$query().patch(updatedStatus);
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('root'));
        return reply;
      } catch (data) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status: req.body.data, errors: data });
        return reply;
      }
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: [authorize, verifyStatusId] }, async (req, reply) => {
      try {
        await app.objection.models.taskStatus.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.render('statuses/index');
        return reply;
      } catch {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.render('statuses/index');
        return reply;
      }
    });
};
