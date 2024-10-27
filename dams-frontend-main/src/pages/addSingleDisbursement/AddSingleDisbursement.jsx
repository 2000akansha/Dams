import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { formatNumberWithCommas } from "../../utils/priceFormat";
import { uploadDisbursementDetails } from "../../redux/apis/beneficiariesAPI";
import toast from "react-hot-toast";
import CONSTANTS from "../../constants.json";
import { RxCross1 } from "react-icons/rx";

const validationSchema = Yup.object({
  faldaarBhumiPrice: Yup.number()
    .min(0, "Invalid value")
    .test("is-decimal", "Invalid value", (value) =>
      /^\d+(\.\d{1,2})?$/.test(value)
    )
    .required("*required field"),
  gairFaldaarBhumiPrice: Yup.number()
    .min(0, "Invalid value")
    .test("is-decimal", "Invalid value", (value) =>
      /^\d+(\.\d{1,2})?$/.test(value)
    )
    .required("*required field"),
  housePrice: Yup.number()
    .min(0, "Invalid value")
    .test("is-decimal", "Invalid value", (value) =>
      /^\d+(\.\d{1,2})?$/.test(value)
    )
    .required("*required field"),
  vivran: Yup.string().max(150, "Max 150 characters"),
  isConsent: Yup.string()
    .required("You must verify all calculations to proceed")
    .oneOf(["1"], "You must verify all calculations to proceed"),
});

