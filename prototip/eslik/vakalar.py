"""Test kancalarını üretir: hook_stratejileri.md §2, §3, §6, §11 örnekleri + uç durumlar.
Her kanca hem 'tr' hem 'en' ile puanlanır. Kullanım: vakalar.py <hook_stratejileri.md> <cikti.json>"""
import json
import re
import sys
from pathlib import Path

md = Path(sys.argv[1]).read_text(encoding="utf-8").splitlines()


def bolum(baslik_on_eki):
    icinde, satirlar = False, []
    for s in md:
        if s.startswith("## "):
            icinde = s.startswith("## " + baslik_on_eki)
            continue
        if icinde:
            satirlar.append(s)
    return satirlar


md_ornekleri = []
for on_ek in ("2.", "3.", "6.", "11."):
    for satir in bolum(on_ek):
        for m in re.finditer(r'"([^"]+)"', satir):
            if m.group(1) not in md_ornekleri:
                md_ornekleri.append(m.group(1))

uc_durumlar = [
    # Türkçe büyük harf, I/İ
    "BU BİR KURT DEĞİL.",
    "BU BİR KURT DEĞİL. AMA GENLERİNDE KURT SAKLIYOR, IRMAKTAKİ IŞIK GİBİ.",
    "SEN BUNU BİLMİYORSUN AMA KURTLAR BÖYLE DEĞİL.",
    "KÖPEKBALIĞI ORKAYI GÖRÜNCE KAÇIYOR.",
    "İstanbul'daki İzmir kedisi İnanılmaz.",
    # kısa isimler başka kelimeye takılmasın
    "Bu filmde kim kazanır?",
    "Kim kazanır: kaz mı, ördek mi?",
    "Fil, filmde filozof gibi.",
    "Atlar ve atlet aynı değil.",
    "Morsun dişleri yemek için değil.",
    "Sen morsun, ben mavi.",
    "Aslan kral olabilir.",
    "Aslan asla geri adım atmaz.",
    # hitap ekleri ve istisnalar
    "Bir kurt görürsen sakın arkanı dönme.",
    "Bunu dişlerine bakarak anlayabilirsin.",
    "Anlayabilirsiniz, sizin köpeğiniz de kurt.",
    "Olsun, kurtlar yine de kazanır.",
    "Hasan ile Yasin kurtları izlerken gelsin dediler.",
    "Kurtlar uluyunca kaçarsın sanıyorsun.",
    "Bir ayıdan mı kaçarsın, kurttan mı? Misin musun?",
    "Sence hangisi kazanır? Kapışsalar galip kim olur?",
    # sayı, birim, yüzde
    "Çita saatte 110 km/sa hıza ulaşır ve %70 oranında başarılı olur.",
    "3 kat daha güçlü: 1.200 kilo baskı.",
    "Mantis karidesi 1/3 saniyede vurur.",
    "Fil yüz yıl yaşar mı, yoksa elli yıllık bir ömür mü?",
    "٣ kurt ve ² kare, １２３ husky.",
    # kesme işaretleri
    "Husky'nin gözleri, kurdun gözlerinden farklı.",
    "Afrika'nın asıl tehlikeli devi aslan değil, su aygırı.",
    "Afrika’nın en hızlı kedisi çita değil.",
    "Your dog's ancestor isn’t a wolf.",
    # boş, tek kelime, soru işareti
    "",
    "Kurt",
    "?",
    "   ",
    "?? ? ?",
    # çok uzun
    "Bu bir kurt değil ama genlerinde gerçek bir kurt saklıyor ve bunu gözlerine bakarak anlayabilirsin "
    "çünkü kurtların gözleri sarı huskylerin gözleri ise mavi olur ve bu fark sana her şeyi anlatır bence "
    "bunu bilmen lazım arkadaşlar.",
    "This is not a wolf but it still carries real wolf DNA and you can tell by looking at its eyes because "
    "wolves have yellow eyes while huskies usually have blue ones and that one tell changes everything you "
    "thought you knew about dogs today.",
    # dolgu, belirsiz sıfat, zamir, cevap veren
    "Merhaba arkadaşlar, bugün kaz ve ördeği karşılaştıracağız.",
    "Selam! Bu videoda harika bir hayvanı tanıyacaksınız, abone ol.",
    "Hoş geldiniz, beğenmeyi unutma: muhteşem, çılgın ve efsane kedi!",
    "Timsah ve aligatör farklı, çünkü burunları farklı.",
    "Bu yüzden kurtlar yani köpekler, bu nedenle aynı.",
    "O aslında çok tehlikeli.",
    "Onlar kaçar, şu ayı kalır.",
    "Bu aslında bir deniz aslanı değil, bir fok.",
    "Köpekbalığı mı köpek mi daha hızlı yüzer?",
    "Kutup ayısı aslında beyaz değil, derisi siyah.",
    "Hayatta kalmak için kaçmak zorunda.",
    "Orkalar köpekbalıklarını avlar, yener ve parçalar.",
    "Su samuru elleriyle taş kullanır mı?",
    "Kurtlar zehirli değil ama ısırıkları öldürür, sakın yaklaşma, asla!",
    # boşluk, satır sonu, tırnak, üç nokta, iki nokta
    "Bu bir kurt değil.\n\tAma Husky gibi uluyor.",
    "“Kurt” dediğin hayvan aslında Husky.",
    "Kurt… Husky… hangisi?",
    "Kurt: Husky değil. Kurt! Husky? Kurt \"Husky\" Kurt",
    "Kurt Husky Kangal　Akbaş\x1cSivas\x85Kars",
    "kurt_husky karışımı ve Kurt_Husky",
    # İngilizce
    "That isn't a wolf, you're looking at a husky.",
    "You'd never guess why the walrus has tusks.",
    "I can't believe this. I am a wolf and I know Wolves.",
    "Hi guys! Welcome back, don't forget to like and subscribe.",
    "It's insane how crazy amazing wolves are.",
    "They say he is incredible, she is awesome.",
    "This actually is unbelievable and interesting.",
    "Polar bears aren't white because their skin is black.",
    "A cheetah hits 70 mph in 3 seconds, 2x faster than you, at 110 km/h.",
    "Killer whales hunt great white sharks, and sharks run for their lives.",
    "İstanbul's cats are not what you think.",
    "Dogs, cats, foxes and wolves: which one is the real hunter?",
    "So that's why the owl turns its head, which means it survives.",
    "You'll lose. You've lost. Yourself, yours, your fear.",
    "Deadly danger: the deadliest rule before they die.",
    # Unicode uçları
    "ΟΔΟΣ ΛΥΚΟΣ λύκος",
    "Straße STRASSE ß ǅemal ǈ wolf",
    "Wolves Ⅻ times faster than ⅻ dogs",
    "🐺 Kurt 🐺 Husky, the 𝐖olf is here.",
    "Café NAÏVE façade Ölü ölür.",
]

kancalar = []
for k in md_ornekleri + uc_durumlar:
    if k not in kancalar:
        kancalar.append(k)
vakalar = [{"metin": k, "dil": d} for k in kancalar for d in ("tr", "en")]
Path(sys.argv[2]).write_text(json.dumps(vakalar, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(md_ornekleri)} md örneği + {len(uc_durumlar)} uç durum = {len(kancalar)} kanca, "
      f"{len(vakalar)} vaka (her kanca tr ve en)")
