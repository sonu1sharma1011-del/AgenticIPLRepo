import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Activity, MessageSquare, Zap, Send, TrendingUp, BarChart2, HelpCircle, Heart, ChevronRight, Menu, X, List, Play, Target, ExternalLink, Settings, RotateCcw, Info, User, Cpu, Globe } from 'lucide-react';
import './App.css';

const API_BASE_URL = window.location.origin + '/api';

const TRANSLATIONS = {
  en: { table: "Points Table", team: "Team", p: "P", w: "W", l: "L", nrr: "NRR", pts: "PTS", form: "Form", reset: "Reset Feed", lang: "हिन्दी" },
  hi: { table: "अंक तालिका", team: "टीम", p: "मैच", w: "जीत", l: "हार", nrr: "NRR", pts: "अंक", form: "फॉर्म", reset: "रीसेट करें", lang: "English" }
};

const IPL_POINTS_TABLE = [
  { team: "KKR", color: "#6A0DAD", p: 14, w: 9, l: 3, nrr: "+1.428", pts: 20, form: ["W", "W", "W", "L", "W"] },
  { team: "SRH", color: "#FF8C00", p: 14, w: 8, l: 5, nrr: "+0.414", pts: 17, form: ["W", "L", "W", "W", "L"] },
  { team: "RR", color: "#FF69B4", p: 14, w: 8, l: 5, nrr: "+0.273", pts: 17, form: ["L", "L", "W", "L", "L"] },
  { team: "RCB", color: "#CC0000", p: 14, w: 7, l: 7, nrr: "+0.459", pts: 14, form: ["W", "W", "W", "W", "W"] },
  { team: "CSK", color: "#FFFF00", p: 14, w: 7, l: 7, nrr: "+0.428", pts: 14, form: ["L", "W", "L", "W", "L"] },
];

