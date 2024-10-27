import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import { useState } from "react";
import CONSTANTS from "../../constants.json";
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from "../../redux/apis/authApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [toastId, setToastId] = useState(null);

  const { loader } = useSelector((state) => state.loadingSlice);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userRoles = [
    { value: "0", label: "Department Inputer" },
    { value: "1", label: "Department Verifier" },
    { value: "2", label: "Finance Approver" },
    { value: "3", label: "DC Administration" },
  ];

  // Validation schema with proper username regex validation
  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(
        /^[a-zA-Z0-9._-]+$/,
        "Username must be alphanumeric and can include . _ -"
      )
      .required("Username is required"),
    password: Yup.string().required("Password is required"),
    role: Yup.string().required("Role is required"),
  });

  const initialValues = {
    username: "",
    password: "",
    role: "",
  };

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(userLogin(values)).then((res) => {
      if (res.success) {
        if (toastId) toast.dismiss(toastId);
        navigate("/dashboard");
      } else {
        if (toastId) toast.dismiss(toastId);
        const id = toast.error(res.message);
        setToastId(id);
      }
      setSubmitting(false);
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="w-full h-screen overflow-y-scroll hide-scrollbar flex justify-evenly items-center flex-col sm:flex-row gap-2 p-2 bg-slate-900">
      <div className="flex flex-col justify-center items-center gap-5 p-3 m-1">
        <div className="bg-white p-5 rounded-lg">
          <img src="/logo02.png" alt="logo" width="250" />
        </div>
        <div className="text-gray-200 font-semibold text-2xl max-w-xl text-center">
          {CONSTANTS.PROJECT_NAME}
        </div>
      </div>
      <div className="m-1 loginPage px-8 max-w-md rounded-xl border border-gray-100 bg-white self-center text-center w-[300px] sm:w-[350px] md:w-[380px] lg:w-[380px]">
        <h3 className="my-8 text-gray-600 font-bold">
          Sign in to your account
        </h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="mb-8">
              <div className="mb-6 relative">
                {values.role && (
                  <label
                    htmlFor="role"
                    className="block text-left text-sm font-medium leading-6 text-gray-900 absolute top-[-22px] left-0"
                  >
                    User Role
                  </label>
                )}
                <Field as="select" name="role" className="custom-input">
                  <option value="" disabled className="text-white bg-stone-300">
                    Select Role
                  </option>
                  {userRoles?.map((opt) => {
                    return (
                      <option
                        value={opt.value}
                        label={opt.label}
                        key={opt.value}
                      ></option>
                    );
                  })}
                </Field>
                <ErrorMessage name="role" component="div" className="error" />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block text-left text-sm font-medium leading-6 text-gray-900"
                >
                  {CONSTANTS.LABEL.USERNAME}
                </label>
                <Field
                  type="text"
                  name="username"
                  className="custom-input"
                  placeholder="Enter username"
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="error"
                />
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="password"
                  className="block text-left text-sm font-medium leading-6 text-gray-900"
                >
                  {CONSTANTS.LABEL.PASSWORD}
                </label>
                <Field
                  type={showPassword ? "text" : "password"} // Dynamic password visibility
                  name="password"
                  className="custom-input"
                  placeholder="Enter password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />

                {/* Eye icon for show/hide password */}
                <span
                  className="absolute inset-y-0 right-3 top-6 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-gray-600"
                  />
                </span>
              </div>

              <Button type="submit" disabled={isSubmitting} color="secondary">
                {isSubmitting ? "Loggin In..." : CONSTANTS.BUTTON.LOGIN}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
      {loader && <Loader />}
      <Toaster />
    </div>
  );
};

export default LoginPage;
