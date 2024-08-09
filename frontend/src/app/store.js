import { configureStore } from "@reduxjs/toolkit";
import propertyReducer from "../features/property/propertySlice";
import authReducer from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    propertise: propertyReducer,
    auth: authReducer,
  },
});

export default store;
