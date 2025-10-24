import {
  setAiSuccessRate,
  setCheckedInCount,
  setDayStats,
  setDoneTasks,
  setEmployeesCount,
  setNeedAttention,
  setNotDoneTasks,
} from "../../../store/slices/dashboardSlice";
import { $authHost } from "../http";

export const getDashboard = () => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(`/organization/dashboard`);
      if (res.status === 200) {
        dispatch(setAiSuccessRate(res.data.ai_success_rate));
        dispatch(setCheckedInCount(res.data.checked_in_count));
        dispatch(setDayStats(res.data.day_stats));
        dispatch(setDoneTasks(res.data.done_tasks));
        dispatch(setEmployeesCount(res.data.employees_count));
        dispatch(setNeedAttention(res.data.need_attention));
        dispatch(setNotDoneTasks(res.data.not_done_tasks));
      }
      return res;
    } catch (error) {
      console.log("getDashboard", error);
      throw error;
    }
  };
};
