// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/session/new', { name: 'newSession' }, (req, reply) => {
      const signInForm = {};
      reply.render('session/new', { signInForm });
    })
    .post('/session', { name: 'session' }, app.fp.authenticate('form', async (req, reply, err, user) => {
      console.log('------------------USER------------------');
      console.log(user);
      console.log(`------ERROR------\n${err}`);
      console.log(`SIGN IN FORM\n${req.body.data}`);
      if (err) {
        console.log('-------------ERROR---------------');
        console.log(err);
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        console.log('---------- NO USER ------------');
        const signInForm = req.body.data;
        const errors = {
          email: [{ message: i18next.t('flash.session.create.error') }],
        };
        return reply.render('session/new', { signInForm, errors });
      }
      await req.logIn(user);
      req.flash('success', i18next.t('flash.session.create.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    }))
    .delete('/session', (req, reply) => {
      req.logOut();
      req.flash('info', i18next.t('flash.session.delete.success'));
      reply.redirect(app.reverse('root'));
    });
};
