// components/treasures/verify-dialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { useTreasures } from "@/hooks/use-treasure";

interface VerifyTreasureDialogProps {
  treasureId: string; // ID of the treasure to verify
  isOpen: boolean; // Whether the dialog is open
  onClose: () => void; // Function to close the dialog
  onSuccess?: () => void; // Optional callback for successful verification
}

interface VerifyTreasureResponse {
  update_treasures: {
    affected_rows: number; // Number of rows affected by the update
    returning: Array<{
      id: string; // Treasure ID
      name: string; // Treasure name
      points: number; // Points awarded for finding the treasure
      verification_code: string; // Verification code for the treasure
      finder_id: string; // ID of the user who found the treasure
    }>;
  };
}

export function VerifyTreasureDialog({ 
  treasureId,
  isOpen, 
  onClose,
  onSuccess
}: VerifyTreasureDialogProps) {
  const [code, setCode] = useState(''); // State for the verification code
  const { verifyTreasure } = useTreasures(); // Hook for verifying treasures
  const { toast } = useToast(); // Hook for displaying toast notifications

  // Handle verification of the treasure
  const handleVerify = async () => {
    try {
      const result = await verifyTreasure.mutateAsync({
        id: treasureId,
        verification_code: code,
        finder_id: '', // Finder ID is not used in this example
      }) as VerifyTreasureResponse; // Type assertion for the response

      // Check if the treasure was successfully verified
      if (result.update_treasures?.affected_rows > 0) {
        const verifiedTreasure = result.update_treasures.returning[0];
        toast({
          title: "Verification Successful!",
          description: `Congratulations! You found the treasure and earned ${verifiedTreasure.points} points.`,
        });
        onSuccess?.(); // Trigger the onSuccess callback if provided
        onClose(); // Close the dialog
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code or the treasure has already been found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Please ensure the verification code is correct.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify Treasure</DialogTitle>
          <DialogDescription>
            Enter the treasure verification code to prove you found this treasure.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter 6-digit verification code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} // Allow only digits and limit to 6 characters
            maxLength={6}
            type="number"
            pattern="\d*"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || verifyTreasure.isPending} // Disable the button if the code is invalid or verification is pending
          >
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}