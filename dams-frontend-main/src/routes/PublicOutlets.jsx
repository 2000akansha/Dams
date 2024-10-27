import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PublicOutlet = () => {
  const isAuthenticated = Cookies.get("accessToken");
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default PublicOutlet;
