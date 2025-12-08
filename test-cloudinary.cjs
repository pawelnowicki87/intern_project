const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

console.log('🔧 Testing Cloudinary connection...');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload(
  './cat.jpg', // plik musi być w katalogu projektu
  {
    folder: 'innogram_uploads',
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    resource_type: 'auto',
  },
  (error, result) => {
    if (error) {
      console.error('❌ Upload error:', error);
    } else {
      console.log('✅ Upload success:', result.secure_url);
    }
  },
);
