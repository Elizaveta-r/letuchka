// toursRegistry.js
import { driver } from "driver.js";
import { $authHost } from "../../utils/api/http";

export const TOUR_ORDER = ["departments", "positions", "tasks", "employees"]; // добавляй новые id сюда

// ➜ 1) ХЕЛПЕР ДЛЯ СОЗДАНИЯ ПОДРАЗДЕЛЕНИЯ
async function createDepartmentOnSkip() {
  // Сконструируем понятный дефолт
  const tz =
    Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "Europe/Moscow";

  const payload = {
    title: "Основное подразделение",
    description: "Создано автоматически при пропуске обучения",
    timezone: tz,
    check_in_time: "09:00",
    check_out_time: "18:00",
    is_default: true,
  };

  const res = await $authHost.post("/organization/department", payload);

  return res;
}
function purgeAllTourFlags() {
  try {
    // 1) подчистить мусор/устаревшие ключи (как у тебя и было)
    const KEYS = [
      "start_tour",
      "tours_state_v1",
      "tours_state",
      "tour_state_v1",
      "tour_state",
      "tour:last",
      "tour:step",
      "tour:state",
      "departments",
      "positions",
      "tasks",
      "employees",
    ];
    for (const k of KEYS) {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    }
    const wipe = (storage) => {
      const toDel = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (
          /^(driver|tour:|tours?_state)/i.test(key) ||
          /^tour(s)?_/i.test(key)
        ) {
          toDel.push(key);
        }
      }
      toDel.forEach((k) => storage.removeItem(k));
    };
    wipe(sessionStorage);
    wipe(localStorage);

    // 2) А теперь — зафиксировать, что все туры пройдены
    const completed = Object.fromEntries(TOUR_ORDER.map((id) => [id, true]));
    localStorage.setItem(
      "tours_state_v1",
      JSON.stringify({ version: 1, current: null, completed })
    );

    window.location.reload();
  } catch {
    // ничего
  }

  // 3) Сообщить приложению (текущему табу), что всё завершено
  // Зафиксируем, что ВСЁ завершено
  const completed = Object.fromEntries(TOUR_ORDER.map((id) => [id, true]));
  localStorage.setItem(
    "tours_state_v1",
    JSON.stringify({ version: 1, current: null, completed })
  );
  // Сообщаем приложению (этот же таб)
  window.dispatchEvent(new CustomEvent("tour:all:finished"));
}
// ➜ 2) ПРАВИМ handlePopoverRender: вызывать API при Skip в "подразделениях"

const handlePopoverRender = (drv, popover, skipType) => {
  if (document.body.dataset.tourNoSkip === "1") return; // не показываем "Пропустить" на финальных шагах

  const skip = document.createElement("button");
  skip.innerText = "Пропустить";
  skip.classList.add("driver-skip-btn");

  // защита от дабл-кликов
  let busy = false;

  skip.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const hasDepartment = JSON.parse(sessionStorage.getItem("departments"));

    const ok = confirm(
      `Пропустить обучение по ${skipType}?\n\n${
        String(skipType).toLowerCase() === "подразделениям" &&
        hasDepartment === null
          ? "После пропуска обучения, подразделение будет создано автоматически"
          : "Рекомендуем продолжить обучение — так вы лучше поймёте последовательность действий."
      }`
    );
    if (!ok) return;

    // Только для раздела "подразделениям" создаём подразделение
    if (
      String(skipType).toLowerCase() === "подразделениям" &&
      hasDepartment === null
    ) {
      try {
        busy = true;
        skip.disabled = true;
        skip.innerText = "Создаю подразделение…";

        const data = await createDepartmentOnSkip();

        // Сообщим приложению, если кому-то нужно отреагировать
        window.dispatchEvent(
          new CustomEvent("tour:departments:skip:create:success", {
            detail: data,
          })
        );

        // Красиво подсказку покажем, если sonner есть
        try {
          const { toast } = await import("sonner");
          toast.success("Подразделение создано");
        } catch (_) {}

        // Завершаем тур только после успешного создания
        if (drv && typeof drv.destroy === "function") drv.destroy();
      } catch (err) {
        // Ошибка — остаёмся в туре, чтобы пользователь мог продолжить/повторить
        try {
          const { toast } = await import("sonner");
          toast.error(
            `Не удалось создать подразделение${
              err?.message ? `: ${err.message}` : ""
            }`
          );
        } catch (_) {}
        skip.disabled = false;
        skip.innerText = "Пропустить";
        busy = false;
      }
      return;
    }

    // Для остальных разделов — старое поведение
    if (drv && typeof drv.destroy === "function") drv.destroy();
  };

  if (popover.footerButtons) popover.footerButtons.appendChild(skip);
};

const errorEmptyInput = (element, options, message) => {
  const input =
    element.querySelector("input") || element.querySelector("textarea");
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
  { maxWait = 600, afterCloseDelay = 40, afterClose } = {}
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
      setTimeout(() => {
        if (typeof afterClose === "function") {
          afterClose();
        } else {
          options.driver.moveNext();
        }
      }, afterCloseDelay);
      return;
    }
    if (elapsed > maxWait) {
      // фоллбэк: если вдруг меню не закрылось — идём дальше
      if (typeof afterClose === "function") {
        afterClose();
      } else {
        options.driver.moveNext();
      }
      return;
    }
    requestAnimationFrame(waitClosed);
  };

  waitClosed();
}

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

