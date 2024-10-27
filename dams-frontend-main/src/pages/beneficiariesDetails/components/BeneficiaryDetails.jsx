import React, { useState } from "react";
import CONSTANTS from "../../../constants.json";
import { CustomizeString } from "../../../utils/SeprateString";
import { useSelector } from "react-redux";
import LegalHeirModal from "./LegalHeirModal";
import { useNavigate, useParams } from "react-router-dom";

const BeneficiaryDetails = ({ details, setRecallAPI, recallAPI, ids }) => {
  const {
    beneficiaryId,
    benefactorId,
    legalHeirs,
    beneficiaryType,
    beneficiaryName,
    khasraNumber,
    acquiredKhasraNumber,
    areaVariety,
    acquiredRakbha,
    beneficiaryShare,
    landPricePerSqMt,
    acquiredBeneficiaryShare,
  } = details;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { villageId, khatauni } = useParams();
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);

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
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center flex-wrap pb-4">
        <div className="text-gray-700 flex gap-3 items-center justify-center">
          <div className="font-bold">{CONSTANTS.BENEFICIARY_TYPE}</div>
          <div>-</div>
          <div className="text-gray-500 font-medium">
            {setBeneficiaryType(beneficiaryType)}
          </div>
        </div>
        {userRole === "0" && beneficiaryType === "self" && (
          <button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="bg-amber-400 text-white py-1 px-4 rounded-lg hover:bg-amber-500"
          >
            {CONSTANTS.BUTTON.ADD_LEGAL_HEIR}
          </button>
        )}
        {(beneficiaryType === "poah" || beneficiaryType === "nokh") && !ids && (
          <button
            onClick={() => {
              navigate(
                `/beneficiaries-details/${villageId}/${khatauni}/${benefactorId}`,
                {
                  state: { single: true, name: beneficiaryName },
                }
              );
            }}
            className="bg-amber-400 text-white py-1 px-4 rounded-lg hover:bg-amber-500"
          >
            {CONSTANTS.BUTTON.VIEW_BENEFACTOR}
          </button>
        )}
        {(beneficiaryType === "poa" || beneficiaryType === "nok") && (
          <button
            onClick={() => {
              navigate(`/beneficiaries-details/${villageId}/${khatauni}`, {
                state: { ids: legalHeirs, name: beneficiaryName },
              });
            }}
            className="bg-amber-400 text-white py-1 px-4 rounded-lg hover:bg-amber-500"
          >
            {CONSTANTS.BUTTON.VIEW_LEGAL_HEIR}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
        <div>
          <div className="font-bold">{CONSTANTS.BENEFICIARY_NAME}</div>
          <div className="text-gray-600">{beneficiaryName}</div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.BENEFICIARY_SHARE}</div>
          <div className="text-gray-600">{beneficiaryShare}</div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.KHASRA_NUMBER}</div>
          <div className="text-gray-600">{CustomizeString(khasraNumber)}</div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.ACQUIRED_KHASRA_NUMBER}</div>
          <div className="text-gray-600">
            {CustomizeString(acquiredKhasraNumber)}
          </div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.AREA_VARIETY}</div>
          <div className="text-gray-600">{CustomizeString(areaVariety)}</div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.ACQUIRED_RAKBA}</div>
          <div className="text-gray-600">{CustomizeString(acquiredRakbha)}</div>
        </div>

        <div>
          <div className="font-bold">
            {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE}
          </div>
          <div className="text-gray-600">{acquiredBeneficiaryShare}</div>
        </div>

        <div>
          <div className="font-bold">{CONSTANTS.LAND_PRICE_PER_SQ_MT}</div>
          <div className="text-gray-600">{landPricePerSqMt}</div>
        </div>
      </div>
      {isModalOpen && (
        <LegalHeirModal
          closeModal={() => setIsModalOpen(false)}
          beneficiaryId={beneficiaryId}
          setRecallAPI={setRecallAPI}
          recallAPI={recallAPI}
        />
      )}
    </div>
  );
};

export default BeneficiaryDetails;
