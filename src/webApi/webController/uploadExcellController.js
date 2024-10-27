import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";
import sanitize from 'sanitize-html';
import Beneficiary from "../webModel/benificiaryDetail.js";
import KhatauniDetails from "../webModel/khatauniDetailsSchema.js";
import LandPrice from "../webModel/landPrice.js"; // Import the LandPrice model
import VillageList from "../webModel/villageListSchema.js";
import BeneficiaryDisbursementDetails from "../webModel/beneficiaryDisbursementDetails.js";
import OldBeneficiaryDisbursement from "../webModel/beneficiaryDisbursementDetails - old Data.js";
import { fileURLToPath } from "url";// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// new keys value successfully saved , VILLAGEAREA  everything fixed . so dont touch this code.
export const uploadExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { villageId } = req.body;
    const userId = req.user.id;

    const sanitizedVillageId = sanitize(villageId, { allowedTags: [], allowedAttributes: {} }).trim();
    if (!sanitizedVillageId) {
        return res.status(400).json({ success: false, message: "Invalid villageId." });
    }

    try {
        const filePath = path.resolve("public/uploads", req.file.filename);
        if (!fs.existsSync(filePath)) throw new Error("File not found");

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
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


        const processedRows = new Set();
        let landPriceDetail = {};
        let landPriceId = null;


        let lastValidKhatauniSankhya = null;  
        for (let rowNumber = 2; rowNumber <= worksheet.lastRow.number; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const khatauniSankhya = row.getCell("A").value;
            const serialNumber = Number(row.getCell("B").value);
            console.log(khatauniSankhya);

            const beneficiaryName = sanitize(row.getCell("C").value?.toString() || "");

       
            if (serialNumber === 1 && !lastValidKhatauniSankhya) {
                lastValidKhatauniSankhya = khatauniSankhya;
            }

           
            if (!isNaN(serialNumber)) {
                lastValidKhatauniSankhya = khatauniSankhya;
            } else if (isNaN(serialNumber) && lastValidKhatauniSankhya) {
           

                let landPricePerSqMtr = sanitize(row.getCell("J").value?.toString()).trim();
                let totalbhumiPrice = sanitize(row.getCell("K").value?.toString()).trim();
                let totalfaldaarBhumiPrice = sanitize(row.getCell("L").value?.toString()).trim();
                let totalgairFaldaarBhumiPrice = sanitize(row.getCell("M").value?.toString()).trim();
                let totalhousePrice = sanitize(row.getCell("N").value?.toString()).trim();

               
                const updateFields = {};
                if (totalbhumiPrice) updateFields.totalbhumiPrice = totalbhumiPrice;
                if (totalfaldaarBhumiPrice) updateFields.totalfaldaarBhumiPrice = totalfaldaarBhumiPrice;
                if (totalgairFaldaarBhumiPrice) updateFields.totalgairFaldaarBhumiPrice = totalgairFaldaarBhumiPrice;
                if (totalhousePrice) updateFields.totalhousePrice = totalhousePrice;

            
                if (Object.keys(updateFields).length > 0) {
                    await KhatauniDetails.updateOne(
                        { khatauniSankhya: lastValidKhatauniSankhya, villageId: sanitizedVillageId },
                        { $set: updateFields },
                        { upsert: true }
                    );
                }

                if (landPricePerSqMtr) {
                    const existingLandPrice = await LandPrice.findOne({ landPricePerSqMtr, villageId: sanitizedVillageId });
                    landPriceId = existingLandPrice ? existingLandPrice._id : (await LandPrice.create({
                        landPricePerSqMtr,
                        villageId: sanitizedVillageId,
                        update: { userId, updatedAt: new Date(), action: "0" }
                    }))._id;
                }

                continue;
            }


            if (khatauniSankhya && serialNumber && beneficiaryName) {
                const uniqueKey = `${khatauniSankhya}-${serialNumber}-${beneficiaryName}`;

                // console.log(uniqueKey);

                if (processedRows.has(uniqueKey)) continue;
                processedRows.add(uniqueKey);

                const existingBeneficiary = await Beneficiary.findOne({ serialNumber, beneficiaryName });
                if (existingBeneficiary) {
                    return res.status(409).json({
                        success: false,
                        message: "Duplicate entries found. The data has already been uploaded.",
                    });
                }

                const existingKhatauniDetails = await KhatauniDetails.findOne({ villageId: sanitizedVillageId, khatauniSankhya });
                let khatauniId = null;

                if (!existingKhatauniDetails) {
                    const newKhatauni = await KhatauniDetails.create({
                        khatauniSankhya,
                        khasraNumber: sanitize(
                            (Array.isArray(row.getCell("D").value)
                                ? row.getCell("D").value.join(", ")
                                : row.getCell("D").value?.toString() || "")
                                .replace(/\s+/g, "")   
                                .replace(/\n|\r/g, "")
                        ),
                        acquiredKhasraNumber: sanitize(
                            (Array.isArray(row.getCell("F").value)
                                ? row.getCell("F").value.join(", ")
                                : row.getCell("F").value?.toString() || "")
                                .replace(/\s+/g, "")
                                .replace(/\n|\r/g, "")
                        ),
                        areaVariety: sanitize(
                            (Array.isArray(row.getCell("E").value)
                                ? row.getCell("E").value.join(", ")
                                : row.getCell("E").value?.toString() || "")
                                .replace(/\s+/g, "")
                                .replace(/\n|\r/g, "")
                        ),
                        acquiredRakbha: sanitize(
                            (Array.isArray(row.getCell("G").value)
                                ? row.getCell("G").value.join(", ")
                                : row.getCell("G").value?.toString() || "")
                                .replace(/\s+/g, "")
                                .replace(/\n|\r/g, "")
                        ),
                        update: { userId, updatedAt: new Date(), action: "0" },
                        villageId: sanitizedVillageId,
                    });
                    khatauniId = newKhatauni._id;
                } else {
                    khatauniId = existingKhatauniDetails._id; 
                }

                const beneficiary = {
                    khatauniSankhya: sanitize(String(khatauniSankhya)).trim(),
                    serialNumber,
                    villageId: sanitizedVillageId,
                    beneficiaryName,
                    acquiredBeneficiaryShare: sanitize(
                        String(row.getCell("I").value || '0').trim()
                    ), 
                    khatauniId, 
                    update: { userId, updatedAt: new Date(), action: "0" },
                };
                
                

                const savedBeneficiary = await Beneficiary.create(beneficiary);


                const disbursementDetails = {
                    bhumiPrice: sanitize(row.getCell("K").value?.toString() || "0"),
                    faldaarBhumiPrice: sanitize(row.getCell("L").value?.toString() || "0"),
                    gairFaldaarBhumiPrice: sanitize(row.getCell("M").value?.toString() || "0"),
                    housePrice: Number(sanitize(row.getCell("N").value)) || "0",
                    toshan: sanitize(row.getCell("P").value?.toString() || "0"),
                    interest: sanitize(row.getCell("R").value?.toString() || "0"),
                    totalCompensation: Number(sanitize(row.getCell("S").value)) || 0, 
                    villageId: sanitizedVillageId,
                    beneficiaryId: savedBeneficiary._id,
                    update: { userId, updatedAt: new Date(), action: "0" },
                };

                await BeneficiaryDisbursementDetails.create(disbursementDetails);
                await OldBeneficiaryDisbursement.create(disbursementDetails);
            }
        }

        const beneficiaries = await Beneficiary.find({ villageId: sanitizedVillageId })
            .populate("khatauniId", "khatauniSankhya serialNumber")
            .select("acquiredBeneficiaryShare");

        const khatauniSankhyaSet = new Set();
        let acquiredVillageArea = 0;

        if (Array.isArray(beneficiaries) && beneficiaries.length > 0) {
            beneficiaries.forEach(beneficiary => {
                if (beneficiary.khatauniId) {
                    khatauniSankhyaSet.add(beneficiary.khatauniId.khatauniSankhya);

                    const acquiredShare = beneficiary.acquiredBeneficiaryShare != null ? String(beneficiary.acquiredBeneficiaryShare) : '';

                    if (acquiredShare) {
                        console.log('check this out ', acquiredShare);

                        const parts = acquiredShare.split("-");

                        const acquiredBeneficiaryArea = parseFloat(parts[parts.length - 1]) || 0; 

                        acquiredVillageArea += acquiredBeneficiaryArea; 
                    } else {
                        console.warn(`acquiredBeneficiaryShare is undefined or empty for beneficiary ID: ${beneficiary._id}`);
                    }
                }
            });
        }

        console.log("Total acquired village area:", acquiredVillageArea);

        await VillageList.findOneAndUpdate(
            { _id: villageId },
            {
                $set: {
                    khatauni: khatauniSankhyaSet.size,
                    totalBeneficiaries: beneficiaries.length,
                    villageArea: String(acquiredVillageArea), 
                    landPriceId,
                    update: { userId, updatedAt: new Date(), action: "0" },
                },
            },
            { new: true }
        ).then(updatedVillage => {
            console.log("Updated village:", updatedVillage);
        }).catch(err => {
            console.error("Error updating village:", err);
        });

        res.status(200).json({
            success: true,
            message: "Beneficiaries records uploaded successfully",
        });
    } catch (error) {
        console.error("Error processing Excel upload:", error.message);
        res.status(500).json({
            success: false,
            message: `Error processing file: ${error.message}`,
        });
    }
}