// @ts-check

import i18next from 'i18next';

export default (app) => {
  const authorize = (req, reply, done) => {
    if (!req.isAuthenticated()) {
      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('root'));
      return done();
    }
    return done();
  };

  const verifyLabelId = async (req, reply) => {
    const label = await app.objection.models.label.query().findOne({ id: req.params.id });
    if (!label) {
      req.flash('error', i18next.t('flash.labels.notFound'));
      reply.redirect(app.reverse('labels'));
    }
  };

  app
    .get('/labels', { name: 'labels', preValidation: authorize }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel', preValidation: authorize }, (req, reply) => {
      const label = new app.objection.models.label();
      reply.render('labels/new', { label });
    })
    .post('/labels', { preValidation: authorize }, async (req, reply) => {
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
    .get('/labels/:id/edit', { preValidation: [authorize, verifyLabelId] }, async (req, reply) => {
      const label = await app.objection.models.label.query().findOne({ id: req.params.id });
      reply.render('labels/edit', { label });
      return reply;
    })
    .patch('/labels/:id/edit', { name: 'editLabel', preValidation: [authorize, verifyLabelId] }, async (req, reply) => {
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
    .delete('/labels/:id', { name: 'deleteLabel', preValidation: [authorize, verifyLabelId] }, async (req, reply) => {
      try {
        await app.objection.models.label.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.labels.delete.success'));
      } catch {
        req.flash('error', i18next.t('flash.labels.delete.error'));
      }
      reply.redirect(app.reverse('labels'));
      return reply;
    });
};
