import React, { useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/common/SEO';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import './index.css';
import HomePage from './features/Homepage/HomePage';
import TraCuuPage from './features/Homepage/TraCuuPage';
import BirthInput from './features/Homepage/BirthInput';
import BaziChart from './features/BaziChart/BaziChart';
import RelationshipRadar from './features/BaziChart/RelationshipRadar';
import ChartDetails from './features/BaziChart/ChartDetails';
import LuckCycles from './features/LuckCycles/LuckCycles';
import MatrixAnalysis from './features/Interpretation/MatrixAnalysis';
import ClassicTexts from './features/Interpretation/ClassicTexts';
import PersonalizedDate from './features/DateSelection/PersonalizedDate';
import AuspiciousDatePicker from './features/DateSelection/AuspiciousDatePicker';
import ConsultantPage from './features/Consultant/ConsultantPage';
import AdminPage from './features/Admin/AdminPage';
import ArticlePage from './features/Articles/ArticlePage';
import MatchingPage from './features/Matching/MatchingPage';
import HistoryPage from './features/ConsultationHistory/HistoryPage';
import QuePage from './features/Que/QuePage';
import WesternPage from './features/WesternAstrology/WesternPage';
import VanHomNayPage from './features/van_hom_nay/VanHomNayPage';
import TuViPage from './features/tu_vi/TuViPage';
import ChuaPage from './features/chua/ChuaPage';
import ChanhDienPage from './features/chua/ChanhDienPage';
import VuonTinhTamPage from './features/chua/VuonTinhTamPage';
import ImageExportButton from './components/ImageExportButton';
import ComprehensiveInterpretation from './components/ComprehensiveInterpretation';
import MobileShell from './components/MobileShell';
import DesktopShell from './components/DesktopShell';
import useWindowSize from './hooks/useWindowSize';
import { useBaziApi } from './hooks/useBaziApi';
import { AuthProvider } from './context/AuthContext';
import { MenhProfileProvider, useMenhProfile, profileSignature } from './context/MenhProfileContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import MusicPlayer from './components/MusicPlayer';
import { getRoomByPath } from './config/rooms';

// Hồ sơ mệnh Page — chính là form nhập bát tự hiện tại, lưu một lần dùng chung.
const ProfilePage = ({ onAnalyze, loading }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveProfile } = useMenhProfile();
  const next = searchParams.get('next') || '/tra-cuu';

  const handleSave = async (params) => {
    const saved = saveProfile(params);
    if (!saved) return;
    navigate(next, { replace: true });
  };

  return <BirthInput onAnalyze={handleSave} loading={loading} profileMode />;
};

// Chart Page Content
const ChartPage = ({ data, isMobile }) => {
  const elementScores = data?.diem_so?.ngu_hanh_vn;

  return (
    <div className="tab-pane fade-in chart-page">
      <div className="chart-actions-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isMobile && (
            <Link to="/vanhan" className="btn-vanhan-inline">
              📈 Vận Hạn
            </Link>
          )}
        </div>
        <div className="chart-actions-right">
          {/* {!isMobile && <PDFExportButton data={data} />} */}
          <ImageExportButton data={data} />
          <ComprehensiveInterpretation data={data} />
        </div>
      </div>

      <div className="chart-top-row">
        <div className="glass-card chart-info-card">
          <ChartDetails data={data} />
        </div>
        <div className="glass-card radar-card">
          <h4 className="radar-title">NGŨ HÀNH</h4>
          {elementScores && <RelationshipRadar scores={elementScores} />}
        </div>
      </div>

      <BaziChart data={data} isMobile={isMobile} />
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlay = () => (
  <div className="loading-overlay glass-card">Đang tải dữ liệu...</div>
);

