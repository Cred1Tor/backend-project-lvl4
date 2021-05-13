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
          hasTasks: 'Пользователь закреплен за некоторыми задачами',
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
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалена',
        },
        notFound: 'Задача не найдена',
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
        tasks: 'Задачи',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
          email: 'Email',
          password: 'Пароль',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        noUsers: 'Нет пользователей :(',
        buttons: {
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
          email: 'Email',
          password: 'Пароль',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение пользователя',
          email: 'Email',
          password: 'Пароль',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
        noStatuses: 'Не найдено ни одного статуса, попробуйте создать новый',
        buttons: {
          new: 'Создать статус',
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          submit: 'Создать',
          creating: 'Создание статуса',
          name: 'Наименование',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение статуса',
          name: 'Наименование',
        },
      },
      tasks: {
        id: 'ID',
        name: 'Наименование',
        description: 'Описание',
        status: 'Статус',
        creator: 'Создатель',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        actions: 'Действия',
        noTasks: 'Нет задач',
        buttons: {
          new: 'Создать задачу',
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        new: {
          submit: 'Создать',
          creating: 'Создание статуса',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
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
