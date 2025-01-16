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
  treasureId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface VerifyTreasureResponse {
    update_treasures: {
      affected_rows: number;
      returning: Array<{
        id: string;
        name: string;
        points: number;
        verification_code: string;
        finder_id: string;
      }>;
    };
  }
  

export function VerifyTreasureDialog({ 
  treasureId,
  isOpen, 
  onClose,
  onSuccess
}: VerifyTreasureDialogProps) {
  const [code, setCode] = useState('');
  const { verifyTreasure } = useTreasures();
  const { toast } = useToast();

  const handleVerify = async () => {
    try {
      const result = await verifyTreasure.mutateAsync({
          id: treasureId,
          verification_code: code,
          finder_id: ''
      }) as VerifyTreasureResponse;  // 添加类型断言

      if (result.update_treasures?.affected_rows > 0) {
        const verifiedTreasure = result.update_treasures.returning[0];
        toast({
          title: "验证成功！",
          description: `恭喜你找到了宝藏！获得 ${verifiedTreasure.points} 积分`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: "验证失败",
          description: "验证码错误或宝藏已被找到",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "验证失败",
        description: "请确认验证码是否正确",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>验证宝藏</DialogTitle>
          <DialogDescription>
            请输入宝藏验证码来证明你找到了这个宝藏
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="请输入6位数字验证码"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
            取消
          </Button>
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || verifyTreasure.isPending}
          >
            验证
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}