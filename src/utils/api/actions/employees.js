import { logPostError } from "../helpers/logErrorHelper";
import { $authHost } from "../http";
import {
  setEmployee,
  setEmployees,
  setEmployeesLoading,
} from "../../../store/slices/employeesSlice";
import { toast } from "sonner";
import {
  setDepartmentEmployees,
  setDepartmentManager,
} from "../../../store/slices/departmentsSlice";

export const getEmployeesList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/employee/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        dispatch(setEmployees(res.data.employees));
        sessionStorage.setItem("employees", JSON.stringify(res.data.employees));
      }
      return res;
    } catch (error) {
      logPostError(error);
      throw error;
    }
  };
};

export const getEmployeesByDepartmentAndRole = (departmentId, role) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/organization/employee/list?page=1&page_size=200&department=${departmentId}&role=${role}`
      );
      if (res.status === 200) {
        if (role === "head") {
          dispatch(setDepartmentManager(res.data.employees));
        } else {
          dispatch(setDepartmentEmployees(res.data.employees));
        }
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
      const res = await $authHost.post(`/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 10));
        toast.success("Сотрудник успешно создан!");
      }
      return res;
    } catch (error) {
      logPostError("createEmployee", error);
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
      const res = await $authHost.put(`/organization/employee`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 10));
        dispatch(getEmployeeById(data.employee_id));
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

/**
 * @param contact_id string
 * @param type string
 * @param value string
 *
 * @returns {Promise<void>}
 */
export const updateEmployeeContact = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.put(`/organization/contact`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 200));
        dispatch(getEmployeeById(data.employee_id));
        toast.success("Контактные данные сотрудника были успешно обновлены!");
      }
      return res;
    } catch (error) {
      logPostError("updateEmployeeContact", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};

export const createEmployeeContact = (data) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.post(`/organization/contact`, data);
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 200));
        dispatch(getEmployeeById(data.employee_id));
        toast.success("Контактные данные сотрудника были успешно созданы!");
      }
      return res;
    } catch (error) {
      logPostError("createEmployeeContact", error);
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
        `/organization/employee?employee_id=${id}`
      );
      if (res.status === 200) {
        dispatch(setEmployee(res.data.employee));
        sessionStorage.setItem("employee", JSON.stringify(res.data.employee));
      }
      return res;
    } catch (error) {
      console.error("getEmployeeById", error);
      throw error;
    }
  };
};

export const deleteEmployee = (id) => {
  return async (dispatch) => {
    dispatch(setEmployeesLoading(true));
    try {
      const res = await $authHost.delete(
        `/organization/employee?employee_id=${id}`
      );
      if (res.status === 200) {
        dispatch(getEmployeesList(1, 10));
        toast.success("Сотрудник успешно удален!");
      }
      return res;
    } catch (error) {
      logPostError("deleteEmployee", error);
      throw error;
    } finally {
      dispatch(setEmployeesLoading(false));
    }
  };
};
