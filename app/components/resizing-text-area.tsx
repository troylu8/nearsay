type Props = {
    placeholder: string;
    value?: string;
    onInput?: (value: string) => any;
};
export default function ResizingTextArea({
    placeholder,
    value,
    onInput,
}: Props) {
    function resizeToFitText(textarea: HTMLTextAreaElement) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
        resizeToFitText(e.currentTarget);
        if (onInput) onInput(e.currentTarget.value);
    }

    return (
        <textarea
            placeholder={placeholder}
            onInput={handleInput}
            className="
                    m-5 p-3 rounded-md 
                    resize-none overflow-y-hidden
                    focus:outline-hidden focus:outline-solid focus:outline-2 focus:outline-black"
            value={value}
        />
    );
}
