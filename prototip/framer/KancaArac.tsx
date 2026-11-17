import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { KancaPuan } from "./Puanla.tsx"
import { KancaKalip } from "./Kalip.tsx"

// Framer kod bileşeni: kanca puanlama + konudan kanca üretme.
// Depodaki kopya: prototip/framer/KancaArac.tsx. Puanla.tsx = prototip/puanla.js, Kalip.tsx = prototip/kalip.js.
// Üretim: önce aracı sunucu (sunucu/worker.mjs, Gemini); hak/kota bitince ya da sunucu yoksa kalıp üretici.

const R = { kart: "#FFFFFF", cizgi: "#D5DCE3", soluk: "#5A6875", lacivert: "#14202B", turuncu: "#FF7A00", turuncuUstu: "#1A0D00", ray: "#E4E9EE" }
const YAZI = "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
const ETIKET = { specificity: "Somutluk", address: "Hitap", stakes: "Risk", curiosity: "Merak", brevity: "Kısalık" }
const ANAHTARLAR = ["specificity", "address", "stakes", "curiosity", "brevity"]
const FORMUL_AD = {"KARSILASTIRMA": "Karşılaştırma", "TERS": "Tersine çevirme", "IMKANSIZ": "İmkânsız iddia", "HITAP": "Doğrudan hitap", "ENLER": "En'ler", "ISTATISTIK": "İstatistik", "SORU": "Soru", "IFSA": "İfşa", "UYARI": "Uyarı", "HATA": "Hata", "LISTE": "Liste", "ICERIDEN": "İçeriden bilgi", "ONCE_SONRA": "Önce / sonra", "KOKEN": "Köken", "BASKASI": "Başkasının sonucu", "KANIT": "Kanıt", "SAAT": "Saat", "DENEDIM": "Denedim", "SOKUM": "Söküm", "YIGIN": "Yığın", "SON_TARIH": "Son tarih"}
const KALIP_FORMULLER = { formuller: Object.keys(FORMUL_AD).map((kod) => ({ kod })) }
const ORNEKLER = [
    "Bu bir kurt değil. Ama genlerinde hâlâ kurt saklıyor.",
    "Kurt mu husky mi? Gözlerine bakarsan hemen anlarsın.",
    "Ormanda bunu görürsen sakın husky sanma.",
    "Bütün köpekler aslında bir kurttan geliyor. Peki husky neden hâlâ ona benziyor?",
    "Karşına bunlardan biri çıksa, hangisinden kaçardın?",
]
const NOT = {
    yok: "Yapay zekâ henüz bağlı değil; kancalar hazır kalıplarla üretildi.",
    hak: "Bugünkü yapay zekâ hakkın doldu; kancalar hazır kalıplarla üretildi. Yarın tekrar dene.",
    kota: "Yapay zekâ bugün çok yoğun; kancalar hazır kalıplarla üretildi.",
    hata: "Yapay zekâ şu an yanıt vermedi; kancalar hazır kalıplarla üretildi.",
}

interface Props {
    baslangic: string
    sunucu: string
    style?: React.CSSProperties
}
type Uretilen = { formul: string; kanca: string; skor: number }

const GOLGE = "inset 0 1px 0 rgba(255,255,255,.9), 0 1px 1px rgba(20,32,43,.04), 0 4px 8px rgba(20,32,43,.05), 0 16px 32px -8px rgba(20,32,43,.10), 0 40px 64px -24px rgba(20,32,43,.16)"
const kart: React.CSSProperties = { background: "linear-gradient(180deg, #FFFFFF 0%, #FBFCFD 100%)", border: "1px solid rgba(20,32,43,.08)", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", gap: 18, minWidth: 0, boxSizing: "border-box", boxShadow: GOLGE }
const kucukBaslik: React.CSSProperties = { margin: 0, fontFamily: YAZI, fontWeight: 600, fontSize: 20, color: R.lacivert }
const sayi: React.CSSProperties = { fontFamily: YAZI, fontWeight: 600, fontVariantNumeric: "tabular-nums" }
const gizli: React.CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }

