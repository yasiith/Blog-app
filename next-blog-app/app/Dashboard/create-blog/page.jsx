'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBlog() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      return payload.userId; // Replace 'userId' with the actual key in your JWT payload
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    if (!image || !['image/jpeg', 'image/png', 'image/jpg'].includes(image.type)) {
      setError('Please upload a valid image file (JPEG, PNG, JPG).');
      setLoading(false);
      return;
    }
  
    if (image.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      setLoading(false);
      return;
    }
  
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      alert('You must be logged in to create a blog.');
      router.push('/login');
      return;
    }
  
    const userId = decodeToken(token);
    if (!userId) {
      alert('Invalid session. Please log in again.');
      router.push('/login');
      return;
    }
  
    try {
      // Fetch Cloudinary signature from your backend
      const signatureResponse = await fetch('http://localhost:5000/api/cloudinary/sign');
      const { signature, timestamp, api_key } = await signatureResponse.json();
  
      // Upload image to Cloudinary
      const imageFormData = new FormData();
      imageFormData.append('file', image);
      imageFormData.append('api_key', api_key);
      imageFormData.append('timestamp', timestamp);
      imageFormData.append('signature', signature);
  
      console.log('Uploading to Cloudinary...');
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dsecpawul/image/upload`,
        {
          method: 'POST',
          body: imageFormData,
        }
      );
  
      const cloudinaryResponseData = await cloudinaryResponse.json();
      console.log(cloudinaryResponseData);
  
      if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryResponseData.error.message || 'Image upload failed');
      }
  
      const imageUrl = cloudinaryResponseData.secure_url;
      const API_URL = process.env.REACT_APP_API_URL;
  
      // Send blog data with image URL to your backend
      const blogData = {
        title,
        description,
        category,
        image: imageUrl,
        author: userId,
      };
  
      const res = await fetch('${API_URL}/api/blogs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      });
  
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          alert('Your session has expired. Please log in again.');
          router.push('/login');
        } else {
          setError(data.message || 'Failed to create blog');
        }
        return;
      }
  
      const data = await res.json();
      alert('Blog created successfully!');
      router.push(`/blogs/${data.blogId}`);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the blog. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='flex justify-center items-center h-screen'>
      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow-md w-full max-w-md'>
        <h2 className='text-2xl mb-4'>Create Blog</h2>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <input
          type='text'
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
          required
          disabled={loading}
        />
        <textarea
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
          required
          disabled={loading}
        />
        <input
          type='text'
          placeholder='Category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
          required
          disabled={loading}
        />
        <input
          type='file'
          onChange={(e) => setImage(e.target.files[0])}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
          accept='image/jpeg, image/png, image/jpg'
          required
          disabled={loading}
        />
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-black text-white p-2 rounded disabled:opacity-50'
        >
          {loading ? 'Creating...' : 'Create Blog'}
        </button>
      </form>
    </div>
  );
}
