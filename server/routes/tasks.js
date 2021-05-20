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
          statusName: (await app.objection.models.taskStatus.query().findById(task.statusId))?.name,
          creatorName: (await app.objection.models.user.query().findById(task.creatorId))?.email,
          executorName: (await app.objection.models.user.query().findById(task.executorId))?.email,
        }),
      ));
      reply.render('tasks/index', { tasks: tasksView });
      return reply;
    })
    .get('/tasks/:id', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id });
      const statusName = (
        await app.objection.models.taskStatus.query().findById(task.statusId)
      )?.name;
      const creatorName = (await app.objection.models.user.query().findById(task.creatorId))?.email;
      const executorName = (
        await app.objection.models.user.query().findById(task.executorId)
      )?.email;
      const labels = await task.$relatedQuery('labels');
      const labelNames = labels.map(({ name }) => name);
      const taskView = {
        ...task, statusName, creatorName, executorName, labelNames,
      };
      reply.render('tasks/view', { task: taskView });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: authorize }, async (req, reply) => {
      try {
        console.log('ZDAROVA');
        const task = new app.objection.models.task();
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        console.log('EVERYTHING LOADED');
        reply.render('tasks/new', {
          task, users, statuses, labels,
        });
        console.log('RENDERED');
      } catch (e) {
        console.log('BOOM');
        console.log(e);
        throw e;
      }
    })
    .post('/tasks', { preValidation: authorize }, async (req, reply) => {
      try {
        const { statusName, executorName, labelNames } = req.body.data;
        const status = await app.objection.models.taskStatus.query().findOne({ name: statusName });
        const executor = await app.objection.models.user.query()
          .findOne({ email: executorName });
        const creator = await app.objection.models.user.query().findById(req.user.id);
        const labelNamesArr = [];
        if (labelNames) {
          if (Array.isArray(labelNames)) {
            labelNamesArr.push(...labelNames);
          } else {
            labelNamesArr.push(labelNames);
          }
        }
        const labels = await app.objection.models.label.query().whereIn('name', labelNamesArr);
        const data = await app.objection.models.task.fromJson(
          { ...req.body.data, creatorName: req.user.email, labelNames: labelNamesArr },
        );
        const task = await app.objection.models.task.query().insert(data);
        await creator.$relatedQuery('createdTasks').relate(task);
        if (executor) {
          await executor.$relatedQuery('assignedTasks').relate(task);
        }
        await status.$relatedQuery('tasks').relate(task);
        if (labels.length > 0) {
          labels.forEach(async (label) => {
            await label.$relatedQuery('tasks').relate(task);
          });
        }
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        reply.render('tasks/new', {
          task: req.body.data,
          users,
          statuses,
          labels,
          errors: data,
        });
        return reply;
      }
    })
    .get('/tasks/:id/edit', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id });
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const statusName = (
        await app.objection.models.taskStatus.query().findById(task.statusId)
      )?.name;
      const executorName = (
        await app.objection.models.user.query().findById(task.executorId)
      )?.email;
      const labelNames = (
        await task.$relatedQuery('labels').select('name')
      );
      const taskView = {
        ...task, statusName, executorName, labelNames,
      };
      reply.render('tasks/edit', {
        task: taskView, users, statuses, labels,
      });
      return reply;
    })
    .patch('/tasks/:id/edit', { name: 'editTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      try {
        const { statusName, executorName, labelNames } = req.body.data;
        const status = await app.objection.models.taskStatus.query().findOne({ name: statusName });
        const executor = await app.objection.models.user.query()
          .findOne({ email: executorName });
        const labelNamesArr = [];
        if (labelNames) {
          if (Array.isArray(labelNames)) {
            labelNamesArr.push(...labelNames);
          } else {
            labelNamesArr.push(labelNames);
          }
        }
        const labels = await app.objection.models.label.query().whereIn('name', labelNamesArr);
        const task = await app.objection.models.task.query().findOne({ id: req.params.id });
        const updatedTask = await app.objection.models.task.fromJson({ ...req.body.data, labelNames: labelNamesArr, creatorName: '' });
        await task.$query().patch(updatedTask);
        if (executor) {
          await executor.$relatedQuery('assignedTasks').relate(task);
        }
        await status.$relatedQuery('tasks').relate(task);
        if (labels.length > 0) {
          labels.forEach(async (label) => {
            await label.$relatedQuery('tasks').relate(task);
          });
        }
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        reply.render('tasks/edit', {
          task: req.body.data, users, statuses, errors: data,
        });
        return reply;
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      if (task.creatorId !== req.user.id) {
        req.flash('error', i18next.t('flash.tasks.delete.unauthorized'));
      } else {
        try {
          await task.$query().delete();
          req.flash('info', i18next.t('flash.tasks.delete.success'));
        } catch {
          req.flash('error', i18next.t('flash.tasks.delete.error'));
        }
      }
      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
