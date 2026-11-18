"""Posta kuralları — düz kod. Kaynak metin: seidel-beyin/kurallar/K-001-posta-siniflama.md

Düzey: yalnız öner. Hiçbir kural mail göndermez, silmez, taşımaz; yalnız ilgili dock
kuyruğuna öneri yazar ya da insana sorar. LLM'in çıktısı bu kararı değiştiremez.
"""
from dataclasses import dataclass

KURAL_ID = "K-001"
GUVEN_ESIGI = 0.75

HEDEF = {
    "tedarikci_faturasi": "wavierp.fatura",
    "mixo": "mixo",
    "banka": "digibank.izleme",
    "musteri": "musteri.destek",
    "spam_diger": "arsiv.oneri",
}

# Her zaman insana sorulan sınıflar: banka (para, yalnız izleme) ve müşteri (kişisel veri, yanıt insanın).
HER_ZAMAN_SOR = {"banka", "musteri"}


@dataclass
class Karar:
    hedef: str
    sor: bool
    gerekce: str
    kural_id: str = KURAL_ID


def karar(sinif: str, guven: float) -> Karar:
    hedef = HEDEF.get(sinif, "arsiv.oneri")
    if guven < GUVEN_ESIGI:
        return Karar(hedef, True, f"düşük güven ({guven:.2f} < {GUVEN_ESIGI})")
    if sinif in HER_ZAMAN_SOR:
        return Karar(hedef, True, f"'{sinif}' sınıfı her zaman onaya gider")
    return Karar(hedef, False, f"güven {guven:.2f} ≥ {GUVEN_ESIGI}, öneri kuyruğuna")
