import Cookies from "js-cookie";
import {
  removeUserDetails,
  updateUserDetails,
} from "../slices/userDetailsSlice";
import { handleApiError } from "../../utils/apiError";
import apiClient from "../../utils/axios";
import { startLoading, stopLoading } from "../slices/loadingSlice";

// Login API
export const userLogin = (params) => async (dispatch) => {
  dispatch(removeUserDetails());
  try {
    const payload = {
      username: params.username,
      password: params.password,
      role: params.role,
    };
    const response = await apiClient.post("/login", payload, {
      headers: {
        skipAuth: true,
      },
    });
    const { data } = response;
    if (response.status === 200) {
      Cookies.set("accessToken", data.user.token, { expires: 1 });
      dispatch(
        updateUserDetails({
          username: data.user.username,
          name: data.user.name,
          userId: data.user.id,
          userRole: data.user.role,
        })
      );
    }
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Change Password API
export const changePassword = (params) => async (dispatch) => {
  try {
    const payload = {
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    };
    const response = await apiClient.post("/change-password", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
