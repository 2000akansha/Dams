import { catchAsyncError } from '../../middleware/catchAsyncError.js';
import beneficiaryDocs from '../../schema/beneficiaryDocDetailSchema.js';
import ErrorHandler from '../../middleware/error.js';
import khatauniDetailsWeb from '../../webApi/webModel/khatauniDetailsSchema.js';
import villageList from '../../webApi/webModel/villageListSchema.js';
import mongoose from 'mongoose';
import beneficiaryDocDetailSchema from '../../schema/beneficiaryDocDetailSchema.js';

import beneficiarDetails from '../../webApi/webModel/benificiaryDetail.js'


// DONT TOUCH MY CODE*//
export const getVillageDetails = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return next(new ErrorHandler('User ID is required.', 400));
        }

        const villagesDetails = await khatauniDetailsWeb.find()
            .populate({
                path: 'beneficiaryId',
                select: 'beneficiaryName'
            })
            .exec();

        if (!villagesDetails || villagesDetails.length === 0) {
            return next(new ErrorHandler('No village details found.', 404));
        }

        const villageIds = villagesDetails.map(village => village.villageId);
        const villages = await villageList.find({ _id: { $in: villageIds } })
            .select('villageName villageNameHindi');

        const docDetails = await beneficiaryDocs.find();
        const groupedVillages = villagesDetails.reduce((acc, village) => {
            const khatauniSankhya = village.khatauniSankhya || 'N/A';
            const villageData = villages.find(v => v._id.toString() === village.villageId.toString());
            const villageName = villageData ? villageData.villageName : 'Unknown Village';

            // Initialize the village entry if it doesn't exist
            if (!acc[khatauniSankhya]) {
                acc[khatauniSankhya] = {
                    id: village._id,
                    khatauniId: village._id,
                    khatauniSankhya,
                    serialNumber: village.serialNumber || 'N/A',
                    khasraNumber: village.khasraNumber || 'N/A',
                    acquiredKhasraNumber: village.acquiredKhasraNumber || 'N/A',
                    areaVariety: village.areaVariety || 'N/A',
                    acquiredRakbha: village.acquiredRakbha || 'N/A',
                    isAllDocumentSubmitted: village.isAllDocumentSubmitted || 'N/A',
                    villageId: village.villageId || 'N/A',
                    villageName,
                    concatBeneficiaries: '', // Initialize as an empty string
                    submissionStatus: '', // Will be determined later
                    submissionColor: '',
                    beneficiaries: []
                };
            }

            const beneficiary = village.beneficiaryId;

            if (beneficiary) {
                // Directly pick the document detail using the beneficiaryId
                const docDetail = docDetails.find(doc => doc.beneficiaryId.toString() == beneficiary._id.toString());

                // Initialize default values
                let documentStatus = 'Not Started';
                let documentColor = '#808080'; // default for 'Not Started'

                // Check if docDetail exists and get document status directly
                if (docDetail) {
                    documentStatus = docDetail.documentUploadedEach == "completed" ? 'Complete' :
                        docDetail.documentUploadedEach == "incomplete" ? 'Incomplete' : 'Not Started';
                    documentColor = docDetail.documentUploadedEach == "completed" ? '#008000' :
                        docDetail.documentUploadedEach == "incomplete" ? '#C76E00' : '#808080'; // grey for 'Not Started'
                }

                // Push beneficiary data into the array
                acc[khatauniSankhya].beneficiaries.push({
                    name: beneficiary.beneficiaryName || 'N/A',
                    documentStatus,
                    documentColor
                });

                // Concatenate beneficiary names with a comma separator
                const beneficiaryName = beneficiary.beneficiaryName || 'N/A';
                acc[khatauniSankhya].concatBeneficiaries = acc[khatauniSankhya].concatBeneficiaries
                    ? `${acc[khatauniSankhya].concatBeneficiaries}, ${beneficiaryName}`
                    : beneficiaryName;
            }

            return acc;
        }, {});

        // Set the submission status for the entire khatauni based on all beneficiaries' document statuses
        Object.values(groupedVillages).forEach(village => {
            const beneficiaryStatuses = village.beneficiaries.map(b => b.documentStatus);

            // Check for submission status
            if (beneficiaryStatuses.length == 0 || beneficiaryStatuses.every(status => status == 'Not Started')) {
                village.submissionStatus = 'Yet to be filled';
                village.submissionColor = '#808080'; // Grey for 'Yet to be filled'
            } else {
                const allBeneficiariesComplete = beneficiaryStatuses.every(b => b == 'Complete');
                const anyBeneficiaryIncomplete = beneficiaryStatuses.some(b => b == 'Incomplete');

                village.submissionStatus = allBeneficiariesComplete ? 'Complete' : 'Partial';
                village.submissionColor = allBeneficiariesComplete ? '#008000' :
                    anyBeneficiaryIncomplete ? '#C76E00' : '#FF0000'; // Green for 'Complete', Yellow for 'Partial', Red for any incomplete
            }
        });

        res.status(200).json({
            status: true,
            message: 'Village details fetched successfully',
            data: Object.values(groupedVillages),
        });

    } catch (error) {
        next(new ErrorHandler('Error fetching village details', 500));
    }
});



