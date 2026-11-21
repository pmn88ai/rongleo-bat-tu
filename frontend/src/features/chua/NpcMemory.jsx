import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/api';
import { getAuthHeaders } from '../../utils/getUserId';
import { formatDateTime } from '../../utils/dateUtils';
import { NPCS, npcMatches, teacherLabelForItem } from './npcTeachers';
import './NpcMemory.css';

const toParagraphs = (item) => {
    if (!item) return [];
    let answer = item.answer;

    if (typeof answer === 'string') {
        const trimmed = answer.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                answer = JSON.parse(trimmed);
            } catch (e) {
                return [answer.replace(/\\n/g, '\n').replace(/\\"/g, '"')];
            }
        } else {
            return [answer.replace(/\\n/g, '\n').replace(/\\"/g, '"')];
        }
    }

    if (Array.isArray(answer)) return answer.map((p) => String(p));

    if (answer && typeof answer === 'object') {
        if (Array.isArray(answer.answer)) return answer.answer.map((p) => String(p));
        if (typeof answer.answer === 'string') return [answer.answer];
        if (answer.assessment) {
            const lines = [];
            if (answer.assessment.title) lines.push(`**Đánh giá:** ${answer.assessment.title}`);
            if (typeof answer.totalScore === 'number') lines.push(`**Điểm tương hợp:** ${answer.totalScore}/100`);
            if (answer.assessment.summary) lines.push(answer.assessment.summary);
            if (Array.isArray(answer.advice)) {
                answer.advice.forEach((adv) => lines.push(`- ${adv.text || adv}`));
            }
            if (lines.length) return lines;
        }
        return [JSON.stringify(answer, null, 2)];
    }

    return answer ? [String(answer)] : [];
};

const pad2 = (n) => String(n).padStart(2, '0');

const NpcMemory = ({ npcId = 'chua', limit = 3, showGuestInvite = true, className = '' }) => {
    const { isAuthenticated, user, savedProfile } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openId, setOpenId] = useState(null);

    const npc = NPCS[npcId] || NPCS.chua;

    useEffect(() => {
        if (!isAuthenticated) {
            setHistory([]);
            setError(null);
            setOpenId(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetch(`${API_CONFIG.CONSULTANT}/my-history?limit=60`, {
            headers: getAuthHeaders()
        })
            .then((res) => {
                if (!res.ok) throw new Error('Không tải được lịch sử tư vấn.');
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                setHistory(Array.isArray(data.history) ? data.history : []);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || 'Không tải được lịch sử tư vấn.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, user?.id]);

    const items = useMemo(
        () => history.filter((item) => npcMatches(npcId, item)).slice(0, limit),
        [history, npcId, limit]
    );

    const displayName = (savedProfile?.name || user?.name || '').trim() || 'mệnh chủ';

    const profileLine = useMemo(() => {
        if (!savedProfile) return '';
        const parts = [];
        if (savedProfile.gender) parts.push(savedProfile.gender);
        if (savedProfile.year && savedProfile.month && savedProfile.day) {
            parts.push(`sinh ${pad2(savedProfile.day)}/${pad2(savedProfile.month)}/${savedProfile.year}`);
        } else if (savedProfile.year) {
            parts.push(`sinh năm ${savedProfile.year}`);
        }
        return parts.join(' • ');
    }, [savedProfile]);

    if (!isAuthenticated) {
        if (!showGuestInvite) return null;
        return (
            <section className={`npc-memory npc-memory--guest ${className}`}>
                <p>
                    🙏 Khách vãng lai — đăng nhập ở góc trên để các thầy nhớ con, lần sau vào chùa
                    thầy nhắc lại câu hỏi cũ.
                </p>
            </section>
        );
    }

    const openItem = items.find((item) => item.id === openId);
    const paragraphs = openItem ? toParagraphs(openItem) : [];

    return (
        <section className={`npc-memory ${className}`}>
            <div className="npc-memory-head">
                <span className="npc-memory-icon" aria-hidden="true">{npc.icon}</span>
                <div className="npc-memory-intro">
                    <p className="npc-memory-kicker">RongLeo • {npc.room}</p>
                    <h3 className="npc-memory-greeting">
                        Chào {displayName}, {npc.name} nhớ con.
                    </h3>
                    <p className="npc-memory-profile">
                        {profileLine
                            ? `Mệnh chủ: ${displayName} • ${profileLine}`
                            : `Mệnh chủ: ${displayName} • hồ sơ sinh chưa lưu`}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="npc-memory-note">Thầy đang mở sổ cũ...</p>
            ) : error ? (
                <p className="npc-memory-note npc-memory-note--error">{error}</p>
            ) : items.length > 0 ? (
                <div className="npc-memory-old">
                    <p className="npc-memory-label">Câu hỏi cũ thầy còn nhớ:</p>
                    <ul className="npc-memory-list">
                        {items.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className={`npc-memory-question ${openId === item.id ? 'active' : ''}`}
                                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                                    title={item.question_text}
                                >
                                    <span className="npc-memory-q-text">{item.question_text || 'Câu hỏi cũ'}</span>
                                    <span className="npc-memory-q-meta">
                                        {npcId === 'chua' && <span>{teacherLabelForItem(item)} • </span>}
                                        {formatDateTime(item.created_at)}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {openItem && (
                        <div className="npc-memory-answer">
                            <p className="npc-memory-answer-title">Lời thầy đã luận:</p>
                            {paragraphs.length > 0 ? (
                                paragraphs.map((para, idx) => (
                                    <div className="npc-memory-answer-para" key={idx}>
                                        <ReactMarkdown>{para}</ReactMarkdown>
                                    </div>
                                ))
                            ) : (
                                <p className="npc-memory-note">Bản lưu này không có nội dung trả lời.</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p className="npc-memory-note">Thầy chưa giữ câu hỏi cũ nào của con ở quầy này.</p>
            )}
        </section>
    );
};

export default NpcMemory;
