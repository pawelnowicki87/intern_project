'use client';

import { useAuth } from '@/client_app/context/AuthContext';
import { useState, useEffect } from 'react';
import { coreApi } from '@/client_app/lib/api';
import EditProfileHeader from './EditProfileHeader';
import ProfilePhotoSection from './ProfilePhotoSection';
import SubmitButtonSection from './SubmitButtonSection';
import Input from '../../ui/Input';
import { Loader } from '../../ui/Loader';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    isPrivate: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Załaduj dane użytkownika
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any).bio || '',
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user) return;
      
      // Call API to update profile
      await coreApi.patch(`/users/${user.id}`, formData);
      
      // Update context with new data
      if (user) {
        setUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone || null,
          avatarUrl: user.avatarUrl ?? null,
          bio: formData.bio || null,
          isPrivate: formData.isPrivate,
        });
      }

      // Redirect back to profile
      router.push('/profile');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-5">
      <EditProfileHeader onCancel={handleCancel} />

      <main className="lg:max-w-3xl lg:mx-auto pb-8">
        <ProfilePhotoSection username={formData.username} />

        {error && (
          <div className="px-4 md:px-8 py-3 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />

        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />

        <Input
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
        />

        <Input
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone (optional)"
          type="tel"
        />

        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 py-4 px-4 md:px-8 border-b border-gray-200">
          <label className="font-semibold text-sm md:text-base md:w-32 flex-shrink-0 md:text-right">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded p-2 text-sm outline-none"
            placeholder="Krótki opis profilu"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-4 px-4 md:px-8 border-b border-gray-200">
          <label className="font-semibold text-sm md:text-base md:w-32 flex-shrink-0 md:text-right">
            Private Account
          </label>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Make your account private
            </span>
          </div>
        </div>

        <SubmitButtonSection 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          loading={loading}
        />

      </main>
    </div>
  );
}
