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

      try {
        const res = await fetch('http://localhost:5000/api/blogs', {
          headers: { Authorization: `Bearer ${token}` },
        });

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
              height={50}
              alt='Logo'
              className='sm:w-auto'
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

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {blogs.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog._id}`}
                className='block border rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105'
              >
                <div className='relative w-full h-48'>
                  <Image
                    src={blog.image || '/default-blog.jpg'} // Fallback image
                    alt={blog.title}
                    layout='fill'
                    objectFit='cover'
                  />
                </div>
                <div className='p-4'>
                  <h3 className='text-lg font-bold'>{blog.title}</h3>
                  <p className='text-sm text-gray-600'>{blog.category || 'Uncategorized'}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
