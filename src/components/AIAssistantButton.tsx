'use client';

import { useState } from 'react';
import { AIDialog } from './AIDialog';

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-white shadow hover:bg-gray-100"
      >
        <span className="text-gray-700">AI</span>
      </button>
      <AIDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
} 