
import { useState } from 'react';
import { Plus, MessageSquare, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebar } from '@/components/ui/sidebar';

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface SidebarProps {
  currentChatId: string;
  onChatSelect: (chatId: string) => void;
}

export const Sidebar = ({ currentChatId, onChatSelect }: SidebarProps) => {
  const { open, setOpen } = useSidebar();
  const [chats, setChats] = useState<Chat[]>([
    { id: '1', title: 'Welcome Chat', timestamp: new Date() }
  ]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date()
    };
    setChats([newChat, ...chats]);
    onChatSelect(newChat.id);
  };

  return (
    <div className={`${!open ? 'w-16' : 'w-80'} transition-all duration-300 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 backdrop-blur-sm flex flex-col shadow-2xl`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            {!open ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
          {open && (
            <Button
              onClick={createNewChat}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        {open && (
          <div className="space-y-2 py-4">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  currentChatId === chat.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border border-emerald-400/30 shadow-lg'
                    : 'hover:bg-slate-700/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {chat.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Settings */}
      <div className="p-4 border-t border-slate-700/50">
        <Button
          variant="ghost"
          className={`${!open ? 'w-8 h-8 p-0' : 'w-full justify-start'} text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200`}
        >
          <Settings className="h-4 w-4" />
          {open && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </div>
  );
};
