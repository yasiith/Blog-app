// app/Blogs.jsx

'use client';
import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://13.60.94.142:5000/api/blogs', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
      });

      const data = await res.json();
      setBlogs(data.blogs);
    };

    fetchBlogs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">My Blogs</h2>
      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <ul>
          {blogs.map((blog) => (
            <li key={blog._id} className="mb-4">
              <h3 className="text-xl font-bold">{blog.title}</h3>
              <p>{blog.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
