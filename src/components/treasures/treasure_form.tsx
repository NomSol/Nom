// components/treasures/treasure_form.tsx
import { useState, useEffect } from 'react'; // Import React hooks for state and side effects
import { Input } from '@/components/ui/input'; // Import Input component from UI library
import { Button } from '@/components/ui/button'; // Import Button component from UI library
import { Textarea } from '@/components/ui/textarea'; // Import Textarea component from UI library
import { CreateTreasureInput, Treasure } from '@/types/treasure'; // Import treasure-related type definitions
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components from UI library
import { Upload } from 'lucide-react'; // Import Upload icon from Lucide library
import Image from 'next/image'; // Import Next.js Image component for optimized image rendering
import { uploadTreasureImage } from '@/lib/supabase'; // Import function to upload images to Supabase
import { toast } from '@/hooks/use-toast'; // Import toast notification hook

// Retrieve Mapbox access token from environment variables for API calls
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Define an async function to calculate the difficulty score based on geographic location
async function calculateDifficultyScore(latitude: number, longitude: number): Promise<number> {
  try {
    // 1. Fetch terrain data (elevation and contour lines)
    const terrainResponse = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${longitude},${latitude}.json?layers=contour&access_token=${MAPBOX_ACCESS_TOKEN}`
    ); // Send request to get terrain data response
    if (!terrainResponse.ok) throw new Error('Terrain API failed'); // Check if response is successful, else throw error
    const terrainData = await terrainResponse.json(); // Parse response into JSON format

    // 2. Fetch nearby Points of Interest (POI) data (malls and supermarkets)
    const poiResponse = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/mall,supermarket.json?proximity=${longitude},${latitude}&limit=10&access_token=${MAPBOX_ACCESS_TOKEN}`
    ); // Send request to get nearby malls and supermarkets
    if (!poiResponse.ok) throw new Error('POI API failed'); // Check if response is successful, else throw error
    const poiData = await poiResponse.json(); // Parse response into JSON format

    // 3. Fetch vector tile data (to identify water bodies and parks)
    const tileResponse = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
    ); // Send request to get street tile data
    if (!tileResponse.ok) throw new Error('Tile API failed'); // Check if response is successful, else throw error
    const tileData = await tileResponse.json(); // Parse response into JSON format

    // Initialize base score to 10 points
    let score = 10;

    // Calculate elevation score: Add 5 points per 500 meters, capped at 20
    const elevation = terrainData?.features?.[0]?.properties?.ele || 0; // Safely get elevation, default to 0 if unavailable
    score += Math.min(Math.floor(elevation / 500) * 5, 20); // Calculate and cap elevation score

    // Calculate terrain complexity: Add 5 points per 3 contour lines, capped at 20
    const featureCount = terrainData?.features?.length || 0; // Safely get number of contour lines, default to 0
    score += Math.min(Math.floor(featureCount / 3) * 5, 20); // Calculate and cap terrain complexity score

    // Calculate building density: Subtract 10 if more than 5 POIs, otherwise add 10
    const poiCount = poiData?.features?.length || 0; // Safely get number of POIs, default to 0
    score += poiCount > 5 ? -10 : 10; // Adjust score based on building density

    // Check for water or parks: Add 15 points if either is present
    const isWater = tileData?.features?.some((f: { properties: { class: string; }; }) => f.properties.class === 'water') || false; // Check if location is near water
    const isPark = tileData?.features?.some((f: { properties: { class: string; }; }) => f.properties.class === 'park') || false; // Check if location is a park
    score += (isWater || isPark) ? 15 : 0; // Add points if water or park is detected

    // Ensure score stays between 10 and 100
    return Math.min(Math.max(score, 10), 100); // Return final clamped score
  } catch (error) {
    console.error('Failed to calculate difficulty:', error); // Log any errors encountered
    return 10; // Return default score of 10 if an error occurs
  }
}

// Define interface for the component props
interface TreasureFormProps {
  initialData?: Partial<Treasure>; // Optional initial treasure data for editing
  onSubmit: (data: CreateTreasureInput) => void; // Callback function for form submission
  onCancel: () => void; // Callback function for canceling the form
  isLoading?: boolean; // Optional loading state to indicate submission in progress
}

