import { useRef, useState } from 'react';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';

interface ProfilePhotoSectionProps {
  username: string;
}

export default function ProfilePhotoSection({ username }: ProfilePhotoSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, setUser } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setError(null);
    setUploading(true);
    try {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      const form = new FormData();
      form.append('file', file);

      const uploadRes = await coreApi.post('/files/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url: string = uploadRes.data?.url;
      if (!url) throw new Error('Upload failed: no URL');

      await coreApi.patch(`/users/${user.id}`, { avatarUrl: url });

      setPreviewUrl(url);
      setUser({ ...user, avatarUrl: url });
    } catch (err) {
      console.error('Avatar upload failed', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 border-b border-gray-200">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
        <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile photo"
              className="w-full h-full rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-2xl md:text-3xl font-bold uppercase">
                    {username.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center md:items-start">
          <h3 className="font-semibold text-base">{username}</h3>
          <button 
            onClick={openFilePicker}
            className="text-blue-500 font-semibold text-sm mt-1 hover:text-blue-600 disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Change profile photo'}
          </button>
          {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
        </div>
      </div>
    </div>
  );
}
