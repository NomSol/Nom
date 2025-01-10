// app/(main)/profile/page.tsx
'use client';
import { useUserProfile } from '@/hooks/use-user';
import MatchHistory from '@/components/match/match-history';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            请先登录后再访问此页面
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">基本信息</TabsTrigger>
          <TabsTrigger value="matches" className="flex-1">对战历史</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.nickname} />
                  <AvatarFallback>{profile.nickname?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.nickname}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                  {profile.description && (
                    <p className="text-gray-600">{profile.description}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    加入时间：{new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <MatchHistory userId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}