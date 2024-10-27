import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const Pagination = ({ data, itemsPerPage, setPaginatedData }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages based on data
  const totalPages = Math.ceil(Object.keys(data)?.length / itemsPerPage);

  // Get paginated data
  const paginateData = (groupedData) => {
    const offset = (currentPage - 1) * itemsPerPage;
    return Object.keys(groupedData).slice(offset, offset + itemsPerPage);
  };

  // Handle pagination
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    setPaginatedData(paginateData(data));
  }, [data, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <div className="flex justify-center flex-wrap gap-1 items-center mt-4 space-x-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-4 py-1 rounded-md ${
          currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
        }`}
      >
        Previous
      </button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`px-4 py-1 rounded-md ${
          currentPage === totalPages || totalPages === 0
            ? "bg-gray-300"
            : "bg-blue-500 text-white"
        }`}
      >
        Next
      </button>
    </div>
  );
};

Pagination.propTypes = {
  data: PropTypes.object.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  setPaginatedData: PropTypes.func.isRequired,
};

export default Pagination;
