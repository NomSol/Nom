// components/treasures/treasure_form.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CreateTreasureInput, Treasure } from '@/types/treasure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadTreasureImage } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface TreasureFormProps {
  initialData?: Partial<Treasure>;
  onSubmit: (data: CreateTreasureInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TreasureForm({ initialData, onSubmit, onCancel, isLoading }: TreasureFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTreasureInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    points: initialData?.points || 0,
    hint: initialData?.hint || '',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    image_url: initialData?.image_url || '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 上传到 Supabase
      const supabaseUrl = await uploadTreasureImage(file);
      setFormData(prev => ({
        ...prev,
        image_url: supabaseUrl
      }));

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to create treasure',
        variant: 'destructive'
      });
    }
  };

  const isProcessing = isLoading || uploading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Treasure' : 'Create New Treasure'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 图片上传部分 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image</label>
            <Card className="p-4">
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <label className="w-full cursor-pointer">
                    {isProcessing ? 'Processing...' : 'Choose Image'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isProcessing}
                    />
                  </label>
                </Button>
              </div>
            </Card>
          </div>

          {/* 名称字段 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter treasure name"
              required
            />
          </div>

          {/* 描述字段 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter treasure description"
              required
            />
          </div>

          {/* 积分字段 */}
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

          {/* 提示字段 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hint</label>
            <Input
              value={formData.hint}
              onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
              placeholder="Enter treasure hint"
              required
            />
          </div>

          {/* 经纬度字段 */}
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

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}