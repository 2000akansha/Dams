import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axios";
import { startLoading, stopLoading } from "../slices/loadingSlice";
import {
  removeVillagesList,
  updateVillagesList,
} from "../slices/villagesListSlice";

// API to fetch villages list
export const getVillagesList = () => async (dispatch) => {
  dispatch(startLoading());
  dispatch(removeVillagesList());

  try {
    const response = await apiClient.get(`/villages`);
    if (response.status === 200) {
      dispatch(updateVillagesList(response.data.villages));
    }
    dispatch(stopLoading());
    return response.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};
