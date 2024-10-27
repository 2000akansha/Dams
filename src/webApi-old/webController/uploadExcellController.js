import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import Beneficiary from "../webModel/benificiaryDetail.js";
import KhatauniDetails from "../webModel/khatauniDetailsSchema.js";
import LandPrice from "../webModel/landPrice.js"; // Import the LandPrice model
import VillageList from "../webModel/villageListSchema.js";
import BeneficiarDisbursementDetails from "../webModel/beneficiaryDisbursementDetails.js";
import OldBeneficiarDisbursement from "../webModel/beneficiaryDisbursementDetails - old Data.js";
import { fileURLToPath } from "url";

// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const uploadExcel = async (req, res) => {
//   if (!req.file) {
//     return res
//       .status(400)
//       .json({ success: false, message: "No file uploaded." });
//   }

//   const { villageId } = req.body;
//   const userId = req.user.id;

//   if (!villageId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "villageId is required." });
//   }

//   try {
//     const filePath = path.resolve("public/uploads", req.file.filename);

//     if (!fs.existsSync(filePath)) {
//       throw new Error("File not found");
//     }

//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(filePath);
//     const worksheet = workbook.getWorksheet(1); // Assume first sheet

//     const columnMappings = {
//       A: "khatauniSankhya",
//       C: "beneficiaryName",
//       H: "beneficiaryShare",
//       I: "acquiredBeneficiaryShare",
//       B: "serialNumber",
//       D: "khasraNumber",
//       E: "areaVariety",
//       F: "acquiredKhasraNumber",
//       G: "acquiredRakbha",
//       J: "landPricePerSqMtr",
//       K: "bhumiPrice",
//       L: "faldaarBhumiPrice",
//       M: "gairFaldaarBhumiPrice",
//       N: "housePrice",
//       P: "toshan",
//       R: "interest",
//       S: "totalCompensation",
//       T: "vivran",
//     };

//     const uniqueKhatauniSankhyaSet = new Set();
//     const beneficiaryPromises = [];
//     let landPriceDetail = {};
//     let landPriceId = null;

//     worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//       if (rowNumber > 1) {
//         const khatauniSankhya = row.getCell("A").value;



//         if (row.getCell("J").value) {
//           landPriceDetail.landPricePerSqMtr = row.getCell("J").value;
//           landPriceDetail.villageId = villageId;
//           landPriceDetail.update = {
//             userId,
//             updatedAt: new Date(),
//             action: "0",
//           };
//         }

//         if (typeof khatauniSankhya === "number" && !isNaN(khatauniSankhya)) {
//           uniqueKhatauniSankhyaSet.add(khatauniSankhya);

//           const beneficiary = {};
//           const khatauniDetail = {};

//           beneficiary.khatauniSankhya = khatauniSankhya;
//           khatauniDetail.khatauniSankhya = khatauniSankhya;

//           for (const [col, field] of Object.entries(columnMappings)) {
//             let cellValue = row.getCell(col).value;

//             if (cellValue instanceof Date) {
//               cellValue = cellValue.toLocaleDateString("en-US");
//             } else if (typeof cellValue === "string") {
//               cellValue = cellValue.replace(/\n/g, " ").trim();
//             }

//             if (["A", "C", "H", "I"].includes(col)) {
//               beneficiary[field] = cellValue || "";
//             } else {
//               khatauniDetail[field] = cellValue || "";
//             }
//           }

//           beneficiary.villageId = villageId;
//           beneficiary.update = { userId, updatedAt: new Date(), action: "0" };
//           khatauniDetail.villageId = villageId;
//           khatauniDetail.update = {
//             userId,
//             updatedAt: new Date(),
//             action: "0",
//           };

//           const beneficiaryPromise = (async () => {
//             const savedBeneficiary = await Beneficiary.create(beneficiary);
//             khatauniDetail.beneficiaryId = savedBeneficiary._id;

//             const savedKhatauniDetails = await KhatauniDetails.create(
//               khatauniDetail
//             );

//             await Beneficiary.findOneAndUpdate(
//               { _id: khatauniDetail.beneficiaryId },
//               {
//                 $set: {
//                   khatauniId: savedKhatauniDetails._id,
//                   landPriceId: landPriceId,
//                 },
//               },
//               { upsert: true, new: true }
//             );

