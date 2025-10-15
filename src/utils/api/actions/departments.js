import { toast } from "sonner";
import {
  setDepartment,
  setDepartments,
  setDepartmentsLoading,
} from "../../../store/slices/departmentsSlice";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";

export const getDepartmentsList = (page, page_size) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/v1/organization/department/list?page=${page}&page_size=${page_size}`
      );
      if (res.status === 200) {
        dispatch(setDepartments(res.data.departments));
        localStorage.setItem(
          "departments",
          JSON.stringify(res.data.departments)
        );
      }
      return res;
    } catch (error) {
      console.error("getDepartmentsList", error);
      throw error;
    }
  };
}; // route: /v1/organization/department/list

export const getDepartmentById = (id) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.get(
        `/v1/organization/department?department_id=${id}`
      );
      if (res.status === 200) {
        console.log("res.data.department", res.data.department);
        dispatch(setDepartment(res.data.department));
        localStorage.setItem("department", JSON.stringify(res.data.department));
      }
      return res;
    } catch (error) {
      console.error("getDepartmentsList", error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
};

export const createDepartment = (data) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    try {
      const res = await $authHost.post(`/v1/organization/department`, data);
      if (res.status === 200) {
        dispatch(getDepartmentsList(1, 10));
        toast.success("Подразделение успешно создано!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
}; // route: /v1/organization/department
export const updateDepartment = (data) => {
  return async (dispatch) => {
    dispatch(setDepartmentsLoading(true));
    console.log("updatedata", data);
    try {
      const res = await $authHost.put(`/v1/organization/department`, data);
      if (res.status === 200) {
        dispatch(getDepartmentsList(1, 10));
        toast.success("Подразделение успешно обновлено!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setDepartmentsLoading(false));
    }
  };
}; // route: /v1/organization/department
export const deleteDepartment = () => {};
