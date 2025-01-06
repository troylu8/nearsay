type Props = Readonly<{
    src: string;
    width: number;
    height: number;
    color: string;
}>;
export default function ColoredSvg({ src, width, height, color }: Props) {
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
        ></div>
    );
}
