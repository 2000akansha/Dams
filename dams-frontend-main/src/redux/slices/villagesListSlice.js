import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};

const villagesListSlice = createSlice({
  name: "villagesList",
  initialState,
  reducers: {
    updateVillagesList: (state, action) => {
      const data = action.payload;
      state.list = data;
    },
    removeVillagesList: (state) => {
      state.list = [];
    },
  },
});

export const { updateVillagesList, removeVillagesList } =
  villagesListSlice.actions;
export default villagesListSlice.reducer;
