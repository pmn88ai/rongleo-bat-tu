#!/usr/bin/env python3
"""
An sao Tu Vi (chinh tinh) - theo bang da cong bo (thayphucloc.com / thayhungtuvi.com,
trich cach an sao truyen thong) + cong thuc an Menh/Than + Ngu Ho Don.
Phạm vi: Menh/Than, Cuc, 14 chinh tinh, Tu Hoa. CHUA co: phu tinh, Tuan/Triet, do sang sao.
Dung: python3 an_sao_tu_vi.py 21 2 Ngo Mau nam
     (ngay am, thang am, gio Chi, Can nam, gioi tinh)
"""
import sys

CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"]
CAN = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"]

# Bang vi tri sao Tu Vi theo (cuc so, ngay am 1-30) - bang cong bo, 2 nguon trung nhau.
# Cuc: 2 Thuy, 3 Moc, 4 Kim, 5 Tho, 6 Hoa. Moi dong la 1 cuc, 30 ngay.
BANG_TU_VI = {
2: "Sửu Dần Dần Mão Mão Thìn Thìn Tỵ Tỵ Ngọ Ngọ Mùi Mùi Thân Thân Dậu Dậu Tuất Tuất Hợi Hợi Tý Tý Sửu Sửu Dần Dần Mão Mão Thìn".split(),
3: "Thìn Sửu Dần Tỵ Dần Mão Ngọ Mão Thìn Mùi Thìn Tỵ Thân Tỵ Ngọ Dậu Ngọ Mùi Tuất Mùi Thân Hợi Thân Dậu Tý Dậu Tuất Sửu Tuất Hợi".split(),
4: "Hợi Thìn Sửu Dần Tý Tỵ Dần Mão Sửu Ngọ Mão Thìn Dần Mùi Thìn Tỵ Mão Thân Tỵ Ngọ Thìn Dậu Ngọ Mùi Tỵ Tuất Mùi Thân Ngọ Hợi".split(),
5: "Ngọ Hợi Thìn Sửu Dần Mùi Tý Tỵ Dần Mão Thân Sửu Ngọ Mão Thìn Dậu Dần Mùi Thìn Tỵ Tuất Mão Thân Tỵ Ngọ Hợi Thìn Dậu Ngọ Mùi".split(),
6: "Dậu Ngọ Hợi Thìn Sửu Dần Tuất Mùi Tý Tỵ Dần Mão Hợi Thân Sửu Ngọ Mão Thìn Tý Dậu Dần Mùi Thìn Tỵ Sửu Tuất Mão Thân Tỵ Ngọ".split(),
}
NAP_AM_60 = ["Hải Trung Kim","Lư Trung Hỏa","Đại Lâm Mộc","Lộ Bàng Thổ","Kiếm Phong Kim","Sơn Đầu Hỏa",
"Giản Hạ Thủy","Thành Đầu Thổ","Bạch Lạp Kim","Dương Liễu Mộc","Tuyền Trung Thủy","Ốc Thượng Thổ",
"Tích Lịch Hỏa","Tùng Bách Mộc","Trường Lưu Thủy","Sa Trung Kim","Sơn Hạ Hỏa","Bình Địa Mộc",
"Bích Thượng Thổ","Kim Bạch Kim","Phú Đăng Hỏa","Thiên Hà Thủy","Đại Trạch Thổ","Thoa Xuyến Kim",
"Tang Đố Mộc","Đại Khê Thủy","Sa Trung Thổ","Thiên Thượng Hỏa","Thạch Lựu Mộc","Đại Hải Thủy"]
def nap_am(can, chi):
    # tim idx hoa giap: idx%10 = can idx, idx%12 = chi idx
    ci, hi = CAN.index(can), CHI.index(chi)
    for idx in range(60):
        if idx % 10 == ci and idx % 12 == hi:
            return NAP_AM_60[idx // 2]
    raise ValueError("Can Chi khong hop hoa giap")
CUC_SO = {"Thủy":2,"Mộc":3,"Kim":4,"Thổ":5,"Hỏa":6}
def hanh_cua_nap_am(na):
    for h in ["Kim","Mộc","Thủy","Hỏa","Thổ"]:
        if na.rstrip().endswith(h) or (" "+h) in na: return h
    # nap am luon ket thuc bang hanh
    return na.split()[-1]

NGU_HO_DON = {"Giáp":"Bính","Kỷ":"Bính","Ất":"Mậu","Canh":"Mậu","Bính":"Canh","Tân":"Canh","Đinh":"Nhâm","Nhâm":"Nhâm","Mậu":"Giáp","Quý":"Giáp"}
TU_HOA = {  # can nam: (Loc, Quyen, Khoa, Ky)
"Giáp":("Liêm Trinh","Phá Quân","Vũ Khúc","Thái Dương"),"Ất":("Thiên Cơ","Thiên Lương","Tử Vi","Thái Âm"),
"Bính":("Thiên Đồng","Thiên Cơ","Văn Xương","Liêm Trinh"),"Đinh":("Thái Âm","Thiên Đồng","Thiên Cơ","Cự Môn"),
"Mậu":("Tham Lang","Thái Âm","Hữu Bật","Thiên Cơ"),"Kỷ":("Vũ Khúc","Tham Lang","Thiên Lương","Văn Khúc"),
"Canh":("Thái Dương","Vũ Khúc","Thái Âm","Thiên Đồng"),"Tân":("Cự Môn","Thái Dương","Văn Khúc","Văn Xương"),
"Nhâm":("Thiên Lương","Tử Vi","Tả Phụ","Vũ Khúc"),"Quý":("Phá Quân","Cự Môn","Thái Âm","Tham Lang")}
# TU_HOA da chot 24/10/2026 (Leo duyet): ban MAC DINH = ban pho bien (Tu Vi Dau So Toan Tap / Kham Thien,
# khop iztro + tuvigiaimenh + giaithan + tracuutuvi). Rieng Quy-Hoa Khoa: ban cu ghi Thai Duong la SAI (khong
# tim duoc nguon xuat ban nao ghi nhan) -> da sua thanh Thai Am, ghi vet trong NHAT_KY.
# DI BAN co nguon (khong dung mac dinh, chi ghi nhan): ban Toan Thu - Canh: Khoa=Thien Dong, Ky=Thai Am;
# Nham: Khoa=Thien Phu; Mau: Khoa=Thai Duong (mot so sach Trung Chau). Khong tron hai ban khi luan.

def an_menh_than(thang, gio_chi):
    g = CHI.index(gio_chi)
    menh = (2 + (thang - 1) - g) % 12
    than = (2 + (thang - 1) + g) % 12
    return menh, than

def can_cung(can_nam, chi_idx):
    start = CAN.index(NGU_HO_DON[can_nam])  # can cua cung Dan (idx 2)
    steps = (chi_idx - 2) % 12
    return CAN[(start + steps) % 10]

def lap_la_so(ngay, thang, gio_chi, can_nam, gioi_tinh):
    menh_i, than_i = an_menh_than(thang, gio_chi)
    can_menh = can_cung(can_nam, menh_i)
    na = nap_am(can_menh, CHI[menh_i])
    hanh = hanh_cua_nap_am(na)
    cuc = CUC_SO[hanh]
    tu_vi_chi = BANG_TU_VI[cuc][ngay - 1]
    tv = CHI.index(tu_vi_chi)
    sao = {}
    # Vong Tu Vi (thuan, theo cach dem cua nguon): tu Tu Vi cach 3 -> Liem Trinh, cach 2 -> Thien Dong,
    # lien tiep Vu Khuc, Thai Duong, cach 1 -> Thien Co
    sao["Tử Vi"] = tv
    sao["Liêm Trinh"] = (tv + 4) % 12
    sao["Thiên Đồng"] = (sao["Liêm Trinh"] + 3) % 12
    sao["Vũ Khúc"] = (sao["Thiên Đồng"] + 1) % 12
    sao["Thái Dương"] = (sao["Vũ Khúc"] + 1) % 12
    sao["Thiên Cơ"] = (sao["Thái Dương"] + 2) % 12
    # Thien Phu doi xung Tu Vi qua truc Dan-Than (hai dau truc co dinh): x' = (4 - x) mod 12
    # Kiem chung: Tu Vi Ty -> Phu Thin; Tu Vi Than -> Phu Than (dong cung, dung quy tac Dan/Than)
    phu = (4 - tv) % 12
    sao["Thiên Phủ"] = phu
    for i, ten in enumerate(["Thái Âm","Tham Lang","Cự Môn","Thiên Tướng","Thiên Lương","Thất Sát"]):
        sao[ten] = (phu + 1 + i) % 12
    sao["Phá Quân"] = (phu + 10) % 12
    # 12 cung chuc nang tu Menh, di nguoc chieu dia chi
    cung_cn = ["Mệnh","Phụ Mẫu","Phúc Đức","Điền Trạch","Quan Lộc","Nô Bộc","Thiên Di","Tật Ách","Tài Bạch"," Tử Tức".strip(),"Phu Thê","Huynh Đệ"]
    bang_cung = {}
    for k, ten in enumerate(cung_cn):
        bang_cung[(menh_i - k) % 12] = ten
    loc, quyen, khoa, ky = TU_HOA[can_nam]
    hoa = {loc:"Hóa Lộc", quyen:"Hóa Quyền", khoa:"Hóa Khoa", ky:"Hóa Kỵ"}
    out = []
    out.append(f"Mệnh tại {CHI[menh_i]} ({can_menh} {CHI[menh_i]} — nạp âm {na}), Thân tại {CHI[than_i]}" + (" — Mệnh Thân đồng cung" if menh_i == than_i else ""))
    out.append(f"Cục: {hanh} {'nhị' if cuc==2 else 'tam' if cuc==3 else 'tứ' if cuc==4 else 'ngũ' if cuc==5 else 'lục'} cục ({cuc})")
    out.append(f"Tứ Hóa năm {can_nam}: Lộc={loc}, Quyền={quyen}, Khoa={khoa}, Kỵ={ky}")
    out.append("Chính tinh theo cung chức năng:")
    for chi_i in range(12):
        ten_cung = bang_cung.get(chi_i, "?")
        cac_sao = [s + (f" [{hoa[s]}]" if s in hoa else "") for s, vi in sao.items() if vi == chi_i]
        if cac_sao:
            out.append(f"  {ten_cung} ({CHI[chi_i]}): {', '.join(cac_sao)}")
    return "\n".join(out), {"menh": CHI[menh_i], "than": CHI[than_i], "cuc": cuc, "tu_vi": tu_vi_chi, "sao": {k: CHI[v] for k, v in sao.items()}}

def _test():
    # Ca 1: Leo - sinh 21/2 am, gio Ngo, nam Mau -> Menh Dau dong Than, Moc tam cuc, Tu Vi Than, Thai Am o Menh (Dau)
    _, r = lap_la_so(21, 2, "Ngọ", "Mậu", "nam")
    assert r["menh"] == "Dậu" and r["than"] == "Dậu" and r["cuc"] == 3 and r["tu_vi"] == "Thân", r
    assert r["sao"]["Thái Âm"] == "Dậu" and r["sao"]["Thiên Phủ"] == "Thân" and r["sao"]["Tử Vi"] == "Thân", r
    # Ca 2-4: cac ca Menh-Than dong cung theo tuvi.cohoc.net
    for thang, gio, ky_vong in [(2,"Tý","Mão"),(8,"Ngọ","Mão"),(8,"Tý","Dậu"),(1,"Tý","Dần")]:
        m, t = an_menh_than(thang, gio)
        assert CHI[m] == ky_vong and CHI[t] == ky_vong, (thang, gio, CHI[m])
    # Ca 5: bang Tu Vi - diem neo da cong bo
    assert BANG_TU_VI[2][0] == "Sửu" and BANG_TU_VI[6][5] == "Dần" and BANG_TU_VI[3][20] == "Thân" and BANG_TU_VI[5][4] == "Dần" and BANG_TU_VI[4][29] == "Hợi"
    print("TAT CA KIEM THU DAT")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        _test()
    elif len(sys.argv) == 6:
        ngay, thang, gio, can_nam, gt = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
        txt, _ = lap_la_so(ngay, thang, gio, can_nam, gt)
        print(txt)
        print("(Chưa gồm: sao phụ, Tuần/Triệt, độ sáng sao — thuộc đợt kiểm chứng tiếp theo.)")
    else:
        print("Dung: an_sao_tu_vi.py NGAY THANG GIO_CHI CAN_NAM GIOI_TINH | hoac: an_sao_tu_vi.py test")
