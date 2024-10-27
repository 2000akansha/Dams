import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  villageBeneficiaries: [],
  paymentBeneficiaries: [],
  beneficiariesDetails: [],
};

const beneficiariesListSlice = createSlice({
  name: "beneficiariesList",
  initialState,
  reducers: {
    updateAllBeneficiariesList: (state, action) => {
      state.list = [...action.payload];
    },
    removeAllBeneficiariesList: (state) => {
      state.list = [];
    },
    updateVillageBeneficiariesList: (state, action) => {
      state.villageBeneficiaries = [...action.payload];
    },
    removeVillageBeneficiariesList: (state) => {
      state.villageBeneficiaries = [];
    },
    updateBeneficiariesDetails: (state, action) => {
      state.beneficiariesDetails = [...action.payload];
    },
    removeBeneficiariesDetails: (state) => {
      state.beneficiariesDetails = [];
    },
    updatePaymentBeneficiaries: (state, action) => {
      state.paymentBeneficiaries = [...action.payload];
    },
    removePaymentBeneficiaries: (state) => {
      state.paymentBeneficiaries = [];
    },
  },
});

export const {
  updateAllBeneficiariesList,
  updateVillageBeneficiariesList,
  updateBeneficiariesDetails,
  updatePaymentBeneficiaries,
  removeAllBeneficiariesList,
  removeVillageBeneficiariesList,
  removeBeneficiariesDetails,
  removePaymentBeneficiaries,
} = beneficiariesListSlice.actions;
export default beneficiariesListSlice.reducer;
