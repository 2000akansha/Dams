import { combineReducers } from "@reduxjs/toolkit";
import loadingSlice from "./slices/loadingSlice";
import userDetailsSlice from "./slices/userDetailsSlice";
import villagesListSlice from "./slices/villagesListSlice";
import beneficiariesListSlice from "./slices/beneficiariesListSlice";

const rootReducer = combineReducers({
  loadingSlice: loadingSlice,
  userDetailsSlice: userDetailsSlice,
  villagesListSlice: villagesListSlice,
  beneficiariesListSlice: beneficiariesListSlice,
});

export default rootReducer;
