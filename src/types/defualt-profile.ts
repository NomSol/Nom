import { Profile } from '@/types/profile';

export const DEFAULT_PROFILE: Profile = {
    id: '',
    nickname: '未知用户',
    redBookId: '0000000000',
    ipLocation: '未知',
    description: '这个人很懒，什么都没有写',
    avatarUrl: '/default-avatar.png',
    stats: {
        following: 0,
        followers: 0,
        likes: 0
    }
};