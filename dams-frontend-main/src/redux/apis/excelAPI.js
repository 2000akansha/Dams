import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axios";
import { startLoading, stopLoading } from "../slices/loadingSlice";

// API to upload excel file
export const uploadExcel = (formData) => async (dispatch) => {
  dispatch(startLoading());
  try {
    const result = await apiClient.post("/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    dispatch(stopLoading());
    return result.data;
  } catch (error) {
    dispatch(stopLoading());
    return handleApiError(error);
  }
};
