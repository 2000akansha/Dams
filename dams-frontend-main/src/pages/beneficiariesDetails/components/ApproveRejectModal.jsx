import React, { useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowCircleUp,
} from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import CONSTANTS from "../../../constants.json";

export default function ApproveRejectModal({
  type,
  closeModal,
  handleVerifyAPI,
  beneficiaryId,
  verifyStatus,
}) {
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [revokedMessage, setRevokedMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  const getModalContent = () => {
    switch (type) {
      case "approve":
        return {
          message: "Are you sure you want to approve the case?",
          icon: <FaCheckCircle className="text-green-500 text-5xl" />,
          isRemarkRequired: false,
        };
      case "reject":
        return {
          message: "Are you sure you want to reject the case?",
          icon: <FaExclamationCircle className="text-red-500 text-5xl" />,
          isRemarkRequired: true,
          isRevok: false,
        };
      case "revok":
        return {
          message: "Are you sure you want to revok the case?",
          icon: <FaArrowCircleUp className="text-blue-500 text-5xl" />,
          isRemarkRequired: true,
          isRevok: true,
        };
      case "dc-approve":
        return {
          message:
            "Once approved the payment request will be sent to the bank.",
          icon: <RiMoneyRupeeCircleFill className="text-yellow-500 text-5xl" />,
          isRemarkRequired: false,
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-4">{modalContent.icon}</div>
        <p className="text-center mb-8 text-xl font-semibold">
          {modalContent.message}
        </p>
        {modalContent.isRemarkRequired && (
          <div className="mb-4">
            <textarea
              placeholder="Write remark*"
              className="border border-gray-300 rounded w-full p-2 outline-blue-600"
              value={modalContent.isRevok ? revokedMessage : rejectionMessage}
              onChange={(e) => {
                if (modalContent.isRevok) {
                  setRevokedMessage(e.target.value.replace(/\s+/g, " "));
                } else {
                  setRejectionMessage(e.target.value.replace(/\s+/g, " "));
                }
              }}
            />
            {messageError && (
              <div className="text-xs text-red-500">
                {CONSTANTS.ERROR.REMARK}
              </div>
            )}
          </div>
        )}
        <div className="flex gap-5 justify-between w-full">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 w-full"
            onClick={() => closeModal()}
          >
            Back
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
            onClick={() => {
              if (verifyStatus === "0" && !rejectionMessage) {
                setMessageError(true);
                return;
              }
              if (verifyStatus === "2" && !revokedMessage) {
                setMessageError(true);
                return;
              }
              handleVerifyAPI(
                beneficiaryId,
                verifyStatus,
                rejectionMessage,
                revokedMessage
              );
              closeModal();
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
