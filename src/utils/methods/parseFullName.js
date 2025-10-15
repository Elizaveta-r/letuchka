/**
 * Разбивает полное ФИО на отдельные компоненты: surname, name, patronymic.
 * @param {string} fullName - Строка с полным ФИО (например, "Иванов Иван Иванович").
 * @returns {object} Объект { surname: string, name: string, patronymic: string | null }.
 */
export const parseFullName = (fullName) => {
  // 1. Очищаем от лишних пробелов и разбиваем на части
  const parts = fullName.trim().split(/\s+/);

  // 2. Извлекаем части
  const surname = parts[0] || "";
  const name = parts[1] || "";
  // Отчество является необязательным, берем третью часть, если она есть.
  const patronymic = parts[2] || null;

  return {
    surname: surname,
    firstname: name,
    patronymic: patronymic,
  };
};
