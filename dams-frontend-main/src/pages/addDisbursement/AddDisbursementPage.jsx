import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { formatNumberWithCommas } from "../../utils/priceFormat";
import { uploadDisbursementDetails } from "../../redux/apis/beneficiariesAPI";
import { filterByKhatauni } from "../../utils/filterGroupSearch";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";
import CONSTANTS from "../../constants.json";

const AddDisbursementPage = () => {
  const [filteredBeneficiariesList, setFilteredBeneficiariesList] = useState(
    []
  );
  const [initialValues, setInitialValues] = useState({
    beneficiaries: [],
  });
  const [isChecked, setIsChecked] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [interestDays, setInterestDays] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { disbursementFilter } = location.state || "";
  const { villageName, khatauni } = useParams();
  const [list, setList] = useState([]);
  const beneficiaryList = useSelector(
    (state) => state.beneficiariesListSlice.villageBeneficiaries
  );

  const validationSchema = Yup.object().shape({
    beneficiaries: Yup.array().of(
      Yup.object().shape({
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
      })
    ),
  });

  const onSubmit = (values) => {
    if (!isChecked) {
      setCheckError(true);
      return;
    }
    const payload = {
      ...values,
    };
    // Add Disbursement API
    dispatch(uploadDisbursementDetails(payload)).then((res) => {
      if (res.success) {
        toast.success(res.message);
        navigate(-1);
      } else {
        toast.error(res.message);
      }
    });
  };

  useEffect(() => {
    // Set initial values for the form
    setInitialValues({
      beneficiaries: filteredBeneficiariesList?.map((item) => ({
        beneficiaryId: item.beneficiaryId || "",
        landPricePerSqMt: item.landPricePerSqMt || 0,
        acquiredBeneficiaryShare: item.acquiredBeneficiaryShare || "",
        interestDays: item.interestDays || 0,
        bhumiPrice: item.bhumiPrice || 0,
        faldaarBhumiPrice: item.faldaarBhumiPrice || 0,
        gairFaldaarBhumiPrice: item.gairFaldaarBhumiPrice || 0,
        housePrice: item.housePrice || 0,
        toshan: item.toshan || 0,
        interest: item.interest || 0,
        totalCompensation: item.totalCompensation || 0,
        vivran: item.vivran || "",
        isConsent: "1",
      })),
    });
  }, [filteredBeneficiariesList]);

  useEffect(() => {
    let data = beneficiaryList;
    if (disbursementFilter) {
      data = data.filter(
        (item) => item.isDisbursementUploaded === disbursementFilter
      );
    }
    setList(data);
  }, [disbursementFilter, beneficiaryList]);

  useEffect(() => {
    // Filter beneficiaries on the basis of selected khautani
    setFilteredBeneficiariesList(
      filterByKhatauni(list, khatauni.split("-")).sort(
        (a, b) => a.serialNumber - b.serialNumber
      )
    );
    setInterestDays(list[0]?.interestDays);
  }, [list]);

  return (
    <div className="p-4">
      {/* Action Buttons */}
      <div className="flex gap-3 mt-1 justify-start items-center">
        <BackButton />
        <div className="text-lg font-semibold text-gray-700 gap-1 flex flex-wrap">
          {CONSTANTS.PAGES_NAME.DISBURSEMENT_DETAILS}
          <span>-</span>
          <div className="font-medium text-gray-500 mb-2 sm:mb-0">
            {villageName}
          </div>
        </div>
      </div>
      <div className="text-md flex justify-between flex-wrap-reverse py-4 items-center">
        {/* Verification Checkbox */}
        <div className="mb-2">
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="isConsent"
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              onChange={(event) => {
                setIsChecked(event.target.checked);
                if (event.target.checked) {
                  setCheckError(false);
                } else {
                  setCheckError(true);
                }
              }}
            />
            <label
              htmlFor="isConsent"
              className="ml-2 block text-md text-gray-900"
            ></label>
            {CONSTANTS.BUTTON.DISBURSEMENT_CHECK}
          </div>
          {checkError && (
            <div className="text-red-500 text-xs">
              {CONSTANTS.ERROR.CONSENT}
            </div>
          )}
        </div>
        <div className="flex gap-5 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 py-1 mb-2 sm:mb-0"
          >
            {CONSTANTS.BUTTON.CANCEL}
          </button>
          <button
            form="beneficiaryForm"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-1 mb-2 sm:mb-0"
            type="submit"
          >
            {CONSTANTS.BUTTON.SAVE_DETAILS}
          </button>
        </div>
      </div>

      <div className="overflow-x-scroll custom-scrollbar border rounded-lg shadow-lg">
        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => {
            const hasRunEffectRef = useRef(false);
            useEffect(() => {
              if (hasRunEffectRef.current || !values?.beneficiaries.length)
                return;
              // Mark the effect as run
              hasRunEffectRef.current = true;
              values.beneficiaries.forEach((_, index) => {
                const bhumiPrice =
                  parseFloat(values?.beneficiaries[index]?.bhumiPrice) || 0;
                const faldaarBhumiPrice =
                  parseFloat(values?.beneficiaries[index]?.faldaarBhumiPrice) ||
                  0;
                const gairFaldaarBhumiPrice =
                  parseFloat(
                    values?.beneficiaries[index]?.gairFaldaarBhumiPrice
                  ) || 0;
                const housePrice =
                  parseFloat(values?.beneficiaries[index]?.housePrice) || 0;

                // Calculate bhumi price
                let bhumi =
                  values?.beneficiaries[index].landPricePerSqMt *
                  parseFloat(
                    values?.beneficiaries[index].acquiredBeneficiaryShare
                      .split("-")
                      .join("")
                  );
                // Set calculated bhumi price
                setFieldValue(
                  `beneficiaries[${index}].bhumiPrice`,
                  parseFloat(bhumi.toFixed(2))
                );

                // Calculate toshan
                const toshan =
                  bhumiPrice +
                  faldaarBhumiPrice +
                  gairFaldaarBhumiPrice +
                  housePrice;
                // Set the calculated toshan value in Formik's state
                setFieldValue(
                  `beneficiaries[${index}].toshan`,
                  parseFloat(toshan.toFixed(2))
                );

                // Calculate interest
                const timeInYears =
                  values?.beneficiaries[index]?.interestDays / 365;
                const interest = (toshan * 12 * timeInYears) / 100;
                // Set calculated interest
                setFieldValue(
                  `beneficiaries[${index}].interest`,
                  parseFloat(interest.toFixed(2))
                );

                // Calculate total compensation
                const total = 2 * toshan + interest;
                // Set calculated interest
                setFieldValue(
                  `beneficiaries[${index}].totalCompensation`,
                  parseFloat(total.toFixed(2))
                );

                // Set vivran
                setFieldValue(
                  `beneficiaries[${index}].vivran`,
                  values?.beneficiaries[index].vivran.replace(/\s+/g, " ")
                );
              });
            }, [values.beneficiaries]);

            const handleFieldChange = (index, field, value) => {
              // Update the specific field's value
              setFieldValue(
                `beneficiaries[${index}].${field}`,
                field === "vivran"
                  ? value.replace(/\s+/g, " ")
                  : parseFloat(value)
              );

              // Perform the calculations based on the new values
              const updatedValues = {
                ...values.beneficiaries[index],
                [field]:
                  field === "vivran"
                    ? value.replace(/\s+/g, " ")
                    : parseFloat(value),
              };

              // Get updated values for recalculations
              const bhumiPrice = parseFloat(updatedValues?.bhumiPrice) || 0;
              const faldaarBhumiPrice =
                parseFloat(updatedValues?.faldaarBhumiPrice) || 0;
              const gairFaldaarBhumiPrice =
                parseFloat(updatedValues?.gairFaldaarBhumiPrice) || 0;
              const housePrice = parseFloat(updatedValues?.housePrice) || 0;

              // Calculate bhumi price based on the updated field
              let bhumi =
                updatedValues?.landPricePerSqMt *
                parseFloat(
                  updatedValues?.acquiredBeneficiaryShare.split("-").join("")
                );

              // Set calculated bhumi price
              setFieldValue(
                `beneficiaries[${index}].bhumiPrice`,
                parseFloat(bhumi.toFixed(2))
              );

              // Calculate toshan
              const toshan =
                bhumiPrice +
                faldaarBhumiPrice +
                gairFaldaarBhumiPrice +
                housePrice;
              setFieldValue(
                `beneficiaries[${index}].toshan`,
                parseFloat(toshan.toFixed(2))
              );

              // Calculate interest
              const timeInYears = updatedValues?.interestDays / 365;
              const interest = (toshan * 12 * timeInYears) / 100;
              setFieldValue(
                `beneficiaries[${index}].interest`,
                parseFloat(interest.toFixed(2))
              );

              // Calculate total compensation
              const total = 2 * toshan + interest;
              setFieldValue(
                `beneficiaries[${index}].totalCompensation`,
                parseFloat(total.toFixed(2))
              );
            };

            return (
              <Form id="beneficiaryForm">
                <table className="text-left">
                  <thead className="bg-gray-200 text-sm">
                    <tr>
                      <th className="px-2 py-3 text-center">
                        {CONSTANTS.KHATAUNI_SANKHYA}
                      </th>
                      <th className="px-2 py-3 text-center">
                        {CONSTANTS.SERIAL_NUMBER}
                      </th>
                      <th className="px-2 py-3">
                        {CONSTANTS.BENEFICIARY_NAME}
                      </th>
                      <th className="px-2 py-3">
                        {CONSTANTS.ACQUIRED_BENEFICIARY_SHARE} (SqMt)
                      </th>
                      <th className="px-2 py-3">
                        {CONSTANTS.LAND_PRICE_PER_SQ_MT}
                      </th>
                      <th className="px-2 py-3">{CONSTANTS.BHUMI_PRICE}</th>
                      <th className="px-2 py-3">
                        {CONSTANTS.FALDAAR_BHUMI_PRICE}
                      </th>
                      <th className="px-2 py-3">
                        {CONSTANTS.GAIR_FALDAAR_BHUMI_PRICE}
                      </th>
                      <th className="px-2 py-3">{CONSTANTS.HOUSE_PRICE}</th>
                      <th className="px-2 py-3">{CONSTANTS.TOSHAN}</th>
                      <th className="px-2 py-3">
                        {CONSTANTS.INTEREST} ({interestDays} days)
                      </th>
                      <th className="px-2 py-3">
                        {CONSTANTS.TOTAL_COMPENSATION}
                      </th>
                      <th className="px-2 py-3">{CONSTANTS.VIVRAN}</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {filteredBeneficiariesList?.map((beneficiary, index) => {
                      return (
                        <tr key={index}>
                          {/* Khatauni Sankhya */}
                          <td className="px-2 py-3 text-center">
                            {beneficiary.khatauniSankhya}
                          </td>
                          {/* Serial Number */}
                          <td className="px-2 py-3 text-center">
                            {beneficiary.serialNumber}
                          </td>
                          {/* Beneficiary Name */}
                          <td className="px-2 py-3 min-w-[150px]">
                            {beneficiary.beneficiaryName}
                          </td>
                          {/* Acquired Beneficiary Share */}
                          <td className="px-2 py-3">
                            <div>
                              {parseFloat(
                                values?.beneficiaries[
                                  index
                                ]?.acquiredBeneficiaryShare
                                  .split("-")
                                  .join("")
                              )}
                            </div>
                          </td>
                          {/* Price Per Sq Mt */}
                          <td className="px-2 py-3">
                            <div className="flex gap-1 items-center">
                              <span className="font-semibold">₹</span>
                              <Field
                                name={`beneficiaries[${index}].landPricePerSqMt`}
                                className="border rounded px-2 py-1 w-16"
                                value={
                                  values?.beneficiaries[index]
                                    ?.landPricePerSqMt || 0
                                }
                                readOnly
                              />
                            </div>
                          </td>
                          {/* Bhumi Price */}
                          <td className="px-2 py-3">
                            <div className="border rounded px-2 py-1 w-auto flex gap-1">
                              <span className="font-semibold">₹</span>
                              {formatNumberWithCommas(
                                values?.beneficiaries[index]?.bhumiPrice
                              )}
                            </div>
                          </td>
                          {/* Faldaar bhumi */}
                          <td className="px-2 py-3">
                            <div className="flex gap-1 items-center relative">
                              <span className="font-semibold">₹</span>
                              <Field
                                name={`beneficiaries[${index}].faldaarBhumiPrice`}
                                type="number"
                                className="custom-input border w-24 rounded px-2 py-1 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="*फलदार"
                                value={
                                  values?.beneficiaries[index]
                                    ?.faldaarBhumiPrice || 0
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    index,
                                    "faldaarBhumiPrice",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "-" ||
                                    e.key === "e" ||
                                    e.key === "+"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                              <ErrorMessage
                                name={`beneficiaries[${index}].faldaarBhumiPrice`}
                                component="div"
                                className="text-red-500 text-xs absolute top-8 left-3"
                              />
                            </div>
                          </td>
                          {/* Gair faldaar bhumi */}
                          <td className="px-2 py-3">
                            <div className="flex gap-1 items-center relative">
                              <span className="font-semibold">₹</span>
                              <Field
                                name={`beneficiaries[${index}].gairFaldaarBhumiPrice`}
                                type="number"
                                className="custom-input border rounded px-2 py-1 w-24 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="*गैर फलदार"
                                value={
                                  values?.beneficiaries[index]
                                    ?.gairFaldaarBhumiPrice || 0
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    index,
                                    "gairFaldaarBhumiPrice",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "-" ||
                                    e.key === "e" ||
                                    e.key === "+"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                              <ErrorMessage
                                name={`beneficiaries[${index}].gairFaldaarBhumiPrice`}
                                component="div"
                                className="text-red-500 text-xs absolute top-8 left-3"
                              />
                            </div>
                          </td>
                          {/* House */}
                          <td className="px-2 py-3">
                            <div className="flex gap-1 items-center relative">
                              <span className="font-semibold">₹</span>
                              <Field
                                name={`beneficiaries[${index}].housePrice`}
                                type="number"
                                className="custom-input border rounded px-2 py-1 w-24 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="*मकान"
                                value={
                                  values?.beneficiaries[index]?.housePrice || 0
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    index,
                                    "housePrice",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "-" ||
                                    e.key === "e" ||
                                    e.key === "+"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                              <ErrorMessage
                                name={`beneficiaries[${index}].housePrice`}
                                component="div"
                                className="text-red-500 text-xs absolute top-8 left-3"
                              />
                            </div>
                          </td>
                          {/* Automatically calculated Toshan */}
                          <td className="px-2 py-3">
                            <div className="border rounded px-2 py-1 w-auto flex gap-1">
                              <span className="font-semibold">₹</span>
                              {formatNumberWithCommas(
                                values?.beneficiaries[index]?.toshan
                              )}
                            </div>
                          </td>
                          {/* Interest */}
                          <td className="px-2 py-3">
                            <div className="border rounded px-2 py-1 w-auto flex gap-1">
                              <span className="font-semibold">₹</span>
                              {formatNumberWithCommas(
                                values?.beneficiaries[index]?.interest
                              )}
                            </div>
                          </td>
                          {/* Total Compensation */}
                          <td className="px-2 py-3">
                            <div className="flex gap-1 font-semibold items-center">
                              <span>₹</span>
                              {formatNumberWithCommas(
                                values?.beneficiaries[index]?.totalCompensation
                              )}
                            </div>
                          </td>
                          {/* Vivran */}
                          <td className="px-2 py-3">
                            <div className="relative">
                              <Field
                                name={`beneficiaries[${index}].vivran`}
                                as="textarea"
                                rows="1"
                                className="custom-input border rounded px-2 py-2 w-28 hide-scrollbar min-h-[32px] max-h-[100px]"
                                placeholder="--"
                                value={
                                  values?.beneficiaries[index]?.vivran || ""
                                }
                                onChange={(e) =>
                                  handleFieldChange(
                                    index,
                                    "vivran",
                                    e.target.value
                                  )
                                }
                              />
                              <ErrorMessage
                                name={`beneficiaries[${index}].vivran`}
                                component="div"
                                className="text-red-500 text-xs absolute bottom-[-12.5px]"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default AddDisbursementPage;