const AddSingleDisbursement = ({
  setIsOpen,
  details,
  disbursementStatus,
  setRecallAPI,
  recallAPI,
}) => {
  const {
    beneficiaryId,
    khatauniSankhya,
    serialNumber,
    beneficiaryName,
    khasraNumber,
    landPricePerSqMt,
    acquiredBeneficiaryShare,
    disbursementDetails,
    interestDays,
  } = details;

  const {
    bhumiPrice,
    faldaarBhumiPrice,
    gairFaldaarBhumiPrice,
    housePrice,
    toshan,
    interest,
    totalCompensation,
    vivran,
  } = disbursementDetails;

  const dispatch = useDispatch();

  const initialValues = {
    beneficiaryId: beneficiaryId,
    landPricePerSqMt: landPricePerSqMt,
    interestDays: interestDays || 0,
    acquiredBeneficiaryShare: acquiredBeneficiaryShare,
    bhumiPrice: bhumiPrice || 0,
    faldaarBhumiPrice: faldaarBhumiPrice || 0,
    gairFaldaarBhumiPrice: gairFaldaarBhumiPrice || 0,
    housePrice: housePrice || 0,
    toshan: toshan || 0,
    interest: interest || 0,
    totalCompensation: totalCompensation || 0,
    isConsent: false,
    vivran: vivran || "",
  };

  const onSubmit = (values) => {
    const payload = {
      beneficiaries: [
        {
          ...values,
        },
      ],
    };
    // Add Disbursement API
    dispatch(uploadDisbursementDetails(payload)).then((res) => {
      if (res.success) {
        toast.success(res.message);
        setRecallAPI(!recallAPI);
        setIsOpen(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="inset-0 text-sm bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 fixed">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative m-5">
        <button
          className="text-gray-500 hover:text-gray-800 absolute top-3 right-3 text-lg"
          onClick={() => setIsOpen(false)}
        >
          <RxCross1 />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
          {disbursementStatus == "1"
            ? CONSTANTS.BUTTON.EDIT_DISBURSEMENT_DETAILS
            : CONSTANTS.BUTTON.ADD_DISBURSEMENT_DETAILS}
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-2 text-gray-700">
          <div>
            <p className="font-semibold">{CONSTANTS.KHATAUNI_SANKHYA}</p>
            <p className="text-gray-600">{khatauniSankhya}</p>
          </div>
          <div>
            <p className="font-semibold">{CONSTANTS.SERIAL_NUMBER}</p>
            <p className="text-gray-600">{serialNumber}</p>
          </div>
          <div>
            <p className="font-semibold">{CONSTANTS.BENEFICIARY_NAME}</p>
            <p className="text-gray-600">{beneficiaryName}</p>
          </div>
          <div>
            <p className="font-semibold">{CONSTANTS.KHASRA_NUMBER}</p>
            <p className="text-gray-600">{khasraNumber}</p>
          </div>
          <div>
            <p className="font-semibold">
              {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE} (SqMt)
            </p>
            <p className="text-gray-600">
              {" "}
              {parseFloat(acquiredBeneficiaryShare.split("-").join(""))}
            </p>
          </div>
          <div>
            <p className="font-semibold">{CONSTANTS.LAND_PRICE_PER_SQ_MT}</p>
            <p className="text-gray-600">
              <span className="font-semibold">₹</span> {landPricePerSqMt}
            </p>
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => {
            useEffect(() => {
              const bhumiPrice = parseFloat(values?.bhumiPrice) || 0;
              const faldaarBhumiPrice =
                parseFloat(values?.faldaarBhumiPrice) || 0;
              const gairFaldaarBhumiPrice =
                parseFloat(values?.gairFaldaarBhumiPrice) || 0;
              const housePrice = parseFloat(values?.housePrice) || 0;

              // Calculate bhumi price
              const bhumi =
                values?.landPricePerSqMt *
                parseFloat(
                  values?.acquiredBeneficiaryShare.split("-").join("") || 0
                );
              // Set calculated bhumi price
              setFieldValue("bhumiPrice", parseFloat(bhumi.toFixed(2)));

              // Calculate toshan
              const toshan =
                bhumiPrice +
                faldaarBhumiPrice +
                gairFaldaarBhumiPrice +
                housePrice;
              // Set the calculated toshan value in Formik's state
              setFieldValue("toshan", parseFloat(toshan.toFixed(2)));

              // Calculate interest
              const timeInYears = values?.interestDays / 365;
              const interest = (toshan * 12 * timeInYears) / 100;
              // Set calculated interest
              setFieldValue("interest", parseFloat(interest.toFixed(2)));

              // Calculate total compensation
              const total = 2 * toshan + interest;
              // Set calculated interest
              setFieldValue("totalCompensation", parseFloat(total.toFixed(2)));

              // Set vivran after removing extra spaces
              setFieldValue("vivran", values.vivran.replace(/\s+/g, " "));
            }, [values]);

            return (
              <Form className="space-y-1">
                <div className="grid grid-cols-2 gap-y-1 gap-x-5">
                  {/* Bhumi Price */}
                  <div>
                    <label
                      htmlFor="bhumiPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.BHUMI_PRICE}
                    </label>
                    <div className="custom-input block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                      <span className="font-semibold">₹ </span>
                      {formatNumberWithCommas(values.bhumiPrice)}
                    </div>
                  </div>
                  {/* Faldaar bhumi */}
                  <div>
                    <label
                      htmlFor="faldaarBhumiPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.FALDAAR_BHUMI_PRICE}
                    </label>
                    <div className="flex gap-1 items-center">
                      <span className="font-semibold text-lg">₹ </span>
                      <Field
                        id="faldaarBhumiPrice"
                        name="faldaarBhumiPrice"
                        type="number"
                        className="custom-input block w-full p-2 border rounded-md shadow-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter amount"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage
                      name="faldaarBhumiPrice"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  {/* Gair faldaar bhumi */}
                  <div>
                    <label
                      htmlFor="gairFaldaarBhumiPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.GAIR_FALDAAR_BHUMI_PRICE}
                    </label>
                    <div className="flex gap-1 items-center">
                      <span className="font-semibold text-lg">₹ </span>
                      <Field
                        id="gairFaldaarBhumiPrice"
                        name="gairFaldaarBhumiPrice"
                        type="number"
                        className="custom-input block w-full p-2 border rounded-md shadow-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter amount"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage
                      name="gairFaldaarBhumiPrice"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  {/* House */}
                  <div>
                    <label
                      htmlFor="housePrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.HOUSE_PRICE}
                    </label>
                    <div className="flex gap-1 items-center">
                      <span className="font-semibold text-lg">₹ </span>
                      <Field
                        id="housePrice"
                        name="housePrice"
                        type="number"
                        className="custom-input block w-full p-2 border rounded-md shadow-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter amount"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "+") {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage
                      name="housePrice"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  {/* Automatically calculated Toshan */}
                  <div>
                    <label
                      htmlFor="toshan"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.TOSHAN}
                    </label>
                    <div className="custom-input block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                      <span className="font-semibold">₹ </span>
                      {formatNumberWithCommas(values.toshan)}
                    </div>
                  </div>
                  {/* Interest */}
                  <div>
                    <label
                      htmlFor="interest"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {CONSTANTS.INTEREST} ({interestDays} days)
                    </label>
                    <div className="custom-input block w-full p-2 border border-gray-300 rounded-md shadow-sm">
                      <span className="font-semibold">₹ </span>
                      {formatNumberWithCommas(values.interest)}
                    </div>
                  </div>
                </div>
                {/* Vivran */}
                <div className="flex flex-col">
                  <label
                    htmlFor="vivran"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {CONSTANTS.VIVRAN}
                  </label>
                  <Field
                    className="custom-input block w-full p-2 border rounded-md shadow-sm max-h-[38px] custom-scrollbar"
                    as="textarea"
                    name="vivran"
                    id="vivran"
                    rows="1"
                    cols="50"
                    placeholder="Enter your description here"
                  />
                  <ErrorMessage
                    name="vivran"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>
                {/* Total Compensation */}
                <div className="flex gap-5 mt-2">
                  <label
                    htmlFor="interest"
                    className="block text-base font-semibold text-gray-700"
                  >
                    {CONSTANTS.TOTAL_COMPENSATION}
                  </label>
                  <div className="text-base font-semibold text-gray-600">-</div>
                  <div className="text-base font-semibold text-gray-500">
                    <span className="font-semibold">₹ </span>
                    {formatNumberWithCommas(values.totalCompensation)}
                  </div>
                </div>

                {/* Verification Checkbox */}
                <div>
                  <div className="flex items-center mt-2">
                    <Field
                      type="checkbox"
                      name="isConsent"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      onChange={(e) => {
                        setFieldValue(
                          "isConsent",
                          e.target.checked ? "1" : false
                        );
                      }}
                    />
                    <label
                      htmlFor="isConsent"
                      className="ml-2 block text-sm text-gray-900"
                    ></label>
                    {CONSTANTS.BUTTON.DISBURSEMENT_CHECK}
                  </div>
                  <ErrorMessage
                    name="isConsent"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md mr-2"
                  >
                    {CONSTANTS.BUTTON.CANCEL}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                  >
                    {CONSTANTS.BUTTON.SAVE_DETAILS}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddSingleDisbursement;
