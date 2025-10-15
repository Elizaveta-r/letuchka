import { toast } from "sonner";
import {
  setPositions,
  setPositionsLoading,
} from "../../../store/slices/positionsSlice";
import { $authHost } from "../http";
import { logPostError } from "../helpers/logErrorHelper";

export const getPositionsList = (page, pageSize) => {
  return async (dispatch) => {
    try {
      const res = await $authHost.get(
        `/v1/organization/position/list?page=${page}&page_size=${pageSize}`
      );
      if (res.status === 200) {
        dispatch(setPositions(res.data.positions));
        localStorage.setItem("positions", JSON.stringify(res.data.positions));
      }
      return res;
    } catch (error) {
      console.error("getPositionsList", error);
      throw error;
    }
  };
}; // rout: /v1/organization/position/list (page, page_size > 200)

export const createPosition = (data) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.post(`/v1/organization/position`, data);
      if (res.status === 200) {
        console.log("createPosition", res.data);
        if (res.status === 200) {
          dispatch(getPositionsList(1, 10));
          toast.success("Должность успешно создана!");
        }

        return res.data;
      }
      return res;
    } catch (error) {
      logPostError(error);
      console.error("createPosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
}; // rout: /v1/organization/position (name, description)

export const updatePosition = (data) => {
  return async (dispatch) => {
    dispatch(setPositionsLoading(true));
    try {
      const res = await $authHost.put(`/v1/organization/position`, data);
      if (res.status === 200) {
        dispatch(getPositionsList(1, 10));
        toast.success("Должность успешно обновлена!");
        return res.data;
      }
      return res;
    } catch (error) {
      logPostError(error);
      console.error("updatePosition", error);
      throw error;
    } finally {
      dispatch(setPositionsLoading(false));
    }
  };
}; // rout: /v1/organization/position (position_id, name, description)

export const deletePosition = () => {}; // rout: /v1/organization/position (not allowed)
