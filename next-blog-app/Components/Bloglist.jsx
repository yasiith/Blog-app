import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BlogItem from './BlogItem';


const API_URL = process.env.REACT_APP_API_URL;


const Bloglist = () => {
  const [menu, setMenu] = useState('All');
  const [blogs, setBlogs] = useState([]);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {

        const res = await fetch('http://13.60.94.142:5000/api/blogs/Allblogs');

        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs);
        } else {
          console.error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };

    fetchBlogs();
  }, []); // Removed `router` from dependencies since it's not used inside `fetchBlogs`

  return (
    <div>
      {/* Category Buttons */}
      <div className='flex justify-center gap-6 my-10'>
        {['All', 'Technology', 'Startup', 'Lifestyle'].map((category) => (
          <button
            key={category}
            onClick={() => setMenu(category)}
            className={`py-1 px-4 rounded-sm ${
              menu === category ? 'bg-black text-white' : 'bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Blog List */}
      <div className='flex flex-wrap justify-around gap-1 gap-y-10 mb-16 xl:mx-24'>
        {blogs
          .filter((item) => menu === 'All' || item.category === menu)
          .map((item) => (
            <BlogItem
              key={item.id} // Use unique ID instead of index
              id={item._id}
              image={item.image}
              title={item.title}
              description={item.description}
              category={item.category}
            />
          ))}
      </div>
    </div>
  );
};

export default Bloglist;
