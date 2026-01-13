'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { useAuth } from '@/client_app/context/AuthContext';
import { coreApi } from '@/client_app/lib/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

    const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMedia(URL.createObjectURL(file));
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await coreApi.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
});

        console.log('UPLOAD RESPONSE:', res.data);

        setSelectedMedia(res.data.url);
        setUploadedFileId(res.data.id);
    } catch (err) {
        console.error('UPLOAD ERROR:', err);
    }
    };

    const handleRemoveMedia = () => {
      setSelectedMedia(null);
      setMediaType(null);
      setUploadedFileId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

  const handleSubmit = async () => {
    if (!caption.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await coreApi.post('/posts', {
        body: caption,
        userId: user?.id,
        fileIds: uploadedFileId ? [uploadedFileId] : [],
        });
      
      // Reset i zamknięcie
      setCaption('');
      setSelectedMedia(null);
      setMediaType(null);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption('');
    setSelectedMedia(null);
    setMediaType(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {/* Modal */}
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-300">
          <button onClick={handleClose} className="p-1">
            <X className="w-6 h-6" />
          </button>
          <h2 className="font-semibold text-base">Create new post</h2>
          <button
            onClick={handleSubmit}
            disabled={!caption.trim() || isSubmitting}
            className="text-blue-500 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User info */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
            <span className="font-semibold text-sm">{user?.username || 'mediamodifier'}</span>
          </div>

          {/* Caption input */}
          <div className="p-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 resize-none outline-none text-sm"
              maxLength={2200}
              autoFocus
            />
            <div className="flex items-center justify-end mt-2">
              <span className="text-xs text-gray-400">
                {caption.length}/2,200
              </span>
            </div>
          </div>

          {/* Media preview */}
          {selectedMedia && (
            <div className="px-4 pb-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                {mediaType === 'image' ? (
                  <img
                    src={selectedMedia}
                    alt="Preview"
                    className="w-full max-h-80 object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia}
                    controls
                    className="w-full max-h-80"
                  />
                )}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Add media buttons */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm font-semibold mb-3 text-gray-700">Add to your post</div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold">Photo</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Video className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold">Video</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}