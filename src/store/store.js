import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";
import billingReducer, { billingListener } from "./slices/billingSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    billing: billingReducer,
  },
  middleware: (gDM) => gDM().prepend(billingListener.middleware),
});
