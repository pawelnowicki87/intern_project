import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { coreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (chatId: number) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onCreated }: CreateGroupModalProps) {
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedUsers(new Set());
      setSearchQuery('');
      setGroupName('');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await coreApi.get('/users');
        const allUsers = (res.data ?? []).filter((u: User) => u.id !== user?.id);
        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    fetchUsers();
  }, [isOpen, user?.id]);

  const filteredUsers = users.filter((u) => {
    const displayName = u.username || [u.firstName, u.lastName].filter(Boolean).join(' ');
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (selectedUsers.size >= 2) {
      setStep('name');
    }
  };

  const handleCreate = async () => {
    if (!user?.id || selectedUsers.size < 2 || !groupName.trim()) return;

    setLoading(true);
    try {
      const participantIds = [user.id, ...Array.from(selectedUsers)];
      const res = await coreApi.post('/chats', {
        creatorId: user.id,
        participantIds,
        name: groupName.trim(),
      });

      const chatId = res.data?.id;
      
      // Ensure participants
      await Promise.all(
        participantIds.map((pid) =>
          coreApi.post('/chat-participants', { chatId, userId: pid }).catch(() => {})
        )
      );

      if (onCreated && chatId) {
        onCreated(chatId);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create group', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold">
            {step === 'select' ? 'New Group' : 'Name Group'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {step === 'select' ? (
          <>
            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Selected count */}
            {selectedUsers.size > 0 && (
              <div className="px-4 py-2 bg-blue-50 text-sm text-blue-700">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </div>
            )}

            {/* User list */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.map((targetUser) => {
                const isSelected = selectedUsers.has(targetUser.id);
                const displayName =
                  targetUser.username ||
                  [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') ||
                  'User';

                return (
                  <div
                    key={targetUser.id}
                    onClick={() => toggleUser(targetUser.id)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden border border-gray-200">
                        {targetUser.avatarUrl ? (
                          <img
                            src={targetUser.avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {displayName[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{displayName}</div>
                        {targetUser.firstName && targetUser.lastName && (
                          <div className="text-xs text-gray-500 truncate">
                            {targetUser.firstName} {targetUser.lastName}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleNext}
                disabled={selectedUsers.size < 2}
                className="w-full py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Group name input */}
            <div className="flex-1 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-2">
                {selectedUsers.size} member{selectedUsers.size > 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim() || loading}
                className="flex-1 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
