import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { addLegalHeir } from "../../../redux/apis/beneficiariesAPI";
import { useDispatch } from "react-redux";
import CONSTANTS from "../../../constants.json";
import { RxCross1 } from "react-icons/rx";

const LegalHeirModal = ({
  closeModal,
  beneficiaryId,
  setRecallAPI,
  recallAPI,
}) => {
  const dispatch = useDispatch();

  // Validation schema for the legal heirs
  const validationSchema = Yup.object({
    beneficiaryType: Yup.string().required("Beneficiary type is required"),
    legalHeirs: Yup.array().of(
      Yup.object({
        name: Yup.string()
          .min(3, "At least 3 characters")
          .required("Beneficiary name is required"),
        bhumi: Yup.number()
          .min(0, "Minimum 0%")
          .max(100, "Maximum 100%")
          .test("is-decimal", "Up to 2 decimals allowed", (value) =>
            /^\d+(\.\d{1,2})?$/.test(value)
          )
          .required("*required"),
        faldaarBhumi: Yup.number()
          .min(0, "Minimum 0%")
          .max(100, "Maximum 100%")
          .test("is-decimal", "Up to 2 decimals allowed", (value) =>
            /^\d+(\.\d{1,2})?$/.test(value)
          )
          .required("*required"),
        gairFaldaarBhumi: Yup.number()
          .min(0, "Minimum 0%")
          .max(100, "Maximum 100%")
          .test("is-decimal", "Up to 2 decimals allowed", (value) =>
            /^\d+(\.\d{1,2})?$/.test(value)
          )
          .required("*required"),
        makaanShare: Yup.number()
          .min(0, "Minimum 0%")
          .max(100, "Maximum 100%")
          .test("is-decimal", "Up to 2 decimals allowed", (value) =>
            /^\d+(\.\d{1,2})?$/.test(value)
          )
          .required("*required"),
      })
    ),
  });

  const initialValues = {
    beneficiaryId: beneficiaryId,
    beneficiaryType: "poa",
    legalHeirs: [
      {
        name: "",
        bhumi: 100,
        faldaarBhumi: 100,
        gairFaldaarBhumi: 100,
        makaanShare: 100,
      },
    ],
  };

  const userTypes = [
    { value: "poa", label: "Power of attorney (POA)" },
    { value: "nok", label: "Next of kin (NOK)" },
  ];

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    const totalBhumi = values.legalHeirs.reduce(
      (acc, beneficiary) => acc + Number(beneficiary.bhumi),
      0
    );
    const totalFaldaarBhumi = values.legalHeirs.reduce(
      (acc, beneficiary) => acc + Number(beneficiary.faldaarBhumi),
      0
    );
    const totalGairFaldaarBhumi = values.legalHeirs.reduce(
      (acc, beneficiary) => acc + Number(beneficiary.gairFaldaarBhumi),
      0
    );
    const totalMakaanShare = values.legalHeirs.reduce(
      (acc, beneficiary) => acc + Number(beneficiary.makaanShare),
      0
    );

    if (totalBhumi !== 100) {
      toast.error(
        "The total percentage of bhumi divided among the legal heirs must equal 100%."
      );
    } else if (totalFaldaarBhumi !== 100) {
      toast.error(
        "The total percentage of faldaar-bhumi divided among the legal heirs must equal 100%."
      );
    } else if (totalGairFaldaarBhumi !== 100) {
      toast.error(
        "The total percentage of gairfaldaar-bhumi divided among the legal heirs must equal 100%."
      );
    } else if (totalMakaanShare !== 100) {
      toast.error(
        "The total percentage of makaan divided among the legal heirs must equal 100%."
      );
    } else {
      console.log(values.legalHeirs, "values.legalHeirs");
      const allValid = values.legalHeirs.every((beneficiary) =>
        ["bhumi", "faldaarBhumi", "gairFaldaarBhumi", "makaanShare"].some(
          (field) => beneficiary[field] >= 1
        )
      );
      if (!allValid) {
        toast.error(
          "Every legal heir must have at least 1% share in any of the field (bhumi, faldaar-bhumi, gairfaldaar-bhumi, makaan)."
        );
      } else {
        console.log(values, "---");
        dispatch(addLegalHeir(values)).then((res) => {
          if (res.success) {
            toast.success(res.message);
            setRecallAPI(!recallAPI);
            closeModal();
          } else {
            toast.error(res.message);
          }
        });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg relative">
        <button
          className="text-gray-500 hover:text-gray-800 absolute top-3 right-3"
          onClick={() => closeModal()}
        >
          <RxCross1 />
        </button>
        <h3 className="mb-4 text-xl text-gray-700 font-bold text-center">
          {CONSTANTS.PAGES_NAME.ADD_LEGAL_HEIR}
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form>
              {/* Beneficiary Type Dropdown */}
              <div>
                <label
                  htmlFor="beneficiaryType"
                  className="block text-left text-sm font-medium leading-6 text-gray-900"
                >
                  {CONSTANTS.CHANGE_TYPE}
                </label>
                <Field
                  as="select"
                  name="beneficiaryType"
                  className="custom-input px-3 py-2"
                >
                  {userTypes?.map((opt) => (
                    <option
                      value={opt.value}
                      label={opt.label}
                      key={opt.value}
                    />
                  ))}
                </Field>
                <ErrorMessage
                  name="beneficiaryType"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="max-h-[350px] overflow-y-scroll pr-1 custom-scrollbar mt-5">
                <FieldArray name="legalHeirs">
                  {({ remove, push }) => (
                    <>
                      {values.legalHeirs.map((_, index) => (
                        <div key={index} className="pb-5">
                          <div className="flex gap-5 mb-1">
                            <div className="text-sm text-gray-600 font-semibold">
                              Legal Heir - {index + 1}
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                className="text-red-500 text-sm"
                                onClick={() => remove(index)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="px-4 pb-5 pt-3 bg-slate-50 rounded-lg">
                            {/*Legal Heir Name */}
                            <label
                              htmlFor={`legalHeirs.${index}.name`}
                              className="block text-xs font-medium text-gray-700"
                            >
                              Legal Heir Name
                            </label>
                            <Field
                              name={`legalHeirs.${index}.name`}
                              className="custom-input px-3 py-2 text-sm"
                              placeholder="Enter name"
                              value={values.legalHeirs[index].name}
                              onChange={(e) => {
                                setFieldValue(
                                  `legalHeirs.${index}.name`,
                                  e.target.value &&
                                    e.target.value.replace(/\s+/g, " ")
                                );
                              }}
                            />
                            <ErrorMessage
                              name={`legalHeirs.${index}.name`}
                              component="div"
                              className="text-red-500 text-xs"
                            />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <label
                                  htmlFor={`legalHeirs.${index}.bhumi`}
                                  className="block text-xs font-medium text-gray-700"
                                >
                                  Bhumi Share %age
                                </label>
                                <Field
                                  name={`legalHeirs.${index}.bhumi`}
                                  type="number"
                                  className="custom-input px-3 py-2 text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="Enter percentage"
                                  onChange={(e) => {
                                    setFieldValue(
                                      `legalHeirs.${index}.bhumi`,
                                      e.target.value &&
                                        parseFloat(
                                          Number(e.target.value).toFixed(2)
                                        )
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "-" ||
                                      e.key === "e" ||
                                      e.key === "+"
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onWheel={(e) => e.target.blur()}
                                />
                                <ErrorMessage
                                  name={`legalHeirs.${index}.bhumi`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`legalHeirs.${index}.faldaarBhumi`}
                                  className="block text-xs font-medium text-gray-700"
                                >
                                  Faldaar Bhumi Share %age
                                </label>
                                <Field
                                  name={`legalHeirs.${index}.faldaarBhumi`}
                                  type="number"
                                  className="custom-input px-3 py-2 text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="Enter percentage"
                                  onChange={(e) => {
                                    setFieldValue(
                                      `legalHeirs.${index}.faldaarBhumi`,
                                      e.target.value &&
                                        parseFloat(
                                          Number(e.target.value).toFixed(2)
                                        )
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "-" ||
                                      e.key === "e" ||
                                      e.key === "+"
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onWheel={(e) => e.target.blur()}
                                />
                                <ErrorMessage
                                  name={`legalHeirs.${index}.faldaarBhumi`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`legalHeirs.${index}.gairFaldaarBhumi`}
                                  className="block text-xs font-medium text-gray-700"
                                >
                                  Gairfaldaar Bhumi Share %age
                                </label>
                                <Field
                                  name={`legalHeirs.${index}.gairFaldaarBhumi`}
                                  type="number"
                                  className="custom-input px-3 py-2 text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="Enter percentage"
                                  onChange={(e) => {
                                    setFieldValue(
                                      `legalHeirs.${index}.gairFaldaarBhumi`,
                                      e.target.value &&
                                        parseFloat(
                                          Number(e.target.value).toFixed(2)
                                        )
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "-" ||
                                      e.key === "e" ||
                                      e.key === "+"
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onWheel={(e) => e.target.blur()}
                                />
                                <ErrorMessage
                                  name={`legalHeirs.${index}.gairFaldaarBhumi`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>

                              <div>
                                <label
                                  htmlFor={`legalHeirs.${index}.makaanShare`}
                                  className="block text-xs font-medium text-gray-700"
                                >
                                  Makaan Share %age
                                </label>
                                <Field
                                  name={`legalHeirs.${index}.makaanShare`}
                                  type="number"
                                  className="custom-input px-3 py-2 text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  placeholder="Enter percentage"
                                  onChange={(e) => {
                                    setFieldValue(
                                      `legalHeirs.${index}.makaanShare`,
                                      e.target.value &&
                                        parseFloat(
                                          Number(e.target.value).toFixed(2)
                                        )
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "-" ||
                                      e.key === "e" ||
                                      e.key === "+"
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onWheel={(e) => e.target.blur()}
                                />
                                <ErrorMessage
                                  name={`legalHeirs.${index}.makaanShare`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add New Beneficiary Button */}
                      <button
                        type="button"
                        className="bg-green-500 text-white text-sm px-4 py-1 rounded-lg hover:bg-green-600 w-full"
                        onClick={() => {
                          const totalBhumi = values.legalHeirs.reduce(
                            (acc, beneficiary) =>
                              acc + (parseFloat(beneficiary.bhumi) || 0),
                            0
                          );
                          const totalFaldaarBhumi = values.legalHeirs.reduce(
                            (acc, beneficiary) =>
                              acc + (parseFloat(beneficiary.faldaarBhumi) || 0),
                            0
                          );
                          const totalGairfaldaarBhumi =
                            values.legalHeirs.reduce(
                              (acc, beneficiary) =>
                                acc +
                                (parseFloat(beneficiary.gairFaldaarBhumi) || 0),
                              0
                            );
                          const totalMakaanShare = values.legalHeirs.reduce(
                            (acc, beneficiary) =>
                              acc + (parseFloat(beneficiary.makaanShare) || 0),
                            0
                          );
                          push({
                            name: "",
                            bhumi: parseFloat((100 - totalBhumi).toFixed(2)),
                            faldaarBhumi: parseFloat(
                              (100 - totalFaldaarBhumi).toFixed(2)
                            ),
                            gairFaldaarBhumi: parseFloat(
                              (100 - totalGairfaldaarBhumi).toFixed(2)
                            ),
                            makaanShare: parseFloat(
                              (100 - totalMakaanShare).toFixed(2)
                            ),
                          });
                        }}
                      >
                        Add Legal Heir
                      </button>
                    </>
                  )}
                </FieldArray>
              </div>

              {/* Cancel and Save Buttons */}
              <div className="flex justify-between mt-6 gap-4">
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-full"
                  onClick={() => closeModal()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LegalHeirModal;
