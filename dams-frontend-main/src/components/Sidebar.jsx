import { BsHouses } from "react-icons/bs";
import { useSelector } from "react-redux";
import CONSTANTS from "../constants.json";
import { NavLink } from "react-router-dom";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { MdPeople, MdOutlinePayments } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ toggleSidebar, setToggleSidebar }) => {
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);
  return (
    <div className="m-0 py-4 px-3 flex flex-col h-full justify-between ">
      <div className="flex flex-col gap-3 justify-center">
        {/* DASHBOARD */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block rounded-md py-2 ${
              isActive ? "bg-primary text-white" : "hover:bg-gray-100"
            } ${toggleSidebar ? "px-1" : "px-4"}`
          }
        >
          <div
            className={`flex items-center gap-2 ${
              toggleSidebar && "justify-center"
            }`}
          >
            <BsHouses className="text-lg" />
            <div
              className={`${
                toggleSidebar
                  ? "hidden transition-all duration-300"
                  : "block transition-all duration-300"
              }`}
            >
              {CONSTANTS.SIDEBAR.DASHBOARD}
            </div>
          </div>
        </NavLink>
        {/* BENEFICIARIES LIST */}
        <NavLink
          to="/all-beneficiaries-list"
          className={({ isActive }) =>
            `block rounded-md ${
              isActive ? "bg-primary text-white" : "hover:bg-gray-100"
            } ${toggleSidebar ? "py-[8px] px-1" : "py-2 px-4"}`
          }
        >
          <div
            className={`flex items-center gap-2 ${
              toggleSidebar && "justify-center"
            }`}
          >
            <MdPeople className="text-lg" />
            <div
              className={`${
                toggleSidebar
                  ? "hidden transition-all duration-300"
                  : "block transition-all duration-300"
              }`}
            >
              {CONSTANTS.SIDEBAR.BENEFICIARIES_LIST}
            </div>
          </div>
        </NavLink>
        {/* PAYMENT STATUS */}
        {userRole === "3" && (
          <NavLink
            to="/payment-status"
            className={({ isActive }) =>
              `block rounded-md ${
                isActive ? "bg-primary text-white" : "hover:bg-gray-100"
              } ${toggleSidebar ? "py-[8px] px-1" : "py-2 px-4"}`
            }
          >
            <div
              className={`flex items-center gap-2 ${
                toggleSidebar && "justify-center"
              }`}
            >
              <MdOutlinePayments className="text-lg" />
              <div
                className={`${
                  toggleSidebar
                    ? "hidden transition-all duration-300"
                    : "block transition-all duration-300"
                }`}
              >
                {CONSTANTS.SIDEBAR.PAYMENT_STATUS}
              </div>
            </div>
          </NavLink>
        )}
      </div>
      <div className={`flex justify-end w-full`}>
        <button
          className="flex items-center justify-center py-2 px-3 rounded-md hover:bg-gray-100"
          onClick={() => {
            setToggleSidebar(!toggleSidebar);
          }}
        >
          {toggleSidebar ? <FaAnglesRight /> : <FaAnglesLeft />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
