import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: sessionStorage.getItem("employees")
    ? JSON.parse(sessionStorage.getItem("employees"))
    : null,
  employeesWithHistory: [],
  employee: sessionStorage.getItem("employee")
    ? JSON.parse(sessionStorage.getItem("employee"))
    : null,
  editedEmployee: null,

  loadingEmployee: false,
  loadingGetEmployee: "",
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees(state, action) {
      state.employees = action.payload;
    },
    setEmployeesWithHistory(state, action) {
      state.employeesWithHistory = action.payload;
    },
    setEmployee(state, action) {
      state.employee = {
        ...action.payload,
        history: action.payload?.history,
      };
      sessionStorage.setItem("employee", JSON.stringify(state.employee));
    },
    setEmployeeHistory(state, action) {
      if (state.employee) {
        state.employee.history = action.payload;
        sessionStorage.setItem("employee", JSON.stringify(state.employee));
      }
    },
    setEditedEmployee(state, action) {
      state.editedEmployee = action.payload;
    },
    setEmployeesLoading(state, action) {
      state.loadingEmployee = action.payload;
    },
    setLoadingGetEmployee(state, action) {
      state.loadingGetEmployee = action.payload;
    },
    triggerContactAutosave: () => {
      // action.payload будет содержать данные контакта для API:
      // { type: 'phone', value: '+7...', contact_id: '...', employee_id: '...' }
    },
  },
});

export const {
  setEmployees,
  setEmployee,
  setEmployeesWithHistory,
  setEditedEmployee,
  setEmployeeHistory,
  setEmployeesLoading,
  setLoadingGetEmployee,
  triggerContactAutosave,
} = employeesSlice.actions;
export default employeesSlice.reducer;
