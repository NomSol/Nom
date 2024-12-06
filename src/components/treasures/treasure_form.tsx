// components/ui/treasure_form.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CreateTreasureInput, Treasure } from '@/types/treasure';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { uploadTreasureImage } from '@/lib/supabase'; // 需要创建这个工具函数

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
    image_url: initialData?.image_url || ''
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
      const imageUrl = await uploadTreasureImage(file);
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

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
                  disabled={uploading}
                >
                  <label className="w-full cursor-pointer">
                    {uploading ? 'Uploading...' : 'Choose Image'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </Button>
              </div>
            </Card>
          </div>

          {/* 原有表单字段 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter treasure name"
              required
            />
          </div>

          {/* ... 其他原有表单字段保持不变 ... */}

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}