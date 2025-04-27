// backend/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

const path = require('path');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'PathologyMuseum';
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (mime.startsWith('image/')) {
      folder += '/PathologyImages';
    } else if (mime.startsWith('audio/')) {
      folder += '/SpecimenAudios';
    } else if (mime.startsWith('video/')) {
      folder += '/PathogenesisVideos';
    } else if ([ '.glb', '.gltf', '.obj', '.fbx' ].includes(ext)) {
      folder += '/3DModels';
    }
    return {
      folder,
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const parser = multer({ storage });

module.exports = parser;