// Define the TreasureForm component for creating or editing treasures
export function TreasureForm({ initialData, onSubmit, onCancel, isLoading }: TreasureFormProps) {
  // Initialize form data state with initialData or default values
  const [formData, setFormData] = useState<CreateTreasureInput>({
    name: initialData?.name || '', // Treasure name
    description: initialData?.description || '', // Treasure description
    points: initialData?.points || 10, // Difficulty points, default to 10
    hint: initialData?.hint || '', // Treasure hint
    latitude: initialData?.latitude || 0, // Latitude, default to 0
    longitude: initialData?.longitude || 0, // Longitude, default to 0
    image_url: initialData?.image_url || '', // Image URL
  });

  // Initialize image preview state with initialData image or null
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  // Initialize uploading state to track image upload progress
  const [uploading, setUploading] = useState(false);

  // Effect hook: Automatically update points when latitude or longitude changes
  useEffect(() => {
    const updatePoints = async () => {
      // Check if latitude and longitude are valid (not 0)
      if (formData.latitude !== 0 && formData.longitude !== 0) {
        // Calculate new difficulty score based on coordinates
        const points = await calculateDifficultyScore(formData.latitude, formData.longitude);
        // Update form data with the new points
        setFormData(prev => ({ ...prev, points }));
      }
    };
    updatePoints(); // Trigger the update
  }, [formData.latitude, formData.longitude]); // Depend on latitude and longitude changes

  // Async function to handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the selected file from the input
    if (!file) return; // Return if no file is selected

    try {
      setUploading(true); // Set uploading state to true
      const reader = new FileReader(); // Create a file reader
      reader.onload = (e) => setImagePreview(e.target?.result as string); // Set preview image when loaded
      reader.readAsDataURL(file); // Read file as a Data URL

      // Upload image to Supabase and get the resulting URL
      const supabaseUrl = await uploadTreasureImage(file);
      // Update form data with the uploaded image URL
      setFormData(prev => ({ ...prev, image_url: supabaseUrl }));
    } catch (error) {
      console.error('Upload failed:', error); // Log any errors
      toast({ // Show error notification
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false); // Reset uploading state regardless of success or failure
    }
  };

  // Async function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      onSubmit(formData); // Call the provided submit callback with form data
    } catch (error) {
      console.error('Submit failed:', error); // Log any errors
      toast({ // Show error notification
        title: 'Error',
        description: 'Failed to create treasure',
        variant: 'destructive',
      });
    }
  };

  // Combined processing state: true if either submission or upload is in progress
  const isProcessing = isLoading || uploading;

  // Render the form UI
  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Treasure' : 'Create New Treasure'}</CardTitle> {/* Display title based on edit or create mode */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4"> {/* Form container, triggers handleSubmit on submit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Image</label> {/* Label for image upload */}
            <Card className="p-4">
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? ( // Conditionally render preview or upload prompt
                  <div className="relative w-full h-48">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-lg" /> {/* Display image preview */}
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" /> {/* Display upload icon */}
                  </div>
                )}
                <Button type="button" variant="outline" className="w-full" disabled={isProcessing}>
                  <label className="w-full cursor-pointer">
                    {isProcessing ? 'Processing...' : 'Choose Image'} {/* Show processing text or prompt */}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload} // Trigger upload on file selection
                      disabled={isProcessing} // Disable input during processing
                    />
                  </label>
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label> {/* Label for name field */}
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} // Update name on change
              placeholder="Enter treasure name"
              required // Field is required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label> {/* Label for description field */}
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} // Update description on change
              placeholder="Enter treasure description"
              required // Field is required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Points (Auto-calculated)</label> {/* Label for points field */}
            <Input type="number" value={formData.points} readOnly className="bg-gray-100" /> {/* Display points as read-only */}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hint</label> {/* Label for hint field */}
            <Input
              value={formData.hint}
              onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))} // Update hint on change
              placeholder="Enter treasure hint"
              required // Field is required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label> {/* Label for latitude field */}
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))} // Update latitude on change
                required // Field is required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label> {/* Label for longitude field */}
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))} // Update longitude on change
                required // Field is required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel {/* Cancel button */}
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : initialData ? 'Update' : 'Create'} {/* Submit button, disabled during processing */}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}