const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 500px)").matches;

// --- Хелперы для динамического описания частоты
function getFrequencyDescription(selectedText = "") {
  const t = selectedText.toLowerCase();

  if (/ежедневн/.test(t)) {
    return `Эта задача выполняется <b>каждый день</b>.\n
Укажите время, когда она должна появляться у сотрудников.`;
  }
  if (/еженедел/.test(t)) {
    return `Эта задача выполняется <b>раз в неделю</b>.\n
Выберите дни недели, когда она должна приходить.`;
  }
  if (/ежемесяч/.test(t)) {
    return `Эта задача выполняется <b>в определённые дни месяца</b>.\n
Укажите даты (например, 1 и 15 числа) и время.`;
  }
  if (/разово|один раз|единожды|once|single/.test(t)) {
    return `Эта задача выполняется <b>один раз</b>.\n
Укажите точную дату и время выполнения.`;
  }
  // дефолт
  return `Уточните параметры расписания для выбранной периодичности.`;
}

function setNextFrequencyStepDesc(options, selectedText) {
  const steps = options?.config?.steps || [];
  const nextStep = steps.find(
    (s) => s.element === '[data-tour="form.tasks.frequency-selectors"]'
  );
  if (nextStep?.popover) {
    nextStep.popover.description = getFrequencyDescription(selectedText);
  }
}

// --- Хелперы для динамического описания тогглов
function getSwitchersDesc(selectedType = "") {
  const t = (selectedType || "").toLowerCase();

  if (/фото/.test(t)) {
    return `Здесь вы настраиваете <b>поведение задачи</b>:\n
      <ul>
        <li><b>Уведомить о просрочке</b> — руководитель получит уведомление, если задача не выполнена вовремя</li>
        <li><b>Требуется фото</b> — сотрудник должен приложить снимок при выполнении задачи</li>
        <li><b>Фото обязательно</b> — без фото задача не будет считаться выполненной</li>
        <li><b>В итоговый отчёт</b> — задача попадёт в Телеграм-отчёт для руководителя по завершению дня</li>
      </ul>`;
  }

  return `Здесь вы можете <b>гибко настроить поведение задачи</b>:\n
      <ul>
        <li><b>Уведомить о просрочке</b> — руководитель получит уведомление, если задача не выполнена вовремя</li>
        <li><b>В итоговый отчёт</b> — задача попадёт в Телеграм-отчёт для руководителя по завершению дня</li>
      </ul>`;
}

function setSwitchersStepDesc(options, selectedType) {
  const steps = options?.config?.steps || [];
  const switchersStep = steps.find(
    (s) => s.element === '[data-tour="form.tasks.switchers"]'
  );
  if (switchersStep?.popover) {
    switchersStep.popover.description = getSwitchersDesc(selectedType);
  }
}

const goToStepByElement = (options, elementSelector) => {
  const i = options?.config?.steps?.findIndex(
    (s) => s.element === elementSelector
  );
  if (i >= 0) options.driver.moveTo(i);
  else options.driver.movePrev?.();
};

// ✔ универсальная проверка: показать тост и подсветить элемент
function showErrorOn(elOrSelector, message) {
  const el =
    typeof elOrSelector === "string"
      ? document.querySelector(elOrSelector)
      : elOrSelector;

  if (el) {
    el.classList.add("input-error");
    setTimeout(() => el.classList.remove("input-error"), 1200);
  }
  import("sonner")
    .then(({ toast }) => toast.error(message))
    .catch(() => {});
}

// ✔ есть ли внутри контейнера выбранные элементы?
function hasSelectedInside(containerSelector, selectedQuery) {
  const root = document.querySelector(containerSelector);
  if (!root) return false;

  // NEW: если сам контейнер помечен как selected — это тоже ок
  if (
    root.matches('[data-selected="true"], .selected, [aria-pressed="true"]')
  ) {
    return true;
  }
  return !!root.querySelector(selectedQuery);
}

// ✔ есть ли значение у input[type=time]?
function hasTimeValue(containerSelector) {
  const root = document.querySelector(containerSelector);
  const input = root?.querySelector('input[type="time"]');
  return !!(input && input.value && input.value.trim().length > 0);
}

// ✔ дата выбрана в “разовой” задаче?
function hasOneTimeDate() {
  const host = document.querySelector(
    '[data-tour="form.tasks.onetime.calendar"]'
  );
  return host?.getAttribute("data-has-value") === "true";
}

// ✔ настроить, какие шаги видны, в зависимости от выбранной периодичности и наличия DOM
function applyFrequencyStepsVisibility(options) {
  const steps = options?.config?.steps || [];
  const byEl = (sel) => steps.find((s) => s.element === sel);

  const headerSel = '[data-tour="form.tasks.frequency.header"]';
  const label =
    document.querySelector(`${headerSel} span`)?.textContent?.toLowerCase() ||
    document.querySelector(headerSel)?.textContent?.toLowerCase() ||
    "";

  const showWeekly =
    /недел/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.weekdays"]');

  const showMonthly =
    /месяч/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.monthdays"]');

  const showOnetime =
    /(единораз|разово|one)/.test(label) &&
    !!document.querySelector('[data-tour="form.tasks.onetime.calendar"]');

  const startTimeExists = !!document.querySelector(
    '[data-tour="form.tasks.start-time"] input[type="time"]'
  );
  const deadlineExists = !!document.querySelector(
    '[data-tour="form.tasks.deadline-time"] input[type="time"]'
  );

  const sWeekly = byEl('[data-tour="form.tasks.weekdays"]');
  const sMonthly = byEl('[data-tour="form.tasks.monthdays"]');
  const sOnetime = byEl('[data-tour="form.tasks.onetime.calendar"]');
  const sStart = byEl('[data-tour="form.tasks.start-time"]');
  const sDeadline = byEl('[data-tour="form.tasks.deadline-time"]');

  if (sWeekly) sWeekly.skip = !showWeekly;
  if (sMonthly) sMonthly.skip = !showMonthly;
  if (sOnetime) sOnetime.skip = !showOnetime;
  if (sStart) sStart.skip = !startTimeExists;
  if (sDeadline) sDeadline.skip = !deadlineExists;
}

