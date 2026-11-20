import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/common/SEO';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import './index.css';
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
import PDFExportButton from './components/PDFExportButton';
import ImageExportButton from './components/ImageExportButton';
import ComprehensiveInterpretation from './components/ComprehensiveInterpretation';
import MobileShell from './components/MobileShell';
import DesktopShell from './components/DesktopShell';
import useWindowSize from './hooks/useWindowSize';
import { useBaziApi } from './hooks/useBaziApi';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import MusicPlayer from './components/MusicPlayer';

// Input Page Component
const InputPage = ({ onAnalyze, loading }) => {
  const navigate = useNavigate();
  const { isAuthenticated, updateProfile } = useAuth();

  const handleAnalyze = async (params) => {
    const result = await onAnalyze(params);
    if (result) {
      // Người đã đăng nhập: lưu hồ sơ để các quầy tự điền lần sau
      if (isAuthenticated && params.year && params.month && params.day) {
        updateProfile({
          name: params.name || '',
          baziData: {
            year: parseInt(params.year),
            month: parseInt(params.month),
            day: parseInt(params.day),
            hour: parseInt(params.hour) || 0,
            minute: parseInt(params.minute) || 0,
            gender: params.gender || 'Nam',
            calendar: params.calendar || 'solar'
          }
        }).catch(() => {});
      }
      // Navigate to chart page, preserving the query params updated by useBaziApi
      navigate({
        pathname: '/laso',
        search: window.location.search
      });
    }
  };

  return <BirthInput onAnalyze={handleAnalyze} loading={loading} />;
};

// Chart Page Content
const ChartPage = ({ data, isMobile }) => {
  const elementScores = data?.diem_so?.ngu_hanh_vn;

  return (
    <div className="tab-pane fade-in chart-page">
      <div className="chart-actions-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isMobile && (
            <Link to={{ pathname: '/vanhan', search: window.location.search }} className="btn-vanhan-inline">
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
  const { data, inputParams, loading, error, analyze, clearData } = useBaziApi();
  const { savedProfile } = useAuth();
  const { isMobile } = useWindowSize();
  const location = useLocation();
  const navigate = useNavigate();

  const hasSavedProfile = !!(savedProfile && savedProfile.year && savedProfile.month && savedProfile.day);
  const effectiveUserData = inputParams || (hasSavedProfile ? savedProfile : null);

  // If we have data and we're on home page, redirect to chart preserving params
  // But skip if there's a pending question from suggestions
  // Redirect to chart disabled to keep InputForm as homepage
  /*
  useEffect(() => {
    const hasPendingQuestion = localStorage.getItem('pending_question');
    if (data && (location.pathname === '/' || location.pathname === '/input') && !hasPendingQuestion) {
      navigate({
        pathname: '/laso',
        search: location.search
      }, { replace: true });
    }
  }, [data, location.pathname, navigate, location.search]);
  */

  const hasData = data !== null;
  const searchParams = new URLSearchParams(location.search);
  const isRecovering = !hasData && searchParams.get('year') && searchParams.get('month') && searchParams.get('day');

  // Render content based on route
  const renderPageContent = (PageComponent, props = {}, options = {}) => {
    if (loading || isRecovering) {
      return <LoadingOverlay />;
    }
    // Allow consultant page if there's pending question from suggestion click
    const hasPendingQuestion = localStorage.getItem('pending_question');
    const canUseProfile = options.allowProfile && hasSavedProfile;
    if (!hasData && !hasPendingQuestion && !canUseProfile) {
      return <Navigate to="/" replace />;
    }
    return <PageComponent {...props} />;
  };

  const Shell = isMobile ? MobileShell : DesktopShell;
  const isTempleRoute = location.pathname === '/chanh-dien' || location.pathname === '/vuon-tinh-tam';

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
        <div className="bazi-bg"></div>

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

        <Routes>
          {/* Input form routes */}
          <Route path="/" element={<InputPage onAnalyze={analyze} loading={loading} />} />
          <Route path="/input" element={<Navigate to="/" replace />} />

          {/* Chart page */}
          <Route path="/laso" element={renderPageContent(ChartPage, { data, isMobile })} />

          {/* Analysis pages */}
          <Route path="/phantich" element={renderPageContent(MatrixAnalysis, { data })} />
          <Route path="/xemngay" element={renderPageContent(PersonalizedDate, { data, userData: effectiveUserData }, { allowProfile: true })} />
          <Route path="/chonngay" element={renderPageContent(AuspiciousDatePicker, { userData: effectiveUserData }, { allowProfile: true })} />
          <Route path="/tuvan" element={renderPageContent(ConsultantPage, { userData: effectiveUserData }, { allowProfile: true })} />
          <Route path="/vanhan" element={renderPageContent(LuckCycles, { data })} />
          <Route path="/dientich" element={renderPageContent(ClassicTexts, { data })} />

          {/* Matching page - uses current userData as person1 */}
          <Route path="/duyenso" element={<MatchingPage userData={inputParams} />} />

          {/* Xin Que page */}
          <Route path="/xinque" element={renderPageContent(QuePage, { userData: effectiveUserData }, { allowProfile: true })} />

          {/* Western Astrology page - renders standalone with its own fallback UI */}
          <Route path="/tuviphuongtay" element={<WesternPage userData={inputParams} />} />

          {/* Vận hôm nay - miễn phí, không cần dữ liệu lá số */}
          <Route path="/van-hom-nay" element={<VanHomNayPage />} />

          {/* Tử vi - an sao theo ngày âm + giờ Chi + Can năm */}
          <Route path="/tuvi" element={<TuViPage />} />

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
      <MusicPlayerProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </MusicPlayerProvider>
    </AuthProvider>
  );
};

export default App;
