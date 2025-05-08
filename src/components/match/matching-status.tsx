// components/match/matching-status.tsx

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface MatchingStatusProps {
  matchType: string;
  onCancel: () => void;
}

export function MatchingStatus({ matchType, onCancel }: MatchingStatusProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">PVP Mode</h2>
        
        {/* Game Mode Display */}
        <div className="bg-gray-100 rounded-full p-2 flex justify-center space-x-4">
          <span className="font-medium">{matchType} Match</span>
        </div>

        {/* Matching Status */}
        <div className="relative flex items-center justify-center py-8">
          <div className="absolute">
            <Timer className="animate-spin h-12 w-12 text-blue-500" />
          </div>
          <div className="font-mono text-2xl mt-16">
            {formatTime(elapsedTime)}
          </div>
        </div>

        <div className="text-gray-600">
          Estimated Waiting Time: 30 Sec
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl 
                     transition-colors duration-200 mt-4"
        >
          Cancel Match
        </button>
      </div>
    </div>
  );
}