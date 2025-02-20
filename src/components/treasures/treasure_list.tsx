import { Treasure } from '@/types/treasure';
import { TreasureCard } from './treasure_card';

interface TreasureListProps {
  treasures: Treasure[];
  onDelete?: (id: string) => void;
  onEdit?: (treasure: Treasure) => void;
  showActions?: boolean;
}

export function TreasureList({
  treasures,
  onDelete,
  onEdit,
  showActions = true
}: TreasureListProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {treasures.map((treasure) => (
        <TreasureCard
          key={treasure.id}
          treasure={treasure}
          onDelete={showActions ? onDelete : undefined}
          onEdit={showActions ? onEdit : undefined}
        />
      ))}
    </div>
  );
}