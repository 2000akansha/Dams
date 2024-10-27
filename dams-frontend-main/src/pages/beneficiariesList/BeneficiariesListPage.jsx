import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { groupByKhatauni } from "../../utils/filterGroupSearch";
import toast from "react-hot-toast";
import CONSTANTS from "../../constants.json";
import { RiFileExcel2Line } from "react-icons/ri";
import Pagination from "../../components/Pagination";
import { getVillageBeneficiariesList } from "../../redux/apis/beneficiariesAPI";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { SeprateString } from "../../utils/SeprateString";
import BackButton from "../../components/BackButton";

const BeneficiariesListPage = () => {
  const [allCheckbox, setAllCheckbox] = useState(false);
  const [disbursementFilter, setDisbursementFilter] = useState("");
  const [paginatedData, setPaginatedData] = useState([]);
  const [selectedKhatauni, setSelectedKhatauni] = useState([]);
  const [groupedBeneficiaries, setGroupedBeneficiaries] = useState({});
  const [filteredBeneficiariesList, setFilteredBeneficiariesList] = useState(
    []
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { villageId, villageName } = useParams();
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);

  const beneficiaryList = useSelector(
    (state) => state.beneficiariesListSlice.villageBeneficiaries
  );

  // To handle khatauni check
  const handleKhatauniCheck = (event) => {
    if (event.checked) {
      const khatauniArray = Object.keys(groupedBeneficiaries)?.map(
        (khatauni) => khatauni
      );
      if (khatauniArray.length === selectedKhatauni.length + 1) {
        setAllCheckbox(true);
      }
      setSelectedKhatauni([...selectedKhatauni, event.value]);
    } else {
      let updatedArray = selectedKhatauni.filter((num) => num !== event.value);
      setSelectedKhatauni(updatedArray);
      setAllCheckbox(false);
    }
  };

  // To handle select-all checkbox
  const handleAllKhatauniCheck = (event) => {
    if (event.checked) {
      const khatauniArray = Object.keys(groupedBeneficiaries)?.map(
        (khatauni) => khatauni
      );
      setSelectedKhatauni([...khatauniArray]);
      setAllCheckbox(true);
    } else {
      setAllCheckbox(false);
      setSelectedKhatauni([]);
    }
  };

  // To handle add details button
  const handleAddDetails = () => {
    const khatauni = selectedKhatauni.join("-");
    // villageName to be changed to villageId
    navigate(`/add-disbursement/${villageName}/${khatauni}`, {
      state: { disbursementFilter: disbursementFilter },
    });
  };

  // To handle add details button
  const setDisbursementStatus = (status) => {
    if (status == "1") {
      return <div className="text-green-500">(Added)</div>;
    } else {
      return <div className="text-red-500">(Pending)</div>;
    }
  };

  useEffect(() => {
    // Filtered data based on selected filters
    const filteredData = beneficiaryList?.filter((item) => {
      return (
        !disbursementFilter ||
        (disbursementFilter == "1"
          ? item.isDisbursementUploaded == "1"
          : item.isDisbursementUploaded == "0")
      );
    });
    setFilteredBeneficiariesList(filteredData);
  }, [disbursementFilter, beneficiaryList]);

  useEffect(() => {
    setGroupedBeneficiaries(groupByKhatauni(filteredBeneficiariesList));
  }, [filteredBeneficiariesList]);

  useEffect(() => {
    // Village beneficiaries API
    dispatch(getVillageBeneficiariesList(villageId)).then((res) => {
      if (res.success) {
        // Group beneficiaries by Khatauni
        setGroupedBeneficiaries(groupByKhatauni(res.beneficiaries));
      } else {
        toast.error(res.message);
      }
    });
  }, []);

  return (
    <div className="p-4">
      <div className="flex mt-1 justify-between gap-2 flex-wrap pb-6 items-center">
        <div className="flex gap-3 items-center justify-center">
          <BackButton />
          <div className="text-lg font-semibold text-gray-600 mb-2 sm:mb-0">
            {CONSTANTS.VILLAGE}: {villageName} - {CONSTANTS.BENEFICIARIES_LIST}
          </div>
        </div>
        {userRole === "0" && (
          <button
            onClick={() => {
              navigate(`/upload-beneficiaries/${villageId}/${villageName}`);
            }}
            className="bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-1 mb-2 sm:mb-0"
          >
            <div className="flex items-center gap-1">
              <RiFileExcel2Line size={20} />
              {CONSTANTS.BUTTON.UPLOAD_BENEFICIARIES_DATA}
            </div>
          </button>
        )}
      </div>
      {userRole == "0" && (
        <>
          <h2 className="text-sm block font-semibold text-gray-700">
            Filters:
          </h2>
          <div className="mt-1 flex justify-start items-center gap-5 mb-4">
            {/* Disbursement Filter */}
            <div>
              <select
                className="custom-input border-gray-500 px-5 py-1 cursor-pointer"
                value={disbursementFilter}
                onChange={(e) => {
                  setDisbursementFilter(e.target.value);
                }}
              >
                <option value="" disabled className="text-white bg-stone-300">
                  Disbursement Details
                </option>
                <option value="">All</option>
                <option value="1">Added</option>
                <option value="0">Pending</option>
              </select>
            </div>
          </div>
        </>
      )}
      <div className="overflow-auto border rounded-lg shadow-lg">
        {/* Table Header */}
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-200 text-sm">
            <tr>
              {userRole === "0" && (
                <th className="px-3 py-2 font-medium text-center">
                  {CONSTANTS.DISBURSEMENT_STATUS}
                </th>
              )}
              <th className="px-3 py-2 text-center">
                {CONSTANTS.SERIAL_NUMBER}
              </th>
              <th className="px-3 py-2">{CONSTANTS.BENEFICIARY_NAME}</th>
              <th className="px-3 py-2">{CONSTANTS.KHASRA_NUMBER}</th>
              <th className="px-3 py-2">{CONSTANTS.AREA_VARIETY}</th>
              <th className="px-3 py-2">{CONSTANTS.ACQUIRED_KHASRA_NUMBER}</th>
              <th className="px-3 py-2">{CONSTANTS.ACQUIRED_RAKBA}</th>
              <th className="px-3 py-2">{CONSTANTS.BENEFICIARY_SHARE}</th>
              <th className="px-3 py-2">
                {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE}
              </th>
              <th className="px-3 py-2">{CONSTANTS.LAND_PRICE_PER_SQ_MT}</th>
            </tr>
          </thead>
          {beneficiaryList?.length > 0 ? (
            <tbody className="text-sm">
              <tr>
                <td
                  colSpan={userRole === "0" ? "10" : "9"}
                  className="px-4 py-2 font-semibold"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        id="all"
                        checked={allCheckbox}
                        className="form-checkbox"
                        onChange={(event) => {
                          handleAllKhatauniCheck(event.target);
                        }}
                      />
                      <label htmlFor="all" className="cursor-pointer">
                        {CONSTANTS.BUTTON.SELECT_ALL}
                      </label>
                    </div>
                    <div className="flex justify-end space-x-4">
                      {userRole !== "0" && (
                        <button
                          disabled={!selectedKhatauni.length}
                          className={`text-white px-4 py-1 rounded-md text-sm ${
                            selectedKhatauni.length
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {CONSTANTS.BUTTON.DOWNLOAD_INVOICE}
                        </button>
                      )}
                      {userRole === "0" && (
                        <button
                          disabled={!selectedKhatauni.length}
                          onClick={() => {
                            handleAddDetails();
                          }}
                          className={`text-white px-4 py-1 rounded-md text-sm ${
                            selectedKhatauni.length
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-gray-300 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex gap-1 items-center justify-center">
                            <MdOutlineLibraryAdd size={16} />
                            {CONSTANTS.BUTTON.ADD_DISBURSEMENT_DETAILS}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              {/* Iterate over each (Khatauni) group */}
              {paginatedData?.map((khatauniSankhya) => (
                <React.Fragment key={khatauniSankhya}>
                  {/* Section Header */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={userRole === "0" ? "10" : "9"}
                      className="px-4 py-2 font-semibold"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <input
                            value={khatauniSankhya}
                            id={khatauniSankhya}
                            checked={selectedKhatauni.includes(khatauniSankhya)}
                            type="checkbox"
                            className="form-checkbox"
                            onChange={(event) => {
                              handleKhatauniCheck(event.target);
                            }}
                          />
                          <label
                            htmlFor={khatauniSankhya}
                            className="cursor-pointer"
                          >
                            {CONSTANTS.KHATAUNI_SANKHYA}: {khatauniSankhya}
                          </label>
                        </div>
                        <div className="py-1 flex gap-4 justify-center items-center">
                          <Link
                            to={`/beneficiaries-details/${villageId}/${khatauniSankhya}`}
                            state={{ disbursementFilter: disbursementFilter }}
                            className="text-blue-600 group"
                          >
                            <div className="relative">
                              {CONSTANTS.BUTTON.VIEW_BENEFICIARIES_DETAILS}
                              <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
                            </div>
                          </Link>
                          {userRole === "0" && (
                            <Link
                              to={`/add-disbursement/${villageName}/${khatauniSankhya}`}
                              state={{ disbursementFilter: disbursementFilter }}
                              className="text-blue-600 group"
                            >
                              <div className="relative">
                                {CONSTANTS.BUTTON.ADD_DISBURSEMENT_DETAILS}
                                <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Rows for each Serial Number under Khatauni Sankhya */}
                  {groupedBeneficiaries[khatauniSankhya]?.map((item) => (
                    <tr key={item.beneficiaryId}>
                      {userRole === "0" && (
                        <td className="px-3 py-2 text-center">
                          {setDisbursementStatus(item.isDisbursementUploaded)}
                        </td>
                      )}
                      <td className="px-3 py-2 text-center">
                        {item.serialNumber}
                      </td>
                      <td className="px-3 py-2">{item.beneficiaryName}</td>
                      <td className="px-3 py-2">
                        {SeprateString(item.khasraNumber)}
                      </td>
                      <td className="px-3 py-2">
                        {SeprateString(item.areaVariety)}
                      </td>
                      <td className="px-3 py-2">
                        {SeprateString(item.acquiredKhasraNumber)}
                      </td>
                      <td className="px-3 py-2">
                        {SeprateString(item.acquiredRakbha)}
                      </td>
                      <td className="px-3 py-2">{item.beneficiaryShare}</td>
                      <td className="px-3 py-2">
                        {item.acquiredBeneficiaryShare}
                      </td>
                      <td className="px-3 py-2">{item.landPricePerSqMt}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          ) : (
            <tbody className="text-sm">
              <tr className="py-5">
                <td
                  colSpan={userRole === "0" ? "10" : "9"}
                  className="px-4 py-5 font-semibold text-center"
                >
                  {CONSTANTS.NO_DATA}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        data={groupedBeneficiaries}
        itemsPerPage={2}
        setPaginatedData={setPaginatedData}
      />
    </div>
  );
};

export default BeneficiariesListPage;
