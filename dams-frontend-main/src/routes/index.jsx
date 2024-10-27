import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, useMemo } from "react";
import { useSelector } from "react-redux";

// Lazy load the components
const LoginPage = lazy(() => import("../pages/login/LoginPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const PublicOutlet = lazy(() => import("./PublicOutlets"));
const PrivateOutlet = lazy(() => import("./PrivateOutlet"));
const HomePage = lazy(() => import("../pages/home/HomePage"));
const BeneficiariesListPage = lazy(() =>
  import("../pages/beneficiariesList/BeneficiariesListPage")
);
const UploadBeneficiariesPage = lazy(() =>
  import("../pages/uploadBeneficiaries/UploadbeneficiariesPage")
);
const BeneficiariesDetailsPage = lazy(() =>
  import("../pages/beneficiariesDetails/BeneficiariesDetailsPage")
);
const AddDisbursementPage = lazy(() =>
  import("../pages/addDisbursement/AddDisbursementPage")
);
const AllBeneficiariesListPage = lazy(() =>
  import("../pages/allBeneficiariesList/AllBeneficiariesListPage")
);
const PaymentStatusPage = lazy(() =>
  import("../pages/paymentStatus/PaymentStatusPage")
);

const RouterComponent = () => {
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);

  // useMemo to prevent re-creation of router object on every render
  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
      {
        path: "/login",
        element: <PublicOutlet />,
        children: [
          {
            index: true,
            element: <LoginPage />,
          },
        ],
      },
      {
        path: "/",
        element: <PrivateOutlet />,
        children: [
          {
            element: <HomePage />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
              {
                path: "beneficiaries-list/:villageId/:villageName",
                element: <BeneficiariesListPage />,
              },
              {
                path: "upload-beneficiaries/:villageId/:villageName",
                element:
                  userRole === "0" ? (
                    <UploadBeneficiariesPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  ),
              },
              {
                path: "beneficiaries-details/:villageId/:khatauni/:id?",
                element: <BeneficiariesDetailsPage />,
              },
              {
                path: "add-disbursement/:villageName/:khatauni",
                element:
                  userRole === "0" ? (
                    <AddDisbursementPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  ),
              },
              {
                path: "all-beneficiaries-list",
                element: <AllBeneficiariesListPage />,
              },
              {
                path: "payment-status",
                element:
                  userRole !== "0" ? (
                    <PaymentStatusPage />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  ),
              },
            ],
          },
        ],
      },
    ]);
  }, [userRole]); // Only recreate the router if userRole changes

  return router;
};

export default RouterComponent;
