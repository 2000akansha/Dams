import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";
import {
  getKhatauniOptions,
  groupByKhatauni,
} from "../../utils/filterGroupSearch";
import CONSTANTS from "../../constants.json";
import { getBeneficiariesList } from "../../redux/apis/beneficiariesAPI";
import { Link } from "react-router-dom";
import { SeprateString } from "../../utils/SeprateString";

const AllBeneficiariesListPage = () => {
  const [searchBy, setSearchBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [villageName, setVillageName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [queryStatus, setQueryStatus] = useState("");
  const [paginatedData, setPaginatedData] = useState([]);
  const [khatauniSankhya, setKhatauniSankhya] = useState("");
  const [groupedBeneficiaries, setGroupedBeneficiaries] = useState({});
  const [filteredBeneficiariesList, setFilteredBeneficiariesList] = useState(
    []
  );

  const dispatch = useDispatch();
  const beneficiaryList = useSelector(
    (state) => state.beneficiariesListSlice.list
  );
  const villagesList = useSelector((state) => state.villagesListSlice.list);
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);

  // Get unique khatauni based on village
  const khatauniOptions = getKhatauniOptions(beneficiaryList, villageName);

  // Search
  const handleSearch = () => {
    const filteredData = beneficiaryList?.filter((item) => {
      if (searchBy === "aadhar") {
        return item.aadhar.includes(searchTerm);
      }
      if (searchBy === "pancard") {
        return item.pancard.includes(searchTerm);
      }
      if (searchBy === "name") {
        return (
          typeof item?.beneficiaryName === "string" &&
          item.beneficiaryName
            .toLowerCase()
            .startsWith(searchTerm.toLowerCase())
        );
      }
      return false;
    });
    setFilteredBeneficiariesList(filteredData);
    setVillageName("");
    setKhatauniSankhya("");
    setSearchBy("");
    setVerificationStatus("");
    setQueryStatus("");
    setIsModalOpen(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilteredBeneficiariesList(beneficiaryList);
    setVillageName("");
    setKhatauniSankhya("");
    setSearchBy("");
    setSearchTerm("");
    setVerificationStatus("");
    setQueryStatus("");
  };

  // Function to set userRole
  const setRole = (role) => {
    if (role == "1") {
      return "Verifier";
    } else if (role == "2") {
      return "Finance";
    } else if (role == "3") {
      return "DC Admistration";
    } else {
      return "Inputer";
    }
  };

  // Set beneficiary type
  const setBeneficiaryType = (type) => {
    if (type === "self") {
      return <div className="text-green-500">Self</div>;
    }
    if (type === "poa") {
      return <div className="text-red-500">POA</div>;
    }
    if (type === "nok") {
      return <div className="text-red-500">NOK</div>;
    }
    if (type === "poah") {
      return <div className="text-blue-500">POA-H</div>;
    }
    if (type === "nokh") {
      return <div className="text-blue-500">NOK-H</div>;
    }
  };

  // Set Beneficiary Status
  const setBeneficiaryStatus = (beneficiary) => {
    if (beneficiary?.hasQuery == "1") {
      return (
        <div className="text-yellow-500">
          (Query) [
          {beneficiary?.verificationLevel !== userRole ? "Raised" : "Arrived"}]
        </div>
      );
    }
    if (beneficiary?.verificationStatus == "0") {
      return <div className="text-red-500">(Rejected)</div>;
    }
    if (
      beneficiary?.verificationStatus == "1" &&
      beneficiary?.verificationLevel == userRole
    ) {
      return <div className="text-green-500">(Verified)</div>;
    }
    return <div className="text-blue-500">(Pending)</div>;
  };

  useEffect(() => {
    if (!searchBy && !searchTerm) {
      // Filtered data based on selected filters
      const filteredData = beneficiaryList?.filter((item) => {
        return (
          (!villageName || item.villageName === villageName) &&
          (!khatauniSankhya || item.khatauniSankhya == khatauniSankhya) &&
          (!verificationStatus ||
            (verificationStatus == "1"
              ? item.verificationStatus == "1" &&
                item.verificationLevel == userRole
              : verificationStatus == "2"
              ? item.verificationStatus == "0" &&
                item.verificationLevel == userRole
              : verificationStatus == "3"
              ? (item.verificationStatus == "1" ||
                  item.verificationStatus == "") &&
                item.verificationLevel != userRole
              : item.verificationStatus == "0" &&
                item.verificationLevel !== userRole)) &&
          (!queryStatus ||
            (queryStatus == "raised"
              ? item.hasQuery == "1" && item.verificationLevel !== userRole
              : item.hasQuery == "1" && item.verificationLevel == userRole))
        );
      });
      setFilteredBeneficiariesList(filteredData);
    }
  }, [
    villageName,
    khatauniSankhya,
    verificationStatus,
    queryStatus,
    beneficiaryList,
  ]);

  useEffect(() => {
    // Group beneficiaries by Khatauni after filtering
    setGroupedBeneficiaries(groupByKhatauni(filteredBeneficiariesList));
  }, [filteredBeneficiariesList]);

  useEffect(() => {
    // Open search modal
    if (searchTerm) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setSearchBy("");
    }
  }, [searchTerm]);

  useEffect(() => {
    // Beneficiaries list API
    dispatch(getBeneficiariesList()).then((res) => {
      if (!res.success) {
        toast.error(res.message);
      }
    });
  }, []);

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="text-lg font-semibold text-gray-600 mb-2 sm:mb-0 pb-5">
        {CONSTANTS.PAGES_NAME.BENEFICIARIES_LIST}
      </div>

      {/* Search Input */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700">
          Search:
        </label>
        <input
          type="text"
          className="mt-1 block w-full custom-input py-1 px-5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`${
            userRole === "0"
              ? "Search by Name"
              : "Search by Name, Aadhar or PAN Number"
          }`}
        />

        {/* Modal for Radio Buttons */}
        {isModalOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white border rounded-md shadow-2xl p-4 z-10">
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700">
                Search By
              </span>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="searchBy"
                    value="name"
                    id="name"
                    onChange={(e) => setSearchBy(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    className="ml-2 block text-sm font-medium text-gray-600"
                    htmlFor="name"
                  >
                    Name
                  </label>
                </div>
                {userRole !== "0" && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="searchBy"
                        value="aadhar"
                        id="aadhar"
                        onChange={(e) => setSearchBy(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        className="ml-2 block text-sm font-medium text-gray-600"
                        htmlFor="aadhar"
                      >
                        Aadhar
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="searchBy"
                        value="pancard"
                        id="pancard"
                        onChange={(e) => setSearchBy(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        className="ml-2 block text-sm font-medium text-gray-600"
                        htmlFor="pancard"
                      >
                        PAN Card
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search Button */}
            <div className="w-full flex justify-center">
              <button
                className={`w-[200px] py-1 px-3 rounded-md shadow-sm text-white 
                ${
                  searchBy
                    ? "bg-secondary hover:bg-primary"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!searchBy}
                onClick={() => {
                  handleSearch();
                }}
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="text-sm block font-semibold text-gray-700">Filters:</h2>
      <div className="mt-1 flex justify-start items-center gap-5 mb-4">
        {/* Village Filter */}
        <div>
          <select
            className="custom-input border-gray-500 px-5 py-1 cursor-pointer"
            value={villageName}
            onChange={(e) => {
              setVillageName(e.target.value);
              setSearchBy("");
              setSearchTerm("");
              setKhatauniSankhya("");
            }}
          >
            <option value="" disabled className="text-white bg-stone-300">
              Village
            </option>
            {villagesList?.map((village) => (
              <option key={village.villageId} value={village.villageName}>
                {village.villageName}
              </option>
            ))}
          </select>
        </div>
        {/* KhatauniSankhya Filter */}
        <div>
          <select
            className={`custom-input border-gray-500 px-5 py-1 ${
              villageName && "cursor-pointer"
            }`}
            value={khatauniSankhya}
            disabled={!villageName}
            onChange={(e) => setKhatauniSankhya(e.target.value)}
          >
            <option value="" disabled className="text-white bg-stone-300">
              Khatauni
            </option>
            {[...new Set(khatauniOptions)]?.map((khatauni, index) => (
              <option key={index} value={khatauni}>
                {khatauni}
              </option>
            ))}
          </select>
        </div>
        {/* Verification Filter */}
        <div>
          <select
            className="custom-input border-gray-500 px-5 py-1 cursor-pointer"
            value={verificationStatus}
            onChange={(e) => {
              setQueryStatus("");
              setVerificationStatus(e.target.value);
            }}
          >
            <option value="" disabled className="text-white bg-stone-300">
              Verification
            </option>
            {userRole !== "0" && (
              <option key="3" value="3">
                Pending
              </option>
            )}
            {userRole !== "0" && (
              <option key="1" value="1">
                Verified (By {setRole(userRole)})
              </option>
            )}
            {userRole !== "0" && (
              <option key="0" value="0">
                Rejected (By {setRole(userRole)})
              </option>
            )}
            {userRole !== "3" && (
              <option key="2" value="2">
                Rejected (By {setRole((parseFloat(userRole) + 1).toString())})
              </option>
            )}
          </select>
        </div>
        {/* Query Filter */}
        <div>
          <select
            className="custom-input border-gray-500 px-5 py-1 cursor-pointer"
            value={queryStatus}
            onChange={(e) => {
              setVerificationStatus("");
              setQueryStatus(e.target.value);
            }}
          >
            <option value="" disabled className="text-white bg-stone-300">
              Queries
            </option>
            {userRole !== "3" && (
              <option key="" value="arrived">
                Arrived
              </option>
            )}
            {userRole !== "0" && (
              <option key="2" value="raised">
                Raised
              </option>
            )}
          </select>
        </div>
        {/* Clear filter */}
        <div>
          <div
            className="text-blue-500 relative cursor-pointer group"
            onClick={() => handleClearFilters()}
          >
            {CONSTANTS.BUTTON.CLEAR_FILTERS}
            <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-scroll custom-scrollbar border rounded-lg shadow-lg">
        {/* Table Header */}
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th className="px-3 py-2 text-center min-w-[100px]">
                {CONSTANTS.TYPE}
              </th>
              <th className="px-3 py-2 text-center">
                {CONSTANTS.VERIFICATION_STATUS}
              </th>
              <th className="px-3 py-2">{CONSTANTS.SERIAL_NUMBER}</th>
              <th className="px-3 py-2 min-w-[150px]">
                {CONSTANTS.BENEFICIARY_NAME}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.KHASRA_NUMBER}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.AREA_VARIETY}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.ACQUIRED_KHASRA_NUMBER}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.ACQUIRED_RAKBA}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.BENEFICIARY_SHARE}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE}
              </th>
              <th className="px-3 py-2 min-w-[100px]">
                {CONSTANTS.LAND_PRICE_PER_SQ_MT}
              </th>
              <th className="px-3 py-2 min-w-[100px]"></th>
            </tr>
          </thead>
          {filteredBeneficiariesList?.length > 0 ? (
            <tbody className="text-sm">
              {/* Iterate over each group (Khatauni Sankhya) */}
              {paginatedData?.map((khatauniSankhya) => (
                <React.Fragment key={khatauniSankhya}>
                  {/* Section Header */}
                  <tr className="bg-gray-100">
                    <td colSpan="12" className="px-4 py-2 font-semibold">
                      <div className="flex gap-2">
                        {CONSTANTS.KHATAUNI_SANKHYA}: {khatauniSankhya}
                      </div>
                    </td>
                  </tr>

                  {/* Rows for each Serial Number under Khatauni Sankhya */}
                  {groupedBeneficiaries[khatauniSankhya]?.map((item) => (
                    <tr key={item.beneficiaryId}>
                      <td className="px-3 py-2 text-center">
                        {setBeneficiaryType(item.beneficiaryType)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {setBeneficiaryStatus(item)}
                      </td>
                      <td className="px-3 py-2">{item.serialNumber}</td>
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
                      <td className="px-3 py-2 text-center">
                        {item.landPricePerSqMt}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          to={`/beneficiaries-details/${item.villageId}/${khatauniSankhya}/${item.beneficiaryId}`}
                          className="text-blue-600 relative group"
                        >
                          {CONSTANTS.BUTTON.VIEW_DETAILS}
                          <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          ) : (
            <tbody className="text-sm">
              <tr className="py-5">
                <td
                  colSpan="12"
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

export default AllBeneficiariesListPage;
