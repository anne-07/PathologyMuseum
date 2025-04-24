// const { User, Specimen, Slide } = require('../models');

// // @desc    Add new specimen
// // @route   POST /api/admin/specimens
// // @access  Admin
// const addSpecimen = asyncHandler(async (req, res) => {
//     try{
//         const specimenData = req.body;
//         const requiredFields = ['accessionNumber', 'title', 'description', 'organ', 'diagnosis', 'clinicalHistory', 'grossFeatures', 'microscopicFeatures', 'category', 'images', 'createdBy'];
//         for (const field of requiredFields) {
//             if (!specimenData[field]) {
//                 return res.status(400).json({
//                 status: 'error',
//                 message: `${field} is required`,
//                 });
//             }
//         }
//         const existing = await Specimen.findOne({ accessionNumber: specimenData.accessionNumber });
//         if (existing) {
//           return res.status(409).json({
//             status: 'error',
//             message: 'Specimen with this accession number already exists',
//           });
//         }  
//         const specimen = await Specimen.create(specimenData);
//         res.status(201).json({
//             status: 'success',
//             message: 'Specimen added successfully',
//             specimen,
//         });              
//     }catch(error){
//         res.status(500).json({
//             status: 'error',
//             message: error.message || 'Server Error',
//         });    
//     }
// });