// Main App Component
const AppContent = () => {
  const { data, loading, error, analyze, clearData } = useBaziApi();
  const { profile, hasProfile } = useMenhProfile();
  const { isMobile } = useWindowSize();
  const location = useLocation();
  const analyzedSigRef = useRef('');

  const profileParams = profile ? {
    name: profile.name || '',
    gender: profile.gender || 'Nam',
    year: profile.year,
    month: profile.month,
    day: profile.day,
    hour: profile.hour ?? 0,
    minute: profile.minute ?? 0,
    calendar: profile.calendar || 'solar'
  } : null;

  const searchParams = new URLSearchParams(location.search);
  const urlHasBirthParams = !!(searchParams.get('year') && searchParams.get('month') && searchParams.get('day'));
  const hasData = data !== null;
  const isRecovering = !hasData && urlHasBirthParams;
  const needsChart = ['/laso', '/phantich', '/vanhan', '/dientich'].includes(location.pathname);

  // Hồ sơ mệnh là nguồn duy nhất: tự dựng lá số một lần cho các mục cần dữ liệu.
  useEffect(() => {
    if (!needsChart || !hasProfile || loading || urlHasBirthParams) return;
    const sig = profileSignature(profile);
    if (!sig) return;
    if (hasData && sessionStorage.getItem('bazi_profile_sig') === sig) return;
    if (analyzedSigRef.current === sig) return;
    analyzedSigRef.current = sig;
    analyze(profileParams, false).then((result) => {
      if (result) {
        try { sessionStorage.setItem('bazi_profile_sig', sig); } catch (e) { /* ignore */ }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsChart, hasProfile, profile, hasData, loading, urlHasBirthParams, analyze]);

  const backToProfile = (path) => (
    <Navigate to={`/ho-so-menh?next=${encodeURIComponent(path)}`} replace />
  );

  // Trang chỉ cần hồ sơ mệnh (không cần lá số đã phân tích).
  const requireProfile = (element) => {
    if (!hasProfile) return backToProfile(location.pathname);
    return element;
  };

  // Trang cần lá số đã phân tích từ hồ sơ mệnh.
  const renderDataPage = (PageComponent, props = {}) => {
    if (!hasProfile) return backToProfile(location.pathname);
    if (loading || isRecovering || !hasData) {
      if (error && !hasData && !loading) {
        return (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p>⚠️ Không dựng được lá số từ hồ sơ mệnh: {error}</p>
            <Link to="/ho-so-menh" className="premium-button small">Sửa hồ sơ mệnh</Link>
          </div>
        );
      }
      return <LoadingOverlay />;
    }
    return <PageComponent {...props} />;
  };

  const Shell = isMobile ? MobileShell : DesktopShell;
  const isTempleRoute = location.pathname === '/chanh-dien' || location.pathname === '/vuon-tinh-tam';
  const room = getRoomByPath(location.pathname);

  // Admin page renders standalone without Shell
  if (location.pathname.startsWith('/admin')) {
    return (
      <>
        <div className="bazi-bg"></div>
        <AdminPage />
      </>
    );
  }

  return (
    <HelmetProvider>
      <Shell hasData={hasData} onClearData={clearData}>
        <SEO
          title={hasData ? "Luận Giải Chi Tiết" : "Mệnh Lý AI - Trang Chủ"}
          url={location.pathname}
        />
        {room ? (
          <div
            className="room-bg"
            style={{ backgroundImage: `url(${room.image})`, '--room-accent': room.accent }}
            aria-hidden="true"
          />
        ) : (
          <div className="bazi-bg"></div>
        )}

        {!isTempleRoute && location.pathname !== '/van-hom-nay' && (
          <Link to="/van-hom-nay" className="vhn-fab" title="Vận hôm nay — miễn phí">
            ☀️ VẬN HÔM NAY
          </Link>
        )}

        {!isTempleRoute && location.pathname !== '/tuvi' && (
          <Link to="/tuvi" className="tuv-fab" title="Tử vi — an sao">
            🔮 TỬ VI
          </Link>
        )}

        <div
          className={`room-scope ${room ? 'room-scope--active' : ''}`}
          style={room ? { '--accent-gold': room.accent, '--accent-gold-glow': room.glow } : undefined}
        >
          {room && (
            <div className="room-ribbon" style={{ '--room-accent': room.accent }}>
              <span className="room-ribbon-icon" aria-hidden="true">{room.icon}</span>
              <span className="room-ribbon-name">{room.title}</span>
              <span className="room-ribbon-sep" aria-hidden="true">•</span>
              <span className="room-ribbon-text">Phòng tra cứu dùng chung hồ sơ mệnh</span>
            </div>
          )}

          <Routes>
            {/* Hai cửa vào */}
            <Route path="/" element={<HomePage />} />
            <Route path="/input" element={<Navigate to="/" replace />} />

            {/* Hồ sơ mệnh — nhập một lần */}
            <Route path="/ho-so-menh" element={<ProfilePage onAnalyze={analyze} loading={loading} />} />
            <Route path="/tra-cuu" element={<TraCuuPage />} />

            {/* Chart page */}
            <Route path="/laso" element={renderDataPage(ChartPage, { data, isMobile })} />

            {/* Analysis pages */}
            <Route path="/phantich" element={renderDataPage(MatrixAnalysis, { data })} />
            <Route path="/xemngay" element={requireProfile(<PersonalizedDate data={data} userData={profileParams} />)} />
            <Route path="/chonngay" element={requireProfile(<AuspiciousDatePicker userData={profileParams} />)} />
            <Route path="/tuvan" element={requireProfile(<ConsultantPage userData={profileParams} />)} />
            <Route path="/vanhan" element={renderDataPage(LuckCycles, { data })} />
            <Route path="/dientich" element={renderDataPage(ClassicTexts, { data })} />

            {/* Matching page - dùng hồ sơ mệnh chung làm person1 */}
            <Route path="/duyenso" element={requireProfile(<MatchingPage userData={profileParams} />)} />

            {/* Xin Que page */}
            <Route path="/xinque" element={requireProfile(<QuePage userData={profileParams} />)} />

            {/* Western Astrology page - đọc hồ sơ mệnh chung */}
            <Route path="/tuviphuongtay" element={requireProfile(<WesternPage userData={profileParams} />)} />

            {/* Vận hôm nay - đọc hồ sơ mệnh chung để tự điền */}
            <Route path="/van-hom-nay" element={requireProfile(<VanHomNayPage />)} />

            {/* Tử vi - an sao theo ngày âm + giờ Chi + Can năm */}
            <Route path="/tuvi" element={requireProfile(<TuViPage />)} />

            {/* Bản đồ chùa - mặt tiền mới, không cần dữ liệu lá số */}
            <Route path="/chua" element={<ChuaPage />} />

            {/* Không gian tĩnh tâm - không cần dữ liệu lá số */}
            <Route path="/chanh-dien" element={<ChanhDienPage />} />
            <Route path="/vuon-tinh-tam" element={<VuonTinhTamPage />} />

            {/* History page - Standalone */}
            <Route path="/lich-su" element={<HistoryPage />} />

            {/* Article page - standalone, no data required */}
            <Route path="/bai-viet/:slug" element={<ArticlePage />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {error && (
          <div className="error-toast glass-card">
            ⚠️ Lỗi: {error}
          </div>
        )}

        <MusicPlayer />
      </Shell>
    </HelmetProvider>
  );
};

// Root App with Router
const App = () => {
  return (
    <AuthProvider>
      <MenhProfileProvider>
        <MusicPlayerProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </MusicPlayerProvider>
      </MenhProfileProvider>
    </AuthProvider>
  );
};

export default App;
