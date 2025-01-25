// components/treasures/treasure_list.tsx
import { Treasure } from '@/types/treasure';
import { TreasureCard } from './treasure_card';

interface TreasureListProps {
  treasures: Treasure[];
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TreasureList({ 
  treasures, 
  onDelete, 
  showActions = true 
}: TreasureListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {treasures.map((treasure) => (
        <TreasureCard
          key={treasure.id}
          treasure={treasure}
          onDelete={showActions ? onDelete : undefined}
        />
      ))}
    </div>
  );
}