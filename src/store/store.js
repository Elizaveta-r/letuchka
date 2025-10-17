import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import billingReducer, { billingListener } from "./slices/billingSlice";
import sessionsReducer from "./slices/sessionsSlice";
import positionsReducer from "./slices/positionsSlice";
import departmentsReducer from "./slices/departmentsSlice";
import employeesReducer from "./slices/employeesSlice";
import tasksReducer from "./slices/tasksSlice";
import { sessionStorageMiddleware } from "../utils/middleware/sessionStorageMiddleware";
import { employeeContactListener } from "../utils/middleware/employeeContactListener";
import integrationsReducer from "./slices/integrationsSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    sessions: sessionsReducer,
    billing: billingReducer,
    positions: positionsReducer,
    departments: departmentsReducer,
    employees: employeesReducer,
    tasks: tasksReducer,
    integrations: integrationsReducer,
  },
  middleware: (gDM) =>
    gDM()
      .prepend([billingListener.middleware, employeeContactListener.middleware])
      .concat(sessionStorageMiddleware),
});
