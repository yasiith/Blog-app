import Blog from '../models/Blog.js';

export const createBlog = async (req, res) => {
  try {
    const { title, description, category, image, author } = req.body;

    if (!title || !description || !category || !image) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newBlog = new Blog({
      title,
      description,
      category,
      image, // This is the Cloudinary URL from the frontend
      author,
    });

    await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully!', blogId: newBlog._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId });
    res.json({ blogs });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Corrected GetBlog function (was missing export)
export const Getblog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
