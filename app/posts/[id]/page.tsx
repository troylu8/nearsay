import PostViewer from "@/app/components/post/post-viewer";
import NotFound from "@/app/not-found";
import { Post } from "@/lib/types";
import { fetchPost } from "@/lib/data";

type Props = {
    params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
    const { id } = await params;

    const resp = await fetchPost(id);
    if (!resp.ok) return <NotFound />;

    const { pos, vote, post } = await resp.json();

    return <PostViewer id={id} pos={pos} initialVote={vote} post={post} />;
}
