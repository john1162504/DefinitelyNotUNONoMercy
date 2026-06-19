import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

const QUERY = "(orientation: portrait) and (max-width: 900px)";

export default function OrientationGate() {
    const [isPortraitMobile, setIsPortraitMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(QUERY);
        const update = () => setIsPortraitMobile(mql.matches);
        update();

        if (mql.addEventListener) {
            mql.addEventListener("change", update);
            return () => mql.removeEventListener("change", update);
        }
        mql.addListener(update);
        return () => mql.removeListener(update);
    }, []);

    if (!isPortraitMobile) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-4 bg-gray-900 px-8 text-center text-white">
            <RotateCw className="h-16 w-16 animate-pulse text-yellow-400" />
            <h2 className="text-2xl font-bold">Please rotate your device</h2>
            <p className="max-w-xs text-sm text-gray-300">
                This game is best played in landscape. Turn your phone sideways
                to see the table and your full hand.
            </p>
        </div>
    );
}
