// components/ui/treasure_form.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CreateTreasureInput, Treasure } from '@/types/treasure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TreasureFormProps {
  initialData?: Treasure;
  onSubmit: (data: CreateTreasureInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TreasureForm({ initialData, onSubmit, onCancel, isLoading }: TreasureFormProps) {
  const [formData, setFormData] = useState<CreateTreasureInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    points: initialData?.points || 0,
    hint: initialData?.hint || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Treasure' : 'Create New Treasure'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter treasure name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter treasure description"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Points</label>
            <Input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hint</label>
            <Input
              value={formData.hint}
              onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
              placeholder="Enter treasure hint"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}