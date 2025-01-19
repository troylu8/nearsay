import PostViewer from "@/app/components/post/post-viewer";
import NotFound from "@/app/not-found";
import { fetchPost, Post } from "@/lib/server";

type Props = {
    params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
    const { id } = await params;

    const resp = await fetchPost(id);
    if (!resp.ok) return <NotFound />;

    const post: Post = await resp.json();

    return <PostViewer id={id} post={post} />;
}
