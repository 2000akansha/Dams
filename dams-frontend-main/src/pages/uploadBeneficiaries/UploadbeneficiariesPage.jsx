import React from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import CONSTANTS from "../../constants.json";
import { uploadExcel } from "../../redux/apis/excelAPI";
import BackButton from "../../components/BackButton";
import { BASE_URL } from "../../utils/axios";

// const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB per chunk

const UploadbeneficiariesPage = () => {
  // const [uploadProgress, setUploadProgress] = useState(0);

  const { villageId, villageName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.userDetailsSlice.details.userId);

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    file: Yup.mixed()
      .required("File is required")
      .test(
        "fileFormat",
        "Unsupported format. Only .xlsx is allowed.",
        (value) => {
          return (
            value &&
            value.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      file: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("villageId", villageId);
      formData.append("userId", userId);
      dispatch(uploadExcel(formData)).then((res) => {
        if (res.success) {
          toast.success(res.message);
          resetForm();
          navigate(-1);
        } else {
          toast.error(res.message);
        }
      });
    },
  });

  // Function to handle file change
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("file", file);
  };

  // Function to upload file in chunks
  // const uploadFileInChunks = async (file) => {
  //   const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  //   let chunkIndex = 0;

  //   for (let start = 0; start < file.size; start += CHUNK_SIZE) {
  //     const chunk = file.slice(start, start + CHUNK_SIZE);
  //     const formData = new FormData();
  //     formData.append("file", chunk);
  //     formData.append("villageId", villageId);
  //     formData.append("userId", userId);
  //     formData.append("chunkIndex", chunkIndex);
  //     formData.append("totalChunks", totalChunks);

  //     const response = await uploadExcelChunk(formData);
  //     if (!response.success) {
  //       throw new Error(response.message);
  //     }

  //     // Update the upload progress
  //     setUploadProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
  //     chunkIndex++;
  //   }
  // };

  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center overflow-auto p-5">
      <div className="flex gap-3 justify-between items-center w-full mb-6">
        <BackButton />
        <h2 className="text-2xl font-semibold text-gray-600">
          {CONSTANTS.PAGES_NAME.IMPORT_EXCEL} -{" "}
          <span className="text-gray-500">{villageName}</span>
        </h2>
        <div></div>
      </div>

      <form onSubmit={formik.handleSubmit} className="w-full max-w-lg">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 bg-slate-100 shadow-xl">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            id="fileUpload"
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center h-48 cursor-pointer group"
          >
            {formik.values.file ? (
              <div className="text-center">
                <div className="text-blue-500 text-4xl mb-2">
                  <i className="fas fa-file-alt"></i>
                </div>
                <span className="text-blue-500 text-lg font-medium">
                  {formik.values.file.name}
                </span>
              </div>
            ) : (
              <>
                <div className="text-blue-500 text-5xl mb-2">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <span className="text-blue-500 text-lg font-medium relative">
                  {CONSTANTS.BUTTON.SELECT_FILE}
                  <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></div>
                </span>
              </>
            )}
          </label>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {CONSTANTS.ERROR.EXCEL}
            <Link
              to={`${BASE_URL}/uploads/sample-excel.xlsx`}
              download
              rel="noopener noreferrer"
              className="text-blue-500 underline font-medium"
            >
              Excel Template
            </Link>
            .
          </p>

          {formik.errors.file && formik.touched.file && (
            <div className="text-red-500 mt-2 text-sm text-center">
              {formik.errors.file}
            </div>
          )}
        </div>

        <div className="w-full flex justify-center items-center">
          <button
            type="submit"
            className="mt-8 bg-blue-500 text-white text-lg font-medium py-2 px-8 rounded-lg hover:bg-blue-600"
            disabled={!formik.isValid}
          >
            {CONSTANTS.BUTTON.IMPORT_NOW}
          </button>
        </div>
        {/* {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full mt-4">
            <div
              className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress}%
            </div>
          </div>
        )} */}
      </form>
    </div>
  );
};

export default UploadbeneficiariesPage;
