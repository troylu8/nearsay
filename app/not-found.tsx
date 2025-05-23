import { ERROR_EMOTICON } from "@/lib/emoticon";
import Link from "next/link";

export default function NotFound() {
    return (
        <div
            className="
            fixed left-0 right-0 top-0 bottom-0 bg-background
            flex flex-col justify-center items-center gap-3"
        >
            <h2>[404] page not found</h2>
            <p> {ERROR_EMOTICON} this link leads nowhere</p>
            <Link href="/" scroll={false}>
                <p> back to map </p>
            </Link>
        </div>
    );
}
