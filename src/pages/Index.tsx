import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  const [currentChatId, setCurrentChatId] = useState<string>('');

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="flex-1 flex flex-col">
        <ChatInterface chatId={currentChatId} />
      </main>
    </div>
  );
};

export default Index;
