import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  departments: localStorage.getItem("departments")
    ? JSON.parse(localStorage.getItem("departments"))
    : null,
  department: localStorage.getItem("department")
    ? JSON.parse(localStorage.getItem("department"))
    : null,
  loading: false,
  loadingGetDetails: "",
};

const departmentsSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setDepartments(state, action) {
      state.departments = action.payload;
    },
    setDepartment(state, action) {
      state.department = action.payload;
    },
    setLoadingGetDetails(state, action) {
      state.loadingGetDetails = action.payload;
    },
    setDepartmentsLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const {
  setDepartments,
  setDepartment,
  setLoadingGetDetails,
  setDepartmentsLoading,
} = departmentsSlice.actions;
export default departmentsSlice.reducer;
