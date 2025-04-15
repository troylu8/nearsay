import { Suspense } from "react";
import ReceptionModal from "../components/modal/reception-modal";

export default function SignUp() {
    return (
        <Suspense>
            <ReceptionModal mode="sign-up"/>
        </Suspense>
    )
}
