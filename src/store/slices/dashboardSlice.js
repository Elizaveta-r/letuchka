import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ai_success_rate: 0,
  checked_in_count: 0,
  day_stats: [],
  done_tasks: 0,
  employees_count: 0,
  need_attention: 0,
  not_done_tasks: 0,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setAiSuccessRate: (state, action) => {
      state.ai_success_rate = action.payload;
    },
    setCheckedInCount: (state, action) => {
      state.checked_in_count = action.payload;
    },
    setDayStats: (state, action) => {
      state.day_stats = action.payload;
    },
    setDoneTasks: (state, action) => {
      state.done_tasks = action.payload;
    },
    setEmployeesCount: (state, action) => {
      state.employees_count = action.payload;
    },
    setNeedAttention: (state, action) => {
      state.need_attention = action.payload;
    },
    setNotDoneTasks: (state, action) => {
      state.not_done_tasks = action.payload;
    },
  },
});

export const {
  setAiSuccessRate,
  setCheckedInCount,
  setDayStats,
  setDoneTasks,
  setEmployeesCount,
  setNeedAttention,
  setNotDoneTasks,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
