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
      const tasksView = await Promise.all(tasks.map(
        async (task) => ({
          ...task,
          status: (await app.objection.models.taskStatus.query().findById(task.statusId)).name,
          creator: (await app.objection.models.user.query().findById(task.creatorId)).email,
          executor: (await app.objection.models.user.query().findById(task.executorId)).email,
        }),
      ));
      console.log(tasksView);
      reply.render('tasks/index', { tasks: tasksView });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: authorize }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('tasks/new', { task, users, statuses });
    })
    .post('/tasks', { preValidation: authorize }, async (req, reply) => {
      try {
        const { statusName, executorName } = req.body.data;
        const status = await app.objection.models.taskStatus.query().findOne({ name: statusName });
        const executor = await app.objection.models.user.query()
          .findOne({ email: executorName });
        const creator = await app.objection.models.user.query().findById(req.user.id);
        const data = await app.objection.models.task.fromJson(
          { ...req.body.data, creatorName: req.user.email },
        );
        const task = await app.objection.models.task.query().insert(data);
        await creator.$relatedQuery('createdTasks').relate(task);
        await executor.$relatedQuery('assignedTasks').relate(task);
        await status.$relatedQuery('tasks').relate(task);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        reply.render('tasks/new', {
          task: req.body.data,
          users,
          statuses,
          errors: data,
        });
        return reply;
      }
    })
    .get('/tasks/:id/edit', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id });
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('tasks/edit', { task, users, statuses });
      return reply;
    })
    .patch('/tasks/:id/edit', { name: 'editTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      try {
        const { statusName, executorName } = req.body.data;
        const status = await app.objection.models.taskStatus.query().findOne({ name: statusName });
        const executor = await app.objection.models.user.query()
          .findOne({ email: executorName });
        const task = await app.objection.models.task.query().findOne({ id: req.params.id });
        const updatedTask = await app.objection.models.task.fromJson({ ...req.body.data, creatorName: '' });
        await task.$query().patch(updatedTask);
        await executor.$relatedQuery('assignedTasks').relate(task);
        await status.$relatedQuery('tasks').relate(task);
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
