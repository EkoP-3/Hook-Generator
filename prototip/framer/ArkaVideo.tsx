import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Framer kod bileşeni: bölüm arka planında sessiz, döngüde oynayan video.
// Depodaki kopya: prototip/framer/ArkaVideo.tsx. "Az hareket" tercihinde ve tuvalde poster gösterilir.

interface Props {
    video: string
    poster: string
    ortu: string
    style?: React.CSSProperties
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ArkaVideo({ video, poster, ortu, style }: Props) {
    const [sabit, setSabit] = React.useState(RenderTarget.current() === RenderTarget.canvas)
    React.useEffect(() => {
        if (RenderTarget.current() === RenderTarget.canvas) return
        const az = window.matchMedia("(prefers-reduced-motion: reduce)")
        const g = () => setSabit(az.matches)
        g(); az.addEventListener("change", g)
        return () => az.removeEventListener("change", g)
    }, [])
    const kapla: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    return (
        <div aria-hidden="true" style={{ ...style, position: "relative", overflow: "hidden", pointerEvents: "none" }}>
            {sabit || !video
                ? poster ? <img src={poster} alt="" style={kapla} /> : null
                : <video src={video} poster={poster} autoPlay muted loop playsInline preload="metadata" style={kapla} />}
            {ortu && <div style={{ position: "absolute", inset: 0, background: ortu }} />}
        </div>
    )
}

addPropertyControls(ArkaVideo, {
    video: { type: ControlType.File, title: "Video", allowedFileTypes: ["mp4", "webm"] },
    poster: { type: ControlType.File, title: "Poster", allowedFileTypes: ["jpg", "jpeg", "png", "webp"] },
    ortu: { type: ControlType.String, title: "Örtü (CSS)", defaultValue: "linear-gradient(180deg, rgba(20,32,43,.55) 0%, rgba(20,32,43,.35) 50%, rgba(20,32,43,.75) 100%)" },
})
