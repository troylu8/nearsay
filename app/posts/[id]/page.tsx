import PostViewer from "@/app/components/post/post-viewer";
import NotFound from "@/app/not-found";
import { getPost, Post } from "@/lib/data";

type Props = {
    params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
    const { id } = await params;

    const resp = await getPost(id);
    if (!resp.ok) return <NotFound />;

    const post: Post = await resp.json();

    return <PostViewer id={id} post={post} />;
}