//             // Insert into beneficiarDisbursementDetails collection
//             const disbursementDetails = {
//               bhumiPrice: row.getCell("K").value || 0,
//               faldaarBhumiPrice: row.getCell("L").value || 0,
//               gairFaldaarBhumiPrice: row.getCell("M").value || 0,
//               housePrice: row.getCell("N").value || 0,
//               toshan: row.getCell("P").value || 0,
//               interest: row.getCell("R").value || 0,
//               totalCompensation: row.getCell("S").value || 0,
//               villageId: villageId,
//               beneficiaryId: savedBeneficiary._id,
//               update: { userId, updatedAt: new Date(), action: "0" },
//             };

//             await BeneficiarDisbursementDetails.create(disbursementDetails);

//             // Insert into old beneficiaryData for future compare collection
//             const disbursementDetailsOld = {
//               bhumiPrice: row.getCell("K").value || 0,
//               faldaarBhumiPrice: row.getCell("L").value || 0,
//               gairFaldaarBhumiPrice: row.getCell("M").value || 0,
//               housePrice: row.getCell("N").value || 0,
//               toshan: row.getCell("P").value || 0,
//               interest: row.getCell("Q").value || 0, // Assuming interest is in column Q
//               totalCompensation: row.getCell("R").value || 0, // Assuming totalCompensation is in column R
//               villageId: villageId,
//               beneficiaryId: savedBeneficiary._id,
//               update: { userId, updatedAt: new Date(), action: "0" },
//             };

//             await OldBeneficiarDisbursement.create(disbursementDetailsOld);
//           })();

//           beneficiaryPromises.push(beneficiaryPromise);
//         }
//       }
//     });

//     if (landPriceDetail.landPricePerSqMtr) {
//       const savedLandPrice = await LandPrice.create(landPriceDetail);
//       landPriceId = savedLandPrice._id;
//     }

//     await Promise.all(beneficiaryPromises);

//     const uniqueKhatauniCount = uniqueKhatauniSankhyaSet.size;
//     const totalBeneficiaries = await Beneficiary.countDocuments({ villageId });

//     await VillageList.findOneAndUpdate(
//       { _id: villageId },
//       {
//         $set: {
//           khatauni: uniqueKhatauniCount,
//           totalBeneficiaries: totalBeneficiaries,
//           landPriceId: landPriceId,
//           update: { userId, updatedAt: new Date(), action: "0" },
//         },
//       },
//       { new: true }
//     );

