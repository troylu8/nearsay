import { Suspense } from "react";
import ReceptionModal from "../components/modal/reception-modal";

export default function SignIn() {
    return (
        <Suspense>
            <ReceptionModal mode="sign-in"/>
        </Suspense>
    )
}
