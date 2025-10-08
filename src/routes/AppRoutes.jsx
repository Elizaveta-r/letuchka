import { useLocation, useRoutes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { PageLayout } from "../layout/PageLayout/PageLayout";
import HomePage from "../pages/HomePage/HomePage";
import { AuthLayout } from "../layout/AuthLayout/AuthLayout";
import { AuthPage } from "../pages/AuthPage/AuthPage";
import { RegPage } from "../pages/RegPage/RegPage";
import { BillingPage } from "../pages/BillingPage/BillingPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import { CodeVerifyPage } from "../pages/CodeVerifyPage/CodeVerifyPage";
import EmployeePage from "../pages/EmployeePage/EmployeePage";
import DepartmentsPage from "../pages/DepartmentsPage/DepartmentsPage";
import DepartmentDetailPage from "../pages/DepartmentDetailPage/DepartmentDetailPage";
import EmployeeDetailPage from "../pages/EmployeeDetailPage/EmployeeDetailPage";
import TasksPage from "../pages/TasksPage/TasksPage";
import PositionsPage from "../pages/PositionsPage/PositionsPage";
import TasksDetailsPage from "../pages/TasksDetailsPage/TasksDetailsPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";

export default function AppRoutes() {
  const location = useLocation();

  const routes = useRoutes([
    {
      path: "/",
      element: (
        <PageLayout>
          <HomePage />
        </PageLayout>
      ),
    },
    {
      path: "/auth",
      element: (
        <AuthLayout>
          <AuthPage />
        </AuthLayout>
      ),
    },
    {
      path: "/reg",
      element: (
        <AuthLayout>
          <RegPage />
        </AuthLayout>
      ),
    },
    {
      path: "/code-verify",
      element: (
        <AuthLayout>
          <CodeVerifyPage />
        </AuthLayout>
      ),
    },
    {
      path: "/billing",
      element: (
        <PageLayout>
          <BillingPage />
        </PageLayout>
      ),
    },
    {
      path: "/employees",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <EmployeePage />,
        },
        {
          path: ":id",
          element: <EmployeeDetailPage />,
        },
      ],
    },
    {
      path: "/departments",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <DepartmentsPage />,
        },
        {
          path: ":id",
          element: <DepartmentDetailPage />,
        },
      ],
    },
    {
      path: "/tasks",
      element: <PageLayout />,
      children: [
        {
          index: true,
          element: <TasksPage />,
        },
        {
          path: ":id",
          element: <TasksDetailsPage />,
        },
      ],
    },
    {
      path: "/reports",
      element: (
        <PageLayout>
          <ReportsPage />
        </PageLayout>
      ),
    },
    {
      path: "/positions",
      element: (
        <PageLayout>
          <PositionsPage />
        </PageLayout>
      ),
    },
    {
      path: "/*",
      element: (
        <PageLayout>
          <NotFoundPage />
        </PageLayout>
      ),
    },
  ]);

  const isAuthRoute = ["/auth", "/reg", "/code-verify"].includes(
    location.pathname
  );

  return isAuthRoute ? (
    <AnimatePresence mode="wait">
      <div key={location.pathname}>{routes}</div>
    </AnimatePresence>
  ) : (
    routes
  );
}
