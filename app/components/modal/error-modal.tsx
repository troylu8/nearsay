import { ERROR_EMOTICON } from "@/lib/emoticon"
import Modal from "./modal"


type Props = {
    title: string,
    msg: string,
    err: Error
}
export default function ErrorModal({title, msg, err}: Props) {
    return (
        <Modal title={title}>
            <p className="text-failure">
                {ERROR_EMOTICON} {msg}  
            </p>
            
            <p className="text-failure mt-5">
                {JSON.stringify(err)}
            </p>
        </Modal>
    )
}