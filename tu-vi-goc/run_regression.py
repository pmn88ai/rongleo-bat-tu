#!/usr/bin/env python3
"""
REGRESSION TEST an sao Tu Vi — chay lai bo ca dong bang (cases.json) voi script
an sao HIEN TAI cua tu, doi chieu tung truong. Muc dich: sau nay sua code/bang
khong duoc lam hong ket qua da kiem chung.
Chay: python3 run_regression.py   (ma thoat 0 = PASS toan bo, 1 = co ca FAIL)
Ky vong (expected) duoc dong bang tu iztro 2.6.3 ngay 24/10/2026 — KHONG tu sua
file cases.json de "cho PASS"; neu doi ky vong phai co nguon doc lap moi + ghi nhat ky.
"""
import json, sys, importlib.util, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("an_sao", HERE.parent.parent / "cong-cu" / "an_sao_tu_vi.py")
A = importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(A)
CAN = A.CAN

def can_nam(y): return CAN[(y - 4) % 10]

def main():
    doc = json.loads((HERE / "cases.json").read_text(encoding="utf-8"))
    fails = 0
    for i, c in enumerate(doc["cases"], 1):
        inp, exp = c["input"], c["expected"]
        _, mine = A.lap_la_so(inp["ngay_am"], inp["thang_am"], inp["gio"], can_nam(inp["nam_am"]), inp["gioi_tinh"])
        loc, quyen, khoa, ky = A.TU_HOA[can_nam(inp["nam_am"])]
        mine_hoa = {"Hóa Lộc": loc, "Hóa Quyền": quyen, "Hóa Khoa": khoa, "Hóa Kỵ": ky}
        problems = []
        if mine["menh"] != exp["menh"]: problems.append(f"Mệnh {mine['menh']} != {exp['menh']}")
        if mine["than"] != exp["than"]: problems.append(f"Thân {mine['than']} != {exp['than']}")
        if mine["cuc"] != exp["cuc"]: problems.append(f"Cục {mine['cuc']} != {exp['cuc']}")
        for sao, vi_tri in exp["sao"].items():
            if mine["sao"].get(sao) != vi_tri: problems.append(f"{sao}: {mine['sao'].get(sao)} != {vi_tri}")
        for hoa, sao in exp["tu_hoa"].items():
            if mine_hoa.get(hoa) != sao: problems.append(f"{hoa}: {mine_hoa.get(hoa)} != {sao}")
        if problems:
            fails += 1
            print(f"FAIL ca {i} ({inp['nam_am']}-{inp['thang_am']}-{inp['ngay_am']} {inp['gio']}): " + "; ".join(problems))
    n = len(doc["cases"])
    print(f"\nREGRESSION: {n - fails}/{n} ca PASS" + (" — TOÀN BỘ ĐẠT" if fails == 0 else f" — {fails} ca FAIL"))
    return 1 if fails else 0

if __name__ == "__main__":
    sys.exit(main())
