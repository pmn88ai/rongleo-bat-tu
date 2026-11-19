import React, { forwardRef } from 'react';

/**
 * Thẻ chia sẻ "Vận hôm nay" — cùng mẫu QueShareCard, thương hiệu RongLeo.
 * Được render ẩn để html2canvas chụp thành PNG.
 */
const VanHomNayShareCard = forwardRef(({ result }, ref) => {
    if (!result) return null;

    const canChi = result.ket_qua?.[0]?.noi_dung || {};
    const thanSo = result.ket_qua?.[1]?.noi_dung || {};
    const loiNhan = result.ket_qua?.[3]?.noi_dung || {};

    return (
        <div
            ref={ref}
            className="vhn-share-card"
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                width: '420px',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #050505 0%, #15120c 50%, #050505 100%)',
                borderRadius: '16px',
                border: '2px solid #e2c044',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                fontFamily: "'Be Vietnam Pro', 'Outfit', sans-serif",
                color: '#fff'
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.8rem',
                borderBottom: '1px solid rgba(226, 192, 68, 0.3)'
            }}>
                <h3 style={{ color: '#e2c044', margin: 0, fontSize: '1rem', letterSpacing: '1px' }}>
                    ☀️ VẬN HÔM NAY
                </h3>
                <span style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.75rem' }}>
                    {result.ngay?.duong_lich}
                </span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', letterSpacing: '2px' }}>
                    CAN CHI HÔM NAY
                </div>
                <div style={{ color: '#e2c044', fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>
                    {canChi.can_chi}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {canChi.am_lich}
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.6rem',
                marginBottom: '1rem'
            }}>
                {[
                    { label: 'Năm', value: thanSo.nam_ca_nhan },
                    { label: 'Tháng', value: thanSo.thang_ca_nhan },
                    { label: 'Ngày', value: thanSo.ngay_ca_nhan }
                ].map(item => (
                    <div key={item.label} style={{
                        minWidth: '70px',
                        padding: '0.45rem 0.5rem',
                        textAlign: 'center',
                        background: 'rgba(226, 192, 68, 0.1)',
                        border: '1px solid rgba(226, 192, 68, 0.3)',
                        borderRadius: '10px'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}>
                            {item.label} cá nhân
                        </div>
                        <div style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700 }}>{item.value}</div>
                    </div>
                ))}
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                padding: '0.9rem',
                marginBottom: '0.9rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.92)',
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    textAlign: 'center'
                }}>
                    {loiNhan.cau}
                </p>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(226, 192, 68, 0.2)' }}>
                <p style={{ color: '#e2c044', margin: 0, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
                    RongLeo
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0.15rem 0 0', fontSize: '0.65rem' }}>
                    Xem vận hôm nay miễn phí • rongleo
                </p>
            </div>
        </div>
    );
});

VanHomNayShareCard.displayName = 'VanHomNayShareCard';

export default VanHomNayShareCard;
