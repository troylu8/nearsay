import { MouseEvent } from "react";

type Props = Readonly<{
    src: string;
    width: number;
    height: number;
    color: string;
    onClick?: (e: MouseEvent<HTMLDivElement>) => any;
    className?: string;
}>;
export default function ColoredSvg({
    src,
    width,
    height,
    color,
    onClick,
    className,
}: Props) {
    return (
        <div
            style={{
                width,
                height,
                maskSize: "cover",
                WebkitMaskSize: "cover",
                maskImage: `url(${src})`,
                WebkitMaskImage: `url(${src})`,
                backgroundColor: color,
            }}
            onClick={onClick}
            className={className}
        ></div>
    );
}
