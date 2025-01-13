import { MouseEvent } from "react";

type Props = Readonly<{
    src: string;
    width: number;
    height: number;
    color: string;
    onClick?: (e: MouseEvent<HTMLDivElement>) => any;
}>;
export default function ColoredSvg({
    src,
    width,
    height,
    color,
    onClick,
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
            }}
            className={`bg-[${color}]`}
            onClick={onClick}
        ></div>
    );
}
