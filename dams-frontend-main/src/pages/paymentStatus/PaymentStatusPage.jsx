import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../components/Pagination";
import { getPaymentBeneficiariesList } from "../../redux/apis/beneficiariesAPI";
import toast from "react-hot-toast";
import CONSTANTS from "../../constants.json";
import moment from "moment";
import {
  getKhatauniOptions,
  groupByKhatauni,
} from "../../utils/filterGroupSearch";
import { formatNumberWithCommas } from "../../utils/priceFormat";
import { SeprateString } from "../../utils/SeprateString";

const PaymentStatusPage = () => {
  const [villageName, setVillageName] = useState("");
  const [khatauniSankhya, setKhatauniSankhya] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paginatedData, setPaginatedData] = useState([]);
  const [groupedBeneficiaries, setGroupedBeneficiaries] = useState({});
  const [filteredBeneficiariesList, setFilteredBeneficiariesList] = useState(
    []
  );

  const dispatch = useDispatch();
  const beneficiaryList = useSelector(
    (state) => state.beneficiariesListSlice.paymentBeneficiaries
  );

  const villagesList = useSelector((state) => state.villagesListSlice.list);
  // Get unique khatauniSankhya based on village
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
        console.log("first");
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
    setPaymentStatus("");
    setKhatauniSankhya("");
    setSearchBy("");
    setIsModalOpen(false);
  };

  // Set Payment Status
  const setStatus = (code, date) => {
    if (code === "1") {
      return (
        <div className="text-green-500">
          <div>(Sent to bank)</div>
          <div>({moment(date).format("DD MMM YYYY - hh:mmA")})</div>
        </div>
      );
    }
    if (code === "2") {
      return (
        <div className="text-yellow-500">
          <div>(Disbursed)</div>
          <div>({moment(date).format("DD MMM YYYY - hh:mmA")})</div>
        </div>
      );
    }
    if (code === "3") {
      return (
        <div className="text-red-500">
          <div>(Failed)</div>
          <div>({moment(date).format("DD MMM YYYY - hh:mmA")})</div>
        </div>
      );
    }
    return (
      <div className="text-blue-500">
        <div>(Pending)</div>
      </div>
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilteredBeneficiariesList(beneficiaryList);
    setVillageName("");
    setKhatauniSankhya("");
    setSearchBy("");
    setSearchTerm("");
    setPaymentStatus("");
  };

  useEffect(() => {
    // Group beneficiaries by Khatauni after filtering
    setGroupedBeneficiaries(groupByKhatauni(filteredBeneficiariesList));
  }, [filteredBeneficiariesList]);

  useEffect(() => {
    // Filtered data based on selected filters
    const filteredData = beneficiaryList?.filter((item) => {
      return (
        (!villageName || item.villageName === villageName) &&
        (!khatauniSankhya || item.khatauniSankhya == khatauniSankhya) &&
        (!paymentStatus || item.paymentStatus == paymentStatus)
      );
    });
    setFilteredBeneficiariesList(filteredData);
  }, [villageName, khatauniSankhya, paymentStatus, beneficiaryList]);

  useEffect(() => {
    if (searchTerm) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setSearchBy("");
    }
  }, [searchTerm]);

  useEffect(() => {
    // Beneficiaries payment status API
    dispatch(getPaymentBeneficiariesList()).then((res) => {
      if (!res.success) {
        toast.error(res.message);
      }
    });
  }, []);

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="text-lg font-semibold text-gray-600 mb-2 sm:mb-0 pb-5">
        {CONSTANTS.PAGES_NAME.APAYMENT_DISBURSEMENT_STATUS}
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
          placeholder="Search by Name, Aadhar or PAN Number"
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
      <div className="flex justify-between items-center gap-5 flex-wrap mb-4">
        <div className="flex gap-5 flex-wrap">
          {/* Village Filter */}
          <div>
            <select
              className="custom-input border-gray-500 px-5 py-1"
              value={villageName}
              onChange={(e) => {
                setVillageName(e.target.value);
                setKhatauniSankhya("");
                setSearchBy("");
                setSearchTerm("");
              }}
            >
              <option value="" disabled>
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
              className="custom-input border-gray-500 px-5 py-1"
              value={khatauniSankhya}
              disabled={!villageName}
              onChange={(e) => setKhatauniSankhya(e.target.value)}
            >
              <option value="" disabled>
                Khatauni
              </option>
              {[...new Set(khatauniOptions)]?.map((khatauni) => (
                <option key={khatauni} value={khatauni}>
                  {khatauni}
                </option>
              ))}
            </select>
          </div>
          {/* Payment Status Filter */}
          <div>
            <select
              className="custom-input border-gray-500 px-5 py-1"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="" disabled>
                Payment Status
              </option>
              <option key="4" value="">
                All
              </option>
              <option key="0" value="0">
                Pending
              </option>
              <option key="1" value="1">
                Sent
              </option>
              <option key="2" value="2">
                Disbursed
              </option>
              <option key="3" value="3">
                Failed
              </option>
            </select>
          </div>
          {/* Clear filter */}
          <div>
            <div
              className="text-blue-600 relative group cursor-pointer"
              onClick={() => handleClearFilters()}
            >
              {CONSTANTS.BUTTON.CLEAR_FILTERS}
              <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
            </div>
          </div>
        </div>
        <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm">
            {CONSTANTS.BUTTON.EXPORT_REPORT}
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg shadow-lg">
        {/* Table Header */}
        <table className="min-w-full text-left table-auto">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th className="px-3 py-2">{CONSTANTS.SERIAL_NUMBER}</th>
              <th className="px-3 py-2">{CONSTANTS.BENEFICIARY_NAME}</th>
              <th className="px-3 py-2">{CONSTANTS.KHASRA_NUMBER}</th>
              <th className="px-3 py-2">{CONSTANTS.AREA_VARIETY}</th>
              <th className="px-3 py-2">{CONSTANTS.ACQUIRED_KHASRA_NUMBER}</th>
              <th className="px-3 py-2">{CONSTANTS.ACQUIRED_RAKBA}</th>
              <th className="px-3 py-2">{CONSTANTS.BENEFICIARY_SHARE}</th>
              <th className="px-3 py-2">
                {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE}
              </th>
              <th className="px-3 py-2">{CONSTANTS.TOTAL_COMPENSATION}</th>
              <th className="px-3 py-2">{CONSTANTS.PAYMENT_STATUS}</th>
            </tr>
          </thead>
          {filteredBeneficiariesList?.length > 0 ? (
            <tbody className="text-sm">
              {/* Iterate over each group (Khatauni Sankhya) */}
              {paginatedData?.map((khatauniSankhya) => (
                <React.Fragment key={khatauniSankhya}>
                  {/* Section Header */}
                  <tr className="bg-gray-100">
                    <td colSpan="11" className="px-4 py-2 font-semibold">
                      <div className="flex gap-2">
                        {CONSTANTS.KHATAUNI_SANKHYA}: {khatauniSankhya}
                      </div>
                    </td>
                  </tr>

                  {/* Rows for each Serial Number under Khatauni Sankhya */}
                  {groupedBeneficiaries[khatauniSankhya]?.map((item) => (
                    <tr key={item.beneficiaryId}>
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
                      <td className="px-3 py-2">
                        <div className="text-center flex gap-1 font-semibold">
                          <span>₹</span>{" "}
                          {formatNumberWithCommas(item.totalCompensation)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {setStatus(item.paymentStatus, item.paymentDate)}
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
                  colSpan="11"
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

export default PaymentStatusPage;
