import express from 'express';
import { createBlog,getAllBlogs,Getblog } from '../controllers/blogController.js';
import upload from '../lib/cloudinary.js';  // Ensure correct import
import { verifyToken } from '../Middleware/verifyToken.js';


const router = express.Router();


// Get all blogs by user
router.get('/', verifyToken, getAllBlogs);

// Create a new blog
router.post('/create',  createBlog);

router.get('/:id',Getblog);

export default router;
