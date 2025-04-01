import express from 'express';
import { createBlog,getAllBlogs,Getblog,GetEveryBlogs } from '../controllers/blogController.js';
import upload from '../lib/cloudinary.js';  // Ensure correct import
import  {verifyToken}  from '../middleware/verifyToken.js';


const router = express.Router();


// Get all blogs by user
router.get('/', verifyToken, getAllBlogs);

router.get('/Allblogs',GetEveryBlogs)

// Create a new blog
router.post('/create',  createBlog);

router.get('/:id',Getblog);

export default router;
