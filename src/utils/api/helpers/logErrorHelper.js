import { toast } from "sonner";

export const logPostError = (err) => {
  if (err?.response) {
    console.log(err.response.data);
    if (err.response.data?.message) toast.error(err.response.data.message);
  } else if (err?.request) {
    console.log(err.request);
  } else {
    console.log(err?.message);
  }
};
