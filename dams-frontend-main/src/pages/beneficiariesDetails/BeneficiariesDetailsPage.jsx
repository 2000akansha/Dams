import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import BeneficiaryDetails from "./components/BeneficiaryDetails";
import DisbursementDetails from "./components/DisbursementDetails";
import PreviewDoc from "../../components/PreviewDoc";
import AddSingleDisbursement from "../addSingleDisbursement/AddSingleDisbursement";
import QueriesModal from "./components/QueriesModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {
  getBeneficiariesDetails,
  verifyDetails,
} from "../../redux/apis/beneficiariesAPI";
import toast from "react-hot-toast";
import CONSTANTS from "../../constants.json";
import ApproveRejectModal from "./components/ApproveRejectModal";
import BackButton from "../../components/BackButton";
import { BASE_URL } from "../../utils/axios";

const BeneficiariesDetailsPage = () => {
  const [showFile, setShowFile] = useState(false);
  const [recallAPI, setRecallAPI] = useState(false);
  const [file, setFile] = useState();
  const [modalType, setModalType] = useState("");
  const [canQuery, setCanQuery] = useState(false);
  const [approveRejectModal, setApproveRejectModal] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQueriesOpen, setIsQueriesOpen] = useState(false);
  const [modalBeneficiary, setModalBeneficiary] = useState("");
  const [disbursementStatus, setDisbursementStatus] = useState("");
  const [beneficiaryQueries, setBeneficiaryQueries] = useState("");

  const dispatch = useDispatch();
  const location = useLocation();
  const { villageId, khatauni, id } = useParams();
  const { ids, single, name, disbursementFilter } = location.state || "";
  const { userRole } = useSelector((state) => state.userDetailsSlice.details);
  const beneficiaryList = useSelector(
    (state) => state.beneficiariesListSlice.beneficiariesDetails
  );

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

  // Open Disburdement Modal
  const handleModal = (beneficiary, isDisbursementUploaded) => {
    setModalBeneficiary(beneficiary);
    setDisbursementStatus(isDisbursementUploaded);
    setIsModalOpen(true);
  };

  // Handle modal opening
  const handleVerifyModal = (id, status) => {
    setApproveRejectModal(true);
    setBeneficiaryId(id);
    setVerifyStatus(status);
    if (status === "1") {
      setModalType("approve");
    }
    if (status === "1" && userRole === "3") {
      setModalType("dc-approve");
    }
    if (status === "0") {
      setModalType("reject");
    }
    if (status === "2") {
      setModalType("revok");
    }
  };

  // Refresh query modal data
  const refreshQueries = (beneficiaries) => {
    const beneficiary = beneficiaries.filter(
      (item) => item.beneficiaryId === beneficiaryId
    );
    setBeneficiaryQueries(beneficiary[0].queryMessages);
  };

  // Verify details API
  const handleVerifyAPI = (
    beneficiaryId,
    status,
    rejectionMessage,
    revokedMessage
  ) => {
    const payload = {
      beneficiaryId,
      status,
      rejectionMessage,
      revokedMessage,
    };
    dispatch(verifyDetails(payload)).then((res) => {
      if (res.success) {
        toast.success(res.message);
        setRecallAPI(!recallAPI);
      } else {
        toast.error(res.message);
      }
    });
  };

  useEffect(() => {
    // Beneficiaries details API
    dispatch(
      getBeneficiariesDetails(
        villageId,
        khatauni,
        id,
        userRole,
        ids,
        disbursementFilter
      )
    ).then((res) => {
      if (!res.success) {
        toast.error(res.message);
      } else {
        if (isQueriesOpen) {
          refreshQueries(res.beneficiaries);
        }
      }
    });
  }, [recallAPI, id, ids, disbursementFilter]);

  return (
    <div className="p-4">
      {/* Heading */}
      <div className="flex gap-3 justify-start items-center mt-1 mb-7">
        <BackButton />
        <div className="flex-1 flex justify-between flex-wrap gap-3">
          {ids ? (
            <h1 className="text-lg font-semibold text-gray-600">
              {CONSTANTS.LEGAL_HEIRS_OF} -{" "}
              <span className="text-gray-500">{name}</span>
            </h1>
          ) : single ? (
            <h1 className="text-lg font-semibold text-gray-600">
              {CONSTANTS.BENEFACTOR_OF} -{" "}
              <span className="text-gray-500">{name}</span>
            </h1>
          ) : (
            <h1 className="text-lg font-semibold text-gray-600">
              {CONSTANTS.DETAILS_OF} {CONSTANTS.KHATAUNI_SANKHYA} - {khatauni}
            </h1>
          )}
          {userRole !== "0" && (
            <div className="text-gray-700 font-semibold">
              {setRole(userRole)} {CONSTANTS.APPROVER_PROCESS}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-14">
        {beneficiaryList?.map((beneficiary, index) => {
          return (
            <div
              key={index}
              className="shadow-2xl px-3 py-5 rounded-lg border border-gray-100 bg-slate-100 flex flex-col gap-5"
            >
              <div className="flex justify-between flex-wrap gap-5 items-center">
                <h2 className="text-md font-semibold text-gray-700">
                  {CONSTANTS.BENEFICIARY} {CONSTANTS.SERIAL_NUMBER} -{" "}
                  {beneficiary.serialNumber}
                </h2>
                {beneficiary?.beneficiaryType != "poa" &&
                  beneficiary?.beneficiaryType != "nok" && (
                    <div className="flex gap-5 flex-wrap items-center justify-between">
                      <div>
                        {beneficiary?.verificationDetails?.level != userRole &&
                        beneficiary?.verificationDetails?.status != "0" ? (
                          userRole != "0" && (
                            <div className="text-amber-400 font-medium px-1 py-1 text-xs border-amber-500 border-x-2 rounded-md">
                              {setRole(userRole)} Approval Pending
                            </div>
                          )
                        ) : (
                          <div>
                            {beneficiary?.verificationDetails?.status &&
                              (beneficiary?.verificationDetails?.status !=
                                "1" ||
                                (beneficiary?.verificationDetails?.status ==
                                  "1" &&
                                  beneficiary?.verificationDetails?.level !=
                                    "0")) &&
                              (beneficiary?.verificationDetails?.status ==
                              "0" ? (
                                <div className="text-red-400 border-red-500 px-2 py-1 text-xs font-medium border-x-2 rounded-md">
                                  Rejected by{" "}
                                  {setRole(
                                    beneficiary?.verificationDetails?.userRole
                                  )}{" "}
                                  ({beneficiary?.verificationDetails?.userName})
                                  on{" "}
                                  {moment(
                                    beneficiary?.verificationDetails?.updatedAt
                                  ).format("DD MMM YYYY - hh:mmA")}
                                </div>
                              ) : (
                                <div className="text-green-400 border-green-500 px-1 py-1 font-medium  text-xs border-x-2 rounded-md">
                                  Approved By{" "}
                                  {setRole(
                                    beneficiary?.verificationDetails?.history[0]
                                      ?.userRole
                                  )}{" "}
                                  (
                                  {
                                    beneficiary?.verificationDetails?.history[0]
                                      ?.updatedBy
                                  }
                                  ) on{" "}
                                  {moment(
                                    beneficiary?.verificationDetails?.history[0]
                                      ?.updatedAt
                                  ).format("DD MMM YYYY - hh:mmA")}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {userRole === "0" && (
                        <button
                          onClick={() => {
                            handleModal(
                              beneficiary,
                              beneficiary.isDisbursementUploaded
                            );
                          }}
                          className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600"
                        >
                          {beneficiary?.isDisbursementUploaded == "1"
                            ? CONSTANTS.BUTTON.EDIT_DISBURSEMENT_DETAILS
                            : CONSTANTS.BUTTON.ADD_DISBURSEMENT_DETAILS}
                        </button>
                      )}
                      {(userRole === "1" ||
                        userRole === "2" ||
                        userRole === "3" ||
                        (userRole === "0" &&
                          (beneficiary?.hasQuery == "1" ||
                            beneficiary?.verificationDetails?.status ==
                              "0"))) && (
                        <button
                          onClick={() => {
                            setBeneficiaryQueries(beneficiary.queryMessages);
                            setIsQueriesOpen(true);
                            setBeneficiaryId(beneficiary.beneficiaryId);
                            setCanQuery(
                              beneficiary?.hasQuery == "1" ||
                                (beneficiary.verificationDetails.level !=
                                  userRole &&
                                  beneficiary.verificationDetails.status != "0")
                            );
                          }}
                          className="bg-orange-500 text-white py-1 px-6 rounded-lg hover:bg-orange-600"
                        >
                          {beneficiary?.hasQuery == "1"
                            ? CONSTANTS.BUTTON.VIEW_QUERIES
                            : beneficiary?.hasQuery != "1" &&
                              (beneficiary.verificationDetails.level ==
                                userRole ||
                                beneficiary.verificationDetails.status == "0")
                            ? CONSTANTS.BUTTON.QUERY
                            : CONSTANTS.BUTTON.RAISE_QUERY}
                        </button>
                      )}
                    </div>
                  )}
              </div>
              {/* Beneficiaries Details */}
              <BeneficiaryDetails
                details={beneficiary}
                setRecallAPI={setRecallAPI}
                recallAPI={recallAPI}
                ids={ids}
              />
              {/* Disbursement Details */}
              <DisbursementDetails
                beneficiaryType={beneficiary?.beneficiaryType}
                isDisbursementUploaded={beneficiary?.isDisbursementUploaded}
                details={beneficiary?.disbursementDetails}
              />
              {/* Bank Details */}
              {beneficiary?.beneficiaryType != "poa" &&
                beneficiary?.beneficiaryType != "nok" && (
                  <div>
                    {userRole !== "0" &&
                      beneficiary?.isDocumentsUploaded == "1" && (
                        <>
                          <div className="flex flex-wrap gap-5 justify-between items-center font-medium">
                            <div>
                              <span className="block text-gray-600">
                                {CONSTANTS.AADHAR_NUMBER}
                              </span>
                              <span className="block text-gray-500 font-semibold">
                                {beneficiary.bankDetails.aadhaarNumber}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-600">
                                {CONSTANTS.PAN}
                              </span>
                              <span className="block text-gray-500 font-semibold">
                                {beneficiary.bankDetails.pancardNumber}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-600">
                                {CONSTANTS.BANK_ACCOUNT_NUMBER}
                              </span>
                              <span className="block text-gray-500 font-semibold">
                                {beneficiary.bankDetails.accountNumber}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-600">
                                {CONSTANTS.IFSC}
                              </span>
                              <span className="block text-gray-500 font-semibold">
                                {beneficiary.bankDetails.ifscCode}
                              </span>
                            </div>
                            <div>
                              <div
                                className="border border-sky-200 bg-sky-100 transition duration-300 hover:shadow-2xl text-gray-500 rounded-lg py-1 px-3 cursor-pointer"
                                onClick={() => {
                                  if (!beneficiary.bankDetails.paymentInvoice) {
                                    return;
                                  }
                                  setFile(
                                    `${BASE_URL}/uploads/${beneficiary.bankDetails.paymentInvoice}`
                                  );
                                  setShowFile(true);
                                }}
                              >
                                {CONSTANTS.PAYMENT_INVOICE}
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="pl-2"
                                />
                              </div>
                            </div>
                          </div>
                          {/* Documents */}
                          <div className="flex flex-wrap gap-5 flex-auto font-medium py-5">
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.landIndemnityBond}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.LAND_INDEMENITY}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.structureIndemnityBond}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.STRUCTURE_INDEMENITY}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.affidavit}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.AFFIDAVIT}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.aadharCard}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.AADHAR_CARD}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.pancard}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.PAN_CARD}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.checkORpassbook}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.PASS_BOOK}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                            <div
                              className="border text-gray-500 bg-sky-100 border-sky-200 transition duration-300 hover:shadow-2xl cursor-pointer rounded-lg px-3 py-1 hover:text-gray-600"
                              onClick={() => {
                                setFile(
                                  `${BASE_URL}/uploads/${beneficiary.documents.photo}`
                                );
                                setShowFile(true);
                              }}
                            >
                              {CONSTANTS.DOC.PHOTO}
                              <FontAwesomeIcon icon={faEye} className="pl-2" />
                            </div>
                          </div>
                        </>
                      )}
                    {/* Verification Buttons */}
                    {userRole !== "0" &&
                      !(beneficiary.verificationDetails.level == userRole) && (
                        <div className="flex justify-start md:justify-end flex-wrap gap-5">
                          {beneficiary.verificationDetails.level !== userRole &&
                          beneficiary.verificationDetails.status === "0" ? (
                            <button
                              className="text-white py-2 px-4 rounded-lg w-[200px] bg-amber-400 hover:bg-amber-500"
                              onClick={() =>
                                handleVerifyModal(
                                  beneficiary.beneficiaryId,
                                  "2"
                                )
                              }
                            >
                              {CONSTANTS.BUTTON.REVOK}
                            </button>
                          ) : (
                            <>
                              <button
                                disabled={
                                  beneficiary.isDocumentsUploaded === "0" ||
                                  beneficiary.isDisbursementUploaded === "0"
                                }
                                className={`text-white py-2 px-4 rounded-lg w-[200px] ${
                                  beneficiary.isDocumentsUploaded === "0" ||
                                  beneficiary.isDisbursementUploaded === "0"
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                                onClick={() =>
                                  handleVerifyModal(
                                    beneficiary.beneficiaryId,
                                    "1"
                                  )
                                }
                              >
                                {CONSTANTS.BUTTON.APPROVE}
                              </button>
                              <button
                                disabled={
                                  beneficiary.isDocumentsUploaded === "0" ||
                                  beneficiary.isDisbursementUploaded === "0"
                                }
                                className={`text-white py-2 px-4 rounded-lg w-[200px] ${
                                  beneficiary.isDocumentsUploaded === "0" ||
                                  beneficiary.isDisbursementUploaded === "0"
                                    ? "bg-red-300 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                                onClick={() =>
                                  handleVerifyModal(
                                    beneficiary.beneficiaryId,
                                    "0"
                                  )
                                }
                              >
                                {CONSTANTS.BUTTON.REJECT}
                              </button>
                            </>
                          )}
                        </div>
                      )}
                  </div>
                )}
              {showFile && <PreviewDoc file={file} setShowFile={setShowFile} />}
            </div>
          );
        })}
      </div>
      {isModalOpen && (
        <AddSingleDisbursement
          setIsOpen={setIsModalOpen}
          details={modalBeneficiary}
          disbursementStatus={disbursementStatus}
          setRecallAPI={setRecallAPI}
          recallAPI={recallAPI}
        />
      )}
      {isQueriesOpen && (
        <QueriesModal
          closeModal={setIsQueriesOpen}
          queries={beneficiaryQueries}
          beneficiaryId={beneficiaryId}
          setRecallAPI={setRecallAPI}
          recallAPI={recallAPI}
          canQuery={canQuery}
        />
      )}
      {approveRejectModal && (
        <ApproveRejectModal
          type={modalType}
          verifyStatus={verifyStatus}
          beneficiaryId={beneficiaryId}
          handleVerifyAPI={handleVerifyAPI}
          closeModal={setApproveRejectModal}
        />
      )}
    </div>
  );
};

export default BeneficiariesDetailsPage;
