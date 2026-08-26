import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  User, 
  Building2, 
  Search, 
  CheckCheck,
  Sparkles,
  Phone
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { StorageService } from '../../storage';

interface AdminChatProps {
  users: UserProfile[];
  messages: ChatMessage[];
  onDataUpdated: () => void;
}

export const AdminChat: React.FC<AdminChatProps> = ({
  users,
  messages,
  onDataUpdated
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [searchUser, setSearchUser] = useState('');

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
    (u.companyName && u.companyName.toLowerCase().includes(searchUser.toLowerCase()))
  );

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const userMessages = messages.filter(
    (m) =>
      (m.senderId === selectedUserId && m.recipientId === 'admin') ||
      (m.senderId === 'admin' && m.recipientId === selectedUserId)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'admin',
      senderName: 'Admin PT. CAFTHEN INDO PROJECT',
      recipientId: selectedUserId,
      message: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    StorageService.saveMessage(newMsg);
    setInputText('');
    onDataUpdated();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[560px]">
      {/* Left Column: User Contact List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-900" />
              Daftar Konsumen
            </h4>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {users.length} Akun
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau PT..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-900' : 'hover:bg-slate-100/70'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.fullName.charAt(0)}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{user.userType}</span>
                  </div>
                  {user.companyName && (
                    <span className="text-[11px] text-blue-700 truncate block font-medium">
                      {user.companyName}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono truncate block">
                    {user.email}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat Room Window */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {selectedUser ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedUser.fullName}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{selectedUser.companyName || selectedUser.userType}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold font-mono">{selectedUser.whatsapp}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-500 font-medium">Online</span>
              </div>
            </div>

            {/* Messages Flow Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
              {userMessages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Belum ada pesan obrolan dengan pembeli ini. Kirim pesan konfirmasi pengadaan atau verifikasi kontrak.
                </div>
              ) : (
                userMessages.map((msg) => {
                  const isAdmin = msg.senderId === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                          isAdmin
                            ? 'bg-blue-900 text-white rounded-br-none shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <span className={`text-[10px] font-bold block ${isAdmin ? 'text-amber-300' : 'text-blue-900'}`}>
                          {msg.senderName}
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik pesan resmi admin kepada pembeli..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 text-slate-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Send className="w-4 h-4" /> Kirim
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
            Pilih pengguna dari daftar kontak di sebelah kiri untuk memulai obrolan.
          </div>
        )}
      </div>
    </div>
  );
};
