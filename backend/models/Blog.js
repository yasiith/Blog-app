import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  image: { type: String, required: true }, // Store the Cloudinary image URL here
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;