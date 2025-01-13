import PostViewer from "@/app/components/post/post-viewer";
import NotFound from "@/app/not-found";
import { Post } from "@/lib/data";

type Props = {
    params: Promise<{ id: string }>;
};
export default async function Page({ params }: Props) {
    const { id } = await params;

    const resp = await fetch(
        `https://troy-book.tail2138e6.ts.net:8443/posts/${id}`
    );
    if (!resp.ok) return <NotFound />;

    const post: Post = await resp.json();

    return <PostViewer id={id} post={post} />;
}
