import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  integrations: sessionStorage.getItem("integrations")
    ? JSON.parse(sessionStorage.getItem("integrations"))
    : null,
  editedIntegration: null,
  isIntegrationLoading: false,
};

const integrationsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setIntegrationsList(state, action) {
      state.integrations = action.payload;
      sessionStorage.setItem(
        "integrations",
        JSON.stringify(state.integrations)
      );
    },
    setEditedIntegration(state, action) {
      state.editedIntegration = action.payload;
    },
    setIsIntegrationLoading(state, action) {
      state.isIntegrationLoading = action.payload;
    },
  },
});

export const {
  setIntegrationsList,
  setEditedIntegration,
  setIsIntegrationLoading,
} = integrationsSlice.actions;
export default integrationsSlice.reducer;
