import PropTypes from "prop-types";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";

const PreviewDoc = ({ file, setShowFile }) => {
  const fileExtension = file.split(".").pop().toLowerCase();
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-20">
      <div className="relative flex items-center justify-center z-50 w-[450px] bg-white p-5 rounded-lg shadow-lg overflow-y-auto m-5">
        {/* Iframe for PDF or document preview */}
        {["png", "jpg", "jpeg", "gif"].includes(fileExtension) ? (
          <div className="flex flex-col items-center justify-center">
            <div className="flex w-[400px]">
              <button
                className="text-white bg-zinc-700 rounded-full p-2"
                onClick={() => setShowFile(false)}
              >
                <RxCross1 />
              </button>
            </div>
            <Link to={file} target="_blank" rel="noopener noreferrer">
              <img
                src={file}
                alt="attachment"
                className="w-[275px] rounded-lg my-2 h-auto object-contain transition duration-300 hover:shadow-2xl"
              ></img>
            </Link>
          </div>
        ) : (
          <>
            <button
              className="absolute top-[32px] left-10 text-white hover:bg-zinc-700 rounded-full transition-colors p-2"
              onClick={() => setShowFile(false)}
            >
              <RxCross1 />
            </button>
            <iframe
              src={file}
              title="Document Preview"
              width="100%"
              height="600px"
              style={{ border: "none" }}
              className="border-2 border-gray-200 rounded-md"
            />
          </>
        )}
      </div>
    </div>
  );
};

PreviewDoc.propTypes = {
  file: PropTypes.any,
  setShowFile: PropTypes.func,
};

export default PreviewDoc;
