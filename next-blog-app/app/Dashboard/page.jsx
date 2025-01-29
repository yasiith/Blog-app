'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { assets } from '@/Assets/assets';
import Footer from '@/Components/Footer';

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/'); // Redirect to login if no token
        return;
      }

      const res = await fetch('http://localhost:5000/api/blogs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs);
      } else {
        alert('Failed to fetch blogs');
      }
    };

    fetchBlogs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Header Section */}
      <div className='bg-gray-200 py-5 px-5 md:px-12 lg:px-28'>
        <div className='flex justify-between items-center'>
          <Link href='/'>
            <Image
              src={assets.logo}
              width={180}
              alt=''
              className='w-[130] sm:w-auto'
            />
          </Link>
          <div className='flex gap-4'>
            <button
              onClick={() => router.push('/Dashboard/create-blog')}
              className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black shadow-[-7px_7px_0px_#000000]'
            >
              Create New Blog
            </button>
            <button
              onClick={handleLogout}
              className='flex items-center gap-2 font-medium py-1 px-3 sm:py-3 sm:px-6 border border-black shadow-[-7px_7px_0px_#000000]'
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className='flex-grow p-6 md:px-12 lg:px-28'>
        <h2 className='text-2xl font-bold mb-4'>My Blogs</h2>

        <div className='mt-4'>
          {blogs.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className='border p-4 rounded mb-2'>
                <h3 className='text-xl font-semibold'>{blog.title}</h3>
                <p>{blog.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}