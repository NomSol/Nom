import { Profile } from '@/types/profile';

export const DEFAULT_PROFILE: Profile = {
    id: '',
    nickname: 'Unknown User',
    redBookId: '0000000000',
    ipLocation: 'Unknown',
    description: 'This person is lazy and has not written anything',
    avatarUrl: '/default-avatar.png',
    stats: {
        following: 0,
        followers: 0,
        likes: 0
    }
};