//     res
//       .status(200)
//       .json({
//         success: true,
//         message: "Beneficiaries records uploaded successfully",
//       });
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const { villageId } = req.body;
  const userId = req.user.id;

  if (!villageId) {
    return res.status(400).json({ success: false, message: "villageId is required." });
  }

  try {
    const filePath = path.resolve("public/uploads", req.file.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1); // Assume first sheet

    const columnMappings = {
      A: "khatauniSankhya",
      C: "beneficiaryName",
      H: "beneficiaryShare",
      I: "acquiredBeneficiaryShare",
      B: "serialNumber",
      D: "khasraNumber",
      E: "areaVariety",
      F: "acquiredKhasraNumber",
      G: "acquiredRakbha",
      J: "landPricePerSqMtr",
      K: "bhumiPrice",
      L: "faldaarBhumiPrice",
      M: "gairFaldaarBhumiPrice",
      N: "housePrice",
      P: "toshan",
      R: "interest",
      S: "totalCompensation",
      T: "vivran",
    };

    const uniqueKhatauniSankhyaSet = new Set();
    const beneficiaryPromises = [];
    const processedRows = new Set(); // To track unique rows within the Excel file itself
    let landPriceDetail = {};
    let landPriceId = null;

    // Find land price only once, based on the first row
    const landPricePerSqMtr = worksheet.getRow(2).getCell("J").value;
    if (landPricePerSqMtr) {
      landPriceDetail = {
        landPricePerSqMtr: landPricePerSqMtr,
        villageId: villageId,
        update: { userId, updatedAt: new Date(), action: "0" },
      };
      const savedLandPrice = await LandPrice.create(landPriceDetail);
      landPriceId = savedLandPrice._id;
    }

    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      if (rowNumber > 1) {
        const khatauniSankhya = row.getCell("A").value;
        let serialNumber = row.getCell("B").value;
        const beneficiaryName = row.getCell("C").value?.trim();

        // Skip row if serialNumber is not a number
        if (isNaN(serialNumber)) {
          console.log(`Invalid serialNumber: ${serialNumber} at row ${rowNumber}. Skipping row.`);
          return;
        }

        uniqueKhatauniSankhyaSet.add(khatauniSankhya);

        // Ensure serialNumber is a number
        serialNumber = Number(serialNumber);

        if (khatauniSankhya && serialNumber && beneficiaryName) {
          const uniqueKey = `${khatauniSankhya}-${serialNumber}-${beneficiaryName}`;

          // Check for duplicates within the current Excel file
          if (processedRows.has(uniqueKey)) {
            console.log(`Duplicate entry found within Excel file for khatauniSankhya: ${khatauniSankhya}, serialNumber: ${serialNumber}, beneficiaryName: ${beneficiaryName}. Skipping row ${rowNumber}.`);
            return;
          }

          // Check for duplicates in the database
          const existingKhatauniDetail = await KhatauniDetails.findOne({ khatauniSankhya, serialNumber });
          const existingBeneficiary = await Beneficiary.findOne({ khatauniSankhya, serialNumber, beneficiaryName });

          if (existingKhatauniDetail || existingBeneficiary) {
            console.log(`Duplicate entry found in database for khatauniSankhya: ${khatauniSankhya}, serialNumber: ${serialNumber}, beneficiaryName: ${beneficiaryName}. Skipping row ${rowNumber}.`);
            return;
          }

          processedRows.add(uniqueKey); // Mark as processed to avoid duplicates within the file

          // Continue with the insertion logic if no duplicates are found
          if (typeof khatauniSankhya === "number" && !isNaN(khatauniSankhya)) {
            const beneficiary = {};
            const khatauniDetail = {};

            beneficiary.khatauniSankhya = khatauniSankhya;
            khatauniDetail.khatauniSankhya = khatauniSankhya;

            for (const [col, field] of Object.entries(columnMappings)) {
              let cellValue = row.getCell(col).value;

              if (cellValue instanceof Date) {
                cellValue = cellValue.toLocaleDateString("en-US");
              } else if (typeof cellValue === "string") {
                cellValue = cellValue.replace(/\n/g, " ").trim();
              }

              if (["A", "C", "H", "I"].includes(col)) {
                beneficiary[field] = cellValue || "";
              } else {
                khatauniDetail[field] = cellValue || "";
              }
            }

            beneficiary.villageId = villageId;
            beneficiary.update = { userId, updatedAt: new Date(), action: "0" };
            khatauniDetail.villageId = villageId;
            khatauniDetail.update = { userId, updatedAt: new Date(), action: "0" };

            const beneficiaryPromise = (async () => {
              const savedBeneficiary = await Beneficiary.create(beneficiary);
              khatauniDetail.beneficiaryId = savedBeneficiary._id;

              const savedKhatauniDetails = await KhatauniDetails.create(khatauniDetail);

              await Beneficiary.findOneAndUpdate(
                { _id: khatauniDetail.beneficiaryId },
                { $set: { khatauniId: savedKhatauniDetails._id, landPriceId: landPriceId } },
                { upsert: true, new: true }
              );

              const disbursementDetails = {
                bhumiPrice: row.getCell("K").value || 0,
                faldaarBhumiPrice: row.getCell("L").value || 0,
                gairFaldaarBhumiPrice: row.getCell("M").value || 0,
                housePrice: row.getCell("N").value || 0,
                toshan: row.getCell("P").value || 0,
                interest: row.getCell("R").value || 0,
                totalCompensation: row.getCell("S").value || 0,
                villageId: villageId,
                beneficiaryId: savedBeneficiary._id,
                update: { userId, updatedAt: new Date(), action: "0" },
              };

              await BeneficiarDisbursementDetails.create(disbursementDetails);
              await OldBeneficiarDisbursement.create(disbursementDetails); // Old beneficiary comparison collection
            })();

            beneficiaryPromises.push(beneficiaryPromise);
          }
        }
      }
    });

    await Promise.all(beneficiaryPromises);

    const uniqueKhatauniCount = uniqueKhatauniSankhyaSet.size;
    const totalBeneficiaries = await Beneficiary.countDocuments({ villageId });

    await VillageList.findOneAndUpdate(
      { _id: villageId },
      {
        $set: {
          khatauni: uniqueKhatauniCount,
          totalBeneficiaries: totalBeneficiaries,
          landPriceId: landPriceId,
          update: { userId, updatedAt: new Date(), action: "0" },
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Beneficiaries records uploaded successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



// export const uploadExcel = async (req, res) => {
//   try {
//     console.log('Request Body:', req.body);
//     console.log('Request File:', req.file);
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded.' });
//     }
//     const { villageId } = req.body;
//     const { userId } = req.body; // Get userId from req.user attached by middleware
//     console.log('userId:', userId);
//     if (!villageId) {
//       return res.status(400).json({ success: false, message: 'villageId is required.' });
//     }
//     const filePath = path.resolve('public/uploads', req.file.filename);
//     console.log('Resolved File Path:', filePath);
//     if (!fs.existsSync(filePath)) {
//       throw new Error('File not found');
//     }
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(filePath);
//     const worksheet = workbook.getWorksheet(1); // Assume first sheet
//     const columnMappings = {
//       'A': 'khatauniSankhya',
//       'C': 'beneficiaryName',
//       'H': 'beneficiaryShare',
//       'I': 'acquiredBeneficiaryShare',
//       'B': 'serialNumber',
//       'D': 'khasraNumber',
//       'E': 'areaVariety',
//       'F': 'acquiredKhasraNumber',
//       'G': 'acquiredRakbha',
//       'J': 'landPricePerSqMtr',
//       'K': 'bhumiPrice',
//       'L': 'faldaarBhumiPrice',
//       'M': 'gairFaldaarBhumiPrice',
//       'N': 'housePrice',
//       'P': 'toshan',
//       'R': 'interest',
//       'S': 'totalCompensation',
//       'T': 'vivran',
//     };
//     const processedRows = new Set(); // Store the unique combination of khatauniSankhya, serialNumber, and beneficiaryName
//     const beneficiaryPromises = [];
//     let landPriceDetail = {};
//     let landPriceId = null;
//     worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
//       if (rowNumber > 1) {
//         const khatauniSankhya = row.getCell('A').value;
//         const serialNumber = row.getCell('B').value;
//         const beneficiaryName = row.getCell('C').value?.trim();
//         if (khatauniSankhya && serialNumber && beneficiaryName) {
//           const uniqueKey = `${khatauniSankhya}-${serialNumber}-${beneficiaryName}`;
//           // Skip if this combination has already been processed
//           if (processedRows.has(uniqueKey)) {
//             console.log(`Duplicate row found for khatauniSankhya: ${khatauniSankhya}, serialNumber: ${serialNumber}, beneficiaryName: ${beneficiaryName}. Skipping row ${rowNumber}.`);
//             return; // Skip the row
//           }
//           // Check for duplicates in the collections
//           const existingKhatauniDetail = await KhatauniDetails.findOne({
//             khatauniSankhya,
//             serialNumber,
//           });
//           const existingBeneficiary = await Beneficiary.findOne({
//             khatauniSankhya,
//             serialNumber,
//             beneficiaryName,
//           });
//           if (existingKhatauniDetail || existingBeneficiary) {
//             console.log(`Duplicate entry found in database for khatauniSankhya: ${khatauniSankhya}, serialNumber: ${serialNumber}, beneficiaryName: ${beneficiaryName}. Skipping row ${rowNumber}.`);
//             return; // Skip if duplicate exists in the database
//           }
//           // Add the unique key to the processedRows set
//           processedRows.add(uniqueKey);
//           // If land price is defined in this row, update the landPriceDetail object
//           if (row.getCell('J').value) {
//             landPriceDetail = {
//               landPricePerSqMtr: row.getCell('J').value,
//               villageId: villageId,
//               update: { userId, updatedAt: new Date(), action: '0' },
//             };
//           }
//           if (typeof khatauniSankhya === 'number' && !isNaN(khatauniSankhya)) {
//             const beneficiary = { villageId, update: { userId, updatedAt: new Date(), action: '0' } };
//             const khatauniDetail = { villageId, update: { userId, updatedAt: new Date(), action: '0' } };
//             // Map the rest of the columns
//             for (const [col, field] of Object.entries(columnMappings)) {
//               let cellValue = row.getCell(col).value;
//               if (cellValue instanceof Date) {
//                 cellValue = cellValue.toLocaleDateString('en-US');
//               } else if (typeof cellValue === 'string') {
//                 cellValue = cellValue.replace(/\n/g, ' ').trim();
//               }
//               if (['A', 'C', 'H', 'I'].includes(col)) {
//                 beneficiary[field] = cellValue || '';
//               } else {
//                 khatauniDetail[field] = cellValue || '';
//               }
//             }
//             beneficiary.khatauniSankhya = khatauniSankhya;
//             khatauniDetail.khatauniSankhya = khatauniSankhya;
//             beneficiaryPromises.push((async () => {
//               const savedBeneficiary = await Beneficiary.create(beneficiary);
//               khatauniDetail.beneficiaryId = savedBeneficiary._id;
//               const savedKhatauniDetails = await KhatauniDetails.create(khatauniDetail);
//               await Beneficiary.findOneAndUpdate(
//                 { _id: khatauniDetail.beneficiaryId },
//                 { $set: { khatauniId: savedKhatauniDetails._id, landPriceId: landPriceId } },
//                 { upsert: true, new: true }
//               );
//               const disbursementDetails = {
//                 bhumiPrice: row.getCell('K').value || 0,
//                 faldaarBhumiPrice: row.getCell('L').value || 0,
//                 gairFaldaarBhumiPrice: row.getCell('M').value || 0,
//                 housePrice: row.getCell('N').value || 0,
//                 toshan: row.getCell('P').value || 0,
//                 interest: row.getCell('R').value || 0,
//                 totalCompensation: row.getCell('S').value || 0,
//                 villageId: villageId,
//                 beneficiaryId: savedBeneficiary._id,
//                 update: { userId, updatedAt: new Date(), action: '0' },
//               };
//               await beneficiarDisbursementDetails.create(disbursementDetails);
//               const disbursementDetailsOld = {
//                 bhumiPrice: row.getCell('K').value || 0,
//                 faldaarBhumiPrice: row.getCell('L').value || 0,
//                 gairFaldaarBhumiPrice: row.getCell('M').value || 0,
//                 housePrice: row.getCell('N').value || 0,
//                 toshan: row.getCell('P').value || 0,
//                 interest: row.getCell('R').value || 0,
//                 totalCompensation: row.getCell('S').value || 0,
//                 villageId: villageId,
//                 beneficiaryId: savedBeneficiary._id,
//                 update: { userId, updatedAt: new Date(), action: '0' },
//               };
//               await OldBeneficiarDisbursement.create(disbursementDetailsOld);
//             })());
//           }
//         }
//       }
//     });
//     if (landPriceDetail.landPricePerSqMtr) {
//       const savedLandPrice = await LandPrice.create(landPriceDetail);
//       landPriceId = savedLandPrice._id;
//     }
//     await Promise.all(beneficiaryPromises);
//     const uniqueKhatauniCount = processedRows.size;
//     const totalBeneficiaries = await Beneficiary.countDocuments({ villageId });
//     await villageList.findOneAndUpdate(
//       { _id: villageId },
//       {
//         $set: {
//           khatauni: uniqueKhatauniCount,
//           totalBeneficiaries: totalBeneficiaries,
//           landPriceId: landPriceId,
//           update: { userId, updatedAt: new Date(), action: '0' },
//         },
//       },
//       { new: true }
//     );
//     res.status(200).json({ success: true, message: 'All the records successfully uploaded.' });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export { uploadExcel };
