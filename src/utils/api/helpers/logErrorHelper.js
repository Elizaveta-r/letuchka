import { toast } from "sonner";

export const logPostError = (method = "-", err) => {
  if (err?.response) {
    console.log(method, err.response.data);
    if (err.response.data?.message) toast.error(err.response.data.message);
  } else if (err?.request) {
    console.log(method, err.request);
  } else {
    console.log(method, err?.message);
  }
};
