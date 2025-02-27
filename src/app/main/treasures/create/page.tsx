"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TreasureForm } from "@/components/treasures/treasure_form";
import {
  useTreasures,
  CreateTreasureInput,
  Treasure,
} from "@/hooks/use-treasure";
import { useToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateTreasurePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createTreasure } = useTreasures();
  const queryClient = useQueryClient();

  // Get latitude and longitude from URL parameters
  const searchParams = useSearchParams();
  const latParam = searchParams ? searchParams.get("lat") : null;
  const lngParam = searchParams ? searchParams.get("lng") : null;

  // Parse latitude and longitude, default to 0 if not provided
  const latitude = latParam ? parseFloat(latParam) : 0;
  const longitude = lngParam ? parseFloat(lngParam) : 0;

  // Initial data to pass to TreasureForm, including latitude and longitude
  const initialData: Treasure = {
    id: "",
    name: "",
    description: "",
    points: 10,
    hint: "",
    latitude: latitude,
    longitude: longitude,
    image_url: "",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    likes_count: 0,
    verification_code: ""
  };

  interface CreateTreasureResponse {
    insert_treasures_one: {
      id: string;
      name: string;
      verification_code: string;
    };
  }

  // Handle the treasure creation form submission
  const handleSubmit = async (data: CreateTreasureInput) => {
    try {
      // Show a toast indicating that treasure creation is in progress
      toast({
        title: "Notice",
        description: "Treasure is being created...",
      });
  
      // Add type assertion for the result of the treasure creation
      const result = await createTreasure.mutateAsync({
        ...data,
        status: "ACTIVE",
      }) as CreateTreasureResponse;
  
      // If creation is successful, show the verification code
      if (result.insert_treasures_one?.verification_code) {
        toast({
          title: "Creation Successful",
          description: `Please save the treasure verification code: ${result.insert_treasures_one.verification_code}`,
          duration: 5000,
        });
      }
  
      // Invalidate the cache to update treasure data
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
  
      // Delay returning to the previous page to give the user time to note down the verification code
      setTimeout(() => {
        router.back();
      }, 5000);
    } catch (error) {
      console.error("Error creating treasure:", error);
      // Show an error toast if creation fails
      toast({
        title: "Error",
        description: "Failed to create treasure",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Treasure</h1>
      <TreasureForm
        initialData={initialData} // Pass the initial data to the form
        onSubmit={handleSubmit}
        onCancel={() => router.back()} // Go back to the previous page on cancel
        isLoading={createTreasure.isPending} // Show loading state while the treasure is being created
      />
    </div>
  );
}
