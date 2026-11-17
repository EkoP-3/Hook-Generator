import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// Framer kod bileşeni: giriş bölümü. Ziyaretçi kaydırdıkça film ileri/geri oynar (scroll-scrub).
// Depodaki kopya: prototip/framer/KaydirFilm.tsx. Videolar sık anahtar kareyle kodlanmalı (site/medya, -g 2).
// Masaüstü 16:9 film, telefonda (<810px) 9:16 film. "Az hareket" tercihinde ve Framer tuvalinde poster gösterilir.

const R = { zemin: "#EEF1F4", lacivert: "#14202B", soluk: "#5A6875", turuncu: "#FF7A00", turuncuKoyu: "#F06C00", turuncuUstu: "#1A0D00" }
const YAZI = "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"

interface Props {
    videoYatay: string
    videoDikey: string
    posterYatay: string
    posterDikey: string
    ust: string
    baslik: string
    vurgu: string
    alt: string
    buton1: string
    link1: string
    buton2: string
    link2: string
    uzunluk: number
    style?: React.CSSProperties
}

// Bölümün ekranda ne kadar kaydırıldığı: 0 (başı) – 1 (sonu).
export function ilerleme(ust: number, yukseklik: number, pencere: number) {
    const yol = yukseklik - pencere
    if (yol <= 0) return 0
    return Math.min(1, Math.max(0, -ust / yol))
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function KaydirFilm(props: Props) {
    const { videoYatay, videoDikey, posterYatay, posterDikey, ust, baslik, vurgu, alt, buton1, link1, buton2, link2, uzunluk = 240, style } = props
    const tuval = RenderTarget.current() === RenderTarget.canvas
    const kap = React.useRef<HTMLDivElement>(null)
    const video = React.useRef<HTMLVideoElement>(null)
    const cubuk = React.useRef<HTMLDivElement>(null)
    const metin = React.useRef<HTMLDivElement>(null)
    const [dikey, setDikey] = React.useState(false)
    const [sabit, setSabit] = React.useState(tuval) // true: yalnız poster

    React.useEffect(() => {
        if (tuval) return
        const dar = window.matchMedia("(max-width: 809px)")
        const az = window.matchMedia("(prefers-reduced-motion: reduce)")
        const guncelle = () => { setDikey(dar.matches); setSabit(az.matches) }
        guncelle()
        dar.addEventListener("change", guncelle)
        az.addEventListener("change", guncelle)
        return () => { dar.removeEventListener("change", guncelle); az.removeEventListener("change", guncelle) }
    }, [tuval])

    React.useEffect(() => {
        if (sabit) return
        const v = video.current
        if (!v) return
        let hedef = 0, simdi = 0, kare = 0, hazir = false
        const hazirla = () => { hazir = v.duration > 0 && isFinite(v.duration) }
        v.addEventListener("loadedmetadata", hazirla)
        hazirla()
        // iOS Safari: aramaya izin vermesi için bir kez oynat-durdur.
        v.play()?.then(() => v.pause()).catch(() => {})
        const olc = () => {
            const k = kap.current
            if (!k) return
            const r = k.getBoundingClientRect()
            hedef = ilerleme(r.top, r.height, window.innerHeight)
        }
        const dongu = () => {
            simdi += (hedef - simdi) * 0.12
            if (Math.abs(hedef - simdi) < 0.0005) simdi = hedef
            if (hazir) {
                const t = simdi * (v.duration - 0.05)
                if (Math.abs(v.currentTime - t) > 0.01) v.currentTime = t
            }
            if (cubuk.current) cubuk.current.style.transform = `scaleX(${simdi})`
            if (metin.current) metin.current.style.transform = `translate3d(0, ${-simdi * 48}px, 0) scale(${1 - simdi * 0.04})`
            kare = requestAnimationFrame(dongu)
        }
        olc()
        window.addEventListener("scroll", olc, { passive: true })
        window.addEventListener("resize", olc)
        kare = requestAnimationFrame(dongu)
        return () => {
            cancelAnimationFrame(kare)
            window.removeEventListener("scroll", olc)
            window.removeEventListener("resize", olc)
            v.removeEventListener("loadedmetadata", hazirla)
        }
    }, [sabit, dikey])

    const kaynak = dikey ? videoDikey : videoYatay
    const poster = dikey ? posterDikey : posterYatay
    const parcalar = vurgu && baslik.includes(vurgu) ? baslik.split(vurgu) : [baslik]
    const ortu = dikey
        ? `linear-gradient(180deg, ${R.zemin} 0%, rgba(238,241,244,.86) 30%, rgba(238,241,244,0) 55%), linear-gradient(0deg, ${R.zemin} 0%, rgba(238,241,244,0) 14%)`
        : `linear-gradient(90deg, rgba(238,241,244,.96) 0%, rgba(238,241,244,.78) 34%, rgba(238,241,244,0) 58%), linear-gradient(0deg, ${R.zemin} 0%, rgba(238,241,244,0) 18%)`

    return (
        <section ref={kap} aria-label="Giriş" style={{ ...style, position: "relative", width: "100%", height: sabit ? "100vh" : `${uzunluk}vh`, minHeight: 560, background: R.zemin, fontFamily: YAZI }}>
            <style>{`
                .kf-btn{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-family:${YAZI};font-weight:600;font-size:16px;border-radius:999px;padding:15px 26px;transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s}
                .kf-btn:active{transform:translateY(1px) scale(.98)}
                .kf-ana{color:${R.turuncuUstu};background:linear-gradient(180deg,#FF8A1F 0%,${R.turuncu} 55%,${R.turuncuKoyu} 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -2px 0 rgba(26,13,0,.12),0 1px 2px rgba(240,108,0,.35),0 8px 20px -6px rgba(240,108,0,.55),0 18px 36px -18px rgba(20,32,43,.35)}
                .kf-ana:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(26,13,0,.12),0 2px 4px rgba(240,108,0,.35),0 14px 28px -8px rgba(240,108,0,.6),0 26px 44px -20px rgba(20,32,43,.4)}
                .kf-ikinci{color:${R.lacivert};background:rgba(255,255,255,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(20,32,43,.14);box-shadow:inset 0 1px 0 #fff,0 1px 2px rgba(20,32,43,.06),0 10px 24px -12px rgba(20,32,43,.25)}
                .kf-ikinci:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 #fff,0 2px 4px rgba(20,32,43,.08),0 16px 32px -14px rgba(20,32,43,.3)}
                .kf-btn:focus-visible{outline:3px solid ${R.turuncu};outline-offset:3px}
                @media (prefers-reduced-motion: reduce){.kf-btn{transition:none}}
            `}</style>
            <div style={{ position: "sticky", top: 0, height: "100vh", minHeight: 560, overflow: "hidden" }}>
                {sabit || !kaynak ? (
                    poster ? <img src={poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : null
                ) : (
                    <video key={kaynak} ref={video} src={kaynak} poster={poster} muted playsInline preload="auto" aria-hidden="true"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                <div style={{ position: "absolute", inset: 0, background: ortu, pointerEvents: "none" }} />
                <div style={{ position: "relative", height: "100%", maxWidth: 1200, margin: "0 auto", padding: dikey ? "112px 20px 0" : "0 40px", display: "flex", alignItems: dikey ? "flex-start" : "center", boxSizing: "border-box" }}>
                    <div ref={metin} style={{ maxWidth: dikey ? "100%" : 560, display: "flex", flexDirection: "column", gap: dikey ? 16 : 22, alignItems: "flex-start", willChange: "transform" }}>
                        {ust && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: R.lacivert, background: "rgba(255,255,255,.75)", border: "1px solid rgba(20,32,43,.1)", borderRadius: 999, padding: "6px 12px 6px 8px", boxShadow: "inset 0 1px 0 #fff, 0 6px 16px -10px rgba(20,32,43,.3)" }}>
                                <span style={{ width: 8, height: 8, borderRadius: 99, background: R.turuncu, boxShadow: "0 0 0 4px rgba(255,122,0,.18)" }} />
                                {ust}
                            </span>
                        )}
                        <h1 style={{ margin: 0, fontSize: dikey ? "clamp(40px, 11vw, 54px)" : "clamp(52px, 6.2vw, 88px)", lineHeight: 1.02, letterSpacing: "-0.035em", fontWeight: 600, color: R.lacivert }}>
                            {parcalar.length > 1 ? (<>{parcalar[0]}<span style={{ color: R.turuncu }}>{vurgu}</span>{parcalar[1]}</>) : baslik}
                        </h1>
                        {alt && <p style={{ margin: 0, fontSize: dikey ? 16 : 19, lineHeight: 1.55, color: R.soluk, maxWidth: 480 }}>{alt}</p>}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
                            {buton1 && <a className="kf-btn kf-ana" href={link1 || "#"}>{buton1}<span aria-hidden="true">→</span></a>}
                            {buton2 && <a className="kf-btn kf-ikinci" href={link2 || "#"}>{buton2}</a>}
                        </div>
                    </div>
                </div>
                {!sabit && (
                    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(20,32,43,.08)" }}>
                        <div ref={cubuk} style={{ height: "100%", background: R.turuncu, transform: "scaleX(0)", transformOrigin: "0 50%", boxShadow: "0 0 12px rgba(255,122,0,.6)" }} />
                    </div>
                )}
            </div>
        </section>
    )
}

addPropertyControls(KaydirFilm, {
    videoYatay: { type: ControlType.File, title: "Video (yatay)", allowedFileTypes: ["mp4", "webm"] },
    videoDikey: { type: ControlType.File, title: "Video (telefon)", allowedFileTypes: ["mp4", "webm"] },
    posterYatay: { type: ControlType.File, title: "Poster (yatay)", allowedFileTypes: ["jpg", "jpeg", "png", "webp"] },
    posterDikey: { type: ControlType.File, title: "Poster (telefon)", allowedFileTypes: ["jpg", "jpeg", "png", "webp"] },
    ust: { type: ControlType.String, title: "Üst etiket", defaultValue: "Kısa video kancaları" },
    baslik: { type: ControlType.String, title: "Başlık", defaultValue: "Shorts’ta ilk 3 saniye." },
    vurgu: { type: ControlType.String, title: "Turuncu kısım", defaultValue: "ilk 3 saniye" },
    alt: { type: ControlType.String, title: "Alt metin", displayTextArea: true, defaultValue: "İzleyici ilk saniyelerde kalır ya da kaydırır. Kancanı yaz, hangi yönünün zayıf olduğunu hemen gör." },
    buton1: { type: ControlType.String, title: "Buton 1", defaultValue: "Kancanı puanla" },
    link1: { type: ControlType.String, title: "Buton 1 bağlantı", defaultValue: "/#arac" },
    buton2: { type: ControlType.String, title: "Buton 2", defaultValue: "Nasıl çalışır?" },
    link2: { type: ControlType.String, title: "Buton 2 bağlantı", defaultValue: "/#nasil" },
    uzunluk: { type: ControlType.Number, title: "Kaydırma uzunluğu (vh)", defaultValue: 240, min: 120, max: 400, step: 10 },
})
