// toursRegistry.js
import { driver } from "driver.js";

export const TOUR_ORDER = ["departments", "positions", "employees"]; // добавляй новые id сюда

const handlePopoverRender = (drv, popover, skipType) => {
  const skip = document.createElement("button");
  skip.innerText = "Пропустить";
  skip.classList.add("driver-skip-btn");
  skip.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Пропустить обучение по ${skipType}?`)) {
      if (drv && typeof drv.destroy === "function") drv.destroy();
    }
  };
  if (popover.footerButtons) popover.footerButtons.appendChild(skip);
};

const errorEmptyInput = (element, options, message) => {
  const input = element.querySelector("input");
  const value = input?.value?.trim() || "";

  if (value.length === 0) {
    input.classList.add("input-error");
    input.focus();

    import("sonner").then(({ toast }) => {
      toast.error(message);
    });

    return false;
  }

  options.driver.moveNext();
  return true;
};

// ===== Utils: ожидание селектора + удобный cleanup
function waitForSelector(selector, onFound, { timeout = 10000 } = {}) {
  const el = document.querySelector(selector);
  if (el) {
    onFound(el);
    return () => {};
  }

  let done = false;
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    observer.disconnect();
  }, timeout);

  const observer = new MutationObserver(() => {
    const elNow = document.querySelector(selector);
    if (elNow) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      observer.disconnect();
      onFound(elNow);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  return () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    observer.disconnect();
  };
}

// небольшой сахар, чтобы хранить и чистить cleanup на DOM-элементе шага
function attachWaitCleanup(target, cleanup) {
  if (!target) return;
  if (target._tourCleanup) target._tourCleanup();
  target._tourCleanup = cleanup;
}
function clearWaitCleanup(target) {
  if (!target) return;
  target._tourCleanup?.();
  delete target._tourCleanup;
}

// спец-обёртка под меню по data-tour -> перейти на шаг moveStep
function waitForMenuAndGo(options, dataTour, moveStep, cfg) {
  return waitForSelector(
    `[data-tour="${dataTour}"]`,
    () => {
      setTimeout(() => options.driver.moveTo(moveStep), 150);
    },
    cfg
  );
}

function closeDropdownAndGo(
  headerSelector,
  menuSelector,
  options,
  { maxWait = 600, afterCloseDelay = 40 } = {}
) {
  const header = document.querySelector(headerSelector);
  const wasOpen = !!document.querySelector(menuSelector);

  if (wasOpen && header) {
    header.click(); // инициируем закрытие
  }

  const t0 = performance.now();

  const waitClosed = () => {
    const stillOpen = !!document.querySelector(menuSelector);
    const elapsed = performance.now() - t0;

    if (!stillOpen) {
      setTimeout(() => options.driver.moveNext(), afterCloseDelay);
      return;
    }
    if (elapsed > maxWait) {
      // фоллбэк: если вдруг меню не закрылось — идём дальше
      options.driver.moveNext();
      return;
    }
    requestAnimationFrame(waitClosed);
  };

  waitClosed();
}

// ✅ универсально для single и multi
const requireOptionSelected = (
  selector,
  regex,
  message,
  {
    // для single
    labelSelector = "span",
    // для multi (оставляем авто-детект)
    isMulti, // можно явно указать true/false при желании
    multiTagSelector = '[class*="multiValueTag"]', // теги выбранных значений
  } = {}
) => {
  const header = document.querySelector(selector);
  if (!header) {
    console.warn("requireOptionSelected: header not found", selector);
    return false;
  }

  // Авто-детект мультиселекта по наличию тегов в хедере
  const isMultiMode =
    typeof isMulti === "boolean"
      ? isMulti
      : !!header.querySelector(multiTagSelector);

  let ok = false;

  if (isMultiMode) {
    // MULTI: считем выбранные теги
    const tags = header.querySelectorAll(multiTagSelector);
    ok = tags && tags.length > 0;
  } else {
    // SINGLE: проверяем текст лейбла (и плейсхолдер по regex)
    const label =
      header.querySelector(labelSelector) ||
      header.querySelector('[data-tour$=".label"]'); // fallback
    const text = (label?.textContent || "").trim();
    ok = !!text && !(regex && regex.test(text));
  }

  if (!ok) {
    header.classList.add("input-error");
    setTimeout(() => header.classList.remove("input-error"), 1200);

    import("sonner")
      .then(({ toast }) => toast.error(message))
      .catch(() => console.warn("sonner not found"));

    return false; // блокируем переход
  }

  return true; // разрешаем дефолтный Next
};

export const ToursRegistry = {
  departments: {
    id: "departments",
    route: "/departments",
    readySelectors: ['[data-tour="menu.departments"]'],
    create: (ctx) => {
      let drv; // замыкание нужно, чтобы из onPopoverRender можно было вызвать destroy()
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Шаг {{current}} из {{total}}",
        nextBtnText: "Дальше",
        prevBtnText: "Назад",

        onDestroyed: () => {
          // завершение (нормальное или по Skip)
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "подразделениям");
        },

        steps: [
          {
            element: '[data-tour="menu.departments"]',
            popover: {
              title: `Раздел "Подразделения"`,
              description: `В этом разделе вы создаёте подразделения — например, разные пункты выдачи, магазины или команды.
                Это помогает распределять сотрудников по местам работы и задавать каждому подразделению своё расписание.

                Даже если у вас всего одна точка, подразделение всё равно нужно — в нём указываются <b>часовой пояс</b>, <b>время начала</b> и <b>окончания рабочего дня</b>, чтобы система знала, когда отправлять уведомления и задачи сотрудникам.
                Без этого приложение не сможет корректно работать.

                Нажмите <b>“Подразделения”</b> в левом меню, чтобы открыть этот раздел.`,
              nextBtnText: "К созданию",
              onNextClick: (element, step, options) => {
                options.driver.drive(1);
                //   navigate("/departments");
              },
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="departments.add"]',
            popover: {
              title: "Добавляем новое подразделение",
              description: `Нажмите <b>“Добавить”</b>, чтобы открыть форму добавления подразделения. \n
                В ней вы сможете указать основные параметры:
                <b>название, часовой пояс, время начала и окончания рабочего дня</b>, а также <b>при необходимости</b> добавить <b>описание</b> и <b>отметить</b> подразделение как используемое <b>по умолчанию</b>.`,
              onNextClick: (element) => {
                element?.click();
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="modal.nameInput"]',
            popover: {
              title: "Название подразделения",
              description: `Введите понятное название — например: \n
                <small><i>Пункт выдачи на ул. Зеленая, 16</i></small> \n
                Это поможет быстро различать подразделения в списках и настройках.`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Введите название подразделения, чтобы продолжить"
                );
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="modal.timezone"]',
            popover: {
              title: "Укажите часовой пояс",
              description: `Если ваши подразделения находятся в <b>разных городах</b> — выберите <b>правильный</b> часовой пояс. \n
                Так уведомления <small>(например, о начале смены)</small> будут приходить в <b>правильное локальное время</b>.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                // 1) запускаем «ждуна» только по кнопке "Дальше"
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "modal.timezone.menu", 4) // ← индекс шага с меню
                );
                // 2) открываем меню кликом по хедеру
                element
                  .querySelector('[data-tour="modal.timezone.header"]')
                  ?.click();
                return false; // дальше двинемся сами, когда меню появится
              },
            },
            onHighlighted: (element, _step, options) => {
              // НЕ открываем меню здесь!
              // Добавим обработчик — если пользователь сам кликнет по хедеру, мы запустим «ждуна»
              const header =
                element.querySelector('[data-tour="modal.timezone.header"]') ||
                document.querySelector('[data-tour="modal.timezone.header"]');

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "modal.timezone.menu", 4)
                );
              };

              if (header) {
                // снимем старый, если был
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },
            onDeselected: (element) => {
              // снимаем ожидание и обработчик клика
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
              // ничего не закрываем насильно — пользователь сам контролирует
            },
          },
          {
            element: '[data-tour="modal.timezone.menu"]',
            popover: {
              title: "Выбор часового пояса",
              description: `Выберите часовой пояс, в котором работает подразделение.\n
                Это нужно, чтобы уведомления и расписание задач <b>совпадали с местным временем сотрудников</b>.\n
                Например, если подразделение находится в Калининграде, выберите UTC+2, а если в Москве — UTC+3.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="modal.timezone.header"]';
                const menuSel = '[data-tour="modal.timezone.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+часовой\s+пояс/i,
                  "Пожалуйста, выберите часовой пояс"
                );
                if (!ok) return false;

                // закрываем дропдаун и только после этого — Next
                closeDropdownAndGo(headerSel, menuSel, options);
                return false; // предотвращаем двойной переход
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="modal.timezone.header"]';
              const menuSel = '[data-tour="modal.timezone.menu"]';

              // универсальный селектор опций (под ваш кастомный селект)
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // даём UI дорисовать выбранное значение
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /выберите\s+часовой\s+пояс/i,
                    ""
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // убираем старый обработчик, если был
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);

              // НИЧЕГО САМО НЕ ОТКРЫВАЕМ — меню уже открыто на этом шаге
              // и не делаем options.driver.moveNext() «на любой клик»
            },

            onDeselected: (element) => {
              element._menuOff?.();
              delete element._menuOff;

              // закрыть меню, если вдруг осталось открытым
              const header = document.querySelector(
                '[data-tour="modal.timezone.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="modal.timezone.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="modal.check-in-time"]',
            popover: {
              title: "Время начала работы",
              description: `Укажите время, когда сотрудники <b>начинают рабочий день</b>.\n
                В этот момент им приходит уведомление в Телеграм, чтобы <b>"отметиться"</b> <small>(сделать чек-ин)</small> и получить задачи. \n
                <small><i>Например: 09:00</i></small>.`,
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(3);
              },
            },
          },
          {
            element: '[data-tour="modal.check-out-time"]',
            popover: {
              title: "Время окончания работы",
              description: `Укажите время, когда сотрудники <b>могут завершить день</b>.\n
                Если кто-то сделает чек-аут <b>раньше</b> — его <b>невыполненные</b> задачи будут <b>отмечены красным</b>.`,
            },
          },
          {
            element: '[data-tour="modal.description"]',
            popover: {
              title: "Добавьте описание (по желанию)",
              description: `Коротко опишите подразделение — где оно находится и чем занимается. \n
                Это <b>необязательно</b>, но помогает при большом количестве подразделений. \n
                <small><i>Пример: "Пункт выдачи Wildberries в ТЦ Мега, смена с 9 до 21."</i></small>`,
            },
          },
          {
            element: '[data-tour="modal.default"]',
            popover: {
              title: "Подразделение по умолчанию",
              description: `Это подразделение сейчас отмечено как <b>по умолчанию</b>. \n
                Все новые сотрудники, которые добавляются через <b>Телеграм-бота</b>, будут автоматически прикрепляться именно сюда.

                В системе всегда должно быть <b>одно подразделение по умолчанию</b>, чтобы система точно знала, куда прикреплять новых сотрудников.

                Если вы снимете отметку и не выберете другое подразделение, появится уведомление с просьбой назначить подразделение по умолчанию, и часть функций <small>(например, добавление сотрудников через бота)</small> работать не будет.`,
            },
          },
          {
            element: '[data-tour="modal.submit"]',
            popover: {
              title: "Сохраняем подразделение",
              description: `Отлично! Теперь нажмите <b>"Создать подразделение"</b>, чтобы сохранить изменения. \n
                Оно появится в общем списке, и вы сможете назначать для него задачи и сотрудников.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="modal.submit"]'
                );
                btn?.click();
              },
            },
            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener("tour:submit:success", onSuccess, {
                once: true,
              });
              window.addEventListener("tour:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener("tour:submit:success", onSuccess);
                window.removeEventListener("tour:submit:fail", onFail);
              };
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Подразделение создано!",
              description: `Поздравляем! 🎉 \n
                Следующий шаг — перейти к разделу <b>“Должности”</b>, где вы узнаете, как создавать должности, чтобы в будущем выбирать их при назначении задач.\n
                Нажмите <b>“К должностям”</b>, чтобы продолжить обучение.`,
              nextBtnText: "К должностям",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
              },
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },

  positions: {
    id: "positions",
    route: "/positions",
    readySelectors: ['[data-tour="menu.positions"]'],
    create: (ctx) => {
      let drv;
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Шаг {{current}} из {{total}}",
        nextBtnText: "Дальше",
        prevBtnText: "Назад",

        onDestroyed: () => {
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "должностям");
        },

        steps: [
          // ---- ВСТАВЬ СВОИ ШАГИ ДЛЯ СОТРУДНИКОВ ----
          {
            element: '[data-tour="menu.positions"]',
            popover: {
              title: "Что такое должности",
              description: `Здесь вы создаёте <b>должности сотрудников</b> — например, <i>менеджер</i>, <i>курьер</i> или <i>оператор пункта выдачи</i>.\n
                Должности помогают систематизировать сотрудников и в будущем назначать им подходящие задачи.\n
                Нажмите <b>“Должности”</b> в левом меню, чтобы открыть этот раздел.`,
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
          },
          {
            element: '[data-tour="positions.add"]',
            popover: {
              title: "Добавляем новую должность",
              description: `Нажмите кнопку <b>“Добавить”</b>, чтобы создать новую должность. \n
                Вы сможете указать её название и, при необходимости, описание.\n
                После этого сотрудники смогут быть назначены на эту должность.`,
              onNextClick: (element) => {
                element?.click();
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="modal.position.name"]',
            popover: {
              title: "Название должности",
              description: `Введите понятное и короткое название должности — например: <i>Администратор пункта выдачи, Курьер</i> или <i>Оператор склада</i>.\n
                Выбирайте формулировку, которая ясно показывает, чем занимается сотрудник.`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Введите название должности, чтобы продолжить"
                );
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="modal.position.description"]',
            popover: {
              title: "Описание (по желанию)",
              description: `Если нужно, добавьте короткое описание. \n
                <small><i>Например: принимает заказы и следит за чистотой в пункте выдачи.</i></small> \n
                Это поможет другим пользователям понять, зачем создана эта должность.\n
                Поле необязательно — можно пропустить.`,
              onNextClick: (element, step, options) => {
                options.driver.moveNext();
              },
            },
          },
          {
            element: '[data-tour="modal.position.submit"]',
            popover: {
              title: "Сохраняем должность",
              description: `Нажмите <b>“Создать”</b>, чтобы добавить должность.\n
                Она появится в общем списке, и вы сможете назначать сотрудников на неё.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="modal.position.submit"]'
                );
                btn?.click();
              },
            },

            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveNext();
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener(
                "tour:position:submit:success",
                onSuccess,
                {
                  once: true,
                }
              );
              window.addEventListener("tour:position:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:position:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:position:submit:fail", onFail);
              };
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Готово! 🎉",
              description: `Вы создали свою первую <b>должность</b>.\n
                Теперь вы можете добавлять <b>сотрудников</b> и назначать им подходящие должности — это поможет системе правильно распределять задачи.\n
                Следующий шаг — перейти к разделу <b>“Сотрудники”</b>, где вы создадите карточки сотрудников и настроите их график работы.\n
                Нажмите <b>“К сотрудникам”</b>, чтобы продолжить обучение.`,
              nextBtnText: "К сотрудникам",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
              },
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },

  employees: {
    id: "employees",
    route: "/employees",
    readySelectors: ['[data-tour="menu.employees"]'],
    create: (ctx) => {
      let drv; // замыкание нужно, чтобы из onPopoverRender можно было вызвать destroy()
      const config = {
        showProgress: true,
        smoothScroll: true,
        allowClose: false,
        popoverClass: "driverjs-theme-dark",
        progressText: "Шаг {{current}} из {{total}}",
        nextBtnText: "Дальше",
        prevBtnText: "Назад",

        onDestroyed: () => {
          // завершение (нормальное или по Skip)
          ctx.complete();
        },

        onPopoverRender: (popover) => {
          handlePopoverRender(drv, popover, "сотрудникам");
        },

        steps: [
          {
            element: '[data-tour="menu.employees"]',
            popover: {
              title: `Раздел “Сотрудники”`,
              description: `Здесь вы управляете сотрудниками компании — добавляете новых, назначаете им подразделения и настраиваете график работы.\n
                Нажмите <b>“Сотрудники”</b> в левом меню, чтобы открыть этот раздел.`,
              nextBtnText: "К созданию",
              onNextClick: (element, step, options) => {
                options.driver.moveTo(1);
              },
            },
            onHighlighted: (element, step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="employees.add"]',
            popover: {
              title: "Добавляем нового сотрудника",
              description: `Нажмите <b>“Добавить”</b>, чтобы открыть форму создания сотрудника.\n
                В ней вы сможете указать основные данные, выбрать подразделение и задать рабочее расписание.`,
              onNextClick: (element, _, options) => {
                element?.click();
                options.driver.moveTo(2);
              },
            },
            onHighlighted: (element, _, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="form.employee.name"]',
            popover: {
              title: "ФИО сотрудника",
              description: `Введите фамилию, имя и отчество сотрудника полностью.\n
                Эти данные будут отображаться в списках и в задачах, чтобы вам было удобно различать сотрудников.`,
              onNextClick: (element, step, options) => {
                const input = element.querySelector("input");
                const value = input?.value?.trim() || "";

                // Разбиваем по пробелам и фильтруем пустые элементы
                const words = value.split(/\s+/).filter(Boolean);

                // Проверяем, что хотя бы 3 слова
                if (words.length < 3) {
                  input.classList.add("input-error");
                  input.focus();

                  import("sonner").then(({ toast }) => {
                    toast.error(
                      "Введите фамилию, имя и отчество полностью, чтобы продолжить"
                    );
                  });

                  return false;
                }

                options.driver.moveNext();
              },
            },
            onHighlighted: (element) => {
              const input = element.querySelector("input");
              if (input) input.classList.remove("input-error");
            },
          },
          {
            element: '[data-tour="form.employee.role"]',
            popover: {
              title: "Выбор роли",
              description: `Выберите роль сотрудника. \n
                Нажмите на поле, чтобы открыть список доступных ролей — <b>“Сотрудник”</b> или <b>“Руководитель”</b>.\n
                Если выбрать <b>“Руководитель”</b>, ему можно будет назначить несколько подразделений`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.role.menu", 4)
                );
                element
                  .querySelector('[data-tour="form.employee.role.header"]')
                  ?.click();
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.role.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.role.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.role.menu", 4)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.role.menu"]',
            popover: {
              title: "Опции ролей",
              description: `<ul>
              <li><b>Сотрудник</b> — получает задачи и отмечается на работе</li>
              <li><b>Руководитель</b> — получает доступ к просмотру отчетов</li>
              </ul>
              Выберите нужную роль, чтобы перейти к следующему шагу.`,
            },
            onHighlighted: (element, step, options) => {
              const header = document.querySelector(
                '[data-tour="form.employee.role.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.role.menu"]'
              );
              if (!isMenuOpen && header) header.click();

              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.employee.role.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.role.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.dep"]',
            popover: {
              title: "Назначаем подразделение",
              description: `По умолчанию выбрано подразделение, помеченное как <b>используемое по умолчанию</b>. \n
                Если сотрудник работает в другой локации — выберите другое.\n
                Нажмите на поле, чтобы открыть список подразделений.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.dep.menu", 6)
                );
                element
                  .querySelector('[data-tour="form.employee.dep.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(3);
              },
            },

            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.dep.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.dep.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.dep.menu", 6)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.dep.menu"]',
            popover: {
              title: "Выбор подразделения",
              description: `Выберите подразделение, в котором работает сотрудник.\n
                Для руководителей можно выбрать сразу несколько.\n
                Если сотрудник работает в основном месте — оставьте значение по умолчанию.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.employee.dep.header"]';
                const menuSel = '[data-tour="form.employee.dep.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+подразделение/i,
                  "Пожалуйста, выберите подразделение"
                );
                if (!ok) return false; // стоп, если нет выбора

                closeDropdownAndGo(headerSel, menuSel, options); // закрыть + перейти
                return false; // НЕ даём дефолтному Next сработать второй раз
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.employee.dep.header"]';
              const menuSel = '[data-tour="form.employee.dep.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // даём UI отрисовать выбранные теги
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /выберите\s+подразделение/i,
                    ""
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // убираем старый обработчик, если был
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);

              // авто-открывать меню здесь не нужно — оно уже открыто на этом шаге
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              // закрыть меню, если открыто (как у тебя было)
              const header = document.querySelector(
                '[data-tour="form.employee.dep.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.dep.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.position"]',
            popover: {
              title: "Указываем должность",
              description: `По умолчанию часовой пояс подставляется из подразделения, но если сотрудник живёт или работает в другом регионе — нажмите на поле, чтобы выбрать другой вариант.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                console.log(element);
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.position.menu", 8)
                );
                element
                  .querySelector('[data-tour="form.employee.position.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(5);
              },
            },

            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.employee.position.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.employee.position.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.employee.position.menu", 8)
                );
              };

              if (header) {
                element._tzHeaderOff?.();
                header.addEventListener("click", onHeaderClick);
                element._tzHeaderOff = () =>
                  header.removeEventListener("click", onHeaderClick);
              }
            },

            onDeselected: (element) => {
              clearWaitCleanup(element);
              element._tzHeaderOff?.();
              delete element._tzHeaderOff;
            },
          },
          {
            element: '[data-tour="form.employee.position.menu"]',
            popover: {
              title: "Выбор должности",
              description: `Выберите часовой пояс, в котором находится сотрудник. \n
                Это важно, чтобы уведомления приходили в нужное локальное время.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.employee.position.header"]';
                const menuSel = '[data-tour="form.employee.position.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+должность/i,
                  "Пожалуйста, выберите должность",
                  { isMulti: true } // (можно опустить, у тебя авто-детект)
                );
                if (!ok) return false; // стоп, если нет выбора

                closeDropdownAndGo(headerSel, menuSel, options); // закрыть + перейти
                return false; // НЕ даём дефолтному Next сработать второй раз
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.employee.position.header"]';
              const menuSel = '[data-tour="form.employee.position.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                // даём UI отрисовать выбранные теги
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /выберите\s+должность/i,
                    "",
                    { isMulti: true }
                  );
                  if (ok) {
                    closeDropdownAndGo(headerSel, menuSel, options);
                  }
                }, 10);
              };

              // убираем старый обработчик, если был
              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);

              // авто-открывать меню здесь не нужно — оно уже открыто на этом шаге
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              // закрыть меню, если открыто (как у тебя было)
              const header = document.querySelector(
                '[data-tour="form.employee.position.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.employee.position.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.timezone"]',
            popover: {
              title: "Указываем часовой пояс",
              description: `По умолчанию часовой пояс подставляется из подразделения, но если сотрудник живёт или работает в другом регионе — нажмите на поле, чтобы выбрать другой вариант.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, step, options) => {
                const header = element.querySelector(
                  '[data-tour="form.employee.timezone.header"]'
                );
                if (header) header.click();

                const waitForMenu = () => {
                  const menu = document.querySelector(
                    '[data-tour="form.employee.timezone.menu"]'
                  );
                  if (menu) {
                    setTimeout(() => {
                      options.driver.moveTo(10);
                    }, 150);
                  } else {
                    requestAnimationFrame(waitForMenu);
                  }
                };
                waitForMenu();
                return false;
              },
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(7);
              },
            },
            onHighlighted: (element, step, options) => {
              const waitForMenu = () => {
                const menu = document.querySelector(
                  '[data-tour="form.employee.timezone.menu"]'
                );
                if (menu) {
                  setTimeout(() => {
                    options.driver.moveTo(10);
                  }, 150);
                } else {
                  requestAnimationFrame(waitForMenu);
                }
              };
              waitForMenu();
            },
          },
          {
            element: '[data-tour="form.employee.timezone.menu"]',
            popover: {
              title: "Выбор часового пояса",
              description: `Выберите часовой пояс, в котором находится сотрудник. \n
                Это важно, чтобы уведомления приходили в нужное локальное время.`,
            },
            onHighlighted: (element, step, options) => {
              const header = document.querySelector(
                '[data-tour="modal.timezone.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.timezone.menu"]'
              );
              if (!isMenuOpen && header) header.click();

              element?.addEventListener("click", () => {
                options.driver.moveNext();
              });
            },
            onDeselected: () => {
              const header = document.querySelector(
                '[data-tour="form.employee.timezone.header"]'
              );
              const isMenuOpen = !!document.querySelector(
                '[data-tour="form.employee.timezone.menu"]'
              );
              if (isMenuOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.employee.check-in-time"]',
            popover: {
              title: "Время начала рабочего дня",
              description: `По умолчанию время начала смены берётся из настроек подразделения.\n
                Если у сотрудника другой график — укажите своё время начала работы.\n
                Это время определяет, когда сотруднику придёт уведомление о начале рабочего дняи когда он сможет сделать чек-ин в Телеграм-боте.`,
              onPrevClick: (element, step, options) => {
                options.driver.moveTo(9);
              },
            },
          },
          {
            element: '[data-tour="form.employee.check-out-time"]',
            popover: {
              title: "Время окончания рабочего дня",
              description: `По умолчанию время окончания смены также берётся из подразделения.\n
              Если сотрудник заканчивает работу в другое время — укажите своё значение.\n
              Система будет использовать это время, чтобы прислать напоминание о завершении смены и корректно учитывать выполнение задач в течение дня.`,
            },
          },
          {
            element: '[data-tour="form.employee.telegram-id"]',
            popover: {
              title: "Телеграм ID сотрудника",
              description: `Введите уникальный ID сотрудника из Телеграм.\n
Найти его можно так:
<ol>
<li>`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Введите Телеграм ID, чтобы продолжить"
                );
              },
            },
          },
          {
            element: '[data-tour="form.employee.telegram-name"]',
            popover: {
              title: "Имя пользователя",
              description: `Это подразделение сейчас отмечено как <b>по умолчанию</b>. \n
                Все новые сотрудники, которые добавляются через <b>Телеграм-бота</b>, будут автоматически прикрепляться именно сюда.

                В системе всегда должно быть <b>одно подразделение по умолчанию</b>, чтобы система точно знала, куда прикреплять новых сотрудников.

                Если вы снимете отметку и не выберете другое подразделение, появится уведомление с просьбой назначить подразделение по умолчанию, и часть функций <small>(например, добавление сотрудников через бота)</small> работать не будет.`,
              onNextClick: (element, step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Введите имя пользователя, чтобы продолжить"
                );
              },
            },
          },
          {
            element: '[data-tour="form.employee.submit"]',
            popover: {
              title: "Сохраняем сотрудника",
              description: `Отлично! Теперь нажмите <b>"Создать подразделение"</b>, чтобы сохранить изменения. \n
                Оно появится в общем списке, и вы сможете назначать для него задачи и сотрудников.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="form.employee.submit"]'
                );
                btn?.click();
              },
            },
            onHighlighted: (element, _step, options) => {
              const onBtnClick = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };
              element.removeEventListener("click", onBtnClick);
              element.addEventListener("click", onBtnClick);

              const onSuccess = () => {
                setTimeout(() => {
                  options.driver.moveTo(16);
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener(
                "tour:employee:submit:success",
                onSuccess,
                {
                  once: true,
                }
              );
              window.addEventListener("tour:employee:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:employee:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:employee:submit:fail", onFail);
              };
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Подразделение создано!",
              description: `Поздравляем! 🎉 \n
                Следующий шаг — перейти к разделу <b>“Должности”</b>, где вы узнаете, как создавать должности, чтобы в будущем выбирать их при назначении задач.\n
                Нажмите <b>“К должностям”</b>, чтобы продолжить обучение.`,
              nextBtnText: "К должностям",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
                //   navigate("/employees");
              },
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },
};
