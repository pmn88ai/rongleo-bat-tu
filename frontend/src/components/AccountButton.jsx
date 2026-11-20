import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import './AccountButton.css';

const AccountButton = () => {
    const { user, isAuthenticated } = useAuth();
    const [showAuth, setShowAuth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    return (
        <div className="account-button-wrap">
            {isAuthenticated ? (
                <>
                    <Link to="/lich-su" className="account-history-link" title="Lịch sử xem">
                        Lịch sử
                    </Link>
                    <button
                        className="account-button"
                        onClick={() => setShowProfile(true)}
                        title="Quản lý hồ sơ"
                    >
                        <span className="account-avatar">{(user?.name || 'M').charAt(0)}</span>
                        <span className="account-name">{user?.name || 'Hồ sơ'}</span>
                    </button>
                </>
            ) : (
                <button className="account-button account-login" onClick={() => setShowAuth(true)}>
                    <span className="account-avatar">👤</span>
                    <span className="account-name">Đăng nhập</span>
                </button>
            )}

            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onSuccess={() => setShowAuth(false)}
                />
            )}
            <UserProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </div>
    );
};

export default AccountButton;
