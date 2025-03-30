"use client"

import Modal from "../components/modal/modal";
import { Settings, useSettings } from "../contexts/present-provider";


export default function SettingsPage() {

    return (
        <Modal title="settings">
            <SettingToggle setting="present" label="show your location" />
            <SettingToggle setting="stayPresentAfterSignOut" label="stay visible as guest after signing out" />
        </Modal>
    );
}


type Props = {
    setting: keyof Settings,
    label: string
}
function SettingToggle({ setting, label }: Props) {
    const [settings, setSettings] = useSettings();

    function handleToggle() {
        setSettings( prev => ({...prev, [setting]: !settings[setting]}) );
    }

    return (
        <div>
            <input
                type="checkbox"  
                name={setting} id={setting}
                checked={settings[setting]}
                onChange={handleToggle}
            />
            <label htmlFor={setting}> {label} </label>
        </div>
    );
}