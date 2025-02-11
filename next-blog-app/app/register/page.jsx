'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state here
  const [error, setError] = useState(''); // Optionally add an error state for better feedback
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Client-side validation
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true); // Set loading to true when starting the request

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      setLoading(false); // Hide loading after request completes

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error("Error during registration:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <form onSubmit={handleSubmit} className='bg-white p-6 rounded shadow-md'>
        <h2 className='text-2xl mb-4'>Register</h2>
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='block w-full p-2 mb-4 border border-gray-300 rounded'
        />
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
        <button
          type='submit'
          className='w-full bg-black text-white p-2 rounded'
          disabled={loading} // Disable the button while loading
        >
          {loading ? 'Registering...' : 'Register'} {/* Show loading text */}
        </button>
      </form>
    </div>
  );
}
