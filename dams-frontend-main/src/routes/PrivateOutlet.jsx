import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

const PrivateOutlet = () => {
  const user = useSelector((state) => state.userDetailsSlice.details);
  if (!user) {
    Cookies.remove("accessToken");
  }
  const isAuthenticated = Cookies.get("accessToken");
  return isAuthenticated && user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateOutlet;
