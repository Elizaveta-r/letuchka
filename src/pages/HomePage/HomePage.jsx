import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle, // Выполнено
  Clock, // Просрочено
  AlertTriangle, // Проблемные задачи
  TrendingUp, // График
  ArrowRight, // Быстрые ссылки
  XCircle,
  ThumbsUp,
  ChevronDown, // Провалено
} from "lucide-react";
import PageTitle from "../../components/PageTitle/PageTitle";
import styles from "./HomePage.module.scss";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMediaQuery } from "react-responsive";
import { getDashboard } from "../../utils/api/actions/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getEmployeeWithHistory } from "../../utils/api/actions/employees";
import { getTaskById } from "../../utils/api/actions/tasks";

// ======================================================================
// МОКОВЫЕ ДАННЫЕ
// ======================================================================

const quickLinks = [
  { title: "Список сотрудников", path: "/employees" },
  { title: "Создать задачу", path: "/tasks/new" },
  { title: "Создать должность", path: "/positions?action=create" },
  { title: "Аналитические отчеты", path: "/reports" },
];

// ======================================================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ======================================================================

const KpiCard = ({ title, value, icon, colorClass }) => {
  const Icon = icon;
  return (
    <div className={`${styles.kpiCard} ${styles[colorClass]}`}>
      <div className={styles.iconWrapper}>
        <Icon size={30} />
      </div>
      <div className={styles.content}>
        <span className={styles.kpiValue}>{value}</span>
        <span className={styles.kpiTitle}>{title}</span>
      </div>
    </div>
  );
};

const KpiCardMobile = ({ title, value, icon, colorClass }) => {
  const Icon = icon;
  return (
    <div className={`${styles.kpiCard} ${styles[colorClass]}`}>
      <div className={styles.contentMobile}>
        <div className={styles.iconWrapper}>
          <Icon size={30} />
        </div>

        <span className={styles.kpiValue}>{value}</span>
      </div>

      <span className={styles.kpiTitle}>{title}</span>
    </div>
  );
};

// ======================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================================================================

const formatChartData = (data) => {
  const dayMap = {
    Monday: "Пн",
    Tuesday: "Вт",
    Wednesday: "Ср",
    Thursday: "Чт",
    Friday: "Пт",
    Saturday: "Сб",
    Sunday: "Вс",
  };

  // Все дни недели, чтобы в графике были даже пустые
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // Базовая структура: все дни с нулями
  const result = weekDays.map((day) => ({
    name: day,
    Выполнено: 0,
    Проблемные: 0,
  }));

  if (!Array.isArray(data)) return result;

  // Группируем данные по дню недели
  data.forEach((item) => {
    const name = dayMap[item.weekday] || item.weekday;

    const found = result.find((d) => d.name === name);
    if (!found) return;

    if (item.is_done) {
      found.Выполнено += 1;
    } else {
      found.Проблемные += 1;
    }
  });

  return result;
};

const getStatusLabel = (status) => {
  switch (status) {
    case "late":
      return "C опозданием";
    case "not_done":
      return "Не выполнено";
    default:
      return;
  }
};

