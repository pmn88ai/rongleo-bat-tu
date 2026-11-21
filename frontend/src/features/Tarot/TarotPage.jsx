import React, { useCallback, useMemo, useState } from 'react';
import { TAROT_CARDS } from '../../data/tarotCards';
import PrintResultButton from '../../components/PrintResultButton';
import './TarotPage.css';

const MODES = [
    {
        id: 'single',
        label: 'Rút 1 lá',
        hint: 'Một câu hỏi nhanh — một lá bài trả lời.'
    },
    {
        id: 'three',
        label: 'Trải 3 lá',
        hint: 'Quá khứ — Hiện tại — Tương lai.'
    }
];

const THREE_POSITIONS = ['Quá khứ', 'Hiện tại', 'Tương lai'];

// Tarot rút bài vốn ngẫu nhiên (khác gieo quẻ theo giờ): xáo 78 lá,
// lấy không trùng trong cùng một trải, rồi tung đồng xu xuôi/ngược 50/50.
const shuffle = (cards) => {
    const pool = cards.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
};

const drawCards = (mode) => {
    const count = mode === 'three' ? 3 : 1;
    const picked = shuffle(TAROT_CARDS).slice(0, count);
    return picked.map((card, index) => ({
        card,
        reversed: Math.random() < 0.5,
        position: mode === 'three' ? THREE_POSITIONS[index] : 'Lá chủ đạo'
    }));
};

const KeywordChips = ({ keywords }) => {
    if (!keywords || keywords.length === 0) return null;
    return (
        <div className="tarot-keywords">
            {keywords.map((keyword) => (
                <span key={keyword} className="tarot-keyword">{keyword}</span>
            ))}
        </div>
    );
};

const CardVisual = ({ item, index, compact = false }) => {
    const { card, reversed, position } = item;
    return (
        <figure
            className={`tarot-card ${reversed ? 'is-reversed' : ''} ${compact ? 'tarot-card--compact' : ''}`}
            style={{ '--deal-index': index }}
        >
            <div className="tarot-card-frame">
                <img
                    className="tarot-card-img"
                    src={card.image}
                    alt={`${card.nameVi} (${card.nameEn})${reversed ? ' — ngược' : ' — xuôi'}`}
                    loading="lazy"
                />
                <span className={`tarot-orientation ${reversed ? 'is-reversed' : ''}`}>
                    {reversed ? 'Ngược' : 'Xuôi'}
                </span>
            </div>
            <figcaption>
                <span className="tarot-position">{position}</span>
                <strong className="tarot-card-name">{card.nameVi}</strong>
                <span className="tarot-card-name-en">{card.nameEn}</span>
                <span className="tarot-card-group">{card.groupLabel}</span>
            </figcaption>
        </figure>
    );
};

const MeaningBlock = ({ item }) => {
    const { card, reversed } = item;
    const simpleMeaning = reversed ? card.giaiThichNguoc : card.giaiThichXuoi;
    return (
        <article className="tarot-result">
            <header className="tarot-result-header">
                <div>
                    <span className="tarot-result-position">{item.position}</span>
                    <h2>{card.nameVi}</h2>
                    <p className="tarot-result-en">{card.nameEn} · {card.groupLabel}</p>
                </div>
                <span className={`tarot-result-orientation ${reversed ? 'is-reversed' : ''}`}>
                    {reversed ? 'Chiều ngược' : 'Chiều xuôi'}
                </span>
            </header>

            <div className={`tarot-simple ${reversed ? 'is-reversed' : 'is-upright'}`}>
                <span className="tarot-simple-label">Hiểu đơn giản là:</span>
                <p>{simpleMeaning}</p>
            </div>

            <div className={`tarot-meaning-block ${reversed ? 'is-dimmed' : 'is-active'}`}>
                <span className="tarot-meaning-label">
                    Nghĩa xuôi {!reversed && <em>· lá đang rút được</em>}
                </span>
                <p>{card.upright}</p>
                <KeywordChips keywords={card.uprightKeywords} />
            </div>

            <div className={`tarot-meaning-block ${reversed ? 'is-active' : 'is-dimmed'}`}>
                <span className="tarot-meaning-label">
                    Nghĩa ngược {reversed && <em>· lá đang rút được</em>}
                </span>
                <p>{card.reversed}</p>
                <KeywordChips keywords={card.reversedKeywords} />
            </div>

            {card.extra && (
                <details className="tarot-extra-details">
                    <summary className="tarot-extra-summary">Đọc thêm — dành cho người rành bài</summary>
                    <div className="tarot-meaning-block tarot-meaning-extra">
                        <span className="tarot-meaning-label">Ý nghĩa bổ sung (§4 Waite)</span>
                        <p>{card.extra}</p>
                    </div>
                </details>
            )}
        </article>
    );
};

