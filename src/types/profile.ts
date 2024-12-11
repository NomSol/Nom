export interface Profile {
    id: string;
    nickname: string;
    redBookId: string;
    ipLocation: string;
    description: string;
    personalUrl?: string;
    avatarUrl: string;
    stats: {
        following: number;
        followers: number;
        likes: number;
    };
}