'use client';

import { Mic, Send, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';

interface AIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIDialog({ open, onOpenChange }: AIDialogProps) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 模拟API调用
    const mockResponse = getMockResponse(input);
    setResponse(mockResponse);
    setInput('');
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // 这里添加实际的语音识别逻辑
      // 模拟3秒后获得语音输入
      setTimeout(() => {
        setInput('How do I get to the nearest park?');
        setIsRecording(false);
      }, 3000);
    } catch (error) {
      console.error('Error recording:', error);
      setIsRecording(false);
    }
  };

  const playResponse = () => {
    if ('speechSynthesis' in window && response) {
      const utterance = new SpeechSynthesisUtterance(response);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto p-4">
            {response && (
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                {response}
              </div>
            )}
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={startRecording}
                disabled={isRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSend}
              >
                <Send className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={playResponse}
                disabled={!response}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getMockResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('weather')) {
    return "Currently it's 72°F (22°C) and sunny with a light breeze. Perfect weather for outdoor activities!";
  }
  
  if (lowerInput.includes('direction') || lowerInput.includes('get to')) {
    return "To reach your destination, head north on Main Street for 2 blocks, then turn right onto Park Avenue. Your destination will be on the left after about 5 minutes of walking.";
  }
  
  return "I'm here to help with accessibility features, navigation, and general information. How can I assist you today?";
} 