// DONT TOUCH MY CODE*//
export const getBeneficiariesByKhatauniSankhya = catchAsyncError(async (req, res, next) => {
    try {
        const { khatauniSankhya } = req.query;
        console.log('Query Parameters:', { khatauniSankhya });

        // Validate query parameters
        if (!khatauniSankhya) {
            return next(new ErrorHandler('Khatauni Sankhya is required.', 200));
        }

        // Fetch villages based on khatauniSankhya
        const villages = await khatauniDetailsWeb.find({
            khatauniSankhya: khatauniSankhya
        })
            .populate('beneficiaryId', 'beneficiaryId beneficiaryName')
            .exec();

        // Check if villages were found
        if (!villages || villages.length === 0) {
            return next(new ErrorHandler('No beneficiaries found for the provided Khatauni Sankhya.', 200));
        }

        // Extract beneficiary IDs for document fetching
        const beneficiaryIds = villages.map(village => village.beneficiaryId._id);

        // Fetch documents for the beneficiaries
        const documents = await beneficiaryDocs.find({
            beneficiaryId: { $in: beneficiaryIds }
        }).exec();

        // Create a map for documents by beneficiaryId
        const documentsMap = documents.reduce((acc, doc) => {
            if (!acc[doc.beneficiaryId]) {
                acc[doc.beneficiaryId] = [];
            }
            acc[doc.beneficiaryId].push(doc);
            return acc;
        }, {});

        // Helper function to format dates
        const formatDate = (date) => {
            if (!date) return ""; // Return empty string if date is falsy

            const options = { day: '2-digit', month: 'long', year: 'numeric' };
            return new Date(date).toLocaleDateString('en-US', options);
        };

        // Build the beneficiaries response with their documents
        const beneficiaries = villages.map(village => {
            const beneficiaryId = village.beneficiaryId._id;
            const docs = documentsMap[beneficiaryId] || [];

            // Format the documents
            const documentsDetails = {
                accountNumber: docs[0]?.accountNumber ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                ifscCode: docs[0]?.ifscCode ? `uploaded on ${formatDate(docs[0].createdAt)}`  ||`uploaded on ${formatDate(docs[0].updatedAt)}`: '',
                aadhaarNumber: docs[0]?.aadhaarNumber ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                panCardNumber: docs[0]?.panCardNumber ?  `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}`: '',
                remarks: docs[0]?.remarks ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}`: '',
                photo: docs[0]?.photo ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                landIndemnityBond: docs[0]?.landIndemnityBond ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                structureIndemnityBond: docs[0]?.structureIndemnityBond ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                uploadAffidavit: docs[0]?.uploadAffidavit ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                aadhaarCard: docs[0]?.aadhaarCard ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                panCard: docs[0]?.panCard ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                chequeOrPassbook: docs[0]?.chequeOrPassbook ? `uploaded on ${formatDate(docs[0].createdAt)}` ||`uploaded on ${formatDate(docs[0].updatedAt)}` : '',
                // createdAt: docs[0]?.createdAt ? `uploaded on ${formatDate(docs[0].createdAt)}` : '',
            };

            // Check if all document values are empty
            const shouldRemoveDocumentsKey = Object.values(documentsDetails).every(value => value === "");

            return {
                beneficiaryId: beneficiaryId,
                name: village.beneficiaryId.beneficiaryName,
                ...(shouldRemoveDocumentsKey ? {} : { documents: documentsDetails }) // Include documents only if not empty
            };
        });

        // Extract khasraNumber, areaVariety, and khatauniSankhya from the first record
        const { khasraNumber, areaVariety } = villages[0];

        // Calculate the total beneficiary count
        const totalBeneficiaryCount = beneficiaries.length;

        // Send the response with all beneficiaries and additional information
        res.status(200).json({
            status: true,
            message: 'Beneficiary details fetched successfully.',
            beneficiaries,  // List of beneficiaries with IDs, names, and their documents
            beneficiaryCount: totalBeneficiaryCount,  // Total count of beneficiaries
            khasraNumber,  // Khasra Number
            areaVariety,   // Area Variety
            khatauniSankhya // Khatauni Sankhya
        });
    } catch (error) {
        console.error('Error:', error);
        next(error);
    }
});



// DONT TOUCH MY CODE*//
// export const uploadDocs = async (req, res) => {
//     try {
//         let { beneficiaries, khatauniSankhya } = req.body;
//         const files = req.files;

//         // Parse beneficiaries if it's a string
//         if (typeof beneficiaries === 'string') {
//             beneficiaries = JSON.parse(beneficiaries);
//         }

//         // Check if beneficiaries is an array
//         if (!Array.isArray(beneficiaries)) {
//             return res.json({
//                 status: false,
//                 message: 'Beneficiaries should be an array.',
//             });
//         }

//         // Validate required fields
//         if (!beneficiaries.length || !khatauniSankhya) {
//             return res.json({
//                 status: false,
//                 message: 'Required fields are missing.',
//             });
//         }

//         const requiredFields = [
//             'accountNumber', 'ifscCode', 'aadhaarNumber', 'panCardNumber', 'photo',
//             'landIndemnityBond', 'structureIndemnityBond', 'uploadAffidavit',
//             'aadhaarCard', 'panCard', 'chequeOrPassbook',
//         ];

//         // Extract file name based on the field and index of beneficiary
//         const extractFileName = (field, index) => {
//             const key = `beneficiaries[${index}][${field}]`;
//             const file = files[key];
//             return file && file[0]?.filename
//                 ? `${field}-${file[0].filename.split('-').pop()}`
//                 : '';
//         };

//         // Process beneficiaries and handle document upload
//         const processedBeneficiaries = beneficiaries.map((beneficiary, index) => {
//             // Ensure beneficiaryName is a string
//             const beneficiaryName = Array.isArray(beneficiary.beneficiaryName)
//                 ? beneficiary.beneficiaryName.join(', ') // Join if it's an array
//                 : beneficiary.beneficiaryName || ''; // Default to empty string if undefined

//             const hasDocumentSubmitted = requiredFields.some(field => files[`beneficiaries[${index}][${field}]`] && files[`beneficiaries[${index}][${field}]`][0]?.filename);

//             // Validate consents before proceeding
//             if (hasDocumentSubmitted && (beneficiary.isConsent1 !== 'true' || beneficiary.isConsent2 !== 'true')) {
//                 throw new Error(`Both consents must be "true" for beneficiary: ${beneficiaryName}`);
//             }

//             // Construct the beneficiary object with extracted file names
//             return {
//                 beneficiaryId: beneficiary.beneficiaryId ? new mongoose.Types.ObjectId(beneficiary.beneficiaryId) : null,
//                 beneficiaryName,
//                 accountNumber: beneficiary.accountNumber || '',
//                 ifscCode: beneficiary.ifscCode || '',
//                 aadhaarNumber: beneficiary.aadhaarNumber || '',
//                 panCardNumber: beneficiary.panCardNumber || '',
//                 remarks: beneficiary.remarks || '',
//                 isConsent1: beneficiary.isConsent1 === 'true',
//                 isConsent2: beneficiary.isConsent2 === 'true',
//                 photo: extractFileName('photo', index),
//                 landIndemnityBond: extractFileName('landIndemnityBond', index),
//                 structureIndemnityBond: extractFileName('structureIndemnityBond', index),
//                 uploadAffidavit: extractFileName('uploadAffidavit', index),
//                 aadhaarCard: extractFileName('aadhaarCard', index),
//                 panCard: extractFileName('panCard', index),
//                 chequeOrPassbook: extractFileName('chequeOrPassbook', index),
//                 khatauniSankhya: khatauniSankhya || '', // Ensure khatauniSankhya is included
//                 documentUploadedEach: '', // Will be updated later based on conditions
//             };
//         });

//         // Check if at least one document or detail is filled for any beneficiary
//         const hasAtLeastOneField = processedBeneficiaries.some(beneficiary =>
//             requiredFields.some(field => beneficiary[field] && beneficiary[field].trim() !== '') ||
//             beneficiary.accountNumber || beneficiary.ifscCode ||
//             beneficiary.aadhaarNumber || beneficiary.panCardNumber
//         );

//         if (!hasAtLeastOneField) {
//             return res.json({
//                 status: false,
//                 message: 'Please fill at least one document or detail for any beneficiary.',
//             });
//         }

//         // Determine if all documents are filled for all beneficiaries
//         const allDocsFilledForAllBeneficiaries = processedBeneficiaries.every(beneficiary =>
//             requiredFields.every(field => beneficiary[field] && beneficiary[field].trim() !== '')
//         );

//         // Initialize submissionStatus
//         const submissionStatus = allDocsFilledForAllBeneficiaries ? 'Completed' : 'Partial';

//         for (const beneficiary of processedBeneficiaries) {
//             // Check if all required documents are filled for each beneficiary
//             const allDocsUploadedForBeneficiary = requiredFields.every(field =>
//                 beneficiary[field] && typeof beneficiary[field] === 'string' && beneficiary[field].trim() !== ''
//             );

//             beneficiary.documentUploadedEach = allDocsUploadedForBeneficiary ? 'completed' : 'incomplete';

//             // Find or create the beneficiary document in the collection
//             let beneficiaryDoc = await beneficiaryDocs.findOne({
//                 beneficiaryId: beneficiary.beneficiaryId,
//                 beneficiaryName: beneficiary.beneficiaryName,
//                 khatauniSankhya: beneficiary.khatauniSankhya,
//             });

//             if (beneficiaryDoc) {
//                 // Update existing document only with non-empty fields
//                 Object.keys(beneficiary).forEach(key => {
//                     const value = beneficiary[key];
//                     if ((typeof value === 'string' && value.trim() !== '') || typeof value !== 'string') {
//                         beneficiaryDoc[key] = value;  // Only update if new value is not empty and different
//                     }
//                 });
//                 beneficiaryDoc.submissionStatus = submissionStatus; // Add submissionStatus to each beneficiary doc

//                 // Update isDocumentUploaded in beneficiaryDetails if all documents are uploaded for this beneficiary
//                 if (beneficiary.documentUploadedEach === 'completed') {
//                     console.log("Updating isDocumentUploaded for beneficiary:", beneficiary.beneficiaryId);
//                     await beneficiarDetails.findOneAndUpdate(
//                         { _id: beneficiary.beneficiaryId },
//                         { $set: { isDocumentUploaded: "1" } },
//                         { new: true, upsert: true } // Upsert in case the document doesn't exist
//                     );
//                 }
//             } else {
//                 // Create new document
//                 beneficiaryDoc = new beneficiaryDocs({ ...beneficiary, submissionStatus });

//                 // Set isDocumentUploaded to "1" if documents are uploaded
//                 if (beneficiary.documentUploadedEach === 'completed') {
//                     console.log("Creating and updating isDocumentUploaded for beneficiary:", beneficiary.beneficiaryId);
//                     await beneficiarDetails.findOneAndUpdate(
//                         { beneficiaryId: beneficiary.beneficiaryId },
//                         { $set: { isDocumentUploaded: "1" } },
//                         { new: true, upsert: true } // Upsert in case the document doesn't exist
//                     );
//                 }
//             }
//             // Save the updated/new beneficiary document
//             await beneficiaryDoc.save();
//         }


//         // Update the overall submission status for all documents under this khatauniSankhya
//         await beneficiaryDocs.updateMany(
//             { khatauniSankhya },
//             { $set: { submissionStatus } }
//         );

//         // Return success response
//         res.status(200).json({
//             status: true,
//             message: 'Documents and beneficiary details uploaded successfully',
//             processedBeneficiaries
//         });
//     } catch (error) {
//         console.error('Error uploading documents:', error);
//         res.json({
//             status: false,
//             message: error.message || 'Error uploading documents',
//         });
//     }
// };




export const uploadDocs = async (req, res) => {
    try {
        let { beneficiaries, khatauniSankhya } = req.body;
        const files = req.files;

        // Parse beneficiaries if it's a string
        if (typeof beneficiaries === 'string') {
            beneficiaries = JSON.parse(beneficiaries);
        }

        // Check if beneficiaries is an array
        if (!Array.isArray(beneficiaries)) {
            return res.json({
                status: false,
                message: 'Beneficiaries should be an array.',
            });
        }

        // Validate required fields
        if (!beneficiaries.length || !khatauniSankhya) {
            return res.json({
                status: false,
                message: 'Required fields are missing.',
            });
        }

        const requiredFields = [
            'accountNumber', 'ifscCode', 'aadhaarNumber', 'panCardNumber', 'photo',
            'landIndemnityBond', 'structureIndemnityBond', 'uploadAffidavit',
            'aadhaarCard', 'panCard', 'chequeOrPassbook',
        ];

        // Extract file name based on the field and index of beneficiary
        const extractFileName = (field, index) => {
            const key = `beneficiaries[${index}][${field}]`;
            console.log('Checking file for key:', key);  // Log the key

            const file = files[key];

            // Check if file exists and log the found file details
            if (file && file[0]) {
                console.log(`Found file for ${key}:`, file[0].filename);
                return `${field}-${file[0].filename.split('-').pop()}`;
            } else {
                console.log(`No file found for ${key}`);
                return '';
            }
        };

        // Process beneficiaries and handle document upload
        const processedBeneficiaries = beneficiaries.map((beneficiary, index) => {
            // Ensure beneficiaryName is a string
            const beneficiaryName = Array.isArray(beneficiary.beneficiaryName)
                ? beneficiary.beneficiaryName.join(', ') // Join if it's an array
                : beneficiary.beneficiaryName || ''; // Default to empty string if undefined

            const hasDocumentSubmitted = requiredFields.some(field => files[`beneficiaries[${index}]`] && files[`beneficiaries[${index}]`][0]?.filename);

            // Validate consents before proceeding
            if (hasDocumentSubmitted && (beneficiary.isConsent1 !== 'true' || beneficiary.isConsent2 !== 'true')) {
                throw new Error(`Both consents must be "true" for beneficiary: ${beneficiaryName}`);
            }

            // Construct the beneficiary object with extracted file names
            return {
                beneficiaryId: beneficiary.beneficiaryId ? new mongoose.Types.ObjectId(beneficiary.beneficiaryId) : null,
                beneficiaryName,
                accountNumber: beneficiary.accountNumber || '',
                ifscCode: beneficiary.ifscCode || '',
                aadhaarNumber: beneficiary.aadhaarNumber || '',
                panCardNumber: beneficiary.panCardNumber || '',
                remarks: beneficiary.remarks || '',
                isConsent1: beneficiary.isConsent1 === 'true',
                isConsent2: beneficiary.isConsent2 === 'true',
                photo: extractFileName('photo', index),
                landIndemnityBond: extractFileName('landIndemnityBond', index),
                structureIndemnityBond: extractFileName('structureIndemnityBond', index),
                uploadAffidavit: extractFileName('uploadAffidavit', index),
                aadhaarCard: extractFileName('aadhaarCard', index),
                panCard: extractFileName('panCard', index),
                chequeOrPassbook: extractFileName('chequeOrPassbook', index),
                khatauniSankhya: khatauniSankhya || '', // Ensure khatauniSankhya is included
                documentUploadedEach: '', // Will be updated later based on conditions
            };
        });

        // Check if at least one document or detail is filled for any beneficiary
        const hasAtLeastOneField = processedBeneficiaries.some(beneficiary =>
            requiredFields.some(field => beneficiary[field] && beneficiary[field].trim() !== '') ||
            beneficiary.accountNumber || beneficiary.ifscCode ||
            beneficiary.aadhaarNumber || beneficiary.panCardNumber
        );

        if (!hasAtLeastOneField) {
            return res.json({
                status: false,
                message: 'Please fill at least one document or detail for any beneficiary.',
            });
        }

        // Determine if all documents are filled for all beneficiaries
        const allDocsFilledForAllBeneficiaries = processedBeneficiaries.every(beneficiary =>
            requiredFields.every(field => beneficiary[field] && beneficiary[field].trim() !== '')
        );

        // Initialize submissionStatus
        const submissionStatus = allDocsFilledForAllBeneficiaries ? 'Completed' : 'Partial';

        for (const beneficiary of processedBeneficiaries) {
            // Check if all required documents are filled for each beneficiary
            const allDocsUploadedForBeneficiary = requiredFields.every(field =>
                beneficiary[field] && typeof beneficiary[field] === 'string' && beneficiary[field].trim() !== ''
            );

            beneficiary.documentUploadedEach = allDocsUploadedForBeneficiary ? 'completed' : 'incomplete';

            // Find or create the beneficiary document in the collection
            let beneficiaryDoc = await beneficiaryDocs.findOne({
                beneficiaryId: beneficiary.beneficiaryId,
                beneficiaryName: beneficiary.beneficiaryName,
                khatauniSankhya: beneficiary.khatauniSankhya,
            });

            if (beneficiaryDoc) {
                // Update existing document only with non-empty fields
                Object.keys(beneficiary).forEach(key => {
                    const value = beneficiary[key];
                    if ((typeof value === 'string' && value.trim() !== '') || typeof value !== 'string') {
                        beneficiaryDoc[key] = value;  // Only update if new value is not empty and different
                    }
                });
                beneficiaryDoc.submissionStatus = submissionStatus; // Add submissionStatus to each beneficiary doc

                // Update isDocumentUploaded in beneficiaryDetails if all documents are uploaded for this beneficiary
                if (beneficiary.documentUploadedEach === 'completed') {
                    console.log("Updating isDocumentUploaded for beneficiary:", beneficiary.beneficiaryId);
                    await beneficiarDetails.findOneAndUpdate(
                        { _id: beneficiary.beneficiaryId },
                        { $set: { isDocumentUploaded: "1" } },
                        { new: true, upsert: true } // Upsert in case the document doesn't exist
                    );
                }
            } else {
                // Create new document
                beneficiaryDoc = new beneficiaryDocs({ ...beneficiary, submissionStatus });

                // Set isDocumentUploaded to "1" if documents are uploaded
                if (beneficiary.documentUploadedEach === 'completed') {
                    console.log("Creating and updating isDocumentUploaded for beneficiary:", beneficiary.beneficiaryId);
                    await beneficiarDetails.findOneAndUpdate(
                        { beneficiaryId: beneficiary.beneficiaryId },
                        { $set: { isDocumentUploaded: "1" } },
                        { new: true, upsert: true } // Upsert in case the document doesn't exist
                    );
                }
            }
            // Save the updated/new beneficiary document
            await beneficiaryDoc.save();
        }

        // Update the overall submission status for all documents under this khatauniSankhya
        await beneficiaryDocs.updateMany(
            { khatauniSankhya },
            { $set: { submissionStatus } }
        );

        // Return success response
        res.status(200).json({
            status: true,
            message: 'Documents and beneficiary details uploaded successfully',
            processedBeneficiaries
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.json({
            status: false,
            message: error.message || 'Error uploading documents',
        });
    }
};