function getFrequencyTargetSelector(selectedText = "") {
  const t = selectedText.toLowerCase();
  if (/недел/.test(t)) return '[data-tour="form.tasks.weekdays"]';
  if (/месяч/.test(t)) return '[data-tour="form.tasks.monthdays"]';
  if (/(единораз|разово|one)/.test(t))
    return '[data-tour="form.tasks.onetime.calendar"]';
  // для "ежедневно" отдельного блока нет — идём к времени старта
  return '[data-tour="form.tasks.start-time"]';
}

function isPhotoTypeSelected() {
  const headerSel = '[data-tour="form.tasks.confirmation-type.header"]';
  const txt = (
    document.querySelector(`${headerSel} span`)?.textContent ||
    document.querySelector(headerSel)?.textContent ||
    window.__tourDoneType ||
    ""
  ).toLowerCase();
  return /фото/.test(txt);
}

function tourDisableSkip() {
  document.body.dataset.tourNoSkip = "1";
  document.querySelector(".driver-skip-btn")?.remove();
}
function tourEnableSkip() {
  delete document.body.dataset.tourNoSkip;
}

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
              description: `В этом разделе вы создаёте подразделения — например, разные пункты выдачи, магазины или команды.\n
                    Это помогает распределять сотрудников по местам работы и задавать каждому подразделению своё расписание.

                    Даже если у вас всего одна точка, подразделение всё равно нужно — в нём указываются <b>часовой пояс</b>, <b>время начала</b> и <b>окончания рабочего дня</b>, чтобы система знала, когда отправлять уведомления и задачи сотрудникам.
                    Без этого приложение не сможет корректно работать.

                    ${
                      isMobile()
                        ? ""
                        : `Нажмите <b>“Подразделения”</b> в левом меню, чтобы открыть этот раздел.`
                    }`,
              nextBtnText: isMobile() ? "Дальше" : "К созданию",
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
              nextBtnText: isMobile() ? "Дальше" : "Показать опции",
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
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
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
              tourDisableSkip();
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
            onDeselected: () => {
              tourEnableSkip();
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
          {
            element: '[data-tour="menu.positions"]',
            popover: {
              title: "Что такое должности",
              description: `Здесь вы создаёте <b>должности сотрудников</b> — например, <i>менеджер</i>, <i>курьер</i> или <i>оператор пункта выдачи</i>.\n
                Должности помогают систематизировать сотрудников и в будущем назначать им подходящие задачи.\n
                ${
                  isMobile()
                    ? ""
                    : `Нажмите <b>“Должности”</b> в левом меню, чтобы открыть этот раздел.`
                }`,
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
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
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
              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Готово! 🎉",
              description: `Вы создали первую <b>должность</b>.\n
                Теперь можно переходить к <b>задачам</b>: создавайте задачи и назначайте их на нужные должности и подразделения — так система корректно распределит работу.\n
                Следующий шаг — открыть раздел <b>“Задачи”</b>, где вы зададите название, периодичность и сроки выполнения.\n
                Нажмите <b>“К задачам”</b>, чтобы продолжить обучение.`,
              nextBtnText: "К задачам",
              onNextClick: (element, step, options) => {
                options.driver.destroy();
              },
            },
            onDeselected: () => {
              tourEnableSkip();
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },

  tasks: {
    id: "tasks",
    route: "/tasks",
    readySelectors: ['[data-tour="menu.tasks"]'],
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
          // было: "сотрудникам"
          handlePopoverRender(drv, popover, "задачам");
        },

        steps: [
          {
            element: '[data-tour="menu.tasks"]',
            popover: {
              title: "Раздел «Задачи»",
              description: `Здесь вы создаёте и управляете задачами для сотрудников.\n
                Задачи помогают автоматизировать рабочие процессы — например, <b>назначать поручения, контролировать выполнение и получать отчёты</b> прямо в системе.\n
                ${
                  isMobile()
                    ? ""
                    : "Нажмите <b>«Задачи»</b> в левом меню, чтобы открыть этот раздел."
                }`,
              nextBtnText: "К созданию",
              onNextClick: (_el, _step, options) => {
                options.driver.moveTo(1);
              },
            },
            onHighlighted: (element, _step, options) => {
              element?.addEventListener("click", () => {
                options.driver.moveTo(1);
              });
            },
          },
          {
            element: '[data-tour="tasks.add"]',
            popover: {
              title: "Добавляем новую задачу",
              description: `Нажмите <b>${
                isMobile() ? "+" : `“Добавить”`
              }</b>, чтобы открыть форму создания задачи.\n
                В ней вы сможете указать, <b>что нужно сделать</b>, <b>кому назначить</b> и <b>когда выполнять</b>.`,
              onNextClick: (element, _step, options) => {
                element?.click();
                options.driver.moveTo(2);
              },
            },
            onHighlighted: (element, _step, options) => {
              element?.addEventListener("click", () => {
                setTimeout(() => {
                  options.driver.moveTo(2);
                }, 100);
              });
            },
          },
          {
            element: '[data-tour="form.tasks.name"]',
            popover: {
              title: "Название задачи",
              description: `Введите понятное название задачи — коротко и по сути.\n
                <small>Например: <b>«Открыть пункт выдачи»</b>, <b>«Проверить кассу»</b> или <b>«Сделать фото витрины»</b></small>.\n
                Название помогает быстро отличать задачи друг от друга в списке.`,
              onNextClick: (element, _step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Введите название задачи"
                );
              },
            },
          },
          {
            element: '[data-tour="form.tasks.confirmation-type"]',
            popover: {
              title: "Тип подтверждения",
              description: `Выберите, <b>каким способом сотрудник будет подтверждать выполнение задачи</b>.\n
                Нажмите на поле, чтобы открыть список вариантов.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // меню — это ШАГ 4
                  waitForMenuAndGo(
                    options,
                    "form.tasks.confirmation-type.menu",
                    4
                  )
                );
                element
                  .querySelector(
                    '[data-tour="form.tasks.confirmation-type.header"]'
                  )
                  ?.click();
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.confirmation-type.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.confirmation-type.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(
                    options,
                    "form.tasks.confirmation-type.menu",
                    4
                  )
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
            element: '[data-tour="form.tasks.confirmation-type.menu"]',
            popover: {
              title: "Опции типа подтверждения",
              description: `Выберите нужный тип, чтобы перейти к следующему шагу:\n
                 <ul>
                  <li><b>Фото</b> — сотрудник прикрепит снимок (например, фото отчёта, витрины или документа).</li>
                  <li><b>Текст</b> — сотрудник напишет комментарий или отчёт о выполнении задачи.</li>
                  <li><b>Чекбокс</b> — простая отметка о выполнении без вложений.</li>
                </ul>
                Нажмите на вариант, который подходит под задачу.`,
              onNextClick: (_el, _step, options) => {
                const headerSel =
                  '[data-tour="form.tasks.confirmation-type.header"]';
                const menuSel =
                  '[data-tour="form.tasks.confirmation-type.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+тип\s+подтверждения/i,
                  "Пожалуйста, выберите тип подтверждения"
                );
                if (!ok) return false;

                // читаем выбранный тип из хедера
                const header = document.querySelector(headerSel);
                const labelText = (
                  header?.querySelector("span")?.textContent ||
                  header?.textContent ||
                  ""
                ).trim();

                // сохраняем и обновляем описание у «Дополнительные настройки»
                window.__tourDoneType = labelText;
                setSwitchersStepDesc(options, labelText);

                const isPhoto = /фото/i.test(labelText);

                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterCloseDelay: 80,
                  afterClose: () => {
                    const acceptStep = options.config.steps.find(
                      (s) =>
                        s.element ===
                        '[data-tour="form.tasks.accept-condition"]'
                    );
                    if (acceptStep) {
                      if (isPhoto) {
                        delete acceptStep.skip;
                        options.driver.moveTo(5);
                      } else {
                        acceptStep.skip = true;
                        options.driver.moveTo(6);
                      }
                    } else {
                      options.driver.moveNext();
                    }
                  },
                });

                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel =
                '[data-tour="form.tasks.confirmation-type.header"]';
              const menuSel = '[data-tour="form.tasks.confirmation-type.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                const selectedText = (item.textContent || "").trim();
                if (selectedText) {
                  // сохраняем и сразу обновляем описание «Дополнительные настройки»
                  window.__tourDoneType = selectedText;
                  setSwitchersStepDesc(options, selectedText);
                }

                // даём UI дорисовать выбранное значение
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /выберите\s+тип\s+подтверждения/i,
                    "Пожалуйста, выберите тип подтверждения"
                  );
                  if (!ok) return;

                  // закрытие меню и переход с учётом «Фото»
                  const isPhoto = /фото/i.test(selectedText);

                  element.removeEventListener("click", onPick);

                  closeDropdownAndGo(headerSel, menuSel, options, {
                    afterCloseDelay: 80,
                    afterClose: () => {
                      const acceptStep = options.config.steps.find(
                        (s) =>
                          s.element ===
                          '[data-tour="form.tasks.accept-condition"]'
                      );
                      if (acceptStep) {
                        if (isPhoto) {
                          delete acceptStep.skip;
                          options.driver.moveTo(5);
                        } else {
                          acceptStep.skip = true;
                          options.driver.moveTo(6);
                        }
                      } else {
                        options.driver.moveNext();
                      }
                    },
                  });
                }, 10);
              };

              element.addEventListener("click", onPick);
              attachWaitCleanup(element, () => {
                element.removeEventListener("click", onPick);
              });
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.confirmation-type.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.confirmation-type.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.tasks.accept-condition"]',
            popover: {
              title: "Критерий приёмки",
              description: `Укажите, <b>по каким признакам система должна принять фото как корректное</b>.\n
                Этот текст используется искусственным интеллектом для проверки снимка.\n
                Например: “На фото должен быть кассовый отчёт и экран с суммой за день” или “Фото витрины с товарами и сегодняшней газетой”.\n
                <small>💡 Это <b>промпт для ИИ</b> — описание того, каким должно быть фото. Если вы не уверены, как правильно его составить, можно обратиться к <b>ChatGPT</b> и попросить помочь сформулировать критерии, чтобы фото успешно проходило проверку.</small>`,
              onNextClick: (element, _step, options) => {
                return errorEmptyInput(
                  element,
                  options,
                  "Заполните критерий приёмки"
                );
              },
              onPrevClick: (_element, _step, options) => {
                options.driver.moveTo(3);
              },
            },
            // skip: true, // показывается только если выбран тип «Фото»
          },

          {
            element: '[data-tour="form.tasks.dep"]',
            popover: {
              title: "Назначаем подразделение",
              description: `Выберите, <b>в каком подразделении будет выполняться эта задача</b>.\n
                По умолчанию выбрано подразделение, отмеченное как <b>используемое по умолчанию</b>. Если задача относится к другой локации — выберите её из списка.\n
                Задачи назначаются <b>по подразделениям</b>, поэтому для одной и той же должности можно задать <b>разные задачи</b> в разных местах.\n
                Нажмите на поле, чтобы открыть список подразделений.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // меню — ШАГ 7 (исправлено)
                  waitForMenuAndGo(options, "form.tasks.dep.menu", 7)
                );
                element
                  .querySelector('[data-tour="form.tasks.dep.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                if (isPhotoTypeSelected()) {
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.accept-condition"]'
                  );
                }
                return goToStepByElement(
                  options,
                  '[data-tour="form.tasks.confirmation-type"]'
                );
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector('[data-tour="form.tasks.dep.header"]') ||
                document.querySelector('[data-tour="form.tasks.dep.header"]');

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.dep.menu", 7) // исправлено
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
            element: '[data-tour="form.tasks.dep.menu"]',
            popover: {
              title: "Выбор подразделения",
              description: ` подразделение, <b>для которого создаётся задача</b>.\n
                Помните, что задачи назначаются <b>по подразделениям</b> — для одинаковых должностей в разных локациях можно задать разные задачи.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.dep.header"]';
                const menuSel = '[data-tour="form.tasks.dep.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+подразделение/i,
                  "Пожалуйста, выберите подразделение"
                );
                if (!ok) return false;

                closeDropdownAndGo(headerSel, menuSel, options);
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.dep.header"]';
              const menuSel = '[data-tour="form.tasks.dep.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

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

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.dep.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.dep.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },

          {
            element: '[data-tour="form.tasks.position"]',
            popover: {
              title: "Указываем должность",
              description: `Выберите, <b>на какие должности</b> распространяется эта задача.\n
                Можно выбрать <b>несколько</b> — например, если за одно действие отвечают и администратор, и курьер.\n
                Задачи назначаются <b>по должностям внутри выбранного подразделения</b>, поэтому одна и та же должность может иметь разные задачи в разных местах.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // меню — ШАГ 9 (исправлено)
                  waitForMenuAndGo(options, "form.tasks.position.menu", 9)
                );
                element
                  .querySelector('[data-tour="form.tasks.position.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                // было 5 — неверно; корректно возвращаться к блоку подразделений
                options.driver.moveTo(6);
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.position.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.position.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.position.menu", 9) // исправлено
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
            element: '[data-tour="form.tasks.position.menu"]',
            popover: {
              title: "Выбор должности",
              description: `Отметьте <b>одну или несколько должностей</b>, которым будет назначена эта задача.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.position.header"]';
                const menuSel = '[data-tour="form.tasks.position.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+должность/i,
                  "Пожалуйста, выберите должность",
                  { isMulti: true }
                );
                if (!ok) return false;

                closeDropdownAndGo(headerSel, menuSel, options);
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.position.header"]';
              const menuSel = '[data-tour="form.tasks.position.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              // единая функция "закрыть меню → перейти к блоку периодичности"
              const advanceToFrequency = () => {
                if (element._tourAdvancing) return; // гард от двойного перехода
                element._tourAdvancing = true;
                // закрываем меню и идём именно к следующему нужному шагу, а не просто moveNext
                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    options.driver.refresh?.();
                    goToStepByElement(
                      options,
                      '[data-tour="form.tasks.frequency"]'
                    );
                    element._tourAdvancing = false;
                  },
                });
              };

              const onCreated = () => {
                advanceToFrequency();
              };

              window.addEventListener(
                "tour:task:position:create:success",
                onCreated,
                { once: true }
              );

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

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

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () => {
                element.removeEventListener("click", onPick);
                window.removeEventListener(
                  "tour:task:position:create:success",
                  onCreated
                );
              };
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.position.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.position.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },

          {
            element: '[data-tour="form.tasks.frequency"]',
            popover: {
              title: "Указываем периодичность",
              description: `Определите, <b>как часто должна выполняться эта задача</b>.\n
                Доступные варианты:
                <ul>
                  <li><b>Ежедневно</b> — выполняется каждый день.</li>
                  <li><b>Еженедельно</b> — в определённые дни недели.</li>
                  <li><b>Ежемесячно</b> — в выбранные даты месяца.</li>
                  <li><b>Единоразово</b> — только один раз, без повторения.</li>
                </ul>
                Нажмите на поле, чтобы выбрать нужный вариант.`,
              nextBtnText: "Показать опции",
              onNextClick: (element, _step, options) => {
                attachWaitCleanup(
                  element,
                  // меню — ШАГ 11 (исправлено)
                  waitForMenuAndGo(options, "form.tasks.frequency.menu", 11)
                );
                element
                  .querySelector('[data-tour="form.tasks.frequency.header"]')
                  ?.click();
                return false;
              },
              onPrevClick: (_element, _step, options) => {
                // закрыть вдруг открытое меню предыдущего шага (на всякий случай)
                const prevHeader = '[data-tour="form.tasks.position.header"]';
                const prevMenu = '[data-tour="form.tasks.position.menu"]';
                if (document.querySelector(prevMenu)) {
                  document.querySelector(prevHeader)?.click();
                }
                goToStepByElement(options, '[data-tour="form.tasks.position"]'); // идём на хедер, а не на меню
              },
            },
            onHighlighted: (element, _step, options) => {
              const header =
                element.querySelector(
                  '[data-tour="form.tasks.frequency.header"]'
                ) ||
                document.querySelector(
                  '[data-tour="form.tasks.frequency.header"]'
                );

              const onHeaderClick = () => {
                attachWaitCleanup(
                  element,
                  waitForMenuAndGo(options, "form.tasks.frequency.menu", 11)
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
            element: '[data-tour="form.tasks.frequency.menu"]',
            popover: {
              title: "Выбор периодичности",
              description: `Выберите подходящую периодичность.`,
              onNextClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.frequency.header"]';
                const menuSel = '[data-tour="form.tasks.frequency.menu"]';

                const ok = requireOptionSelected(
                  headerSel,
                  /выберите\s+периодичность/i,
                  "Пожалуйста, выберите периодичность"
                );
                if (!ok) return false;

                // читаем выбранную метку из хедера и обновляем следующий шаг
                const header = document.querySelector(headerSel);
                const selectedText = (
                  header?.querySelector("span")?.textContent ||
                  header?.textContent ||
                  ""
                ).trim();

                setNextFrequencyStepDesc(options, selectedText);
                const targetSel = getFrequencyTargetSelector(selectedText);

                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    // ждём, пока React смонтирует нужный блок
                    const cleanup = waitForSelector(
                      targetSel,
                      () => {
                        applyFrequencyStepsVisibility(options);
                        options.driver.refresh?.();
                        goToStepByElement(options, targetSel);
                      },
                      { timeout: 2000 }
                    );
                    // чтобы убираться, если пользователь уйдёт со шага
                    attachWaitCleanup(document.body, cleanup);
                  },
                });
                return false;
              },
            },
            onHighlighted: (element, _step, options) => {
              const headerSel = '[data-tour="form.tasks.frequency.header"]';
              const menuSel = '[data-tour="form.tasks.frequency.menu"]';
              const itemSelector =
                '[role="option"], [class*="option"], li, button, [data-option]';

              const onPick = (e) => {
                const item = e.target.closest(itemSelector);
                if (!item) return;

                const selectedText = item.textContent?.trim() || "";
                if (selectedText) {
                  // сразу меняем описание следующего шага
                  setNextFrequencyStepDesc(options, selectedText);
                }

                // стандартный сценарий: закрыть меню → перейти дальше
                setTimeout(() => {
                  const ok = requireOptionSelected(
                    headerSel,
                    /выберите\s+периодичность/i,
                    ""
                  );
                  if (ok) {
                    const targetSel = getFrequencyTargetSelector(selectedText);

                    closeDropdownAndGo(headerSel, menuSel, options, {
                      afterClose: () => {
                        // ждём, пока React смонтирует нужный блок
                        const cleanup = waitForSelector(
                          targetSel,
                          () => {
                            applyFrequencyStepsVisibility(options);
                            options.driver.refresh?.();
                            goToStepByElement(options, targetSel);
                          },
                          { timeout: 2000 }
                        );
                        // чтобы убираться, если пользователь уйдёт со шага
                        attachWaitCleanup(document.body, cleanup);
                      },
                    });
                    return false;
                  }
                }, 10);
              };

              // откроем меню, если вдруг закрыто
              const header = document.querySelector(headerSel);
              const isMenuOpen = !!document.querySelector(menuSel);
              if (!isMenuOpen && header) header.click();

              element._menuOff?.();
              element.addEventListener("click", onPick);
              element._menuOff = () =>
                element.removeEventListener("click", onPick);
            },
            onDeselected: (element) => {
              clearWaitCleanup(element);
              const header = document.querySelector(
                '[data-tour="form.tasks.frequency.header"]'
              );
              const isOpen = !!document.querySelector(
                '[data-tour="form.tasks.frequency.menu"]'
              );
              if (isOpen && header) header.click();
            },
          },
          {
            element: '[data-tour="form.tasks.weekdays"]',
            popover: {
              title: "Выбираем дни недели",
              description: `Отметьте, <b>в какие дни</b> задача должна выполняться.\n
                Например, если это задание для офисных сотрудников — выберите <b>будние дни</b>.\n
                Если для склада или магазина — добавьте и выходные.\n
                \n
                <small>Выберите хотя бы один день, чтобы система знала, когда показывать задачу.</small>`,
              onNextClick: (_el, _step, options) => {
                const ok = hasSelectedInside(
                  '[data-tour="form.tasks.weekdays"]',
                  '[data-selected="true"], .selected, [aria-pressed="true"]'
                );
                if (!ok) {
                  showErrorOn(
                    '[data-tour="form.tasks.weekdays"]',
                    "Выберите хотя бы один день недели"
                  );
                  return false;
                }

                applyFrequencyStepsVisibility(options); // на всякий случай
                options.driver.refresh?.();
                goToStepByElement(
                  options,
                  '[data-tour="form.tasks.start-time"]'
                );
                return false;
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10); // назад к заголовку периодичности
              },
            },
          },

          // ——— Ежемесячно: дни месяца (DaysGrid должен проставлять data-selected="true" на выбранных)
          {
            element: '[data-tour="form.tasks.monthdays"]',
            popover: {
              title: "Выбираем дни месяца",
              description: `Укажите, <b>в какие даты</b> каждого месяца должна выполняться эта задача.\n
                Например, можно выбрать <b>1 и 15 число</b>, если отчёт делается дважды в месяц, или <b>последний день</b>, если задача связана с закрытием периода. \n
                <small>Выберите хотя бы одну дату, чтобы продолжить.</small>`,
              onNextClick: (_el, _step, options) => {
                const ok = hasSelectedInside(
                  '[data-tour="form.tasks.monthdays"]',
                  '[data-selected="true"], .selected, [aria-pressed="true"]'
                );
                if (!ok) {
                  showErrorOn(
                    '[data-tour="form.tasks.monthdays"]',
                    "Выберите хотя бы одну дату"
                  );
                  return false;
                }

                applyFrequencyStepsVisibility(options); // на всякий случай
                options.driver.refresh?.();
                goToStepByElement(
                  options,
                  '[data-tour="form.tasks.start-time"]'
                );
                return false;
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10);
              },
            },
          },

          // ——— Единоразово: календарь
          {
            element: '[data-tour="form.tasks.onetime.calendar"]',
            popover: {
              title: "Дата выполнения задачи",
              description: `Укажите <b>конкретный день</b>, когда задача должна быть выполнена.\n
                Это удобно для разовых поручений — например, провести инвентаризацию 10 числа\n
                или отправить отчёт в конце месяца.`,
              onNextClick: (_el, _step, options) => {
                if (!hasOneTimeDate()) {
                  showErrorOn(
                    '[data-tour="form.tasks.onetime.calendar"]',
                    "Выберите дату"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
              onPrevClick: (_el, _step, options) => {
                options.driver.moveTo(10);
              },
            },
          },

          // ——— Время начала
          {
            element: '[data-tour="form.tasks.start-time"]',
            popover: {
              title: "Когда выполнять задачу",
              description: `Укажите, <b>во сколько</b> задача должна быть доступна сотруднику.\n
              Задачи отправляются <b>сразу после чекина</b> — то есть, когда сотрудник отмечается на рабочем месте.\n
              Поле времени помогает задать <b>ориентир</b> — например, если вы хотите, чтобы сотрудник знал, что задание нужно выполнить к определённому часу.`,
              onNextClick: (_el, _step, options) => {
                if (!hasTimeValue('[data-tour="form.tasks.start-time"]')) {
                  showErrorOn(
                    '[data-tour="form.tasks.start-time"]',
                    "Заполните время начала"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
              onPrevClick: (_el, _step, options) => {
                const headerSel = '[data-tour="form.tasks.frequency.header"]';
                const label = (
                  document.querySelector(`${headerSel} span`)?.textContent ||
                  document.querySelector(headerSel)?.textContent ||
                  ""
                ).toLowerCase();

                if (/недел/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.weekdays"]'
                  );
                if (/месяч/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.monthdays"]'
                  );
                if (/(единораз|разово|one)/.test(label))
                  return goToStepByElement(
                    options,
                    '[data-tour="form.tasks.onetime.calendar"]'
                  );

                // Ежедневно → возвращаемся к буферу селекторов
                return goToStepByElement(
                  options,
                  '[data-tour="form.tasks.frequency"]'
                );
              },
            },
          },

          // ——— Дедлайн
          {
            element: '[data-tour="form.tasks.deadline-time"]',
            popover: {
              title: "Дедлайн",
              description: `Укажите, <b>до какого времени</b> задача должна быть выполнена.\n
                После этого времени задача считается <b>просроченной</b>, и руководитель получит уведомление.\n
                <small>Это помогает держать сотрудников в ритме и не пропускать важные задачи.</small>`,
              onNextClick: (_el, _step, options) => {
                if (!hasTimeValue('[data-tour="form.tasks.deadline-time"]')) {
                  showErrorOn(
                    '[data-tour="form.tasks.deadline-time"]',
                    "Заполните дедлайн"
                  );
                  return false;
                }
                options.driver.moveNext();
              },
            },
          },

          {
            element: '[data-tour="form.tasks.switchers"]',
            popover: {
              title: "Дополнительные настройки",
              description: "", // будет поставлено динамически
            },
            onHighlighted: (_element, _step, options) => {
              // при входе на шаг подставим описание в зависимости от текущего выбора
              setSwitchersStepDesc(options, window.__tourDoneType || "");
              // и на всякий случай перерисуем поповер (если библиотека это поддерживает)
              options.driver.refresh?.();
            },
          },
          {
            element: '[data-tour="form.tasks.submit"]',
            popover: {
              title: "Сохраняем задачу",
              description: `Нажмите <b>"Добавить"</b>, чтобы сохранить изменения. Задача появится в общем списке.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="form.tasks.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, _step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
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
                  options.driver.moveTo(19);
                }, 150);
              };

              const onFail = () => {
                requestAnimationFrame(() => options.driver.refresh());
              };

              window.addEventListener("tour:tasks:submit:success", onSuccess, {
                once: true,
              });
              window.addEventListener("tour:tasks:submit:fail", onFail, {
                once: true,
              });

              element._tourCleanup = () => {
                element.removeEventListener("click", onBtnClick);
                window.removeEventListener(
                  "tour:tasks:submit:success",
                  onSuccess
                );
                window.removeEventListener("tour:tasks:submit:fail", onFail);
              };

              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
            },
          },
          {
            popover: {
              title: "Обучение завершено! 🎉",
              description: `Основное обучение пройдено. \n
                Далее будет предложено создать сотрудников — вы можете <b>пропустить</b> этот шаг, если не хотите проходить его.\n
                Сотрудники добавляются <b>автоматически через бота <small>(команда "/start")</small></b>, после чего их останется лишь <b>отредактировать</b> — указать должность и имя.`,
              onNextClick: () => {
                drv.destroy();
              },
              nextBtnText: "Завершить",
            },
            onHighlighted: () => {
              tourDisableSkip();
            },
            onDeselected: () => {
              tourEnableSkip();
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
          purgeAllTourFlags();
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
              <div style="
                background-color: rgba(255, 255, 255, 0.08);
                border-left: 3px solid #7cd992;
                padding: 10px 12px;
                border-radius: 6px;
                margin-bottom: 10px;
              ">💡 <b>Сотрудники добавляются автоматически</b> через Telegram-бота — 
                после того, как человек нажмёт команду <b>/start</b> в боте.<br>
                <small>При необходимости вы можете добавить сотрудника вручную прямо из этого раздела.</small>
              </div>
               ${
                 isMobile()
                   ? ""
                   : ` Нажмите <b>“Сотрудники”</b> в левом меню, чтобы открыть этот раздел.`
               }`,
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

                // Проверяем, что хотя бы 2 слова
                if (words.length < 2) {
                  input.classList.add("input-error");
                  input.focus();

                  import("sonner").then(({ toast }) => {
                    toast.error(
                      "Введите как минимум фамилию и имя, чтобы продолжить"
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
              description: `Выберите одну или несколько должностей, которые занимает сотрудник.`,
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
              description: `Вы можете <b>создать новую</b> должность, если нужной <b>нет в списке</b> — просто начните ввод и нажмите <b>"Создать"</b>.`,
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

              const advanceToFrequency = () => {
                if (element._tourAdvancing) return; // гард от двойного перехода
                element._tourAdvancing = true;
                // закрываем меню и идём именно к следующему нужному шагу, а не просто moveNext
                closeDropdownAndGo(headerSel, menuSel, options, {
                  afterClose: () => {
                    options.driver.refresh?.();
                    goToStepByElement(
                      options,
                      '[data-tour="form.tasks.frequency"]'
                    );
                    element._tourAdvancing = false;
                  },
                });
              };

              const onCreated = () => {
                advanceToFrequency();
              };
              window.addEventListener(
                "tour:employee:position:create:success",
                onCreated,
                { once: true }
              );

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
              element._menuOff = () => {
                element.removeEventListener("click", onPick);
                window.removeEventListener(
                  "tour:task:position:create:success",
                  onCreated
                );
                element._tourAdvancing = false;
              };

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
                  <li>Попросите сотрудника открыть бота <b>@userinfobot</b> в Telegram и отправить ему любое сообщение — бот покажет его ID (обычно это число, например <code>543219876</code>).</li>
                  <li>Либо на десктопе: откройте настройки Telegram → «Расширенные настройки» → включите «Показывать ID чатов». После этого откройте профиль сотрудника — ID отобразится в виде <b>PEER ID</b>.</li>
                </ol>`,
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
              title: "Имя пользователя Телеграм",
              description: `Укажите <b>username</b> сотрудника в Телеграм — он нужен, чтобы бот мог отправлять задачи и уведомления.\n
                Username начинается с <code>@</code> и выглядит, например, как <b>@ivan_petrov</b>.\n
                Сотрудник должен включить его в настройках Телеграм, если он скрыт.`,
            },
          },
          {
            element: '[data-tour="form.employee.submit"]',
            popover: {
              title: "Сохраняем сотрудника",
              description: `<b>Отлично!</b> 🎯\n
                Нажмите <b>“Создать”</b>, чтобы добавить сотрудника в систему.
                После этого он появится в общем списке, и вы сможете назначать ему задачи.`,
              onNextClick: () => {
                const btn = document.querySelector(
                  '[data-tour="form.employee.submit"]'
                );
                btn?.click();
              },
              onPrevClick: (element, step, options) => {
                options.driver.movePrevious();
                tourEnableSkip();
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
              tourDisableSkip();
            },
            onDeselected: (element) => {
              element?._tourCleanup?.();
              delete element?._tourCleanup;
              tourEnableSkip();
            },
          },
          {
            popover: {
              title: "Сотрудник создан! 🎉",
              description: `Вы успешно добавили сотрудника в систему и завершили обучение`,
              nextBtnText: "Закрыть",
              onNextClick: () => {
                drv.destroy(); // вызовет onDestroyed -> purgeAllTourFlags()
              },
            },
            onHighlighted: () => {
              tourDisableSkip();
            },
          },
        ],
      };
      drv = driver(config);
      return drv;
    },
  },
};
