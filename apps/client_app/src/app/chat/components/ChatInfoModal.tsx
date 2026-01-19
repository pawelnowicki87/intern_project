import { useState, useEffect } from 'react';
import { X, Trash2, Edit2, Plus } from 'lucide-react';
import { coreApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Participant {
  id: number;
  userId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface ChatInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: number;
  chatType: 'direct' | 'group';
  chatName: string;
  onLeave?: () => void;
  onNameUpdated?: (name: string) => void;
}

export default function ChatInfoModal({
  isOpen,
  onClose,
  chatId,
  chatType,
  chatName,
  onLeave,
  onNameUpdated,
}: ChatInfoModalProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen || !chatId) return;

    const fetchParticipants = async () => {
      try {
        const res = await coreApi.get(`/chats/${chatId}`);
        setParticipants(res.data?.participants ?? []);
        setNewName(chatName);
      } catch (err) {
        console.error('Failed to fetch chat info', err);
      }
    };

    fetchParticipants();
  }, [isOpen, chatId, chatName]);

  useEffect(() => {
    if (!isAddingMembers || chatType !== 'group') return;

    const fetchAvailableUsers = async () => {
      try {
        const res = await coreApi.get('/users');
        const allUsers = res.data ?? [];
        const participantIds = participants.map((p) => p.userId);
        const available = allUsers.filter(
          (u: any) => !participantIds.includes(u.id) && u.id !== user?.id,
        );
        setAvailableUsers(available);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    fetchAvailableUsers();
  }, [isAddingMembers, participants, chatType, user?.id]);

  const handleRemoveMember = async (userId: number) => {
    try {
      await coreApi.delete(`/chat-participants/${chatId}/${userId}`);
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    
    try {
      await coreApi.patch(`/chats/${chatId}`, { name: newName.trim() });
      setIsEditing(false);
      if (onNameUpdated) onNameUpdated(newName.trim());
    } catch (err) {
      console.error('Failed to update chat name', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.id) return;
    
    try {
      await coreApi.delete(`/chat-participants/${chatId}/${user.id}`);
      if (onLeave) onLeave();
      onClose();
    } catch (err) {
      console.error('Failed to leave group', err);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      await coreApi.post('/chat-participants', { chatId, userId });
      const res = await coreApi.get(`/chats/${chatId}`);
      setParticipants(res.data?.participants ?? []);
      setIsAddingMembers(false);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to add member', err);
    }
  };

  const filteredUsers = availableUsers.filter((u) => {
    const displayName =
      u.username || [u.firstName, u.lastName].filter(Boolean).join(' ');
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold">Chat Info</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Group name (editable for groups) */}
          {chatType === 'group' && (
            <div className="p-4 border-b border-gray-200">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  <button
                    onClick={handleUpdateName}
                    className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewName(chatName);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{chatName}</h3>
                    <p className="text-sm text-gray-500">
                      {participants.length} member{participants.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Members ({participants.length})
              </h4>
              {chatType === 'group' && (
                <button
                  onClick={() => setIsAddingMembers(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Member
                </button>
              )}
            </div>
            <div className="space-y-2">
              {participants.map((participant) => {
                const displayName =
                  participant.username ||
                  [participant.firstName, participant.lastName]
                    .filter(Boolean)
                    .join(' ') ||
                  'User';
                const isCurrentUser = user?.id === participant.userId;

                return (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
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
                      <div>
                        <div className="font-semibold text-sm">
                          {displayName}
                          {isCurrentUser && (
                            <span className="text-xs text-gray-500 ml-2">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {chatType === 'group' && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(participant.userId)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer - Leave group button */}
        {chatType === 'group' && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLeaveGroup}
              className="w-full py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Leave Group
            </button>
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      {isAddingMembers && chatType === 'group' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-base font-semibold">Add Members</h2>
              <button
                onClick={() => {
                  setIsAddingMembers(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No users available to add
                </div>
              ) : (
                filteredUsers.map((targetUser) => {
                  const displayName =
                    targetUser.username ||
                    [targetUser.firstName, targetUser.lastName]
                      .filter(Boolean)
                      .join(' ') ||
                    'User';

                  return (
                    <div
                      key={targetUser.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
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
                        <div>
                          <div className="font-semibold text-sm">{displayName}</div>
                          {targetUser.firstName && targetUser.lastName && (
                            <div className="text-xs text-gray-500">
                              {targetUser.firstName} {targetUser.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(targetUser.id)}
                        className="px-4 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
