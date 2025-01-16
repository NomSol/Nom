import { TreasureCard } from './treasure_card';
import {Treasure} from "@/types/treasure";


interface TreasureListProps {
  treasures: Treasure[];
  onEdit?: (treasure: Treasure) => void;
  onDelete?: (id: string) => void;
}

export function TreasureList({ treasures, onEdit, onDelete }: TreasureListProps) {
  if (treasures.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No treasures found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {treasures.map((treasure) => (
        <TreasureCard
          key={treasure.id}
          treasure={treasure}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}