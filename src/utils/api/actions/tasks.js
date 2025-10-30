import { toast } from "sonner";
import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";
import {
  setActiveTask,
  setLoadingTask,
  setTasks,
} from "../../../store/slices/tasksSlice";

export const getTasksList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/task/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        dispatch(setTasks(res.data.tasks));
        localStorage.setItem("tasksData", JSON.stringify(res.data.tasks));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const createTask = (data) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.post(`/organization/task`, data);
      if (res.status === 200) {
        dispatch(getTasksList(1, 1000));
        toast.success("Задача успешно создана!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const updateTask = (data) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.put(`/organization/task`, data);
      if (res.status === 200) {
        console.log("updateTask", res.data);
        dispatch(getTasksList(1, 1000));
        toast.success("Задача успешно обновлена!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};

export const getTaskById = (id) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(`/organization/task?task_id=${id}`);
      if (res.status === 200) {
        dispatch(setActiveTask(res.data.task));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const deleteTask = (id) => {
  return async (dispatch) => {
    dispatch(setLoadingTask(true));
    try {
      const res = await $authHost.delete(`/organization/task?task_id=${id}`);
      if (res.status === 200) {
        dispatch(getTasksList(1, 1000));
        toast.success("Задача успешно удалена!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setLoadingTask(false));
    }
  };
};