async function sunucuyaSor(adres: string, konu: string, dil: string) {
    const kes = new AbortController()
    const zaman = setTimeout(() => kes.abort(), 25000)
    try {
        const r = await fetch(adres.replace(/\/+$/, "") + "/uret", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ konu, dil }), signal: kes.signal,
        })
        const j = await r.json().catch(() => ({}))
        if (r.ok && Array.isArray(j.kancalar) && j.kancalar.length) return { kancalar: j.kancalar, kalan: j.kalan }
        return { hata: j.hata === "hak" ? "hak" : j.hata === "kota" ? "kota" : "hata" }
    } catch {
        return { hata: "hata" }
    } finally {
        clearTimeout(zaman)
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function KancaArac(props: Props) {
    const { baslangic, sunucu, style } = props
    const [metin, setMetin] = React.useState(baslangic || "")
    const [dil, setDil] = React.useState<"tr" | "en">("tr")
    const [konu, setKonu] = React.useState("")
    const [uretiliyor, setUretiliyor] = React.useState(false)
    const [liste, setListe] = React.useState<Uretilen[]>([])
    const [bilgi, setBilgi] = React.useState("")
    const puanKarti = React.useRef<HTMLElement>(null)
    const sonuc = metin.trim() ? KancaPuan.puanla(metin, dil) : null
    const ornekler = React.useMemo(
        () => ORNEKLER.map((t) => ({ t, s: Math.round(KancaPuan.puanla(t, "tr").skor) })).sort((a, b) => b.s - a.s),
        []
    )

    async function uret(e?: React.FormEvent) {
        e?.preventDefault()
        const k = konu.trim()
        if (k.length < 2) { setBilgi("Önce konuyu yaz."); return }
        setUretiliyor(true); setBilgi("Kancalar yazılıyor…"); setListe([])
        let ham: { formul: string; kanca: string }[] = []
        let not = NOT.yok
        if (sunucu && sunucu.trim()) {
            const c = await sunucuyaSor(sunucu.trim(), k, dil)
            if ("kancalar" in c) {
                ham = c.kancalar
                not = typeof c.kalan === "number" ? `Yapay zekâyla yazıldı. Bugün ${c.kalan} hakkın kaldı.` : "Yapay zekâyla yazıldı."
            } else not = NOT[c.hata]
        }
        if (!ham.length) ham = KancaKalip.uret(k, dil, KALIP_FORMULLER)
        setListe(ham.map((x) => ({ ...x, skor: Math.round(KancaPuan.puanla(x.kanca, dil).skor) })).sort((a, b) => b.skor - a.skor))
        setBilgi(not)
        setUretiliyor(false)
    }

    function sec(t: string) {
        setMetin(t)
        puanKarti.current?.scrollIntoView?.({ behavior: "smooth", block: "center" })
    }

    return (
        <div style={{ ...style, width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 20, fontFamily: YAZI, color: R.lacivert, boxSizing: "border-box" }}>
            <style>{`
                .ka-odak:focus-visible{outline:3px solid #FF7A00;outline-offset:2px}
                .ka-satir{transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s,border-color .18s}
                .ka-satir:hover{transform:translateY(-2px);border-color:rgba(255,122,0,.45)!important;box-shadow:0 2px 4px rgba(20,32,43,.05),0 12px 24px -12px rgba(20,32,43,.22)}
                .ka-ana{transition:transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s;background:linear-gradient(180deg,#FF8A1F 0%,#FF7A00 55%,#F06C00 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -2px 0 rgba(26,13,0,.12),0 1px 2px rgba(240,108,0,.35),0 8px 20px -6px rgba(240,108,0,.5)}
                .ka-ana:hover:not(:disabled){transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(26,13,0,.12),0 2px 4px rgba(240,108,0,.35),0 14px 28px -8px rgba(240,108,0,.6)}
                .ka-ana:active:not(:disabled){transform:translateY(1px) scale(.98)}
                .ka-girdi{transition:border-color .15s,box-shadow .15s}
                .ka-girdi:focus{outline:none;border-color:#FF7A00!important;box-shadow:inset 0 1px 2px rgba(20,32,43,.06),0 0 0 4px rgba(255,122,0,.16)!important}
                .ka-halka{transition:stroke-dashoffset .5s cubic-bezier(.2,.8,.2,1)}
                @media (prefers-reduced-motion: reduce){.ka-cubuk,.ka-halka,.ka-satir,.ka-ana{transition:none!important}}
            `}</style>

            <section ref={puanKarti} style={kart} aria-label="Kancanı puanla">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <h3 style={kucukBaslik}>Kancanı puanla</h3>
                    <div role="group" aria-label="Dil" style={{ display: "inline-flex", border: "1px solid " + R.cizgi, borderRadius: 999, padding: 3, gap: 2, background: "#F7F9FA", boxShadow: "inset 0 1px 2px rgba(20,32,43,.06)" }}>
                        {(["tr", "en"] as const).map((l) => (
                            <button key={l} type="button" className="ka-odak" aria-pressed={dil === l} onClick={() => setDil(l)}
                                style={{ border: 0, cursor: "pointer", borderRadius: 999, padding: "5px 14px", fontFamily: YAZI, fontWeight: 600, fontSize: 13, background: dil === l ? R.lacivert : "transparent", color: dil === l ? "#FFFFFF" : R.soluk, boxShadow: dil === l ? "0 2px 6px -1px rgba(20,32,43,.35)" : "none" }}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <label htmlFor="ka-kanca" style={gizli}>Kancan</label>
                <textarea id="ka-kanca" className="ka-odak ka-girdi" rows={3} value={metin} onChange={(e) => setMetin(e.target.value)}
                    placeholder="ör. Bu bir kurt değil. Ama genlerinde hâlâ kurt saklıyor."
                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid " + R.cizgi, borderRadius: 14, padding: 16, fontFamily: YAZI, fontSize: 16, lineHeight: 1.5, color: R.lacivert, background: "#F7F9FA", boxShadow: "inset 0 1px 2px rgba(20,32,43,.06)" }} />
                <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {!sonuc ? (
                        <p style={{ margin: 0, color: R.soluk, fontSize: 15 }}>Bir kanca yaz ya da örneklerden birine tıkla; puanı burada görünsün.</p>
                    ) : (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                                <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1F4F7 70%)", boxShadow: "inset 0 1px 0 #fff, 0 10px 24px -10px rgba(20,32,43,.3), 0 2px 4px rgba(20,32,43,.06)" }}>
                                    <svg viewBox="0 0 112 112" width="112" height="112" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
                                        <defs>
                                            <linearGradient id="ka-turuncu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8A1F" /><stop offset="1" stopColor="#F06C00" /></linearGradient>
                                        </defs>
                                        <circle cx="56" cy="56" r="46" fill="none" stroke={R.ray} strokeWidth="9" />
                                        <circle className="ka-halka" cx="56" cy="56" r="46" fill="none" stroke="url(#ka-turuncu)" strokeWidth="9" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - Math.max(0, Math.min(100, sonuc.skor)) / 100)}
                                            transform="rotate(-90 56 56)" style={{ filter: "drop-shadow(0 2px 4px rgba(240,108,0,.35))" }} />
                                    </svg>
                                    <span style={{ ...sayi, position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 36, letterSpacing: "-0.02em" }}>{Math.round(sonuc.skor)}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: R.soluk }}><span style={{ ...sayi, color: R.lacivert, fontSize: 16 }}>/ 100</span><br />0,6 × ortalama + 0,4 × en düşük</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {ANAHTARLAR.map((k) => {
                                    const v = Math.round(sonuc.ozellikler[k])
                                    const zayif = k === sonuc.en_zayif
                                    return (
                                        <div key={k}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: zayif ? 700 : 400 }}>
                                                <span>{ETIKET[k]}</span>
                                                <span style={sayi}>{v}</span>
                                            </div>
                                            <div style={{ marginTop: 4, height: 8, borderRadius: 999, background: R.ray, overflow: "hidden" }}>
                                                <div className="ka-cubuk" style={{ height: "100%", width: v + "%", borderRadius: 999, background: R.turuncu, opacity: zayif ? 1 : 0.45, transition: "width .2s" }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <p style={{ margin: 0, fontSize: 15 }}><strong>En zayıf: {ETIKET[sonuc.en_zayif]}.</strong> <span style={{ color: R.soluk }}>{sonuc.oneri}</span></p>
                            {sonuc.cezalar.length > 0 && (
                                <p style={{ margin: 0, fontSize: 13, color: R.soluk }}>Ceza: {sonuc.cezalar.map((c) => c.neden).join(" · ")}</p>
                            )}
                        </>
                    )}
                </div>
            </section>

            <section style={kart} aria-label="Örnek kancalar">
                <div>
                    <h3 style={kucukBaslik}>Örnek kancalar</h3>
                    <p style={{ margin: "4px 0 0", color: R.soluk, fontSize: 14 }}>Konu: Kurt mu Husky mi?</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ornekler.map(({ t, s }) => (
                        <button key={t} type="button" className="ka-odak ka-satir" onClick={() => { setMetin(t); setDil("tr") }}
                            style={{ display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left", cursor: "pointer", background: "#FFFFFF", border: "1px solid " + R.cizgi, borderRadius: 14, padding: 14, fontFamily: YAZI, fontSize: 14, boxShadow: "0 1px 2px rgba(20,32,43,.04)", lineHeight: 1.45, color: R.lacivert }}>
                            <span style={{ ...sayi, fontSize: 15, minWidth: 40, height: 28, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(255,122,0,.10)", color: R.lacivert, boxShadow: "inset 0 0 0 1px rgba(255,122,0,.25)" }}>{s}</span>
                            <span>{t}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section style={{ ...kart, gridColumn: "1 / -1" }} aria-label="Konudan kanca üret">
                <h3 style={kucukBaslik}>Konudan kanca üret</h3>
                <form onSubmit={uret} style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <label htmlFor="ka-konu" style={gizli}>Konu</label>
                    <input id="ka-konu" className="ka-odak ka-girdi" type="text" maxLength={120} value={konu} onChange={(e) => setKonu(e.target.value)}
                        placeholder="ör. Uykusuzluk beynine ne yapar?" autoComplete="off"
                        style={{ flex: "1 1 240px", minWidth: 0, border: "1px solid " + R.cizgi, borderRadius: 999, padding: "14px 20px", boxShadow: "inset 0 1px 2px rgba(20,32,43,.06)", fontFamily: YAZI, fontSize: 16, color: R.lacivert, background: "#F7F9FA" }} />
                    <button type="submit" className="ka-odak ka-ana" disabled={uretiliyor}
                        style={{ border: 0, borderRadius: 999, padding: "14px 26px", ...(uretiliyor ? { background: R.ray, boxShadow: "none" } : {}), color: uretiliyor ? R.soluk : R.turuncuUstu, fontFamily: YAZI, fontWeight: 600, fontSize: 15, cursor: uretiliyor ? "wait" : "pointer" }}>
                        {uretiliyor ? "Yazılıyor…" : "Kanca üret"}
                    </button>
                </form>
                <p style={{ margin: 0, fontSize: 13, color: R.soluk }}>Dil, puanlama kartındaki TR / EN seçimine göre. Kişisel bilgi yazma: konu yalnızca kanca yazmak için yapay zekâya gönderilir, biz saklamayız.</p>
                <div aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {bilgi && <p style={{ margin: 0, fontSize: 14, color: R.soluk }}>{bilgi}</p>}
                    {liste.map((x) => (
                        <button key={x.kanca} type="button" className="ka-odak ka-satir" onClick={() => sec(x.kanca)} title="Puan ayrıntısı için tıkla"
                            style={{ display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left", cursor: "pointer", background: "#FFFFFF", border: "1px solid " + R.cizgi, borderRadius: 14, padding: 14, fontFamily: YAZI, fontSize: 15, boxShadow: "0 1px 2px rgba(20,32,43,.04)", lineHeight: 1.45, color: R.lacivert }}>
                            <span style={{ ...sayi, fontSize: 15, minWidth: 40, height: 28, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(255,122,0,.10)", color: R.lacivert, boxShadow: "inset 0 0 0 1px rgba(255,122,0,.25)" }}>{x.skor}</span>
                            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <span>{x.kanca}</span>
                                <span style={{ fontSize: 12, color: R.soluk }}>{FORMUL_AD[x.formul] || x.formul}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    )
}

addPropertyControls(KancaArac, {
    baslangic: { type: ControlType.String, title: "Başlangıç", defaultValue: "", displayTextArea: true },
    sunucu: { type: ControlType.String, title: "Sunucu adresi", defaultValue: "", placeholder: "https://kanca-uretici.<hesap>.workers.dev" },
})