function App() {
  const [matchEvent, setMatchEvent] = useState('');
  const [loading, setLoading] = useState(false);
  const [interaction, setInteraction] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeModal, setActiveModal] = useState(null); 
  const [lang, setLang] = useState('en');

  const processEvent = async () => {
    if (!matchEvent) return;
    setLoading(true);
    setInteraction(null); // Clear previous to show intent
    try {
      const response = await axios.post(`${API_BASE_URL}/process-event`, { event_text: matchEvent });
      const data = response.data;
      setInteraction(data);
      setHistory(prev => [data, ...prev]);

      // Handle Agentic Tool Triggers
      if (data.action?.tool_to_call === "TABLE_OPEN") setActiveModal('TABLE');
      if (data.action?.tool_to_call === "GAME_START") setActiveModal('GAME');
      if (data.action?.tool_to_call === "SCORECARD_OPEN") setActiveModal('SCORECARD');

    } catch (error) {
      console.error("Error processing event:", error);
    } finally {
      setLoading(false);
      setMatchEvent('');
    }
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="app-container ipl-realistic-theme">
      <div className="stadium-bg" style={{ backgroundImage: `url('/stadium_bg.png')` }}></div>
      
      {/* --- RE-STORED DASHBOARD UI --- */}
      <header className="main-header">
        <div className="header-left-empty"></div>
        <div className="top-center-score glass-card" onClick={() => setActiveModal('SCORECARD')}>
          <div className="ipl-logo-mini">IPL</div>
          <div className="score-ticker">
            <span className="live-dot"></span>
            <span className="match-pair">KKR vs SRH</span>
            <span className="current-score">114-2 <small>(10.3)</small></span>
          </div>
        </div>
        <div className="top-right-actions">
          <button className="game-zone-btn" onClick={() => setActiveModal('GAME')}>
            <Play size={16} fill="currentColor"/> STRIKER ZONE
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* --- Sidebar (Left: Match Center + Menu) --- */}
        <aside className="left-match-center glass-card">
          <div className="sidebar-header">
            <Activity className="icon-pulse" />
            <h3>MATCH CENTER</h3>
          </div>
          <nav className="sidebar-menu">
            <div className="menu-item" onClick={() => setActiveModal('TABLE')}><Trophy size={18} /> {t.table}</div>
            <div className="menu-item" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}><Globe size={18} /> {t.lang}</div>
            <div className="menu-item" onClick={() => setHistory([])}><RotateCcw size={18} /> {t.reset}</div>
          </nav>
          <div className="sidebar-feed">
            <h4>FEED HISTORY</h4>
            <div className="mini-feed">
              {history.map((h, i) => (
                <div key={i} className="feed-entry"><p>{h.commentary.headline}</p></div>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-viewport">
          <AnimatePresence mode="wait">
            {!interaction && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="welcome-hero">
                <Cpu size={64} className="hero-icon" />
                <h1>STADIUM AI ENGINE</h1>
                <p>Telemetry Connected. Awaiting Match Events...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="bottom-center-ai">
        <div className="ai-interaction-hub glass-card">
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ai-loading-state">
                <div className="pulse-dot"></div>
                <span>CricketPulse AI is thinking...</span>
              </motion.div>
            )}
            {interaction && !loading && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="active-interaction">
                <div className="interaction-badge">{interaction.action.tool_to_call}</div>
                <h3>{interaction.commentary.headline}</h3>
                <p>{interaction.commentary.body}</p>
                {interaction.action.content.question && (
                  <div className="ai-options">
                    {interaction.action.content.options.map((opt, i) => <button key={i} className="opt-chip">{opt}</button>)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ai-input-bar">
            <input value={matchEvent} onChange={(e) => setMatchEvent(e.target.value)} placeholder="Talk to CricketPulse AI..." onKeyPress={(e) => e.key === 'Enter' && processEvent()} />
            <button className="ai-send-btn" onClick={processEvent} disabled={loading}>
              {loading ? <RotateCcw className="icon-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeModal && (
          <Modal title={activeModal === 'GAME' ? "ONE-OVER CHALLENGE" : t.table} onClose={() => setActiveModal(null)}>
            {activeModal === 'GAME' ? <CricketGame /> : <PointsTableContent lang={lang} />}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function CricketGame() {
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [ballsRemaining, setBallsRemaining] = useState(6);
  const [ballActive, setBallActive] = useState(false);
  const [timing, setTiming] = useState(0);
  const [message, setMessage] = useState('Ready for the final over?');
  const [swinging, setSwinging] = useState(false);
  const [overSummary, setOverSummary] = useState([]);

  const startGame = () => {
    setScore(0); setBallsRemaining(6); setOverSummary([]);
    setGameState('PLAYING'); nextBall();
  };

  const nextBall = () => {
    if (ballsRemaining === 0) { setGameState('RESULT'); return; }
    setBallActive(false); setMessage(`Ball 1.${6 - ballsRemaining + 1} coming up...`);
    setTimeout(() => { setBallActive(true); setTiming(Date.now()); setMessage('HIT!'); }, 1000 + Math.random() * 2000);
  };

  const hitBall = () => {
    if (swinging || !ballActive) return;
    setSwinging(true); setTimeout(() => setSwinging(false), 400);
    const diff = Date.now() - timing;
    setBallActive(false);
    setBallsRemaining(prev => prev - 1);
    let runs = 0, feedback = '';
    if (diff < 180) { runs = 6; feedback = '🚀 SIXER!'; }
    else if (diff < 350) { runs = 4; feedback = '🏏 FOUR!'; }
    else if (diff < 600) { runs = 1; feedback = '🏃 Single.'; }
    else { runs = 0; feedback = '☝️ WICKET!'; }
    setScore(s => s + runs);
    setOverSummary(prev => [...prev, runs]);
    setMessage(feedback);
    if (ballsRemaining > 1) setTimeout(nextBall, 1500);
    else setTimeout(() => setGameState('RESULT'), 1500);
  };

  if (gameState === 'RESULT') {
    return (
      <div className="game-result-screen">
        <h2>Innings Complete!</h2>
        <div className="final-score">{score} Runs</div>
        <div className="over-balls">
          {overSummary.map((r, i) => <span key={i} className={`ball-res r-${r}`}>{r}</span>)}
        </div>
        <button className="btn-ipl-large" onClick={startGame}>Re-play Over</button>
      </div>
    );
  }

  return (
    <div className="ipl-game-pro">
      <div className="game-header">
        <div className="g-stat">SCORE: <strong>{score}</strong></div>
        <div className="g-stat">BALLS: <strong>{6 - ballsRemaining}/6</strong></div>
      </div>
      <div className="game-arena-pro">
        <div className="bowler-pos">🤖</div>
        <AnimatePresence>{ballActive && <motion.div initial={{ scale: 0.1, y: -200, opacity: 0 }} animate={{ scale: 3, y: 0, opacity: 1 }} className="pro-ball" />}</AnimatePresence>
        <div className="stumps-pro"><div className="s-stick"></div><div className="s-stick"></div><div className="s-stick"></div></div>
        <div className="batsman-pro">
          <motion.div animate={swinging ? { rotate: -75, x: 20 } : { rotate: 0, x: 0 }} className="pro-bat">🏏</motion.div>
          <div className="pro-player">👤</div>
        </div>
        <div className="game-pitch-pro"></div>
        <div className="game-announcer">{message}</div>
      </div>
      <button className="btn-strike" onClick={gameState === 'PLAYING' ? hitBall : startGame}>
        {gameState === 'PLAYING' ? 'SWING BAT!' : 'START OVER'}
      </button>
    </div>
  );
}

function PointsTableContent({ lang }) {
  const t = TRANSLATIONS[lang];
  return (
    <div className="table-container ipl-table">
      <table>
        <thead><tr><th>{t.team}</th><th>{t.p}</th><th>{t.pts}</th><th>{t.form}</th></tr></thead>
        <tbody>
          {IPL_POINTS_TABLE.map((row, i) => (
            <tr key={i}>
              <td className="team-cell"><span className="t-dot" style={{background: row.color}}>{row.team[0]}</span>{row.team}</td>
              <td>{row.p}</td><td className="t-pts">{row.pts}</td>
              <td><div className="form-badges">{row.form.map((res, idx) => <span key={idx} className={`form-dot ${res.toLowerCase()}`}>{res}</span>)}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-wrapper" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="modal-content ipl-modal-realistic" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{title}</h2><X className="modal-close" onClick={onClose} /></div>
        {children}
      </motion.div>
    </div>
  );
}

export default App;
