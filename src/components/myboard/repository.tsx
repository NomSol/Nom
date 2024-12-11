import { PostCard } from '@/components/myboard/post-card';
import { Post } from '@/types/post';

export function Repository() {
    const posts: Post[] = [
        {
            id: 1,
            title: "九月总结",
            author: "Suu",
            content: "",
            createdAt: new Date().toISOString(),
        },
        {
            id: 2,
            title: "八月总结",
            author: "Suu",
            content: "",
            createdAt: new Date().toISOString(),
        },
        {
            id: 3,
            title: "ANU入住第四天火警来临",
            author: "Suu",
            content: "",
            createdAt: new Date().toISOString(),
        }
    ];

    return (
        <div className="w-72 border-l p-4">
            <h3 className="font-bold mb-4">我的收藏</h3>
            {posts.map((post, index) => (
                <PostCard key={index} post={post} />
            ))}
        </div>
    );
}