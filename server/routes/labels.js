// @ts-check

import i18next from 'i18next';

export default (app) => {
  const verifyLabelId = async (req, reply, next) => {
    const label = await app.objection.models.label.query().findOne({ id: req.params.id });
    if (!label) {
      const err = app.httpErrors.notFound('Label not found.');
      next(err);
    }
  };

  app
    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel', preValidation: app.authenticate }, (req, reply) => {
      const label = new app.objection.models.label();
      reply.render('labels/new', { label });
    })
    .post('/labels', { preValidation: app.authenticate }, async (req, reply) => {
      try {
        const label = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(label);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/labels/:id/edit', { preValidation: [app.authenticate, verifyLabelId] }, async (req, reply) => {
      const label = await app.objection.models.label.query().findOne({ id: req.params.id });
      reply.render('labels/edit', { label });
      return reply;
    })
    .patch('/labels/:id/edit', { name: 'editLabel', preValidation: [app.authenticate, verifyLabelId] }, async (req, reply) => {
      try {
        const label = await app.objection.models.label.query().findOne({ id: req.params.id });
        const updatedLabel = await app.objection.models.label.fromJson(req.body.data);
        await label.$query().patch(updatedLabel);
        req.flash('info', i18next.t('flash.labels.edit.success'));
        reply.redirect(app.reverse('labels'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.edit.error'));
        reply.render('labels/edit', { label: req.body.data, errors: data });
        return reply;
      }
    })
    .delete('/labels/:id', { name: 'deleteLabel', preValidation: [app.authenticate, verifyLabelId] }, async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      const tasks = await label.$relatedQuery('tasks');
      if (tasks.length > 0) {
        req.flash('error', i18next.t('flash.labels.delete.hasTasks'));
      } else {
        try {
          await app.objection.models.label.query().deleteById(req.params.id);
          req.flash('info', i18next.t('flash.labels.delete.success'));
        } catch {
          req.flash('error', i18next.t('flash.labels.delete.error'));
        }
      }
      reply.redirect(app.reverse('labels'));
      return reply;
    });
};
