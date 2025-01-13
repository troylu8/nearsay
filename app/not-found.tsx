import Link from "next/link";

export default function NotFound() {
    return (
        <div
            className="
            fixed left-0 right-0 top-0 bottom-0 bg-white
            flex flex-col justify-center items-center gap-3"
        >
            <h2>[404] page not found</h2>
            <p>this link leads nowhere</p>
            <Link href="/">
                <p> back to map </p>
            </Link>
        </div>
    );
}
