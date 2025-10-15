import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";
import {
  setEmployee,
  setEmployees,
  setEmployeesLoading,
} from "../../../store/slices/employeesSlice";
import { toast } from "sonner";

export const getEmployeesList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/v1/organization/employee/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        // console.log("res.data.employees", res.data.employees);
        dispatch(setEmployees(res.data.employees));
        localStorage.setItem("employees", JSON.stringify(res.data.employees));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const createEmployee = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.post(`/v1/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 10));
        toast.success("Сотрудник успешно создан!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const updateEmployee = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.put(`/v1/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 10));
        toast.success("Сотрудник успешно обновлен!");
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const getEmployeeById = (id) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/v1/organization/employee?employee_id=${id}`
      );
      if (res.status === 200) {
        // console.log("res.data.employee", res.data.employee);
        dispatch(setEmployee(res.data.employee));
        localStorage.setItem("employee", JSON.stringify(res.data.employee));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};