const TarotPage = () => {
    const [mode, setMode] = useState('single');
    const [question, setQuestion] = useState('');
    const [result, setResult] = useState([]);
    const [round, setRound] = useState(0);

    const activeMode = useMemo(
        () => MODES.find((item) => item.id === mode) || MODES[0],
        [mode]
    );

    const handleModeChange = useCallback((nextMode) => {
        setMode(nextMode);
        setResult([]);
    }, []);

    const handleDraw = useCallback(() => {
        setResult(drawCards(mode));
        setRound((value) => value + 1);
        window.setTimeout(() => {
            document.getElementById('tarot-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
    }, [mode]);

    return (
        <div className="tarot-page fade-in">
            <header className="tarot-hero glass-card">
                <span className="tarot-kicker">TAROT · RIDER–WAITE–SMITH</span>
                <h1 className="tarot-title">Rút Bài Tarot</h1>
                <p className="tarot-subtitle">
                    Tĩnh tâm nghĩ về điều đang băn khoăn, rồi rút một lá hoặc trải ba lá.
                </p>
                <p className="tarot-note">
                    Tarot rút bài vốn <strong>ngẫu nhiên</strong> — khác với gieo quẻ theo mệnh/giờ.
                    Mỗi lần rút, hệ thống xáo đủ 78 lá, chọn lá không trùng trong cùng một trải
                    và ngẫu nhiên chiều xuôi/ngược (50/50).
                </p>
            </header>

            <section className="tarot-controls glass-card" aria-label="Chọn kiểu rút bài">
                <div className="tarot-modes" role="tablist" aria-label="Kiểu rút">
                    {MODES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={mode === item.id}
                            className={`tarot-mode ${mode === item.id ? 'is-active' : ''}`}
                            onClick={() => handleModeChange(item.id)}
                        >
                            <span className="tarot-mode-label">{item.label}</span>
                            <span className="tarot-mode-hint">{item.hint}</span>
                        </button>
                    ))}
                </div>

                <label className="tarot-question">
                    <span>Câu hỏi của bạn (không bắt buộc)</span>
                    <input
                        type="text"
                        value={question}
                        maxLength={160}
                        placeholder="Ví dụ: Công việc sắp tới nên chú ý điều gì?"
                        onChange={(event) => setQuestion(event.target.value)}
                    />
                </label>

                <div className="tarot-actions">
                    <button type="button" className="tarot-draw-btn" onClick={handleDraw}>
                        {mode === 'three' ? 'Trải 3 lá' : 'Rút 1 lá'}
                    </button>
                    {result.length > 0 && (
                        <button type="button" className="tarot-redraw-btn" onClick={handleDraw}>
                            Rút lại
                        </button>
                    )}
                </div>
            </section>

            {result.length === 0 ? (
                <section className="tarot-empty glass-card" aria-label="Hướng dẫn rút bài">
                    <div className="tarot-empty-deck" aria-hidden="true">
                        <span className="tarot-empty-card" />
                        <span className="tarot-empty-card" />
                        <span className="tarot-empty-card" />
                    </div>
                    <p>
                        Chọn <strong>{activeMode.label}</strong> rồi bấm nút phía trên.
                        {question.trim() && <> Đang giữ câu hỏi: <em>“{question.trim()}”</em>.</>}
                    </p>
                </section>
            ) : (
                <section id="tarot-results" className="tarot-results print-area" aria-live="polite">
                    <div className="tarot-print-bar print-hide">
                        <PrintResultButton />
                    </div>
                    {question.trim() && (
                        <p className="tarot-question-echo glass-card">
                            Câu hỏi: <em>“{question.trim()}”</em>
                        </p>
                    )}

                    <div className={`tarot-spread ${mode === 'three' ? 'tarot-spread--three' : 'tarot-spread--single'}`}>
                        {result.map((item, index) => (
                            <CardVisual
                                key={`${round}-${item.card.id}-${index}`}
                                item={item}
                                index={index}
                                compact={mode === 'three'}
                            />
                        ))}
                    </div>

                    <div className={`tarot-meanings ${mode === 'three' ? 'tarot-meanings--three' : ''}`}>
                        {result.map((item, index) => (
                            <MeaningBlock key={`${round}-meaning-${item.card.id}-${index}`} item={item} />
                        ))}
                    </div>

                    <p className="tarot-disclaimer glass-card">
                        Phần “Hiểu đơn giản là” chỉ diễn lại bằng lời thường cho dễ hiểu, không thêm nghĩa mới.
                        Nghĩa gốc lấy từ A.E. Waite, <em>The Pictorial Key to the Tarot</em> (1910, Public Domain).
                        Trang chưa gọi AI luận giải.
                    </p>
                </section>
            )}
        </div>
    );
};

export default TarotPage;
