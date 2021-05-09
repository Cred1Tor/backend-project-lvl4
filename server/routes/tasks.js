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

  const verifyTaskId = async (req, reply) => {
    const task = await app.objection.models.task.query().findOne({ id: req.params.id });
    if (!task) {
      req.flash('error', i18next.t('flash.tasks.notFound'));
      reply.redirect(app.reverse('tasks'));
    }
  };

  app
    .get('/tasks', { name: 'tasks', preValidation: authorize }, async (req, reply) => {
      const tasks = await app.objection.models.task.query();
      reply.render('tasks/index', { tasks });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: authorize }, (req, reply) => {
      const task = new app.objection.models.task();
      reply.render('tasks/new', { task });
    })
    .post('/tasks', { preValidation: authorize }, async (req, reply) => {
      try {
        const { statusName, assignedUserName } = req.body.data;
        const status = await app.objection.models.status.query().find({ name: statusName });
        const assignedUser = await app.objection.models.user.query()
          .find({ name: assignedUserName });
        const task = await app.objection.models.task.fromJson(req.body.data);
        await assignedUser.$relatedQuery('tasks').relate(task);
        await status.$relatedQuery('tasks').relate(task);
        await app.objection.models.task.query().insert(task);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', { task: req.body.data, errors: data });
        return reply;
      }
    })
    .get('/tasks/:id/edit', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id });
      reply.render('tasks/edit', { task });
      return reply;
    })
    .patch('/tasks/:id/edit', { name: 'editTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      try {
        const { statusName, assignedUserName } = req.body.data;
        const status = await app.objection.models.status.query().find({ name: statusName });
        const assignedUser = await app.objection.models.user.query()
          .find({ name: assignedUserName });
        const task = await app.objection.models.task.query().findOne({ id: req.params.id });
        const updatedTask = await app.objection.models.task.fromJson(req.body.data);
        await assignedUser.$relatedQuery('tasks').relate(updatedTask);
        await status.$relatedQuery('tasks').relate(updatedTask);
        await task.$query().patch(updatedTask);
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (data) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        reply.render('tasks/edit', { task: req.body.data, errors: data });
        return reply;
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      try {
        await app.objection.models.task.query().deleteById(req.params.id);
        req.flash('info', i18next.t('flash.tasks.delete.success'));
      } catch {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
      }
      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
