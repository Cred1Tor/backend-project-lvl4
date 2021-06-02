// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

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
      console.log('-----FILTER-----');
      const filter = req.query;
      console.log(filter);
      filter.status = filter.status ? Number(filter.status) : null;
      filter.executor = filter.executor ? Number(filter.executor) : null;
      filter.label = filter.label ? Number(filter.label) : null;
      let tasks = await app.objection.models.task.query()
        .withGraphFetched('[creator, executor, status, labels]');
      if (filter.status) {
        tasks = tasks.filter((task) => task.status.id === filter.status);
      }
      if (filter.executor) {
        tasks = tasks.filter((task) => task.executor?.id === filter.executor);
      }
      if (filter.label) {
        tasks = tasks.filter(
          (task) => task.labels?.some((label) => label.id === filter.label),
        );
      }
      if (filter?.isCreatorUser) {
        tasks = tasks.filter((task) => task.creator.id === req.user.id);
      }
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/index', {
        tasks, users, statuses, labels, filter,
      });
      return reply;
    })
    .get('/tasks/:id', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id })
        .withGraphFetched('[creator, executor, status, labels]');
      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: authorize }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .post('/tasks', { preValidation: authorize }, async (req, reply) => {
      const data = { ...req.body.data };
      try {
        if (data.labels) {
          data.labels = _.concat(data.labels).map((labelId) => Number(labelId));
        }
        data.statusId = data.statusId ? Number(data.statusId) : null;
        data.executorId = data.executorId ? Number(data.executorId) : null;
        data.creatorId = req.user.id;
        const status = await app.objection.models.taskStatus.query().findById(data.statusId);
        const executor = await app.objection.models.user.query()
          .findById(data.executorId);
        const creator = await app.objection.models.user.query().findById(data.creatorId);
        const labels = await app.objection.models.label.query().whereIn('id', data.labels);
        const dataParsed = await app.objection.models.task.fromJson(data);
        const task = await app.objection.models.task.query().insert(dataParsed);
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
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        reply.render('tasks/new', {
          task: data,
          users,
          statuses,
          labels,
          errors: err.data,
        });
        return reply;
      }
    })
    .get('/tasks/:id/edit', { preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findOne({ id: req.params.id })
        .withGraphFetched('[executor, status, labels]');
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/edit', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .patch('/tasks/:id/edit', { name: 'editTask', preValidation: [authorize, verifyTaskId] }, async (req, reply) => {
      const data = { ...req.body.data };
      try {
        data.labelIds = [];
        if (data.labels) {
          data.labels = _.concat(data.labels).map((labelId) => Number(labelId));
        }
        data.statusId = data.statusId ? Number(data.statusId) : null;
        data.executorId = data.executorId ? Number(data.executorId) : null;
        const status = await app.objection.models.taskStatus.query().findById(data.statusId);
        const executor = await app.objection.models.user.query()
          .findById(data.executorId);
        const labels = await app.objection.models.label.query().whereIn('id', data.labels);
        const task = await app.objection.models.task.query().findOne({ id: req.params.id });
        data.creatorId = task.creatorId;
        const updatedTask = await app.objection.models.task.fromJson(data);
        await task.$query().patch(updatedTask);
        await task.$relatedQuery('executor').unrelate();
        if (executor) {
          await executor.$relatedQuery('assignedTasks').relate(task);
        }
        await status.$relatedQuery('tasks').relate(task);
        await task.$relatedQuery('labels').unrelate();
        if (labels.length > 0) {
          labels.forEach(async (label) => {
            await label.$relatedQuery('tasks').relate(task);
          });
        }
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        const users = await app.objection.models.user.query();
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        reply.render('tasks/edit', {
          task: data, users, statuses, labels, errors: err.data,
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
