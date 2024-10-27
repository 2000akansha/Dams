import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axios";
import {
  removeAllBeneficiariesList,
  removeBeneficiariesDetails,
  removePaymentBeneficiaries,
  removeVillageBeneficiariesList,
  updateAllBeneficiariesList,
  updateBeneficiariesDetails,
  updatePaymentBeneficiaries,
  updateVillageBeneficiariesList,
} from "../slices/beneficiariesListSlice";
import { startLoading, stopLoading } from "../slices/loadingSlice";

// API to fetch all beneficiaries list
export const getBeneficiariesList = (userId) => async (dispatch) => {
  dispatch(startLoading());
  dispatch(removeAllBeneficiariesList());
  try {
    const response = await apiClient.get(`/beneficiaries-list`);
    if (response.status === 200) {
      dispatch(updateAllBeneficiariesList(response.data.beneficiaries));
    }
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to fetch beneficiaries list with respect to village
export const getVillageBeneficiariesList = (villageId) => async (dispatch) => {
  dispatch(startLoading());
  dispatch(removeVillageBeneficiariesList());
  try {
    const response = await apiClient.get(`/village-beneficiaries`, {
      params: { villageId },
    });
    if (response.status === 200) {
      dispatch(updateVillageBeneficiariesList(response.data.beneficiaries));
    }
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to fetch beneficiaries details list with respect to village and selected khatauni
export const getBeneficiariesDetails =
  (villageId, khatauniSankhya, id, userRole, ids, disbursementFilter) =>
  async (dispatch) => {
    dispatch(startLoading());
    dispatch(removeBeneficiariesDetails());
    try {
      const response = await apiClient.get(`/beneficiaries-details`, {
        params: { villageId, khatauniSankhya },
      });
      if (response.status === 200) {
        let data = response.data.beneficiaries.sort(
          (a, b) => a.serialNumber - b.serialNumber
        );
        if (userRole !== "0" && !id) {
          data = data.filter(
            (item) =>
              item.beneficiaryType !== "nok" && item.beneficiaryType !== "poa"
          );
        }
        if (id) {
          data = data.filter((item) => item.beneficiaryId === id);
        }
        if (ids) {
          data = data.filter((item) => ids.includes(item.beneficiaryId));
        }
        if (disbursementFilter) {
          data = data.filter(
            (item) =>
              item.isDisbursementUploaded === disbursementFilter &&
              item.beneficiaryType !== "nok" &&
              item.beneficiaryType !== "poa"
          );
        }
        dispatch(updateBeneficiariesDetails(data));
      }
      dispatch(stopLoading());
      return response.data;
    } catch (error) {
      dispatch(stopLoading());
      return handleApiError(error);
    }
  };

// API to fetch all beneficiaries payment status list
export const getPaymentBeneficiariesList = () => async (dispatch) => {
  dispatch(startLoading());
  dispatch(removePaymentBeneficiaries());
  try {
    const response = await apiClient.get(`/payment-beneficiaries`);
    if (response.status === 200) {
      dispatch(updatePaymentBeneficiaries(response.data.beneficiaries));
    }
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to upload beneficiaries disbursement details
export const uploadDisbursementDetails = (payload) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiClient.post("/add-disbursements", payload);
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to verify beneficiary details
export const verifyDetails = (payload) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiClient.post("/verify-details", payload);
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to raise a query
export const raiseQuery = (formData) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiClient.post("/add-query", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};

// API to add legal heir
export const addLegalHeir = (payload) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const response = await apiClient.post("/add-legal-heir", payload);
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};
