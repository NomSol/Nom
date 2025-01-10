import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import Image from 'next/image';

export interface Treasure {
  id: string;
  name: string;
  description: string;
  points: number;
  hint: string;
  latitude: number;
  longitude: number;
  status: string;
  image_url?: string;
  created_at: string;
}

interface TreasureCardProps {
  treasure: Treasure;
  onEdit?: (treasure: Treasure) => void;
  onDelete?: (id: string) => void;
}

export function TreasureCard({ treasure, onEdit, onDelete }: TreasureCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* 添加图片部分 */}
      {treasure.image_url && (
        <div className="relative w-full h-48">
          <Image
            src={treasure.image_url}
            alt={treasure.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{treasure.name}</CardTitle>
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(treasure)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(treasure.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{treasure.description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Points: {treasure.points}</div>
          <div>Status: {treasure.status}</div>
          <div>Lat: {treasure.latitude.toFixed(6)}</div>
          <div>Long: {treasure.longitude.toFixed(6)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
