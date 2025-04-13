import { MouseEvent, ReactNode } from "react";

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
                cursor: onClick? "pointer" : "inherit"
            }}
            onClick={onClick}
            className={className}
        ></div>
    );
}

type UIButtonProps = {
    src: string,
    iconSize: number,
    onClick: () => any,
    children?: ReactNode,
    className?: string
}
export function UIButton({ src, iconSize, onClick, className, children }: UIButtonProps) {
    return (
        <div 
            className={` flex items-center bg-primary gap-2 p-2 rounded-md cursor-pointer ${className}`}
            onClick={onClick}
        >
            <ColoredSvg 
                src={src} 
                width={iconSize} 
                height={iconSize} 
                color="var(--color-background)"
            />
            
            {children && <label className="cursor-pointer text-background" style={{lineHeight: iconSize + "px"}}> { children } </label> }
        </div>
    )
}