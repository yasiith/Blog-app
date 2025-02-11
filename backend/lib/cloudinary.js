//backend\lib\cloudinary.js
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary'; // Correct import

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup multer storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-app', // Folder for your images in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed formats
  },
});

// Create multer instance
const upload = multer({ storage: storage });

export default upload;
