import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  details: "",
};

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    updateUserDetails: (state, action) => {
      const data = action.payload;
      state.details = data;
    },
    removeUserDetails: (state) => {
      state.details = "";
    },
  },
});

export const { updateUserDetails, removeUserDetails } =
  userDetailsSlice.actions;
export default userDetailsSlice.reducer;
