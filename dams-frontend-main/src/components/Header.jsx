import React, { useState } from "react";
import CONSTANTS from "../constants.json";
import ChangePassword from "./ChangePassword";
import HeaderDropdown from "./HeaderDropdown";

const Header = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="flex justify-between items-center gap-5 px-8 py-3 bg-slate-800">
      <div className="flex">
        <div className="bg-white rounded-lg p-2 flex justify-center items-center">
          <img src="/logo02.png" alt="logo" width="80" />
        </div>
        <div className="text-gray-200 font-semibold text-md max-w-[350px] flex justify-center items-center text-center">
          {CONSTANTS.PROJECT_NAME}
        </div>
      </div>
      <HeaderDropdown setModalOpen={setModalOpen} />
      {isModalOpen && <ChangePassword closeModal={() => setModalOpen(false)} />}
    </div>
  );
};

export default Header;
