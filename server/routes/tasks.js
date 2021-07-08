// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  const verifyTaskId = async (req) => {
    const task = await app.objection.models.task.query().findById(req.params.id);
    if (!task) {
      throw app.httpErrors.notFound('Label not found.');
    }
  };

  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const filter = req.query;
      filter.status = filter.status ? Number(filter.status) : null;
      filter.executor = filter.executor ? Number(filter.executor) : null;
      filter.label = filter.label ? Number(filter.label) : null;
      filter.creator = filter.isCreatorUser ? req.user.id : null;
      const tasks = await app.objection.models.task.query()
        .withGraphJoined('[creator, executor, status, labels]')
        .modify('filterStatus', filter.status)
        .modify('filterExecutor', filter.executor)
        .modify('filterLabel', filter.label)
        .modify('filterCreator', filter.creator);
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/index', {
        tasks, users, statuses, labels, filter,
      });
      return reply;
    })
    .get('/tasks/:id', { preValidation: [app.authenticate, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id)
        .withGraphFetched('[creator, executor, status, labels]');
      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/new', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const data = { ...req.body.data };
      try {
        if (data.labels) {
          data.labels = _.concat(data.labels).map((labelId) => Number(labelId));
        } else {
          data.labels = [];
        }
        data.statusId = data.statusId ? Number(data.statusId) : null;
        data.executorId = data.executorId ? Number(data.executorId) : null;
        data.creatorId = req.user.id;

        const dataParsed = await app.objection.models.task.fromJson(data);
        const graph = {
          ...dataParsed,

          creator: {
            id: data.creatorId,
          },

          status: {
            id: data.statusId,
          },
        };

        if (data.executorId) {
          graph.executor = { id: data.executorId };
        }

        if (data.labels) {
          graph.labels = graph.labels.map((id) => ({ id }));
        }

        await app.objection.models.task.knex().transaction(async (trx) => {
          await app.objection.models.task.query(trx).insertGraph(graph, { relate: true });
        });

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
    .get('/tasks/:id/edit', { preValidation: [app.authenticate, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id)
        .withGraphFetched('[executor, status, labels]');
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const data = {
        ...task,
        labels: task.labels.map(({ id }) => id),
      };
      reply.render('tasks/edit', {
        task: data, users, statuses, labels,
      });
      return reply;
    })
    .patch('/tasks/:id/edit', { name: 'editTask', preValidation: [app.authenticate, verifyTaskId] }, async (req, reply) => {
      const data = { ...req.body.data };
      try {
        if (data.labels) {
          data.labels = _.concat(data.labels).map((labelId) => Number(labelId));
        } else {
          data.labels = [];
        }
        data.statusId = data.statusId ? Number(data.statusId) : null;
        data.executorId = data.executorId ? Number(data.executorId) : null;

        const dataParsed = await app.objection.models.task.fromJson(data);
        const graph = {
          id: Number(req.params.id),
          ...dataParsed,

          status: {
            id: data.statusId,
          },
        };

        if (data.executorId) {
          graph.executor = { id: data.executorId };
        }

        if (data.labels) {
          graph.labels = graph.labels.map((id) => ({ id }));
        }

        await app.objection.models.task.knex().transaction(async (trx) => {
          await app.objection.models.task.query(trx).upsertGraph(
            graph,
            { relate: true, unrelate: true, noUnrelate: ['creator'] },
          );
        });

        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        console.log(err);
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
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: [app.authenticate, verifyTaskId] }, async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      if (task.creatorId !== req.user.id) {
        req.flash('error', i18next.t('flash.tasks.delete.unauthorized'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }

      try {
        await task.$query().delete();
        req.flash('info', i18next.t('flash.tasks.delete.success'));
      } catch {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
      }

      reply.redirect(app.reverse('tasks'));
      return reply;
    });
};
