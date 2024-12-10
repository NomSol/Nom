import { Post } from '@/types/post'

interface PostCardProps {
    post: Post
}

export function PostCard({ post }: PostCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            {post.imageUrl && (
                <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                />
            )}
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{post.author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {post.tags && (
                <div className="flex gap-2 mt-3">
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}