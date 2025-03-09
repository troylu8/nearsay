"use client";

import { useContext, createContext, useState, Dispatch, SetStateAction, useEffect } from "react";

export type Settings = {
    // avatar is visible to others
    present: boolean,           

    // sign in as guest automatically after signing out, so avatar remains visible to others  
    stayPresentAfterSignOut: boolean
}

const SettingsContext = createContext<[Settings, Dispatch<SetStateAction<Settings>>] | null>(null);

export function useSettings() {
    return useContext(SettingsContext)!;
}

type Props = {
    children: React.ReactNode;
};
export default function SettingsContextProvider({ children }: Props) {
    
    const [settings, setSettings] = useState<Settings>(
        {
            present: false,
            stayPresentAfterSignOut: true
        }
    );

    // apply saved settings on first load
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem("settings");
            if (savedSettings) {
                setSettings({
                    ...settings,
                    ...JSON.parse(savedSettings), // any missing fields will be set as defaults
                });
            }
        }
        catch (_) {}  // if error parsing saved settings, keep as defaults
    }, []);

    // save settings on tab close
    useEffect(() => {
        const saveSettings = () => localStorage.setItem("settings", JSON.stringify(settings));
        window.addEventListener("beforeunload", saveSettings);
        return () => window.removeEventListener("beforeunload", saveSettings);
    }, [settings]);

    return (
        <SettingsContext.Provider value={[settings, setSettings]}>
            {children}
        </SettingsContext.Provider>
    );
}
