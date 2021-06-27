// @ts-check

import i18next from 'i18next';

export default (app) => {
  const verifyStatusId = async (req, reply, next) => {
    const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
    if (!status) {
      const err = app.httpErrors.notFound('Status not found.');
      next(err);
    }
  };

  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, (req, reply) => {
      const status = new app.objection.models.taskStatus();
      reply.render('statuses/new', { status });
    })
    .post('/statuses', { preValidation: app.authenticate }, async (req, reply) => {
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
    .get('/statuses/:id/edit', { preValidation: [app.authenticate, verifyStatusId] }, async (req, reply) => {
      const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
      reply.render('statuses/edit', { status });
      return reply;
    })
    .patch('/statuses/:id/edit', { name: 'editStatus', preValidation: [app.authenticate, verifyStatusId] }, async (req, reply) => {
      try {
        const status = await app.objection.models.taskStatus.query().findOne({ id: req.params.id });
        const updatedStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await status.$query().patch(updatedStatus);
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status: req.body.data, errors: data });
        return reply;
      }
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: [app.authenticate, verifyStatusId] }, async (req, reply) => {
      const status = await app.objection.models.taskStatus.query().findById(req.params.id);
      const tasks = await status.$relatedQuery('tasks');
      if (tasks.length > 0) {
        req.flash('error', i18next.t('flash.statuses.delete.hasTasks'));
      } else {
        try {
          await app.objection.models.taskStatus.query().deleteById(req.params.id);
          req.flash('info', i18next.t('flash.statuses.delete.success'));
        } catch {
          req.flash('error', i18next.t('flash.statuses.delete.error'));
        }
      }
      reply.redirect(app.reverse('statuses'));
      return reply;
    });
};
