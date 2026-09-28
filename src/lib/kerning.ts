/**
 * The hero name is split into one span per letter for its intro animation,
 * which drops the font's kerning (e.g. "AY" is -0.145em in Kanit ExtraBold).
 * This restores it. Values are in thousandths of an em, measured from the
 * font with canvas measureText (uppercase, weight 800); pairs under 0.005em
 * are omitted. Re-measure if the display font or weight changes.
 */
const TABLE =
  "AA-35 AC-55 AG-55 AO-55 AQ-55 AS-25 AT-85 AU-45 AV-135 AW-95 AX-30 AY-145 AZ-15 BA-35 BT-25 BV-65 BW-25 BX-55 " +
  "BY-75 BZ-20 CA-20 CV-30 CX-15 CY-25 DA-55 DT-10 DV-50 DW-20 DX-65 DY-85 EV-15 EX-25 FA-60 FJ-30 FW-5 FX-25 " +
  "FY-25 FZ-15 GV-35 GY-45 HY-20 IY-20 JA-35 KA-45 KC-65 KG-65 KO-65 KQ-65 KS-35 KT-35 KU-50 KV-35 KW-30 KX-35 " +
  "KY-35 KZ-5 LC-10 LG-10 LO-10 LQ-10 LT-70 LV-125 LW-60 LX-25 LY-145 MY-20 NY-20 OA-55 OT-10 OV-50 OW-20 OX-65 " +
  "OY-85 PA-80 PJ-40 PV-45 PW-35 PX-55 PY-45 QA-55 QT-10 QV-50 QW-20 QX-65 QY-85 RA-45 RC-15 RG-15 RJ-20 RO-15 " +
  "RQ-15 RV-65 RW-30 RX-25 RY-65 SA-45 SV-45 SX-25 SY-45 TA-85 TC-10 TG-10 TJ-60 TO-10 TQ-10 TT35 TW-15 TX-25 " +
  "TY-10 TZ-15 UA-45 UX-35 UY-35 UZ-25 VA-135 VC-50 VG-50 VJ-100 VO-50 VQ-50 VS-45 VU-10 VW-35 VX-25 VY-35 VZ-25 " +
  "WA-95 WC-20 WG-20 WJ-60 WO-20 WQ-20 WS-20 WT-15 WV-35 WW-15 WX-35 WY-35 WZ-25 XA-30 XC-65 XG-65 XJ-55 XO-65 " +
  "XQ-65 XS-45 XU-25 XV-25 XW-35 XY-35 XZ-35 YA-145 YB-20 YC-85 YD-20 YE-20 YF-20 YG-85 YH-20 YI-20 YJ-120 YK-20 " +
  "YL-20 YM-20 YN-20 YO-85 YP-20 YQ-85 YR-20 YS-65 YT-25 YV-35 YW-35 YX-35 YY-35 YZ-35 ZA-25 ZV-25 ZW-35 ZX-35 " +
  "ZY-25 ZZ-15";

const PAIRS = new Map(TABLE.split(" ").map((entry) => [entry.slice(0, 2), Number(entry.slice(2)) / 1000]));

/** Kerning (in em) to add before `right` when it follows `left`. */
export const kern = (left: string, right: string) => PAIRS.get((left + right).toUpperCase()) ?? 0;
