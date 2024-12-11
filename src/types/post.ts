export interface Post {
    id: string | number;
    title: string
    content: string
    author: string
    createdAt: string
    // 可选字段
    imageUrl?: string
    tags?: string[]
}