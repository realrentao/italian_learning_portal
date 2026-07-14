#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
动词变位数据生成器
================================
为 30 个常用意大利语动词生成准确的「7 语式 × 各时态」变位，
写入 src/data/verbs.json。

策略：
  - 规则动词（规则 -are / -ere / -ire / -isc）由代码依规则推导；
  - 不规则动词（essere/avere/andare/fare/dire/venire/bere/uscire）
    仅对不规则的语式/时态显式给出，其余仍由规则推导；
  - 复合时态（近过去、不定式过去时、副动词过去时）由助动词 + 过去分词推导；
  - 生成后进行一致性校验（人称数、id 合法），保证数据可被前端直接消费。

运行：python scripts/gen_verbs.py
依赖：仅标准库（json / re / os）。
"""

import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUT_PATH = os.path.join(PROJECT_ROOT, "src", "data", "verbs.json")

SAFE_ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# 6 个人称顺序，与前端 ConjugationCell.forms 顺序一致
PERSONS = ["io", "tu", "lui/lei", "noi", "voi", "loro"]


def assert_safe_id(v: str) -> None:
    if not isinstance(v, str) or not SAFE_ID_RE.match(v):
        raise ValueError(f"非法 id：{v!r}")


# ---------------------- 规则推导辅助函数 ----------------------

def indic_impf(inf: str, stem: str) -> list:
    """直陈式未完成过去时（-are→avo / -ere→evo / -ire→ivo）。"""
    if inf.endswith("are"):
        b = "av"
    elif inf.endswith("ere"):
        b = "ev"
    else:
        b = "iv"
    return [stem + b + e for e in ["o", "i", "a", "amo", "ate", "ano"]]


def cong_pres(inf: str, stem: str, isc: bool = False) -> list:
    """虚拟式现在时。"""
    if inf.endswith("are"):
        v = stem + "i"
        return [v, v, v, stem + "iamo", stem + "iate", stem + "ino"]
    else:
        # -ere / -ire / -isc
        v = stem + ("isca" if isc else "a")
        return [v, v, v, stem + ("iamo" if isc else "iamo"),
                stem + ("iate" if isc else "iate"),
                stem + ("iscano" if isc else "ano")]


def cong_impf(inf: str, stem: str, isc: bool = False) -> list:
    """虚拟式未完成过去时。
    词干：现在词干 + ass/-ess/-iss（如 parlass / credess / dormiss）；
    voi 为特殊形式（词干 + aste/-este/-iste，如 parlaste / credeste / dormiste）。
    """
    if inf.endswith("are"):
        s_base, voi_suf = "ass", "aste"
    elif isc:
        s_base, voi_suf = "iss", "iste"
    else:
        s_base, voi_suf = "ess", "este"
    base = stem + s_base
    return [base + "i", base + "i", base + "e", base + "imo",
            stem + voi_suf, base + "ero"]


def fut_forms(stem_fut: str, kind: str) -> list:
    """将来时。kind: reg(-are/-ere) / ire / irr(不规则词干)。"""
    if kind in ("reg", "ire"):
        pre = "er" if kind == "reg" else "ir"
        suf = [pre + e for e in ["ò", "ai", "à", "emo", "ete", "anno"]]
    else:  # irr：不规则词干（如 sar/avr/andr/far/dir/verr/berr/uscir）后接标准词尾
        suf = ["ò", "ai", "à", "emo", "ete", "anno"]
    return [stem_fut + s for s in suf]


def cond_forms(stem_fut: str, kind: str) -> list:
    """条件式现在时。"""
    if kind in ("reg", "ire"):
        pre = "er" if kind == "reg" else "ir"
        suf = [pre + e for e in ["ei", "esti", "ebbe", "emmo", "este", "ebbero"]]
    else:
        suf = ["ei", "esti", "ebbe", "emmo", "este", "ebbero"]
    return [stem_fut + s for s in suf]


def passato_prossimo(aux: str, pp: str) -> list:
    forms = (["ho", "hai", "ha", "abbiamo", "avete", "hanno"]
             if aux == "avere" else
             ["sono", "sei", "è", "siamo", "siete", "sono"])
    return [f"{a} {pp}" for a in forms]


def imperativo(present: list, cong_pres: list, inf: str,
               imp_tu: str = None) -> list:
    """命令式现在时：[io, tu, lei, noi, voi, loro]。"""
    if imp_tu is not None:
        tu = imp_tu
    elif inf.endswith("are"):
        tu = inf[:-3] + "a"
    else:
        tu = present[1]
    return ["", tu, cong_pres[2], present[3], present[4], cong_pres[5]]


def gerundio_pres(inf: str, override: str = None) -> str:
    if override:
        return override
    stem = inf[:-3]
    return stem + ("ando" if inf.endswith("are") else "endo")


def gerundio_passato(aux: str, pp: str) -> str:
    return ("avendo " if aux == "avere" else "essendo ") + pp


# ---------------------- 动词规格数据 ----------------------

# 每个动词：id, inf, chi, aux, pp(过去分词), fut_stem, kind, part_pres,
#           present[6], isc?(是否 -isc),
#           cong_pres?/cong_impf?/impf? (不规则时显式给出),
#           imp_tu? (命令式 tu 覆盖), ger? (副动词现在时覆盖)
VERBS = [
    # ---- 规则 -are ----
    dict(id="parlare", inf="parlare", chi="说话", aux="avere", pp="parlato",
         fut_stem="parl", kind="reg", part_pres="parlante",
         present=["parlo", "parli", "parla", "parliamo", "parlate", "parlano"]),
    dict(id="mangiare", inf="mangiare", chi="吃", aux="avere", pp="mangiato",
         fut_stem="mang", kind="reg", part_pres="mangiante",
         present=["mangio", "mangi", "mangia", "mangiamo", "mangiate", "mangiano"]),
    dict(id="studiare", inf="studiare", chi="学习", aux="avere", pp="studiato",
         fut_stem="stud", kind="reg", part_pres="studiante",
         present=["studio", "studi", "studia", "studiamo", "studiate", "studiano"]),
    dict(id="cercare", inf="cercare", chi="寻找", aux="avere", pp="cercato",
         fut_stem="cerc", kind="reg", part_pres="cercante",
         present=["cerco", "cerchi", "cerca", "cerchiamo", "cercate", "cercano"]),
    dict(id="pagare", inf="pagare", chi="支付", aux="avere", pp="pagato",
         fut_stem="pag", kind="reg", part_pres="pagante",
         present=["pago", "paghi", "paga", "paghiamo", "pagate", "pagano"]),
    dict(id="guardare", inf="guardare", chi="看", aux="avere", pp="guardato",
         fut_stem="guard", kind="reg", part_pres="guardante",
         present=["guardo", "guardi", "guarda", "guardiamo", "guardate", "guardano"]),
    dict(id="comprare", inf="comprare", chi="买", aux="avere", pp="comprato",
         fut_stem="compr", kind="reg", part_pres="comprante",
         present=["compro", "compri", "compra", "compriamo", "comprate", "comprano"]),
    dict(id="cantare", inf="cantare", chi="唱", aux="avere", pp="cantato",
         fut_stem="cant", kind="reg", part_pres="cantante",
         present=["canto", "canti", "canta", "cantiamo", "cantate", "cantano"]),
    # ---- 规则 -ere ----
    dict(id="vedere", inf="vedere", chi="看见", aux="avere", pp="visto",
         fut_stem="ved", kind="reg", part_pres="vedente",
         present=["vedo", "vedi", "vede", "vediamo", "vedete", "vedono"]),
    dict(id="leggere", inf="leggere", chi="读", aux="avere", pp="letto",
         fut_stem="legg", kind="reg", part_pres="leggente",
         present=["leggo", "leggi", "legge", "leggiamo", "leggete", "leggono"]),
    dict(id="scrivere", inf="scrivere", chi="写", aux="avere", pp="scritto",
         fut_stem="scriv", kind="reg", part_pres="scrivente",
         present=["scrivo", "scrivi", "scrive", "scriviamo", "scrivete", "scrivono"]),
    dict(id="prendere", inf="prendere", chi="拿/取", aux="avere", pp="preso",
         fut_stem="prend", kind="reg", part_pres="prendente",
         present=["prendo", "prendi", "prende", "prendiamo", "prendete", "prendono"]),
    dict(id="mettere", inf="mettere", chi="放", aux="avere", pp="messo",
         fut_stem="mett", kind="reg", part_pres="mettente",
         present=["metto", "metti", "mette", "mettiamo", "mettete", "mettono"]),
    dict(id="perdere", inf="perdere", chi="丢失", aux="avere", pp="perso",
         fut_stem="perd", kind="reg", part_pres="perdente",
         present=["perdo", "perdi", "perde", "perdiamo", "perdete", "perdono"]),
    dict(id="credere", inf="credere", chi="相信", aux="avere", pp="creduto",
         fut_stem="cred", kind="reg", part_pres="credente",
         present=["credo", "credi", "crede", "crediamo", "credete", "credono"]),
    dict(id="chiudere", inf="chiudere", chi="关闭", aux="avere", pp="chiuso",
         fut_stem="chiud", kind="reg", part_pres="chiudente",
         present=["chiudo", "chiudi", "chiude", "chiudiamo", "chiudete", "chiudono"]),
    # ---- 规则 -ire（非 -isc） ----
    dict(id="dormire", inf="dormire", chi="睡觉", aux="avere", pp="dormito",
         fut_stem="dorm", kind="ire", part_pres="dormiente",
         present=["dormo", "dormi", "dorme", "dormiamo", "dormite", "dormono"]),
    dict(id="aprire", inf="aprire", chi="打开", aux="avere", pp="aperto",
         fut_stem="apr", kind="ire", part_pres="aprente",
         present=["apro", "apri", "apre", "apriamo", "aprite", "aprono"]),
    dict(id="sentire", inf="sentire", chi="感觉/听", aux="avere", pp="sentito",
         fut_stem="sent", kind="ire", part_pres="sentente",
         present=["sento", "senti", "sente", "sentiamo", "sentite", "sentono"]),
    dict(id="partire", inf="partire", chi="离开", aux="avere", pp="partito",
         fut_stem="part", kind="ire", part_pres="partente",
         present=["parto", "parti", "parte", "partiamo", "partite", "partono"]),
    # ---- 规则 -ire（-isc） ----
    dict(id="finire", inf="finire", chi="完成", aux="avere", pp="finito",
         fut_stem="fin", kind="ire", part_pres="finiente", isc=True,
         present=["finisco", "finisci", "finisce", "finiamo", "finite", "finiscono"]),
    dict(id="capire", inf="capire", chi="理解", aux="avere", pp="capito",
         fut_stem="cap", kind="ire", part_pres="capiente", isc=True,
         present=["capisco", "capisci", "capisce", "capiamo", "capite", "capiscono"]),
    # ---- 不规则动词 ----
    dict(id="essere", inf="essere", chi="是/在", aux="essere", pp="stato",
         fut_stem="sar", kind="irr", part_pres="essente", imp_tu="sii",
         present=["sono", "sei", "è", "siamo", "siete", "sono"],
         cong_pres=["sia", "sia", "sia", "siamo", "siate", "siano"],
         cong_impf=["fossi", "fossi", "fosse", "fossimo", "foste", "fossero"],
         impf=["ero", "eri", "era", "eravamo", "eravate", "erano"]),
    dict(id="avere", inf="avere", chi="有", aux="avere", pp="avuto",
         fut_stem="avr", kind="irr", part_pres="avente", imp_tu="abbi",
         present=["ho", "hai", "ha", "abbiamo", "avete", "hanno"],
         cong_pres=["abbia", "abbia", "abbia", "abbiamo", "abbiate", "abbiano"],
         cong_impf=["avessi", "avessi", "avesse", "avessimo", "aveste", "avessero"],
         impf=["avevo", "avevi", "aveva", "avevamo", "avevate", "avevano"]),
    dict(id="andare", inf="andare", chi="去", aux="essere", pp="andato",
         fut_stem="andr", kind="irr", part_pres="andante", imp_tu="va'",
         present=["vado", "vai", "va", "andiamo", "andate", "vanno"],
         cong_pres=["vada", "vada", "vada", "andiamo", "andiate", "vadano"],
         cong_impf=["andassi", "andassi", "andasse", "andassimo", "andaste", "andassero"],
         impf=["andavo", "andavi", "andava", "andavamo", "andavate", "andavano"]),
    dict(id="fare", inf="fare", chi="做", aux="avere", pp="fatto",
         fut_stem="far", kind="irr", part_pres="facente", imp_tu="fa'", ger="facendo",
         present=["faccio", "fai", "fa", "facciamo", "fate", "fanno"],
         cong_pres=["faccia", "faccia", "faccia", "facciamo", "facciate", "facciano"],
         cong_impf=["facessi", "facessi", "facesse", "facessimo", "faceste", "facessero"],
         impf=["facevo", "facevi", "faceva", "facevamo", "facevate", "facevano"]),
    dict(id="dire", inf="dire", chi="说", aux="avere", pp="detto",
         fut_stem="dir", kind="irr", part_pres="dicente", imp_tu="di'",
         present=["dico", "dici", "dice", "diciamo", "dite", "dicono"],
         cong_pres=["dica", "dica", "dica", "diciamo", "diciate", "dicano"],
         cong_impf=["dicessi", "dicessi", "dicesse", "dicessimo", "diceste", "dicessero"],
         impf=["dicevo", "dicevi", "diceva", "dicevamo", "dicevate", "dicevano"],
         ger="dicendo"),
    dict(id="venire", inf="venire", chi="来", aux="essere", pp="venuto",
         fut_stem="verr", kind="irr", part_pres="veniente",
         present=["vengo", "vieni", "viene", "veniamo", "venite", "vengono"],
         cong_pres=["venga", "venga", "venga", "veniamo", "veniate", "vengano"],
         cong_impf=["venissi", "venissi", "venisse", "venissimo", "veniste", "venissero"],
         impf=["venivo", "venivi", "veniva", "venivamo", "venivate", "venivano"]),
    dict(id="bere", inf="bere", chi="喝", aux="avere", pp="bevuto",
         fut_stem="berr", kind="irr", part_pres="bevente",
         present=["bevo", "bevi", "beve", "beviamo", "bevete", "bevono"],
         cong_pres=["beva", "beva", "beva", "beviamo", "beviate", "bevano"],
         cong_impf=["bevessi", "bevessi", "bevesse", "bevessimo", "beveste", "bevessero"],
         impf=["bevevo", "bevevi", "beveva", "bevevamo", "bevevate", "bevavano"]),
    dict(id="uscire", inf="uscire", chi="出去", aux="essere", pp="uscito",
         fut_stem="uscir", kind="irr", part_pres="uscente",
         present=["esco", "esci", "esce", "usciamo", "uscite", "escono"],
         cong_pres=["esca", "esca", "esca", "usciamo", "usciate", "escano"],
         cong_impf=["uscissi", "uscissi", "uscisse", "uscissimo", "usciste", "uscissero"],
         impf=["uscivo", "uscivi", "usciva", "uscivamo", "uscivate", "uscivano"],
         ger="uscendo"),
]


def build_cells(v: dict) -> list:
    """根据动词规格构建完整的 ConjugationCell 列表。"""
    inf = v["inf"]
    stem = inf[:-3]
    isc = v.get("isc", False)
    aux = v["aux"]
    pp = v["pp"]

    # 虚拟式 / 未完成过去时 / 命令式 tu 的推导或覆盖
    cp = v.get("cong_pres") or cong_pres(inf, stem, isc)
    ci = v.get("cong_impf") or cong_impf(inf, stem, isc)
    imp = v.get("impf") or indic_impf(inf, stem)
    cells = []

    # 1) infinito
    cells.append({"mood": "infinito", "tense": "presente", "forms": [inf]})
    cells.append({"mood": "infinito", "tense": "passato",
                  "forms": [f"{aux} {pp}"]})

    # 2) indicativo
    cells.append({"mood": "indicativo", "tense": "presente", "forms": list(v["present"])})
    cells.append({"mood": "indicativo", "tense": "passato prossimo",
                  "forms": passato_prossimo(aux, pp)})
    cells.append({"mood": "indicativo", "tense": "imperfetto", "forms": list(imp)})
    cells.append({"mood": "indicativo", "tense": "futuro semplice",
                  "forms": fut_forms(v["fut_stem"], v["kind"])})

    # 3) congiuntivo
    cells.append({"mood": "congiuntivo", "tense": "presente", "forms": list(cp)})
    cells.append({"mood": "congiuntivo", "tense": "imperfetto", "forms": list(ci)})

    # 4) condizionale
    cells.append({"mood": "condizionale", "tense": "presente",
                  "forms": cond_forms(v["fut_stem"], v["kind"])})

    # 5) imperativo
    cells.append({"mood": "imperativo", "tense": "presente",
                  "forms": imperativo(v["present"], cp, inf, v.get("imp_tu"))})

    # 6) participio
    cells.append({"mood": "participio", "tense": "presente", "forms": [v["part_pres"]]})
    cells.append({"mood": "participio", "tense": "passato", "forms": [pp]})

    # 7) gerundio
    cells.append({"mood": "gerundio", "tense": "presente",
                  "forms": [gerundio_pres(inf, v.get("ger"))]})
    cells.append({"mood": "gerundio", "tense": "passato",
                  "forms": [gerundio_passato(aux, pp)]})

    return cells


def main() -> None:
    result = []
    for v in VERBS:
        assert_safe_id(v["id"])
        cells = build_cells(v)
        # 校验：人称语式必须为 6 个形式；无人称语式为 1 个
        for c in cells:
            n = len(c["forms"])
            if c["mood"] in ("infinito", "participio", "gerundio"):
                assert n == 1, f"{v['id']} {c['mood']}/{c['tense']} 应为 1 个形式，实际 {n}"
            else:
                assert n == 6, f"{v['id']} {c['mood']}/{c['tense']} 应为 6 个形式，实际 {n}"
        result.append({
            "id": v["id"],
            "infinitive": v["inf"],
            "chinese": v["chi"],
            "conjugation": cells,
        })

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total_cells = sum(len(r["conjugation"]) for r in result)
    print(f"已生成 {len(result)} 个动词，共 {total_cells} 个变位单元格 -> {OUT_PATH}")


if __name__ == "__main__":
    main()
