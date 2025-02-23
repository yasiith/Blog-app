'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/Components/Footer';
import Link from 'next/link';
import { assets } from '@/Assets/assets'; // Assuming your assets (like arrows) are imported this way
import Header from '@/Components/Header';

const BlogPage = ({ params }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/blogs/${params.id}`);

        if (!response.ok) {
          throw new Error('Blog not found');
        }

        const blogData = await response.json();
        setData(blogData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [params.id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return data ? (
    <>
    <div className='py-5 px-5 md:px-12 lg:px-28'>
      <div className='flex justify-between items-center'>
        <Image src={assets.logo} width={180} alt='' className='w-[130px] sm:w-auto' />
        </div>
        </div>
      <div className='max-w-[800px] mx-auto py-8'>
        <div className='bg-white border border-black hover:shadow-[-7px_7px_0px_#000000]'>
          <Link href={`/blogs/${params.id}`}>
            <Image src={data.image} alt='' width={1280} height={720} className='border-b border-black' />
          </Link>
          <div className='p-5'>
            <p className="ml-5 mt-5 px-1 inline-block bg-black text-white text-sm">{data.category}</p>
            <h1 className="mb-2 text-3xl font-medium tracking-tight text-gray-900">{data.title}</h1>
            <div className="flex items-center mt-3">
              <Image src={data.author_img} width={60} height={60} alt={data.author} className="rounded-full" />
              <p className="ml-3 text-sm text-gray-700">{data.author}</p>
            </div>
            <p className="mt-4 text-lg text-gray-800">{data.description}</p>
            <div className="my-6">
              <p className='text-black font-semibold my-4'>Share this article on social media</p>
              <div className='flex'>
                <Image src={assets.facebook_icon} width={50} alt='' />
                <Image src={assets.twitter_icon} width={50} alt='' />
                <Image src={assets.googleplus_icon} width={50} alt='' />
              </div>
            </div>
            <button onClick={() => router.push('/blogs')} className="inline-flex items-center py-2 font-semibold text-center">
  Back to Blogs <Image src={assets.arrow} className="ml-2" alt='' width={12} />
</button>

          </div>
        </div>
      </div>

      <Footer />
    </>
  ) : (
    <p className="text-center mt-10">No blog found</p>
  );
};

export default BlogPage;
