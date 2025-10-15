import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../../ui/Modal/Modal";
import { AnimatePresence } from "motion/react";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import styles from "./EditEmployeeModal.module.scss";
import { Button } from "../../ui/Button/Button";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import Hint from "../../ui/Hint/Hint";
import {
  formatDataForSelect,
  mapSelectOptionsToIds,
} from "../../utils/methods/formatDataForSelect";
import { parseFullName } from "../../utils/methods/parseFullName";

const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "head", label: "Руководитель" },
];

const formatTimeFromDepartment = (dateTimeString) => {
  if (!dateTimeString) return "09:00";
  try {
    const m = dateTimeString.match(/\s(\d{2}:\d{2}):\d{2}\s?/);
    return m?.[1] ?? "09:00";
  } catch {
    return "09:00";
  }
};

export default function EditEmployeeModal({
  isOpen,
  onClose,
  employee,
  onConfirm,
  onUpdate,
  isNew,
}) {
  const { departments } = useSelector((state) => state.departments);
  const { positions: allPositions } = useSelector((state) => state.positions);
  const { loadingEmployee } = useSelector((state) => state.employees);

  // ✅ мемоизируем, чтобы не менять ссылки на каждом рендере
  const departmentsOptions = useMemo(
    () => formatDataForSelect(departments || []),
    [departments]
  );
  const positionsOptions = useMemo(
    () => formatDataForSelect(allPositions || []),
    [allPositions]
  );

  const getRoleValue = (role) =>
    roles.find((r) => r.value === role) || roles[0];

  const getPosition = (positionName) =>
    positionsOptions.find((p) => p.label === positionName) || {
      value: positionName,
      label: positionName,
    };

  const [input, setInput] = useState({
    name: "",
    telegramId: "",
    telegramName: "",
    checkInTime: "09:00",
    checkOutTime: "18:00",
  });
  const [role, setRole] = useState(roles[0]);
  const [position, setPosition] = useState([]);
  const [department, setDepartment] = useState(null);
  const [timeZone, setTimeZone] = useState(null);

  const skipAutoFillRef = useRef(false);

  const initializeState = (emp) => {
    if (!emp) {
      setInput({
        name: "",
        telegramId: "",
        telegramName: "",
        checkInTime: "09:00",
        checkOutTime: "18:00",
      });
      setRole(roles[0]);
      setPosition([]);
      setDepartment(
        departments?.[0]
          ? { value: departments[0].id, label: departments[0].name }
          : null
      );
      setTimeZone(null);
      return;
    }

    setInput({
      name: `${emp.surname} ${emp.firstname}${
        emp.patronymic ? " " + emp.patronymic : ""
      }`,
      checkInTime: formatTimeFromDepartment(emp.check_in_time) || "09:00",
      checkOutTime: formatTimeFromDepartment(emp.check_out_time) || "18:00",
      telegramId:
        emp.contacts.find((c) => c.type === "telegram_id")?.value || "",
      telegramName:
        emp.contacts.find((c) => c.type === "telegram_name")?.value || "",
    });

    setRole(getRoleValue(emp.role));

    const initialPositions = Array.isArray(emp.positions)
      ? emp.positions.map((p) => getPosition(p.name))
      : [];
    setPosition(initialPositions);

    if (Array.isArray(emp.departments) && emp.departments.length > 0) {
      const initialDepartments = emp.departments.map((d) => ({
        value: d.id,
        label: d.name,
      }));
      setDepartment(
        emp.role === "head" ? initialDepartments : initialDepartments[0]
      );
    } else {
      setDepartment(
        departments?.[0]
          ? { value: departments[0].id, label: departments[0].name }
          : null
      );
    }

    if (emp.timezone) {
      const tz = timeZoneOptions.find((t) => t.value === emp.timezone) || null;
      setTimeZone(tz);
    } else {
      setTimeZone(null);
    }

    skipAutoFillRef.current = true;
  };

  useEffect(() => {
    if (isOpen) {
      initializeState(isNew ? null : employee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employee, isNew, departmentsOptions, positionsOptions]);

  const handleChangeInput = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    onClose();
  };

  const buildPayload = (withId = false) => {
    const { surname, firstname, patronymic } = parseFullName(input.name);
    const positionIds = mapSelectOptionsToIds(position);
    const departmentsArray = Array.isArray(department)
      ? department
      : department
      ? [department]
      : [];
    const departmentIds = mapSelectOptionsToIds(departmentsArray);

    const base = {
      surname,
      firstname,
      patronymic,
      contacts: [
        { type: "telegram_id", value: input.telegramId },
        { type: "telegram_name", value: input.telegramName },
      ],
      role: role.value,
      positions: positionIds,
      departments: departmentIds,
      timezone: timeZone?.value ?? null,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
    };

    return withId ? { employee_id: employee.id, ...base } : base;
  };

  const validateName = () => {
    if (!input.name) {
      toast.error("Пожалуйста, заполните ФИО сотрудника.");
      return false;
    }
    const { surname, firstname } = parseFullName(input.name);
    if (!surname || !firstname) {
      toast.error("Пожалуйста, введите как минимум фамилию и имя.");
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateName()) return;
    onConfirm(buildPayload(false)).then((res) => {
      if (res?.status === 200) {
        initializeState(null);
        handleClose();
      }
    });
  };

  const handleUpdate = () => {
    if (!validateName()) return;
    onUpdate(buildPayload(true)).then((res) => {
      if (res?.status === 200) handleClose();
    });
  };

  useEffect(() => {
    const departmentId = Array.isArray(department)
      ? department?.[0]?.value
      : department?.value;

    if (!departmentId) return;

    if (skipAutoFillRef.current) {
      skipAutoFillRef.current = false;
      return;
    }

    const depFull = departments.find((d) => d.id === departmentId);
    if (!depFull) return;

    const depTz = depFull.timezone
      ? timeZoneOptions.find((t) => t.value === depFull.timezone) || null
      : null;

    if ((depTz?.value ?? null) !== (timeZone?.value ?? null)) {
      setTimeZone(depTz);
    }

    const newIn = formatTimeFromDepartment(depFull.check_in_time);
    const newOut = formatTimeFromDepartment(depFull.check_out_time);

    setInput((prev) =>
      prev.checkInTime !== newIn || prev.checkOutTime !== newOut
        ? { ...prev, checkInTime: newIn, checkOutTime: newOut }
        : prev
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    department?.value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Array.isArray(department) ? department?.[0]?.value : null,
    departments,
    timeZone?.value,
  ]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          title={`${isNew ? "Создание" : "Редактирование"} сотрудника`}
        >
          <div className={styles.content}>
            <div className={styles.formGrid}>
              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>ФИО</p>
                  <CustomInput
                    placeholder="Введите ФИО..."
                    value={input.name}
                    name="name"
                    onChange={handleChangeInput}
                  />
                </div>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Роль</p>
                  <CustomSelect
                    options={roles}
                    value={role}
                    onChange={(val) => {
                      setRole(val);
                      setDepartment((prev) =>
                        val?.value === "head"
                          ? Array.isArray(prev)
                            ? prev
                            : prev
                          : Array.isArray(prev)
                          ? prev?.[0] ?? null
                          : prev
                      );
                    }}
                    placeholder="Выберите роль..."
                    isSearchable
                  />
                </div>
              </div>

              <div className={styles.formItem}>
                <p className={styles.formLabel}>Подразделение</p>
                <CustomSelect
                  options={departmentsOptions}
                  value={department}
                  onChange={setDepartment}
                  placeholder="Выберите подразделение..."
                  isSearchable
                  isMulti={role?.value === "head"}
                />
              </div>

              <div className={styles.formItem}>
                <p className={styles.formLabel}>Должность</p>
                <CustomSelect
                  isMulti
                  options={positionsOptions}
                  value={position}
                  onChange={setPosition}
                  placeholder="Выберите должность..."
                  isSearchable
                  isCreatable
                />
              </div>

              <div className={styles.formItem} style={{ gap: 6 }}>
                <Hint
                  hintContent="Определяет время получения автоматических задач и уведомлений сотрудниками."
                  minWidth="500px"
                >
                  <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                    Часовой пояс
                  </p>
                </Hint>

                <CustomSelect
                  placeholder="Выберите часовой пояс"
                  options={timeZoneOptions}
                  onChange={setTimeZone}
                  value={timeZone}
                  isSearchable
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formItem} style={{ gap: 6 }}>
                  <Hint
                    hintContent={`Сотрудник должен быть на рабочем месте и отметиться (сделать "чекин") не позднее указанного времени.`}
                  >
                    <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                      Чекин (до)
                    </p>
                  </Hint>
                  <CustomInput
                    id="checkInTime"
                    name="checkInTime"
                    type="time"
                    value={input.checkInTime}
                    onChange={handleChangeInput}
                  />
                </div>
                <div className={styles.formItem} style={{ gap: 6 }}>
                  <Hint
                    hintContent={`Это самое раннее время, когда сотрудник может официально отметиться об уходе с работы (сделать "чекаут").`}
                  >
                    <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                      Чекаут (с)
                    </p>
                  </Hint>
                  <CustomInput
                    id="checkOutTime"
                    name="checkOutTime"
                    type="time"
                    value={input.checkOutTime}
                    onChange={handleChangeInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Telegram ID</p>
                  <CustomInput
                    placeholder="Введите Telegram ID..."
                    value={input.telegramId}
                    name="telegramId"
                    onChange={handleChangeInput}
                  />
                </div>
                <div className={styles.formItem}>
                  <p className={styles.formLabel}>Telegram Name</p>
                  <CustomInput
                    placeholder="Введите Telegram Name..."
                    value={input.telegramName}
                    name="telegramName"
                    onChange={handleChangeInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                title="Отмена"
                onClick={handleClose}
                className={styles.buttonCancel}
                secondary
              />
              <Button
                className={styles.button}
                title={isNew ? "Создать" : "Сохранить"}
                onClick={isNew ? handleConfirm : handleUpdate}
                loading={loadingEmployee}
                secondary
              />
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
