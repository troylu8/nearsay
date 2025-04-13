type Props = {
    placeholder: string;
    value?: string;
    maxChars?: number;
    onInput?: (value: string) => any;
};
export default function ResizingTextArea({
    placeholder,
    value = "",
    maxChars,
    onInput,
}: Props) {
    
    const showCharLimit = (maxChars != undefined) && (value.length > maxChars - 10);
    const limitExceeded = (maxChars != undefined) && (value.length > maxChars);
    
    function resizeToFitText(textarea: HTMLTextAreaElement) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
        resizeToFitText(e.currentTarget);
        if (onInput) onInput(e.currentTarget.value);
    }

    return (
        <div className="relative grow">
            
            <textarea
                placeholder={placeholder}
                onInput={handleInput}
                className={`
                        p-3 rounded-md w-full h-full
                        resize-none overflow-y-hidden
                        ${showCharLimit && "pb-15"}
                `}
                value={value}
            />
            {   showCharLimit && 
                <p className={`
                    absolute right-3 bottom-3 
                    bg-background ${limitExceeded && "text-failure"} rounded-md px-1
                    text-sm
                `}>
                    {value.length}/{maxChars}
                </p>
            }
        </div>
    );
}
