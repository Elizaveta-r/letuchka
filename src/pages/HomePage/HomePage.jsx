import React from "react";
import {
  CheckCircle, // Выполнено
  Clock, // Просрочено
  AlertTriangle, // Проблемные задачи
  TrendingUp, // График
  ArrowRight, // Быстрые ссылки
  XCircle,
  ThumbsUp, // Провалено
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

// ======================================================================
// МОКОВЫЕ ДАННЫЕ
// ======================================================================

const kpiData = {
  tasksCompleted: 85,
  tasksOverdue: 7,
  aiChecksOK: 110,
  aiChecksFAIL: 15,
  activeEmployees: 18,
  totalEmployees: 25,
};

const chartData = [
  { name: "Пн", Выполнено: 40, Проблемные: 4 },
  { name: "Вт", Выполнено: 55, Проблемные: 8 },
  { name: "Ср", Выполнено: 70, Проблемные: 5 },
  { name: "Чт", Выполнено: 85, Проблемные: 10 },
  { name: "Пт", Выполнено: 90, Проблемные: 6 },
  { name: "Сб", Выполнено: 35, Проблемные: 2 },
  { name: "Вс", Выполнено: 30, Проблемные: 1 },
];

const problematicTasks = [
  {
    id: 101,
    task: "Прием рабочего места",
    employee: "Иван Иванов",
    status: { name: "FAIL", value: "Просрочена" },
    time: "10:30",
  },
  {
    id: 102,
    task: "Выслать списания в чат",
    employee: "Ольга Петрова",
    status: { name: "LATE", value: "С опозданием" },
    time: "08:58",
  },
  {
    id: 103,
    task: "Подготовка зоны выдачи",
    employee: "Светлана Кузнецова",
    status: { name: "FAIL", value: "Просрочена" },
    time: "09:00",
  },
  {
    id: 104,
    task: "Чистота мойки",
    employee: "Иван Иванов",
    status: { name: "LATE", value: "С опозданием" },
    time: "08:58",
  },
];

const quickLinks = [
  { title: "Список сотрудников", path: "/employees" },
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

// ======================================================================
// ГЛАВНЫЙ КОМПОНЕНТ ДАШБОРДА
// ======================================================================

export default function HomePage() {
  const isMobile = useMediaQuery({
    query: "(max-width: 1023px)",
  });
  const totalAIChecks = kpiData.aiChecksOK + kpiData.aiChecksFAIL;

  const aiSuccessRate = totalAIChecks
    ? Math.round((kpiData.aiChecksOK / totalAIChecks) * 100)
    : 0;

  const employeeProgress =
    (kpiData.activeEmployees / kpiData.totalEmployees) * 100;

  return (
    <div className={styles.dashboardPage}>
      <PageTitle title={"Дашборд"} />

      {/* 1. СВОДКА KPI (ВЕРХНИЙ БЛОК) */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="Выполнено задач (сегодня)"
          value={kpiData.tasksCompleted}
          icon={CheckCircle}
          colorClass="green"
        />
        <KpiCard
          title="Просрочено"
          value={kpiData.tasksOverdue}
          icon={Clock}
          colorClass="red"
        />
        {isMobile ? (
          <KpiCardMobile
            title="Успешность AI-проверок"
            value={`${aiSuccessRate}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        ) : (
          <KpiCard
            title="Успешность AI-проверок"
            value={`${aiSuccessRate}%`}
            icon={ThumbsUp}
            colorClass="gradient"
          />
        )}
        {/* Отдельная карточка для прогресса сотрудников */}
        <div className={`${styles.kpiCard} ${styles.blue}`}>
          <div className={styles.content}>
            <span className={styles.kpiValue}>
              {kpiData.activeEmployees} из {kpiData.totalEmployees}
            </span>
            <span className={styles.kpiTitle}>Активных сотрудников</span>
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
            Требуется внимание ({problematicTasks.length})
          </h2>

          <div className={styles.tasksTable}>
            {/* Заголовки */}
            <div className={`${styles.taskRow} ${styles.headerRow}`}>
              <span>Задача</span>
              <span>Сотрудник</span>
              <span className={`${styles.statusCell} ${styles.title}`}>
                Статус
              </span>
              <span className={`${styles.timeCell} ${styles.title}`}>
                Время
              </span>
            </div>

            {/* Строки данных */}
            {problematicTasks.map((task) => (
              <div key={task.id} className={styles.taskRow}>
                <span className={styles.taskName}>{task.task}</span>
                <span className={styles.employeeName}>{task.employee}</span>
                <span
                  className={`${styles.statusCell} ${
                    styles[task.status.name.toLowerCase()]
                  }`}
                >
                  {task.status.name === "FAIL" ? (
                    <XCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {task.status.value}
                </span>
                <span className={styles.timeCell}>{task.time}</span>
              </div>
            ))}
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
                  {/* Легкая, сдержанная сетка */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />

                  {/* Ось X (Дни недели) */}
                  <XAxis dataKey="name" stroke="#a0a0a0" tickLine={false} />

                  {/* Ось Y (Значения) - без меток для чистоты */}
                  <YAxis hide={true} />

                  {/* Tooltip (подсказка при наведении) - кастомизация стилей */}
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                  />

                  {/* Легенда */}
                  <Legend
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="circle"
                  />

                  {/* Столбцы */}
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
              {quickLinks.map((link) => (
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
