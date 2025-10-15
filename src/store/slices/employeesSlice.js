import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: localStorage.getItem("employees")
    ? JSON.parse(localStorage.getItem("employees"))
    : null,
  employee: localStorage.getItem("employee")
    ? JSON.parse(localStorage.getItem("employee"))
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
  },
});

export const {
  setEmployees,
  setEmployee,
  setEmployeesLoading,
  setLoadingGetEmployee,
} = employeesSlice.actions;
export default employeesSlice.reducer;
