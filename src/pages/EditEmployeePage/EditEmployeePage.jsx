import { useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import {
  formatDataForSelect,
  mapSelectOptionsToIds,
} from "../../utils/methods/formatDataForSelect";
import { timeZoneOptions } from "../../utils/methods/generateTimeZoneOptions";
import { parseFullName } from "../../utils/methods/parseFullName";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { setEditedEmployee } from "../../store/slices/employeesSlice";
import {
  createEmployee,
  updateEmployee,
} from "../../utils/api/actions/employees";

import styles from "./EditEmployeePage.module.scss";
import CustomInput from "../../ui/CustomInput/CustomInput";
import CustomSelect from "../../ui/CustomSelect/CustomSelect";
import { HintWithPortal } from "../../ui/HintWithPortal/HintWithPortal";
import {
  HintCheckIn,
  HintCheckOut,
  HintTimeZone,
} from "../../modules/CreateDepartmentModal/CreateDepartmentModal";
import { Button } from "../../ui/Button/Button";
import {
  createPosition,
  getPositionsList,
} from "../../utils/api/actions/positions";
import { useMediaQuery } from "react-responsive";

const roles = [
  { value: "employee", label: "Сотрудник" },
  { value: "head", label: "Руководитель" },
];

export default function EditEmployeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { departments } = useSelector((state) => state.departments);
  const { positions: allPositions } = useSelector((state) => state.positions);
  const { editedEmployee, loadingEmployee } = useSelector(
    (state) => state?.employees
  );

  const isNew = !editedEmployee;
  const isStartTour = sessionStorage.getItem("start_tour");

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
  const [isOpen, setIsOpen] = useState(false);

  const lastSelectedPositionsRef = useRef([]);
  const skipAutoFillRef = useRef(false);

  const defaultDepartment = departments?.filter((d) => d.is_default)[0];

  const isMobile = useMediaQuery({
    query: "(max-width: 500px)",
  });

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
        defaultDepartment
          ? { value: defaultDepartment.id, label: defaultDepartment.title }
          : departments?.[0]
          ? { value: departments[0].id, label: departments[0].title }
          : null
      );
      setTimeZone(null);
      return;
    }

    setInput({
      name: `${emp.surname} ${emp.firstname}${
        emp.patronymic ? " " + emp.patronymic : ""
      }`,
      checkInTime: emp.check_in_time || "09:00",
      checkOutTime: emp.check_out_time || "18:00",
      telegramId:
        emp.contacts.find((c) => c.type === "telegram_id")?.value || "",
      telegramName:
        emp.contacts.find((c) => c.type === "telegram_username")?.value || "",
    });

    setRole(getRoleValue(emp.role));

    const initialPositions = Array.isArray(emp.positions)
      ? emp?.positions.map((p) => getPosition(p?.title))
      : [];
    setPosition(initialPositions);

    if (Array.isArray(emp?.departments) && emp?.departments?.length > 0) {
      const initialDepartments = emp?.departments?.map((d) => ({
        value: d.id,
        label: d.title,
      }));
      setDepartment(
        emp.role === "head" ? initialDepartments : initialDepartments[0]
      );
    } else {
      setDepartment(
        departments?.[0]
          ? { value: departments[0]?.id, label: departments[0]?.title }
          : null
      );
    }

    if (emp.timezone) {
      const tz = timeZoneOptions?.find((t) => t.value === emp.timezone) || null;
      setTimeZone(tz);
    } else {
      setTimeZone(null);
    }

    skipAutoFillRef.current = true;
  };

  const handleChangeInput = (e) => {
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        { type: "telegram_username", value: input.telegramName },
      ],
      role: role.value,
      positions: positionIds,
      departments: departmentIds,
      timezone: timeZone?.value ?? null,
      check_in_time: input.checkInTime,
      check_out_time: input.checkOutTime,
    };

    return withId ? { employee_id: editedEmployee.id, ...base } : base;
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
    window.dispatchEvent(new CustomEvent("tour:employee:submit:clicked"));
    dispatch(createEmployee(buildPayload(false)))
      .then((res) => {
        if (res?.status === 200) {
          window.dispatchEvent(new CustomEvent("tour:employee:submit:success"));

          initializeState(null);
          navigate(-1);
          dispatch(setEditedEmployee(null));
        } else {
          window.dispatchEvent(new CustomEvent("tour:employee:submit:fail"));
        }
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent("tour:employee:submit:fail"));
      });
  };

  const handleUpdate = () => {
    if (!validateName()) return;
    dispatch(updateEmployee(buildPayload(true))).then((res) => {
      if (res?.status === 200) {
        navigate(-1);
        dispatch(setEditedEmployee(null));
      }
    });
  };

  const handleCreatePosition = (data) => {
    let dataToCreate = {
      title: data.value,
      description: "",
    };
    return dispatch(createPosition(dataToCreate));
  };

  const handleCancel = () => {
    navigate(-1);
    dispatch(setEditedEmployee(null));
  };

  useEffect(() => {
    setIsOpen(true);

    return () => {
      setIsOpen(false);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      initializeState(isNew ? null : editedEmployee);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editedEmployee, isNew, departmentsOptions, positionsOptions]);

  useEffect(() => {
    // определяем ID активного подразделения
    let activeDepartmentId = null;

    if (Array.isArray(department) && department.length > 0) {
      // если мультиселект — берём первое подразделение
      activeDepartmentId = department[0].value;
    } else if (department?.value) {
      activeDepartmentId = department.value;
    }

    if (!activeDepartmentId) return;

    // пропускаем автофилл при инициализации
    if (skipAutoFillRef.current) {
      skipAutoFillRef.current = false;
      return;
    }

    const depFull = departments.find((d) => d.id === activeDepartmentId);
    if (!depFull) return;

    // таймзона
    const depTz = depFull.timezone
      ? timeZoneOptions.find((t) => t.value === depFull.timezone) || null
      : null;

    setTimeZone((prev) =>
      depTz && depTz.value !== prev?.value ? depTz : prev
    );

    // чекин/чекаут
    const newIn = depFull.check_in_time || "09:00";
    const newOut = depFull.check_out_time || "18:00";

    setInput((prev) => {
      if (prev.checkInTime !== newIn || prev.checkOutTime !== newOut) {
        return { ...prev, checkInTime: newIn, checkOutTime: newOut };
      }
      return prev;
    });
  }, [department, departments]);

  useEffect(() => {
    dispatch(getPositionsList(1, 200));
  }, [dispatch]);

  useEffect(() => {
    const titleElement = document.querySelector(`.${styles.page} `);
    if (!isStartTour && !isMobile && titleElement) {
      // небольшой таймаут, чтобы DOM успел прогрузиться
      setTimeout(() => {
        window.scrollTo({
          top: titleElement.offsetTop - 10, // чуть выше блока
          behavior: "smooth",
        });
      }, 100);
    }
  }, [isMobile, isStartTour]);

  useEffect(() => {
    lastSelectedPositionsRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!allPositions?.length) return;

    // 1️⃣ превращаем redux-список в формат {value, label}
    const newOptions = formatDataForSelect(allPositions);

    // 2️⃣ фильтруем и восстанавливаем прежние выбранные по label или id
    const restoredPositions = lastSelectedPositionsRef.current
      .map(
        (old) =>
          newOptions.find(
            (opt) => opt.value === old.value || opt.label === old.label
          ) || old // если новой опции пока нет — оставляем старую
      )
      // на случай дублей / undefined
      .filter(Boolean);

    // 3️⃣ если реально что-то поменялось — обновляем
    setPosition(restoredPositions);
  }, [allPositions]);

  return (
    <div className={styles.page}>
      <PageTitle
        title={isNew ? "Создание сотрудника" : "Редактирование сотрудника"}
      />
      <div className={styles.content}>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <div className={styles.formItem} data-tour="form.employee.name">
              <p className={styles.formLabel}>ФИО</p>
              <CustomInput
                placeholder="Введите ФИО..."
                value={input.name}
                name="name"
                onChange={handleChangeInput}
              />
            </div>
            <div className={styles.formItem} data-tour="form.employee.role">
              <p className={styles.formLabel}>Роль</p>
              <CustomSelect
                options={roles}
                value={role}
                onChange={(val) => {
                  setRole(val);

                  setDepartment((prev) => {
                    // Если выбираем руководителя — превращаем в массив, включая дефолтное
                    if (val?.value === "head") {
                      const asArray = Array.isArray(prev)
                        ? prev
                        : prev
                        ? [prev]
                        : [];
                      const alreadyHasDefault = asArray.some(
                        (d) => d.value === defaultDepartment?.id
                      );
                      return alreadyHasDefault || !defaultDepartment
                        ? asArray
                        : [
                            ...asArray,
                            {
                              value: defaultDepartment.id,
                              label: defaultDepartment.title,
                            },
                          ];
                    }

                    // Если переключаемся обратно на сотрудника — оставляем первый из массива
                    return Array.isArray(prev) ? prev[0] ?? null : prev;
                  });
                }}
                dataTourHeader="form.employee.role.header"
                dataTourId="form.employee.role"
                placeholder="Выберите роль..."
              />
            </div>
          </div>

          <div className={styles.formItem} data-tour="form.employee.dep">
            <p className={styles.formLabel}>Подразделение</p>
            <CustomSelect
              options={departmentsOptions}
              value={department}
              onChange={setDepartment}
              placeholder="Выберите подразделение..."
              isSearchable
              dataTourHeader="form.employee.dep.header"
              dataTourId="form.employee.dep"
              isMulti={role?.value === "head"}
            />
          </div>

          <div className={styles.formItem} data-tour="form.employee.position">
            <p className={styles.formLabel}>Должность</p>
            <CustomSelect
              isMulti
              options={positionsOptions}
              value={position}
              onChange={setPosition}
              placeholder="Выберите должность..."
              isSearchable
              isCreatable
              dataTourHeader="form.employee.position.header"
              dataTourId="form.employee.position"
              onCreate={handleCreatePosition}
            />
          </div>

          <div
            className={styles.formItem}
            style={{ gap: 6 }}
            data-tour="form.employee.timezone"
          >
            <HintWithPortal
              hintContent={<HintTimeZone text={"работает ваш сотрудник"} />}
              minWidth="500px"
            >
              <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                Часовой пояс
              </p>
            </HintWithPortal>

            <CustomSelect
              placeholder="Выберите часовой пояс"
              options={timeZoneOptions}
              onChange={setTimeZone}
              value={timeZone}
              isSearchable
              dataTourId="form.employee.timezone"
              dataTourHeader="form.employee.timezone.header"
            />
          </div>

          <div className={styles.formRow}>
            <div
              className={styles.formItem}
              style={{ gap: 6 }}
              data-tour="form.employee.check-in-time"
            >
              <HintWithPortal hintContent={<HintCheckIn />}>
                <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                  Чекин (в)
                </p>
              </HintWithPortal>
              <CustomInput
                id="checkInTime"
                name="checkInTime"
                type="time"
                value={input.checkInTime}
                onChange={handleChangeInput}
              />
            </div>
            <div
              className={styles.formItem}
              style={{ gap: 6 }}
              data-tour="form.employee.check-out-time"
            >
              <HintWithPortal hintContent={<HintCheckOut />}>
                <p className={styles.formLabel} style={{ marginBottom: 0 }}>
                  Чекаут (с)
                </p>
              </HintWithPortal>
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
            <div
              className={styles.formItem}
              data-tour="form.employee.telegram-id"
            >
              <p className={styles.formLabel}>Телеграм ID</p>
              <CustomInput
                placeholder="Введите Телеграм ID..."
                value={input.telegramId}
                name="telegramId"
                onChange={handleChangeInput}
              />
            </div>
            <div
              className={styles.formItem}
              data-tour="form.employee.telegram-name"
            >
              <p className={styles.formLabel}>Имя пользователя</p>
              <CustomInput
                placeholder="Введите имя пользователя..."
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
            onClick={handleCancel}
            className={styles.buttonCancel}
            secondary
          />
          <Button
            className={styles.button}
            title={isNew ? "Создать" : "Сохранить"}
            onClick={isNew ? handleConfirm : handleUpdate}
            loading={loadingEmployee}
            dataTour="form.employee.submit"
            secondary
          />
        </div>
      </div>
    </div>
  );
}
