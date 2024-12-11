import { PostCard } from '@/components/myboard/post-card';
import { Post } from '@/types/post';

export function Notes() {
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
        <div className="w-full p-4">
            <div className="flex flex-wrap gap-4">
                {posts.map((post, index) => (
                    <PostCard key={index} post={post} />
                ))}
            </div>
        </div>
    );
}