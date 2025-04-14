
type Props = {
    placeholder: string;
    bind: [string, (nextText: string) => any];
    maxChars?: number;
};
export default function LimitedTextArea({
    placeholder,
    bind,
    maxChars,
}: Props) {
    const [text, setText] = bind;
    
    const showCharLimit = (maxChars != undefined) && (text.length > maxChars - 10);
    const limitExceeded = (maxChars != undefined) && (text.length > maxChars);

    return (
        <div className="relative grow max-h-full">
            
            <textarea
                placeholder={placeholder}
                onInput={e => setText(e.currentTarget.value)}
                className={`
                        p-3 rounded-md w-full h-full
                        resize-none min-h-[50vh]
                        ${showCharLimit && "pb-15"}
                `}
                value={text}
            />
            {   showCharLimit && 
                <p className={`
                    absolute right-3 bottom-3 
                    bg-background ${limitExceeded && "text-failure"} rounded-md px-1
                    text-sm
                `}>
                    {text.length}/{maxChars}
                </p>
            }
        </div>
    );
}
