import React from "react";
import CONSTANTS from "../../../constants.json";
import { formatNumberWithCommas } from "../../../utils/priceFormat";

const DisbursementDetails = ({
  beneficiaryType,
  isDisbursementUploaded,
  details,
}) => {
  const {
    bhumiPrice,
    faldaarBhumiPrice,
    gairFaldaarBhumiPrice,
    housePrice,
    toshan,
    interest,
    totalCompensation,
    vivran,
  } = details;
  return (
    <div className="overflow-auto border border-gray-200 rounded-lg">
      {/* Table Header */}
      <table className="min-w-full text-left table-auto">
        <thead className="bg-white text-sm">
          <tr>
            <th className="px-4 py-4">{CONSTANTS.BHUMI_PRICE}</th>
            <th className="px-4 py-4">{CONSTANTS.FALDAAR_BHUMI_PRICE}</th>
            <th className="px-4 py-4">{CONSTANTS.GAIR_FALDAAR_BHUMI_PRICE}</th>
            <th className="px-4 py-4">{CONSTANTS.HOUSE_PRICE}</th>
            <th className="px-4 py-4">{CONSTANTS.TOSHAN}</th>
            <th className="px-4 py-4">{CONSTANTS.INTEREST_SHORT}</th>
            <th className="px-4 py-4">{CONSTANTS.TOTAL_COMPENSATION}</th>
            <th className="px-4 py-4">{CONSTANTS.VIVRAN}</th>
          </tr>
        </thead>
        <tbody className="text-sm bg-white">
          {isDisbursementUploaded == "1" ||
          beneficiaryType == "poa" ||
          beneficiaryType == "nok" ? (
            <tr>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(bhumiPrice)}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(faldaarBhumiPrice) || 0}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div>{" "}
                  {formatNumberWithCommas(gairFaldaarBhumiPrice) || 0}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(housePrice) || 0}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(toshan)}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(interest)}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>₹</div> {formatNumberWithCommas(totalCompensation)}
                </div>
              </td>
              <td className="px-4 py-4">{vivran ? vivran : "--"}</td>
            </tr>
          ) : (
            <tr>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex gap-1">
                  <div>--</div>
                </div>
              </td>
              <td className="px-4 py-4">{vivran ? vivran : "--"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DisbursementDetails;
