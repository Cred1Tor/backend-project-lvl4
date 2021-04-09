module.exports = {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          success: 'Пользователь успешно изменен',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удален',
        },
        notFound: 'Пользователь не найден',
        unauthorized: 'Вы не можете редактировать или удалять другого пользователя',
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменен',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удален',
        },
        notFound: 'Статус не найден',
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        buttons: {
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение пользователя',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
        buttons: {
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          submit: 'Создать',
          creating: 'Создание статуса',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение статуса',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
    },
  },
};
