'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.REACT_APP_API_URL;



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('${API_URL}/api/auth/login', {  // Corrected URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.push('/Dashboard');  // Redirect to the homepage (or any other page)
    } else {
      alert(data.message);  // Display the error message
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow-md'>
        <h2 className='text-2xl mb-4'>Login</h2>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
        />
        <button type='submit' className='w-full bg-black text-white p-2 rounded'>
          Login
        </button>
      </form>
    </div>
  );
}
