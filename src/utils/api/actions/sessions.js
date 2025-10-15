import { setSessions } from "../../../store/slices/sessionsSlice";
import { $authHost } from "../http";

export const getSessions = () => {
  return async (dispatch) => {
    await $authHost
      .get("/user/session/list")
      .then((res) => {
        if (res.status === 200) {
          dispatch(setSessions(res.data.sessions));
          localStorage.setItem(
            "sessions_data",
            JSON.stringify(res.data.sessions)
          );
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
        } else {
          if (err.request) {
            console.log(err.request);
          } else {
            console.log(err.message);
          }
        }
      });
  };
};

export const revokeSession = (session_id, setLoading) => {
  setLoading(true);
  return async (dispatch) => {
    await $authHost
      .post("/user/session/revoke", { session_id })
      .then((res) => {
        if (res.status === 200) {
          console.log("object");
          dispatch(getSessions());
          return res.data;
        } else {
          return Promise.reject(new Error("Ошибка при завершении сессии"));
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          return Promise.reject(err.response.data);
        } else {
          if (err.request) {
            console.log(err.request);
            return Promise.reject("Сервер не ответил");
          } else {
            console.log(err.message);
            return Promise.reject(err.message);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
};
