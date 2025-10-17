import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: sessionStorage.getItem("employees")
    ? JSON.parse(sessionStorage.getItem("employees"))
    : null,
  employee: sessionStorage.getItem("employee")
    ? JSON.parse(sessionStorage.getItem("employee"))
    : null,
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
    setEmployee(state, action) {
      state.employee = action.payload;
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
  setEmployeesLoading,
  setLoadingGetEmployee,
  triggerContactAutosave,
} = employeesSlice.actions;
export default employeesSlice.reducer;
