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
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
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
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
          hasTasks: 'Статус присвоен некоторым задачам',
        },
        notFound: 'Статус не найден',
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить метку',
          success: 'Метка успешно удалена',
          hasTasks: 'Метка закреплена за некоторыми задачами',
        },
        notFound: 'Метка не найдена',
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
          unauthorized: 'Вы можете удалять только свои задачи',
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
        labels: 'Метки',
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
        fullName: 'Полное имя',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        noUsers: 'Нет пользователей :(',
        buttons: {
          edit: 'Изменить',
          delete: 'Удалить',
        },
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение пользователя',
          firstName: 'Имя',
          lastName: 'Фамилия',
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
          edit: 'Изменить',
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
      labels: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        actions: 'Действия',
        noLabels: 'Не найдено ни одной метки',
        buttons: {
          new: 'Создать метку',
          edit: 'Изменить',
          delete: 'Удалить',
        },
        new: {
          submit: 'Создать',
          creating: 'Создание метки',
          name: 'Наименование',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение метки',
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
        label: 'Метка',
        labels: 'Метки',
        actions: 'Действия',
        noTasks: 'Нет задач',
        showOnlyMyTasks: 'Показывать только мои задачи',
        buttons: {
          new: 'Создать задачу',
          edit: 'Изменить',
          delete: 'Удалить',
          show: 'Показать',
        },
        new: {
          submit: 'Создать',
          creating: 'Создание задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
          labels: 'Метки',
        },
        edit: {
          submit: 'Изменить',
          editing: 'Изменение задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
          labels: 'Метки',
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
