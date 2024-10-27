import React, { useEffect, useState } from "react";
import VillageDetails from "./components/VillageDetails";
import { useDispatch, useSelector } from "react-redux";
import { getVillagesList } from "../../redux/apis/villagesAPI";
import toast from "react-hot-toast";
import CONSTANTS from "../../constants.json";

const DashboardPage = () => {
  // Get list of villages from redux store
  const villagesList = useSelector((state) => state.villagesListSlice.list);
  const dispatch = useDispatch();

  useEffect(() => {
    // Village list API
    dispatch(getVillagesList()).then((res) => {
      if (!res.success) {
        toast.error(res.message);
      }
    });
  }, []);

  return (
    <div className="p-4">
      {/* Heading */}
      <h1 className="text-xl font-semibold mb-6 text-gray-600">
        {CONSTANTS.PAGES_NAME.VILLAGES_LIST}
      </h1>

      {villagesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Villages List */}
          {villagesList?.map((village) => (
            <VillageDetails
              key={village.villageId}
              villageId={village.villageId}
              villageName={village.villageName}
              villageNameHindi={village.villageNameHindi}
              villageArea={village.villageArea}
              khatauni={village.khatauni}
              totalBeneficiaries={village.totalBeneficiaries}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center h-[350px] items-center font-semibold text-gray-500">{CONSTANTS.NO_DATA}</div>
      )}
    </div>
  );
};

export default DashboardPage;