// ======================================================================
// ГЛАВНЫЙ КОМПОНЕНТ ДАШБОРДА
// ======================================================================

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [scrollPosition, setScrollPosition] = useState("top"); // 'top', 'middle', 'bottom'
  const tableRef = useRef(null);

  const {
    ai_success_rate,
    checked_in_count,
    day_stats,
    done_tasks,
    employees_count,
    need_attention,
    not_done_tasks,
  } = useSelector((state) => state.dashboard);

  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });

  const employeeProgress = (checked_in_count / employees_count) * 100;

  const chartData = useMemo(() => formatChartData(day_stats), [day_stats]);

  const goToEmployee = (id) => {
    dispatch(getEmployeeWithHistory(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate("/employees/" + id);
      }
    });
  };

  const goToTask = (id) => {
    dispatch(getTaskById(id, 1, 1000)).then((res) => {
      if (res.status === 200) {
        navigate("/tasks/" + id);
      }
    });
  };

  const handleScroll = (e) => {
    const element = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;

    if (scrollTop === 0) {
      setScrollPosition("top");
    } else if (Math.abs(scrollHeight - scrollTop - clientHeight) < 5) {
      setScrollPosition("bottom");
    } else {
      setScrollPosition("middle");
    }
  };

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  return (
    <div className={styles.dashboardPage}>
      <PageTitle
        title={"Дашборд"}
        hint={"Информация отображается за текущий день"}
      />

      {/* 1. СВОДКА KPI (ВЕРХНИЙ БЛОК) */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Задач выполнено"
          value={done_tasks}
          icon={CheckCircle}
          colorClass="green"
        />
        <KpiCard
          title="Задач не выполнено"
          value={not_done_tasks}
          icon={Clock}
          colorClass="red"
        />
        {isMobile ? (
          <KpiCardMobile
            title="Успешность AI-проверок"
            value={`${Number(ai_success_rate.toFixed(0))}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        ) : (
          <KpiCard
            title="Успешность AI-проверок"
            value={`${Number(ai_success_rate.toFixed(0))}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        )}
        {/* Отдельная карточка для прогресса сотрудников */}
        <div className={`${styles.kpiCard} ${styles.blue}`}>
          <div className={styles.content}>
            <span className={styles.kpiValue}>
              {checked_in_count} из {employees_count}
            </span>
            <span className={styles.kpiTitle}>
              Сотрудников на рабочем месте
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${employeeProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. ОСНОВНОЙ КОНТЕНТ (2 КОЛОНКИ: Проблемы и Аналитика/Ссылки) */}
      <div className={styles.mainContentGrid}>
        {/* 2.1. ЛЕВЫЙ БЛОК: Проблемные задачи (Требуется внимание) */}
        <div className={styles.problemTasksSection}>
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={20} className={styles.alertIcon} />
            Требуется внимание (
            {need_attention?.length ? need_attention?.length : 0})
          </h2>

          <div className={styles.tableWrapper}>
            {/* Заголовки вынесены отдельно для sticky */}
            <div className={styles.tableHeader}>
              <span>Задача</span>
              <span>Сотрудник</span>
              <span>Статус</span>
            </div>

            <div
              className={styles.tasksTable}
              ref={tableRef}
              onScroll={handleScroll}
            >
              {/* Строки данных */}
              {need_attention &&
                need_attention?.map((task) => (
                  <div key={task.id} className={styles.taskRow}>
                    <span
                      className={styles.taskName}
                      onClick={() => goToTask(task.task_id)}
                    >
                      {task.task_title}
                    </span>
                    <span
                      className={styles.employeeName}
                      onClick={() => goToEmployee(task.employee_id)}
                    >
                      {task.employee_name}
                    </span>
                    <span
                      className={`${styles.statusCell} ${
                        styles[task.task_status_type.toLowerCase()]
                      }`}
                    >
                      {task.task_status_type === "not_done" ? (
                        <XCircle size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      {getStatusLabel(task.task_status_type)}
                    </span>
                  </div>
                ))}
            </div>

            {need_attention?.length > 5 && (
              <div
                className={`${styles.scrollIndicator} ${
                  scrollPosition === "bottom"
                    ? styles.scrollUp
                    : styles.scrollDown
                }`}
                onClick={() => {
                  if (tableRef.current) {
                    const scrollTo =
                      scrollPosition === "top"
                        ? tableRef.current.scrollHeight
                        : 0;
                    tableRef.current.scrollTo({
                      top: scrollTo,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <ChevronDown size={28} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* 2.2. ПРАВЫЙ БЛОК: Аналитика и Ссылки */}
        <div className={styles.analyticsSection}>
          {/* А. Блок быстрого обзора (График - тут будет заглушка) */}
          <div className={styles.analyticsCard}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={20} /> Динамика выполнения (7 дней)
            </h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -2, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis dataKey="name" stroke="#a0a0a0" tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Выполнено"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Проблемные"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Б. Блок быстрых ссылок */}
          <div className={styles.linksCard}>
            <h2 className={styles.sectionTitle}>Быстрые ссылки</h2>
            <div className={styles.linkList}>
              {quickLinks?.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className={styles.quickLink}
                >
                  {link.title}
                  <ArrowRight size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
