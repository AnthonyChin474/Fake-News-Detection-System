/**
 * TruthGuard - Misinformation Detection System
 * React conversion of the original vanilla JS / HTML / CSS implementation.
 *
 * All original pages, components, mock-data, chart logic, styles, and
 * sidebar navigation are preserved exactly as they were, just re-expressed
 * in idiomatic React (hooks, JSX, inline <style>, useRef for canvas charts).
 *
 * Requires: React 18+ (imported via the artifact runtime).
 * Talks to: FastAPI backend at http://127.0.0.1:8000/predict  (POST)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// ─────────────────────────────────────────────
// 1.  GLOBAL STYLES  (verbatim from style.css)
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    /* ── CSS Variables & Reset ── */
    :root {
      --primary-blue: #6b5b95;
      --primary-blue-dark: #5a4a7a;
      --primary-blue-light: #8b7bb5;
      --primary-glow: rgba(107,91,149,0.15);

      --sidebar-bg: #1e1730;
      --sidebar-width: 72px;
      --sidebar-border: rgba(255,255,255,0.07);
      --sidebar-item-hover: rgba(255,255,255,0.08);
      --sidebar-item-active: rgba(139,123,181,0.25);
      --sidebar-active-bar: #a094d4;

      --success-green: #2d7a4a;
      --success-green-light: #d4edda;
      --danger-red: #c74642;
      --danger-red-light: #f8d7da;
      --warning-yellow: #c68642;
      --warning-yellow-light: #fff3cd;

      --gray-50: #f8f9fa;
      --gray-100: #f0f2f5;
      --gray-200: #e9ecef;
      --gray-300: #dee2e6;
      --gray-400: #adb5bd;
      --gray-500: #6c757d;
      --gray-600: #495057;
      --gray-700: #343a40;
      --gray-800: #212529;
      --gray-900: #0f1419;

      --font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-display: 'DM Serif Display', Georgia, serif;

      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 1rem;
      --spacing-lg: 1.5rem;
      --spacing-xl: 2rem;
      --spacing-2xl: 3rem;

      --radius-sm: 0.375rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
      --radius-full: 9999px;

      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
      --shadow-lg: 0 8px 24px rgba(0,0,0,0.1);
      --shadow-xl: 0 16px 40px rgba(0,0,0,0.14);
      --shadow-sidebar: 4px 0 24px rgba(0,0,0,0.18);

      --transition-fast: 150ms ease;
      --transition-normal: 200ms ease;
      --transition-slow: 300ms ease;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: var(--font-family);
      font-size: 1rem;
      line-height: 1.6;
      color: var(--gray-800);
      background-color: var(--gray-100);
      min-height: 100vh;
    }
    a { color: var(--primary-blue); text-decoration: none; transition: color var(--transition-fast); }
    a:hover { color: var(--primary-blue-dark); }
    img { max-width: 100%; height: auto; }

    /* Typography */
    h1,h2,h3,h4,h5,h6 { font-weight:700; line-height:1.3; color:var(--gray-900); letter-spacing:-0.02em; }
    h1 { font-size:2.5rem; } h2 { font-size:2rem; } h3 { font-size:1.5rem; }
    h4 { font-size:1.25rem; } h5 { font-size:1.125rem; } h6 { font-size:1rem; }
    .text-sm { font-size:0.875rem; }
    .text-xs { font-size:0.75rem; }
    .text-muted { color:var(--gray-500); }
    :focus-visible { outline:2px solid var(--primary-blue); outline-offset:2px; }

    /* Layout */
    #tg-app { display:flex; width:100%; min-height:100vh; }

    /* Sidebar */
    .app-sidebar {
      width:var(--sidebar-width);
      background:var(--sidebar-bg);
      color:white;
      display:flex;
      flex-direction:column;
      padding:1rem 0.5rem;
      gap:0;
      align-items:center;
      flex-shrink:0;
      position:sticky;
      top:0;
      height:100vh;
      overflow-y:auto;
      box-shadow:var(--shadow-sidebar);
      z-index:200;
    }
    .app-sidebar::-webkit-scrollbar { width:3px; }
    .app-sidebar::-webkit-scrollbar-track { background:transparent; }
    .app-sidebar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }

    .sidebar-brand {
      flex-direction:column; align-items:center; padding:0.5rem 0 0.75rem;
      gap:0.35rem; width:100%; display:flex; cursor:pointer;
      text-decoration:none; transition:opacity var(--transition-fast);
    }
    .sidebar-brand:hover { opacity:0.85; }
    .brand-icon {
      width:36px; height:36px;
      background:linear-gradient(135deg, var(--primary-blue-light), var(--primary-blue-dark));
      border-radius:10px; display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 12px rgba(107,91,149,0.45); flex-shrink:0;
    }
    .brand-icon svg { width:18px; height:18px; color:white; }
    .brand-name {
      font-size:0.48rem; font-weight:700; color:white; letter-spacing:0.08em;
      text-transform:uppercase; text-align:center; line-height:1.3;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
    }
    .sidebar-divider { height:1px; background:var(--sidebar-border); margin:0.4rem 0.25rem; border-radius:1px; width:100%; }
    .sidebar-nav { display:flex; flex-direction:column; gap:0.15rem; width:100%; flex-grow:1; padding-top:0.25rem; }
    .sidebar-footer { margin-top:auto; width:100%; }

    .sidebar-nav-item {
      width:100%; padding:0.55rem 0.4rem 0.45rem; background:transparent;
      border-radius:10px; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:0.2rem;
      cursor:pointer; transition:all var(--transition-normal);
      border:1px solid transparent; position:relative; text-align:center;
      min-height:auto;
    }
    .sidebar-nav-item:hover { background:var(--sidebar-item-hover); }
    .sidebar-nav-item.active {
      background:var(--sidebar-item-active); border-color:rgba(160,148,212,0.3);
    }
    .sidebar-nav-item.active::before {
      content:''; position:absolute; left:-0.5rem; top:20%; bottom:20%;
      width:3px; background:var(--sidebar-active-bar); border-radius:0 2px 2px 0;
    }
    .nav-icon { width:22px; height:22px; display:flex; align-items:center; justify-content:center; border-radius:0; background:none; }
    .nav-icon svg { width:20px; height:20px; color:rgba(255,255,255,0.55); transition:color var(--transition-normal); }
    .sidebar-nav-item:hover .nav-icon svg { color:rgba(255,255,255,0.9); }
    .sidebar-nav-item.active .nav-icon svg { color:var(--sidebar-active-bar); }
    .nav-label {
      font-size:0.58rem; font-weight:600; color:rgba(255,255,255,0.45); letter-spacing:0.03em;
      text-transform:uppercase; transition:color var(--transition-normal); line-height:1;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
    }
    .sidebar-nav-item:hover .nav-label { color:rgba(255,255,255,0.85); }
    .sidebar-nav-item.active .nav-label { color:rgba(255,255,255,0.9); }

    /* Main Content */
    .app-content { flex:1; display:flex; flex-direction:column; min-width:0; background:var(--gray-100); }
    .container { width:100%; max-width:100%; margin:0; padding:0 var(--spacing-lg); }

    /* Navbar */
    .navbar {
      background:white; border-bottom:1px solid var(--gray-200);
      padding:0.875rem var(--spacing-xl); position:sticky; top:0; z-index:100;
      box-shadow:0 1px 0 var(--gray-200),0 2px 8px rgba(0,0,0,0.04);
    }
    .navbar-content { display:flex; align-items:center; justify-content:space-between; max-width:1400px; margin:0 auto; }
    .navbar-brand { display:flex; align-items:center; gap:var(--spacing-sm); font-size:1.25rem; font-weight:700; color:var(--gray-900); letter-spacing:-0.02em; cursor:pointer; }
    .navbar-brand svg { width:28px; height:28px; color:var(--primary-blue); }
    .navbar-nav { display:flex; align-items:center; gap:var(--spacing-xl); list-style:none; }
    .nav-link { color:var(--gray-600); font-weight:500; font-size:0.9375rem; padding:var(--spacing-sm) 0; position:relative; transition:color var(--transition-fast); cursor:pointer; }
    .nav-link:hover, .nav-link.active { color:var(--primary-blue); }
    .nav-link.active::after { content:''; position:absolute; bottom:-4px; left:0; right:0; height:2px; background:var(--primary-blue); border-radius:var(--radius-full); }
    .navbar-actions { display:flex; align-items:center; gap:var(--spacing-md); }
    .mobile-menu-btn { display:none; background:none; border:none; cursor:pointer; padding:var(--spacing-sm); }

    /* Buttons */
    .btn {
      display:inline-flex; align-items:center; justify-content:center; gap:var(--spacing-sm);
      padding:0.65rem 1.35rem; font-family:inherit; font-size:0.9375rem; font-weight:600;
      line-height:1.5; border:1.5px solid transparent; border-radius:var(--radius-md);
      cursor:pointer; transition:all var(--transition-normal); text-decoration:none; letter-spacing:0.01em;
    }
    .btn:disabled { opacity:0.55; cursor:not-allowed; }
    .btn svg { width:18px; height:18px; }
    .btn-primary { background:var(--primary-blue); color:white; border-color:var(--primary-blue); box-shadow:0 2px 8px rgba(107,91,149,0.3); }
    .btn-primary:hover:not(:disabled) { background:var(--primary-blue-dark); border-color:var(--primary-blue-dark); box-shadow:0 4px 16px rgba(107,91,149,0.4); transform:translateY(-1px); }
    .btn-secondary { background:white; color:var(--gray-700); border-color:var(--gray-300); }
    .btn-secondary:hover:not(:disabled) { background:var(--gray-50); border-color:var(--gray-500); }
    .btn-ghost { background:transparent; color:var(--gray-600); border-color:transparent; }
    .btn-ghost:hover { background:var(--gray-100); }
    .btn-lg { padding:0.875rem 1.875rem; font-size:1rem; border-radius:var(--radius-lg); }
    .btn-sm { padding:0.375rem 0.875rem; font-size:0.875rem; }
    .btn-danger { background:var(--danger-red); color:white; }

    /* Form Elements */
    .form-group { margin-bottom:var(--spacing-lg); }
    .form-label { display:block; margin-bottom:var(--spacing-sm); font-weight:600; color:var(--gray-700); font-size:0.9rem; }
    .form-input, .form-textarea, .form-select {
      width:100%; padding:0.8rem 1rem; font-family:inherit; font-size:0.95rem; line-height:1.5;
      color:var(--gray-800); background:white; border:1.5px solid var(--gray-300); border-radius:var(--radius-md);
      transition:all var(--transition-normal);
    }
    .form-input:focus, .form-textarea:focus, .form-select:focus {
      outline:none; border-color:var(--primary-blue); box-shadow:0 0 0 3px rgba(107,91,149,0.1);
    }
    .form-input::placeholder, .form-textarea::placeholder { color:var(--gray-400); }
    .form-textarea { min-height:150px; resize:vertical; }
    .form-helper { margin-top:var(--spacing-xs); font-size:0.85rem; color:var(--gray-500); }
    .form-error { color:var(--danger-red); font-size:0.85rem; margin-top:0.25rem; }
    .char-counter { text-align:right; font-size:0.8rem; color:var(--gray-400); margin-top:var(--spacing-xs); }
    .char-counter.warning { color:var(--warning-yellow); }
    .char-counter.error { color:var(--danger-red); }

    /* Cards */
    .card { background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-md); overflow:hidden; border:1px solid rgba(0,0,0,0.04); }
    .card-header { padding:var(--spacing-lg) var(--spacing-xl); border-bottom:1px solid var(--gray-100); }
    .card-body { padding:var(--spacing-xl); }

    /* Login Page */
    .login-page {
      min-height:100vh; display:flex; align-items:center; justify-content:center;
      background:linear-gradient(135deg,#1e1730 0%,#3d2f6b 50%,#6b5b95 100%);
      padding:var(--spacing-lg); width:100%;
    }
    .login-card { width:100%; max-width:420px; background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-xl); padding:var(--spacing-2xl); }
    .login-logo { text-align:center; margin-bottom:var(--spacing-xl); }
    .login-logo svg { width:56px; height:56px; color:var(--primary-blue); }
    .login-logo h1 { margin-top:var(--spacing-md); font-size:1.75rem; font-family:var(--font-display); }
    .login-logo p { color:var(--gray-500); margin-top:var(--spacing-xs); }
    .login-divider { display:flex; align-items:center; margin:var(--spacing-xl) 0; color:var(--gray-400); font-size:0.875rem; }
    .login-divider::before, .login-divider::after { content:''; flex:1; height:1px; background:var(--gray-200); }
    .login-divider span { padding:0 var(--spacing-md); }
    .login-footer { text-align:center; margin-top:var(--spacing-xl); color:var(--gray-500); font-size:0.875rem; }
    .checkbox-group { display:flex; align-items:center; gap:var(--spacing-sm); cursor:pointer; font-size:0.9375rem; }
    .checkbox-group input[type="checkbox"] { width:17px; height:17px; accent-color:var(--primary-blue); cursor:pointer; }

    /* Hero */
    .hero {
      padding:4rem var(--spacing-xl) 3.5rem; text-align:center;
      background:linear-gradient(160deg,#ffffff 0%,#f3f0f9 60%,var(--gray-100) 100%);
      position:relative; overflow:hidden;
    }
    .hero::before {
      content:''; position:absolute; inset:0;
      background-image:radial-gradient(circle at 20% 50%,rgba(107,91,149,0.06) 0%,transparent 60%),
                        radial-gradient(circle at 80% 20%,rgba(107,91,149,0.05) 0%,transparent 50%);
      pointer-events:none;
    }
    .hero > * { position:relative; }
    .hero-eyebrow {
      display:inline-flex; align-items:center; gap:0.4rem; font-size:0.8125rem; font-weight:700;
      letter-spacing:0.1em; text-transform:uppercase; color:var(--primary-blue);
      background:rgba(107,91,149,0.1); border:1px solid rgba(107,91,149,0.2);
      padding:0.35rem 0.875rem; border-radius:var(--radius-full); margin-bottom:1.25rem;
    }
    .hero h1 {
      font-size:3rem; margin-bottom:var(--spacing-md); color:var(--gray-900);
      line-height:1.15; font-family:var(--font-display); max-width:680px; margin-left:auto; margin-right:auto;
    }
    .hero h1 em { font-style:normal; color:var(--primary-blue); }
    .hero p { font-size:1.0625rem; color:var(--gray-600); max-width:540px; margin:0 auto var(--spacing-xl); line-height:1.7; }
    .hero-actions { display:flex; justify-content:center; gap:var(--spacing-md); flex-wrap:wrap; }
    @media(min-width:768px){ .hero h1 { font-size:3.5rem; } }

    /* Features */
    .features { padding:var(--spacing-2xl) var(--spacing-xl); max-width:1200px; margin:0 auto; }
    .section-label { font-size:0.8125rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--primary-blue); text-align:center; margin-bottom:0.75rem; }
    .features h2 { text-align:center; margin-bottom:var(--spacing-xl); font-family:var(--font-display); }
    .features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:var(--spacing-lg); margin-top:var(--spacing-xl); }
    .feature-card {
      text-align:center; padding:var(--spacing-xl); background:white; border-radius:var(--radius-xl);
      border:1px solid var(--gray-200); transition:all var(--transition-normal); position:relative; overflow:hidden;
    }
    .feature-card::after {
      content:''; position:absolute; bottom:0; left:0; right:0; height:3px;
      background:linear-gradient(90deg,var(--primary-blue-light),var(--primary-blue));
      transform:scaleX(0); transition:transform var(--transition-normal);
    }
    .feature-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:rgba(107,91,149,0.2); }
    .feature-card:hover::after { transform:scaleX(1); }
    .feature-step { font-size:0.7rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--primary-blue-light); margin-bottom:0.875rem; }
    .feature-icon { width:60px; height:60px; margin:0 auto var(--spacing-md); display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,rgba(139,123,181,0.15),rgba(107,91,149,0.1)); border-radius:var(--radius-lg); color:var(--primary-blue); }
    .feature-icon svg { width:28px; height:28px; }
    .feature-card h3 { margin-bottom:var(--spacing-sm); font-size:1.125rem; }
    .feature-card p { color:var(--gray-500); font-size:0.9375rem; line-height:1.6; }

    /* Stats */
    .stats { padding:var(--spacing-2xl) var(--spacing-xl); background:linear-gradient(135deg,#1e1730 0%,#2d2449 100%); color:white; position:relative; overflow:hidden; }
    .stats::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 120%,rgba(107,91,149,0.3) 0%,transparent 70%); }
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:var(--spacing-xl); text-align:center; max-width:900px; margin:0 auto; position:relative; }
    .stat-item { padding:var(--spacing-lg); border-radius:var(--radius-lg); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); }
    .stat-item h3 { font-size:2.5rem; color:var(--primary-blue-light); margin-bottom:var(--spacing-xs); font-family:var(--font-display); }
    .stat-item p { color:rgba(255,255,255,0.6); font-size:0.9rem; }

    /* Analyze Page */
    .analyze-page { padding:var(--spacing-2xl) var(--spacing-xl); max-width:900px; margin:0 auto; width:100%; }
    .analyze-header { text-align:center; margin-bottom:var(--spacing-xl); }
    .analyze-header h1 { margin-bottom:var(--spacing-sm); font-family:var(--font-display); }
    .analyze-header p { font-size:1rem; color:var(--gray-500); }
    .analyze-card { max-width:720px; margin:0 auto; }
    .info-box { background:rgba(107,91,149,0.05); border-left:3px solid var(--primary-blue); padding:var(--spacing-md) var(--spacing-lg); border-radius:var(--radius-md); margin-bottom:var(--spacing-lg); }
    .info-box p { margin:0; color:var(--gray-700); font-size:0.9rem; }
    .input-modes { display:flex; gap:var(--spacing-sm); margin-bottom:var(--spacing-lg); padding:0.3rem; background:var(--gray-100); border-radius:var(--radius-lg); }
    .mode-btn { flex:1; padding:0.6rem var(--spacing-md); background:transparent; border:none; border-radius:var(--radius-md); font-weight:600; color:var(--gray-500); cursor:pointer; transition:all var(--transition-normal); display:flex; align-items:center; justify-content:center; gap:var(--spacing-xs); font-size:0.875rem; font-family:inherit; }
    .mode-btn svg { width:16px; height:16px; }
    .mode-btn.active { background:white; color:var(--primary-blue); box-shadow:var(--shadow-sm); }
    .mode-btn:hover:not(.active) { color:var(--gray-700); }
    .url-input-group { display:flex; gap:var(--spacing-sm); }
    .url-input-group .form-input { flex:1; }
    .file-upload-area { border:2px dashed var(--gray-300); border-radius:var(--radius-xl); padding:var(--spacing-2xl) var(--spacing-lg); text-align:center; cursor:pointer; transition:all var(--transition-normal); display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .file-upload-area:hover { border-color:var(--primary-blue); background:rgba(107,91,149,0.03); }
    .file-upload-area svg { width:44px; height:44px; color:var(--primary-blue); margin-bottom:var(--spacing-md); }
    .file-upload-text { color:var(--gray-700); font-weight:600; margin-bottom:var(--spacing-xs); }
    .file-upload-link { color:var(--primary-blue); font-weight:700; cursor:pointer; }
    .file-upload-link:hover { text-decoration:underline; }
    .file-upload-hint { color:var(--gray-400); font-size:0.825rem; margin-top:var(--spacing-sm); }
    .file-info { margin-top:var(--spacing-lg); padding:var(--spacing-lg); background:var(--gray-50); border-radius:var(--radius-md); border-left:3px solid var(--success-green); }
    .analyze-options { display:flex; flex-wrap:wrap; gap:var(--spacing-md); margin-top:var(--spacing-lg); padding-top:var(--spacing-lg); border-top:1px solid var(--gray-200); }

    /* Results Page */
    .results-page { padding:var(--spacing-2xl) var(--spacing-xl); max-width:1200px; margin:0 auto; }
    .results-header { text-align:center; margin-bottom:var(--spacing-xl); }
    .result-summary { max-width:760px; margin:0 auto var(--spacing-xl); }
    .result-verdict { display:flex; align-items:center; gap:var(--spacing-lg); padding:var(--spacing-xl); }
    .verdict-icon { width:76px; height:76px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .verdict-icon svg { width:36px; height:36px; }
    .verdict-icon.authentic { background:var(--success-green-light); color:var(--success-green); }
    .verdict-icon.misinformation { background:var(--danger-red-light); color:var(--danger-red); }
    .verdict-icon.uncertain { background:var(--warning-yellow-light); color:var(--warning-yellow); }
    .verdict-content h2 { margin-bottom:var(--spacing-xs); font-family:var(--font-display); }
    .verdict-content p { color:var(--gray-600); }
    .confidence-meter { padding:var(--spacing-lg) var(--spacing-xl); border-top:1px solid var(--gray-100); }
    .confidence-label { display:flex; justify-content:space-between; margin-bottom:var(--spacing-sm); font-weight:600; font-size:0.9rem; }
    .confidence-bar { height:10px; background:var(--gray-200); border-radius:var(--radius-full); overflow:hidden; }
    .confidence-fill { height:100%; border-radius:var(--radius-full); transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
    .confidence-fill.high { background:linear-gradient(90deg,var(--success-green),#34d399); }
    .confidence-fill.medium { background:linear-gradient(90deg,var(--warning-yellow),#fbbf24); }
    .confidence-fill.low { background:linear-gradient(90deg,var(--danger-red),#f87171); }
    .analysis-details { display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:var(--spacing-xl); max-width:960px; margin:0 auto; }
    .detail-card { background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-md); overflow:hidden; border:1px solid rgba(0,0,0,0.04); }
    .detail-card-header { padding:var(--spacing-md) var(--spacing-lg); background:var(--gray-50); border-bottom:1px solid var(--gray-200); font-weight:700; font-size:0.9rem; display:flex; align-items:center; gap:var(--spacing-sm); color:var(--gray-700); }
    .detail-card-header svg { width:17px; height:17px; color:var(--primary-blue); }
    .detail-card-body { padding:var(--spacing-lg); }
    .factor-list { list-style:none; }
    .factor-item { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--gray-100); }
    .factor-item:last-child { border-bottom:none; }
    .factor-name { display:flex; align-items:center; gap:var(--spacing-sm); font-size:0.9375rem; }
    .factor-indicator { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .factor-indicator.positive { background:var(--success-green); }
    .factor-indicator.negative { background:var(--danger-red); }
    .factor-indicator.neutral { background:var(--gray-400); }
    .factor-score { font-weight:700; padding:0.2rem 0.625rem; border-radius:var(--radius-sm); font-size:0.8125rem; }
    .factor-score.high { background:var(--success-green-light); color:var(--success-green); }
    .factor-score.medium { background:var(--warning-yellow-light); color:var(--warning-yellow); }
    .factor-score.low { background:var(--danger-red-light); color:var(--danger-red); }
    .original-content { background:var(--gray-50); padding:var(--spacing-lg); border-radius:var(--radius-md); font-size:0.9375rem; line-height:1.7; max-height:220px; overflow-y:auto; color:var(--gray-700); border:1px solid var(--gray-200); }

    /* Visualization */
    .visualization-section { padding:4rem var(--spacing-xl); background:linear-gradient(145deg,#f7f5fc 0%,#eeeaf7 100%); max-width:100%; }
    .visualization-header { max-width:1200px; margin:0 auto var(--spacing-xl); text-align:center; }
    .visualization-header h2 { margin-bottom:0.35rem; color:#2d2440; }
    .visualization-header p { color:var(--gray-600); }
    .stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:var(--spacing-lg); max-width:1200px; margin:0 auto var(--spacing-xl); }
    .stat-card { position:relative; overflow:hidden; background:white; border-radius:var(--radius-xl); padding:1.4rem 1.5rem; box-shadow:0 10px 28px rgba(67,47,96,0.1); border:1px solid rgba(107,91,149,0.12); }
    .stat-card::before { content:""; position:absolute; inset:0 auto 0 0; width:4px; background:linear-gradient(180deg,#8b7bb5,#5a4a7a); }
    .stat-label { display:block; margin-bottom:0.4rem; color:var(--gray-500); font-size:0.78rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; }
    .stat-value { color:#2d2440; font-family:var(--font-display); font-size:clamp(1.7rem,3vw,2.25rem); line-height:1.1; }
    .stat-unit { margin-left:0.3rem; color:var(--gray-500); font-family:var(--font-family); font-size:0.78rem; font-weight:600; }
    .viz-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--spacing-xl); max-width:1200px; margin:0 auto; }
    .viz-card { min-width:0; background:rgba(255,255,255,0.96); border-radius:var(--radius-xl); box-shadow:0 12px 32px rgba(67,47,96,0.11); padding:var(--spacing-xl); border:1px solid rgba(107,91,149,0.12); transition:transform var(--transition-normal),box-shadow var(--transition-normal); }
    .viz-card:hover { transform:translateY(-3px); box-shadow:0 16px 38px rgba(67,47,96,0.15); }
    .viz-card h4 { margin-bottom:0.25rem; display:flex; align-items:center; gap:var(--spacing-sm); font-size:1.05rem; color:#35294a; }
    .viz-card h4 svg { width:18px; height:18px; color:var(--primary-blue); }
    .viz-card-subtitle { margin-bottom:var(--spacing-lg); color:var(--gray-500); font-size:0.82rem; }
    .chart-container { position:relative; height:310px; }
    .chart-container.keywords-chart { height:350px; }
    .chart-container canvas { width:100% !important; }
    .visualization-status { max-width:1200px; margin:0 auto; padding:3rem; text-align:center; background:white; border-radius:var(--radius-xl); box-shadow:var(--shadow-md); color:var(--gray-600); }
    .visualization-error { color:var(--danger-red); }

    /* Uploaded CSV Dashboard */
    .batch-dashboard { min-height:100vh; padding:3rem var(--spacing-xl); background:linear-gradient(145deg,#f7f5fc 0%,#eeeaf7 100%); }
    .batch-dashboard-header { text-align:center; margin-bottom:var(--spacing-xl); }
    .batch-dashboard-header h1 { color:#2d2440; font-family:var(--font-display); }
    .batch-dashboard-header p { margin-top:0.35rem; color:var(--gray-600); }
    .batch-summary-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:var(--spacing-lg); max-width:1200px; margin:0 auto var(--spacing-xl); }
    .batch-summary-card { position:relative; overflow:hidden; display:flex; flex-direction:column; gap:0.45rem; padding:1.4rem 1.5rem; background:white; border:1px solid rgba(107,91,149,0.12); border-radius:var(--radius-xl); box-shadow:0 10px 28px rgba(67,47,96,0.1); }
    .batch-summary-card::before { content:""; position:absolute; inset:0 auto 0 0; width:4px; background:linear-gradient(180deg,#8b7bb5,#5a4a7a); }
    .batch-summary-card span { color:var(--gray-500); font-size:0.78rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }
    .batch-summary-card strong { color:#2d2440; font-family:var(--font-display); font-size:2rem; line-height:1.1; }
    .batch-chart-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:var(--spacing-xl); max-width:1200px; margin:0 auto var(--spacing-xl); }
    .batch-chart-card { min-width:0; padding:var(--spacing-xl); background:white; border:1px solid rgba(107,91,149,0.12); border-radius:var(--radius-xl); box-shadow:0 12px 32px rgba(67,47,96,0.11); }
    .batch-chart-card h3 { color:#35294a; font-size:1.08rem; }
    .batch-chart-card p { margin:0.25rem 0 var(--spacing-lg); color:var(--gray-500); font-size:0.82rem; }
    .batch-chart { position:relative; height:300px; }
    .batch-keywords-chart { height:340px; }
    .batch-table-card { max-width:1200px; margin:0 auto var(--spacing-xl); padding:var(--spacing-xl); background:white; border:1px solid rgba(107,91,149,0.12); border-radius:var(--radius-xl); box-shadow:0 12px 32px rgba(67,47,96,0.11); }
    .batch-table-card h3 { margin-bottom:var(--spacing-lg); color:#35294a; }
    .batch-table-wrap { max-height:600px; overflow:auto; border:1px solid var(--gray-200); border-radius:var(--radius-lg); }
    .batch-results-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
    .batch-results-table th { position:sticky; top:0; z-index:2; padding:0.8rem 1rem; text-align:left; color:var(--gray-600); background:#f8f9fa; border-bottom:2px solid var(--gray-200); box-shadow:0 1px 0 var(--gray-200); }
    .batch-results-table td { padding:0.8rem 1rem; color:var(--gray-700); border-bottom:1px solid var(--gray-100); }
    .batch-results-table td:nth-child(2) { min-width:340px; }
    .batch-badge { display:inline-block; padding:0.25rem 0.7rem; border-radius:999px; font-size:0.75rem; font-weight:700; white-space:nowrap; }
    .batch-badge.real { color:#2d7a4a; background:#d4edda; }
    .batch-badge.fake { color:#a53652; background:#f8d7e0; }
    .batch-actions { display:flex; justify-content:center; }
    .batch-empty { min-height:65vh; padding:5rem 2rem; text-align:center; }
    .batch-empty p { margin:0.5rem 0 1.5rem; color:var(--gray-500); }

    /* History Page */
    .history-page { padding:var(--spacing-2xl) var(--spacing-xl); max-width:1200px; margin:0 auto; width:100%; }
    .history-filters { display:flex; gap:var(--spacing-md); margin-bottom:var(--spacing-xl); flex-wrap:wrap; }
    .history-table { width:100%; border-collapse:separate; border-spacing:0; background:white; border-radius:var(--radius-xl); overflow:hidden; box-shadow:var(--shadow-md); border:1px solid rgba(0,0,0,0.04); }
    .history-table th, .history-table td { padding:var(--spacing-md) var(--spacing-lg); text-align:left; border-bottom:1px solid var(--gray-100); }
    .history-table th { background:var(--gray-50); font-weight:700; font-size:0.8125rem; color:var(--gray-600); letter-spacing:0.04em; text-transform:uppercase; }
    .history-table tr:last-child td { border-bottom:none; }
    .history-table tbody tr { transition:background var(--transition-fast); }
    .history-table tbody tr:hover { background:var(--gray-50); }
    .csv-history-heading { margin:var(--spacing-xl) 0 var(--spacing-lg); color:#35294a; }
    .csv-history-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:var(--spacing-lg); margin-bottom:var(--spacing-2xl); }
    .csv-history-card { padding:var(--spacing-lg); background:white; border:1px solid rgba(107,91,149,0.12); border-radius:var(--radius-xl); box-shadow:0 8px 24px rgba(67,47,96,0.09); }
    .csv-history-card h3 { overflow:hidden; color:#35294a; font-size:1.05rem; text-overflow:ellipsis; white-space:nowrap; }
    .csv-history-date { margin:0.25rem 0 var(--spacing-md); color:var(--gray-500); font-size:0.8rem; }
    .csv-history-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:0.6rem; margin-bottom:var(--spacing-lg); }
    .csv-history-stat { padding:0.65rem 0.4rem; text-align:center; background:var(--gray-50); border-radius:var(--radius-md); }
    .csv-history-stat strong { display:block; color:#35294a; font-size:1.05rem; }
    .csv-history-stat span { color:var(--gray-500); font-size:0.68rem; text-transform:uppercase; }
    .csv-history-actions { display:flex; gap:var(--spacing-sm); }
    .csv-history-actions .btn { flex:1; }
    .history-empty { padding:2rem; text-align:center; color:var(--gray-500); background:white; border:1px dashed var(--gray-300); border-radius:var(--radius-xl); }
    .pagination-summary { margin-top:var(--spacing-md); color:var(--gray-500); font-size:0.84rem; text-align:center; }
    .pagination-controls { display:flex; align-items:center; justify-content:center; gap:0.4rem; margin-top:var(--spacing-lg); flex-wrap:wrap; }
    .pagination-button { min-width:38px; height:38px; padding:0 0.7rem; border:1px solid var(--gray-300); border-radius:var(--radius-md); background:white; color:var(--gray-700); font-family:inherit; font-size:0.84rem; font-weight:600; cursor:pointer; transition:all var(--transition-fast); }
    .pagination-button:hover:not(:disabled) { border-color:var(--primary-blue); color:var(--primary-blue); background:#f7f5fc; }
    .pagination-button.active { color:white; background:var(--primary-blue); border-color:var(--primary-blue); box-shadow:0 3px 10px rgba(107,91,149,0.25); }
    .pagination-button:disabled { opacity:0.45; cursor:not-allowed; }
    .pagination-nav { padding:0 0.9rem; }

    /* Badges */
    .badge { display:inline-flex; align-items:center; gap:var(--spacing-xs); padding:0.2rem 0.6rem; font-size:0.75rem; font-weight:700; border-radius:var(--radius-full); text-transform:uppercase; letter-spacing:0.04em; }
    .badge-success { background:var(--success-green-light); color:var(--success-green); }
    .badge-danger { background:var(--danger-red-light); color:var(--danger-red); }
    .badge-warning { background:var(--warning-yellow-light); color:var(--warning-yellow); }
    .badge-neutral { background:var(--gray-200); color:var(--gray-600); }

    /* Footer */
    .footer { background:var(--gray-900); color:var(--gray-400); padding:var(--spacing-2xl) var(--spacing-xl) var(--spacing-xl); }
    .footer-content { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:var(--spacing-xl); margin-bottom:var(--spacing-xl); max-width:1200px; margin-left:auto; margin-right:auto; }
    .footer-brand h3 { color:white; margin-bottom:var(--spacing-sm); font-family:var(--font-display); }
    .footer-links h4 { color:rgba(255,255,255,0.7); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:var(--spacing-md); }
    .footer-links ul { list-style:none; }
    .footer-links li { margin-bottom:var(--spacing-sm); }
    .footer-links a { color:var(--gray-500); font-size:0.9rem; transition:color var(--transition-fast); }
    .footer-links a:hover { color:white; }
    .footer-bottom { padding-top:var(--spacing-lg); border-top:1px solid rgba(255,255,255,0.07); text-align:center; font-size:0.875rem; max-width:1200px; margin:0 auto; }

    /* Loading */
    .loading-spinner { width:38px; height:38px; border:3px solid var(--gray-200); border-top-color:var(--primary-blue); border-radius:50%; animation:spin 0.75s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loading-overlay { position:fixed; inset:0; background:rgba(255,255,255,0.92); backdrop-filter:blur(4px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--spacing-lg); z-index:1000; }
    .loading-text { font-size:1rem; color:var(--gray-600); font-weight:500; }

    /* Alerts */
    .alert { padding:var(--spacing-md) var(--spacing-lg); border-radius:var(--radius-lg); display:flex; align-items:flex-start; gap:var(--spacing-md); margin-bottom:var(--spacing-lg); }
    .alert-danger { background:var(--danger-red-light); color:#991b1b; }
    .alert-success { background:var(--success-green-light); color:#065f46; }

    /* Utilities */
    .text-center { text-align:center; }
    .mt-sm { margin-top:var(--spacing-sm); }
    .mt-md { margin-top:var(--spacing-md); }
    .mt-lg { margin-top:var(--spacing-lg); }
    .mt-xl { margin-top:var(--spacing-xl); }
    .mb-sm { margin-bottom:var(--spacing-sm); }
    .mb-md { margin-bottom:var(--spacing-md); }
    .mb-lg { margin-bottom:var(--spacing-lg); }
    .mb-xl { margin-bottom:var(--spacing-xl); }
    .flex { display:flex; }
    .flex-center { display:flex; align-items:center; justify-content:center; }
    .flex-between { display:flex; align-items:center; justify-content:space-between; }
    .gap-sm { gap:var(--spacing-sm); }
    .gap-md { gap:var(--spacing-md); }
    .gap-lg { gap:var(--spacing-lg); }

    /* Responsive */
    @media(max-width:768px){
      html { font-size:15px; }
      body { overflow-x:hidden; }
      #tg-app { flex-direction:column; padding-bottom:68px; }
      .app-content { width:100%; }
      .app-sidebar {
        width:100%; height:68px; flex-direction:row; padding:0.4rem max(0.35rem,env(safe-area-inset-right)) calc(0.4rem + env(safe-area-inset-bottom)) max(0.35rem,env(safe-area-inset-left));
        position:fixed; inset:auto 0 0; justify-content:center; align-items:stretch;
        box-shadow:0 -3px 18px rgba(0,0,0,0.2); overflow:visible;
      }
      .sidebar-brand { display:none; }
      .sidebar-divider { display:none; }
      .sidebar-nav { flex-direction:row; gap:0.1rem; flex:1; padding-top:0; }
      .sidebar-footer { display:flex; margin-top:0; width:20%; }
      .sidebar-footer .sidebar-divider { display:none; }
      .sidebar-nav-item { min-width:0; min-height:54px; padding:0.35rem 0.25rem; flex:1; border-radius:9px; }
      .sidebar-nav-item.active::before { display:none; }
      .nav-icon { width:24px; height:24px; }
      .nav-icon svg { width:20px; height:20px; }
      .nav-label { font-size:0.55rem; }
      .navbar { padding:0.65rem 0; }
      .navbar .container { padding:0 0.9rem; }
      .navbar-brand { font-size:1.05rem; }
      .navbar-brand svg { width:24px; height:24px; }
      .navbar-nav { display:none; }
      .navbar-actions { gap:0.35rem; }
      .navbar-actions .text-muted { display:none; }
      .navbar-actions .btn { min-height:40px; padding:0.45rem 0.8rem; }
      .container { padding:0 var(--spacing-md); }
      h1 { font-size:1.9rem; }
      h2 { font-size:1.5rem; }
      h3 { font-size:1.2rem; }
      .btn { min-height:44px; }
      .card-header,.card-body { padding:var(--spacing-lg); }
      .hero { padding:2.5rem var(--spacing-md) 2rem; }
      .hero h1 { font-size:2.25rem; }
      .features,.stats,.analyze-page,.results-page,.history-page { padding:2.25rem var(--spacing-md); }
      .features-grid { grid-template-columns:1fr; }
      .analysis-details, .viz-grid { grid-template-columns:1fr; }
      .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .result-verdict { align-items:flex-start; padding:var(--spacing-lg); }
      .verdict-icon { width:58px; height:58px; }
      .verdict-icon svg { width:28px; height:28px; }
      .input-modes { overflow-x:auto; }
      .mode-btn { min-width:max-content; min-height:44px; }
      .url-input-group { flex-direction:column; }
      .url-input-group .btn { width:100%; }
      .file-upload-area { padding:2rem var(--spacing-md); }
      .history-filters { flex-direction:column; }
      .history-filters .form-select,.history-filters .form-input { width:100% !important; }
      .history-table { display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:var(--radius-lg); }
      .history-table thead,.history-table tbody { min-width:700px; }
      .history-table th,.history-table td { white-space:nowrap; padding:0.85rem 1rem; }
      .csv-history-grid { grid-template-columns:1fr; }
      .batch-summary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .batch-chart-grid { grid-template-columns:1fr; }
      .visualization-section { padding:3rem var(--spacing-md); }
      .batch-dashboard { min-height:auto; padding:2.25rem var(--spacing-md); }
      .batch-table-wrap { max-width:100%; -webkit-overflow-scrolling:touch; }
      .batch-results-table { min-width:720px; }
      .footer { padding:2.5rem var(--spacing-md) 1.5rem; }
      .footer-content { grid-template-columns:1fr 1fr; gap:var(--spacing-lg); }
    }
    @media(max-width:480px){
      #tg-app { padding-bottom:64px; }
      .app-sidebar { height:64px; }
      .hero-actions { flex-direction:column; width:100%; }
      .hero-actions .btn { width:100%; }
      .hero h1 { font-size:2rem; }
      .hero p { font-size:0.95rem; }
      .nav-label { font-size:0.5rem; }
      .stats-grid { grid-template-columns:1fr; }
      .batch-summary-grid { grid-template-columns:1fr; }
      .viz-card { padding:var(--spacing-lg); }
      .batch-chart-card,.batch-table-card { padding:var(--spacing-lg); }
      .chart-container { height:280px; }
      .batch-chart { height:280px; }
      .result-verdict { flex-direction:column; }
      .confidence-meter { padding:var(--spacing-lg); }
      .factor-item { align-items:flex-start; gap:var(--spacing-sm); }
      .factor-name { min-width:0; }
      .csv-history-actions { flex-direction:column; }
      .pagination-controls { gap:0.3rem; }
      .pagination-button { min-width:34px; height:36px; padding:0 0.55rem; font-size:0.78rem; }
      .pagination-nav { flex:1 1 120px; }
      .login-page { padding:var(--spacing-md); }
      .login-card { padding:1.75rem var(--spacing-lg); }
      .footer-content { grid-template-columns:1fr; }
    }

    .model-info-card { background:#fff; padding:20px; border-radius:12px; margin-top:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
  `}</style>
);

// ─────────────────────────────────────────────
// 2.  SVG ICON COMPONENTS
// ─────────────────────────────────────────────
const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);
const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const DocumentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);
const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
    />
  </svg>
);
const BrainIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z"
    />
  </svg>
);
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z" />
    <polyline points="9 21 9 13 15 13 15 21" />
  </svg>
);
const BarChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);
const HistoryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 15.5" />
  </svg>
);
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

// ─────────────────────────────────────────────
// 3.  MOCK DATA
// ─────────────────────────────────────────────
const MockData = {
  sampleResult: {
    verdict: "misinformation",
    verdictTitle: "Likely Misinformation",
    verdictDescription:
      "Our analysis indicates this content contains several indicators commonly associated with misinformation.",
    confidence: 87,
    originalContent:
      "This is sample analyzed content that would appear here...",
    factors: [
      {
        name: "Sensational Language",
        score: "High",
        status: "negative",
        scoreClass: "low",
      },
      {
        name: "Source Credibility",
        score: "Low",
        status: "negative",
        scoreClass: "low",
      },
      {
        name: "Factual Consistency",
        score: "Medium",
        status: "neutral",
        scoreClass: "medium",
      },
      {
        name: "Emotional Manipulation",
        score: "High",
        status: "negative",
        scoreClass: "low",
      },
      {
        name: "Citation Quality",
        score: "Low",
        status: "negative",
        scoreClass: "low",
      },
    ],
  },
  authenticResult: {
    verdict: "authentic",
    verdictTitle: "Likely Authentic",
    verdictDescription:
      "Our analysis suggests this content appears to be reliable and factually accurate.",
    confidence: 92,
    originalContent: "",
    factors: [
      {
        name: "Sensational Language",
        score: "Low",
        status: "positive",
        scoreClass: "high",
      },
      {
        name: "Source Credibility",
        score: "High",
        status: "positive",
        scoreClass: "high",
      },
      {
        name: "Factual Consistency",
        score: "High",
        status: "positive",
        scoreClass: "high",
      },
      {
        name: "Emotional Manipulation",
        score: "Low",
        status: "positive",
        scoreClass: "high",
      },
      {
        name: "Citation Quality",
        score: "Medium",
        status: "neutral",
        scoreClass: "medium",
      },
    ],
  },
  sampleTexts: {
    authentic: `A new study published in the Journal of Medical Research found that regular exercise can improve cardiovascular health. The peer-reviewed research, conducted over five years with 10,000 participants, showed that individuals who exercised at least 150 minutes per week had a 30% lower risk of heart disease. The findings align with recommendations from the World Health Organization.`,
    fake: `BREAKING: Scientists SHOCKED by discovery that drinking lemon water cures ALL diseases! Big Pharma DOESN'T want you to know this simple trick that doctors are hiding. Share before this gets DELETED! One weird fruit that DESTROYS cancer cells overnight - click here to learn the secret they're trying to hide from you!!!`,
  },
  historyItems: [
    {
      id: "1",
      date: "2026-05-14",
      preview: "Scientists discover new treatment...",
      result: "Authentic",
      confidence: 89,
    },
    {
      id: "2",
      date: "2026-05-13",
      preview: "SHOCKING: Government hiding...",
      result: "Misinformation",
      confidence: 94,
    },
    {
      id: "3",
      date: "2026-05-12",
      preview: "Local council announces new...",
      result: "Authentic",
      confidence: 78,
    },
    {
      id: "4",
      date: "2026-05-11",
      preview: "This ONE trick will make you...",
      result: "Misinformation",
      confidence: 91,
    },
  ],
};

// ─────────────────────────────────────────────
// 4.  REUSABLE COMPONENTS
// ─────────────────────────────────────────────

/** Top navbar inside the content area */
function Navbar({ currentPage, user, navigate, logout }) {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="navbar-brand" onClick={() => navigate("home")}>
          <ShieldIcon />
          <span>TruthGuard</span>
        </div>
        <ul className="navbar-nav">
          {["home", "analyze", "history"].map((p) => (
            <li key={p}>
              <span
                className={`nav-link ${currentPage === p ? "active" : ""}`}
                onClick={() => navigate(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </span>
            </li>
          ))}
          <li>
            <span className="nav-link" onClick={() => navigate("about")}>
              About
            </span>
          </li>
        </ul>
        <div className="navbar-actions">
          {user ? (
            <>
              <span className="text-sm text-muted">Welcome, {user}</span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/** Site footer */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>TruthGuard</h3>
          <p>
            AI-powered misinformation detection for a safer online experience.
          </p>
        </div>
        {[
          { title: "Product", links: ["Features", "How It Works", "Pricing"] },
          { title: "Resources", links: ["Documentation", "API", "Research"] },
          {
            title: "Company",
            links: ["About Us", "Contact", "Privacy Policy"],
          },
        ].map((col) => (
          <div key={col.title} className="footer-links">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 TruthGuard - COS30049 Group 10. All rights reserved.</p>
      </div>
    </footer>
  );
}

/** Full-screen loading overlay */
function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5.  PAGE COMPONENTS
// ─────────────────────────────────────────────

/** Login / sign-in page */
function LoginPage({ navigate, login }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    login(username);
    navigate("home");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <ShieldIcon />
          <h1>TruthGuard</h1>
          <p>Misinformation Detection System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="checkbox-group">
              <input type="checkbox" id="remember" />
              <span>Remember me</span>
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
          >
            Sign In
          </button>
        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <button
          className="btn btn-secondary"
          style={{ width: "100%" }}
          onClick={() => {
            login("Guest");
            navigate("home");
          }}
        >
          Continue as Guest
        </button>

        <p className="login-footer">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("home");
            }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

/** Home / landing page */
function HomePage({ navigate, currentPage, user, logout }) {
  return (
    <>
      <Navbar
        currentPage={currentPage}
        user={user}
        navigate={navigate}
        logout={logout}
      />

      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">
            <ShieldIcon /> AI-Powered Fact Checking
          </div>
          <h1>
            Detect <em>Misinformation</em>
            <br />
            with Confidence
          </h1>
          <p>
            Our advanced machine learning system analyzes text and social media
            content to identify false or misleading information — helping you
            stay informed and make better decisions online.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate("analyze")}
            >
              <SearchIcon /> Start Analyzing
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate("about")}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <p className="section-label">How It Works</p>
          <h2 className="text-center">Simple. Fast. Accurate.</h2>
          <div className="features-grid">
            {[
              {
                step: "Step 01",
                icon: <DocumentIcon />,
                title: "Input Content",
                body: "Paste text from social media posts, news articles, or enter a URL for analysis.",
              },
              {
                step: "Step 02",
                icon: <BrainIcon />,
                title: "AI Analysis",
                body: "Our machine learning models analyze text patterns, sentiment, and credibility indicators.",
              },
              {
                step: "Step 03",
                icon: <ChartIcon />,
                title: "Get Results",
                body: "Receive detailed analysis with confidence scores and visual breakdowns.",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <p className="feature-step">{f.step}</p>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {[
              { val: "93.13%", label: "Detection Accuracy" },
              { val: "<3s", label: "Analysis Time" },
              { val: "10K+", label: "Dataset Samples" },
              { val: "3", label: "ML Models" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <h3>{s.val}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/** Analyze page — input form with Text / URL / File modes */
function AnalyzePage({
  navigate,
  currentPage,
  user,
  logout,
  onAnalysisComplete,
  onCsvComplete,
}) {
  const [inputMode, setInputMode] = useState("text");
  const [content, setContent] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvResults, setCsvResults] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedLabelColumn, setSelectedLabelColumn] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const fileInputRef = useRef();

  const realCount = csvResults.filter(
    (r) => r.prediction === "REAL NEWS",
  ).length;

  const fakeCount = csvResults.filter(
    (r) => r.prediction === "FAKE NEWS",
  ).length;
  // Validation
  const [fieldErrors, setFieldErrors] = useState({});

  const validateText = (val) => {
    if (!val || val.trim().length < 10)
      return "Please enter at least 10 characters to analyze.";
    return "";
  };
  const validateUrl = (val) => {
    if (!val || !val.trim()) return "Please enter a URL.";
    try {
      new URL(val);
    } catch {
      return "Please enter a valid URL (e.g. https://example.com).";
    }
    return "";
  };

  const handleTextChange = (e) => {
    const v = e.target.value;
    setContent(v);
    setCharCount(v.length);
    if (fieldErrors.text)
      setFieldErrors((prev) => ({ ...prev, text: validateText(v) }));
  };

  const handleUrlChange = (e) => {
    setUrlValue(e.target.value);
    if (fieldErrors.url)
      setFieldErrors((prev) => ({ ...prev, url: validateUrl(e.target.value) }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFieldErrors((prev) => ({
        ...prev,
        file: "Please upload a CSV file.",
      }));
      return;
    }

    setSelectedFile(file);
    setCsvFile(file);
    setCsvColumns([]);
    setSelectedColumn("");
    setSelectedLabelColumn("");
    setEvalResult(null);
    setCsvResults([]);

    // Read first line to extract column headers
    const reader = new FileReader();
    reader.onload = (e) => {
      const firstLine = e.target.result.split("\n")[0];
      const cols = firstLine.split(",").map((c) =>
        c.trim().replace(/^"|"$/g, "")
      );
      setCsvColumns(cols);
      if (cols.includes("cleaned_text")) setSelectedColumn("cleaned_text");
      const labelGuess = cols.find((c) => /^label$/i.test(c) || /^class$/i.test(c));
      if (labelGuess) setSelectedLabelColumn(labelGuess);
    };
    reader.readAsText(file);

    setFieldErrors((prev) => ({
      ...prev,
      file: "",
    }));
  };

  const loadSample = (type) => {
    setInputMode("text");
    setContent(MockData.sampleTexts[type]);
    setCharCount(MockData.sampleTexts[type].length);
  };

  const readFileContent = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type === "text/plain") resolve(e.target.result);
        else if (file.type === "application/pdf")
          resolve(
            "PDF content: " +
              e.target.result?.toString().substring(0, 100) +
              "...",
          );
        else
          resolve(
            "Document content: " +
              e.target.result?.toString().substring(0, 100) +
              "...",
          );
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      if (file.type === "text/plain") reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    });

  const uploadCSV = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }
    if (!selectedColumn) {
      alert("Please select the text column from the dropdown.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("column_name", selectedColumn);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      const rows = data.rows || data; // backward-safe
      setCsvResults(rows);
      if (onCsvComplete) onCsvComplete(rows, csvFile.name, selectedColumn);
    } catch (error) {
      console.error(error);
      alert("CSV upload failed.");
    }
  };

  const evaluateModel = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }
    if (!selectedColumn) {
      alert("Please select the text column from the dropdown.");
      return;
    }
    if (!selectedLabelColumn) {
      alert("Please select the label column (the column that says REAL/FAKE) to evaluate the model.");
      return;
    }

    setEvaluating(true);
    setEvalResult(null);

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("column_name", selectedColumn);
    formData.append("label_column", selectedLabelColumn);

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        setEvaluating(false);
        return;
      }

      setEvalResult(data);
    } catch (error) {
      console.error(error);
      alert("Model evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let textToAnalyze = "";

    // Per-mode validation
    if (inputMode === "text") {
      const err = validateText(content);
      if (err) {
        setFieldErrors({ text: err });
        return;
      }
      textToAnalyze = content;
    } else if (inputMode === "url") {
      const err = validateUrl(urlValue);
      if (err) {
        setFieldErrors({ url: err });
        return;
      }
      textToAnalyze = urlValue;
    } else if (inputMode === "file") {
      if (!csvFile) {
        setFieldErrors({
          file: "Please upload a CSV file.",
        });
        return;
      }

      await uploadCSV();

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToAnalyze }),
      });
      const data = await response.json();

      const base =
        data.prediction === "REAL NEWS"
          ? MockData.authenticResult
          : MockData.sampleResult;
      const result = {
        ...base,
        confidence: data.confidence,
        originalContent:
          textToAnalyze.substring(0, 500) +
          (textToAnalyze.length > 500 ? "..." : ""),
      };

      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        preview: textToAnalyze.substring(0, 50) + "...",
        result:
          data.prediction === "REAL NEWS" ? "Authentic" : "Misinformation",
        confidence: data.confidence,

        fullResult: result,
      };

      onAnalysisComplete(result, historyItem);
      navigate("results");
    } catch {
      setError(
        "Error connecting to AI server. Please ensure the backend is running at http://127.0.0.1:8000",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const counterClass =
    charCount > 4500 ? "error" : charCount > 3750 ? "warning" : "";

  return (
    <>
      {isLoading && (
        <LoadingOverlay message="Analyzing content with ML model..." />
      )}
      <Navbar
        currentPage={currentPage}
        user={user}
        navigate={navigate}
        logout={logout}
      />

      <section className="analyze-page">
        <div className="container">
          <div className="analyze-header">
            <h1>Content Analysis</h1>
            <p className="text-muted">
              Select an input method and let our AI analyze the content for
              potential misinformation
            </p>
          </div>

          <div className="info-box">
            <p>
              <strong>How it works:</strong> Upload text, provide a URL, or
              import a file. Our analysis evaluates credibility indicators,
              language patterns, and source reliability to provide a
              comprehensive report.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger mb-lg">
              <WarningIcon />
              <span>{error}</span>
            </div>
          )}

          <div className="card analyze-card">
            <div className="card-body">
              {/* Mode Toggle */}
              <div className="input-modes">
                {[
                  { id: "text", label: "Text", icon: <DocumentIcon /> },
                  { id: "url", label: "URL", icon: <LinkIcon /> },
                  { id: "file", label: "File", icon: <UploadIcon /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`mode-btn ${inputMode === m.id ? "active" : ""}`}
                    onClick={() => {
                      setInputMode(m.id);
                      setFieldErrors({});
                    }}
                    title={`Switch to ${m.label} mode`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Text Mode */}
                {inputMode === "text" && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="content-input">
                      Content to Analyze
                    </label>
                    <textarea
                      id="content-input"
                      className="form-input"
                      style={{ minHeight: "200px" }}
                      placeholder="Paste the text content you want to analyze..."
                      rows={8}
                      maxLength={5000}
                      value={content}
                      onChange={handleTextChange}
                      aria-describedby="char-counter"
                    />
                    <div
                      className={`char-counter ${counterClass}`}
                      id="char-counter"
                    >
                      {charCount} / 5000 characters
                    </div>
                    {fieldErrors.text && (
                      <div className="form-error">{fieldErrors.text}</div>
                    )}
                  </div>
                )}

                {/* URL Mode */}
                {inputMode === "url" && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="url-input">
                      Article or Post URL
                    </label>
                    <div className="url-input-group">
                      <input
                        type="url"
                        id="url-input"
                        className="form-input"
                        placeholder="https://example.com/article"
                        value={urlValue}
                        onChange={handleUrlChange}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          alert(
                            "URL fetch feature — to be implemented with web scraping backend",
                          )
                        }
                      >
                        Fetch
                      </button>
                    </div>
                    <p className="form-helper">
                      Enter a URL to automatically extract and analyze the
                      article content
                    </p>
                    {fieldErrors.url && (
                      <div className="form-error">{fieldErrors.url}</div>
                    )}
                  </div>
                )}

                {/* File Mode */}
                {inputMode === "file" && (
                  <div className="form-group">
                    <label className="form-label">Upload File</label>
                    <div
                      className="file-upload-area"
                      style={{
                        borderColor: dragOver
                          ? "var(--primary-blue)"
                          : undefined,
                        background: dragOver
                          ? "rgba(107,91,149,0.03)"
                          : undefined,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handleFileSelect(f);
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: "none" }}
                        accept=".csv"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                      <UploadIcon />
                      <p className="file-upload-text">
                        Drag and drop your file here, or{" "}
                        <span className="file-upload-link">
                          click to select
                        </span>
                      </p>
                      <p className="file-upload-hint">
                        Supported: CSV files only
                      </p>
                    </div>

                    {selectedFile && (
                      <div className="file-info">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div style={{ fontSize: "2rem" }}>📄</div>
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontWeight: 600,
                                color: "var(--gray-900)",
                                margin: 0,
                              }}
                            >
                              {selectedFile.name}
                            </p>
                            <p
                              style={{
                                color: "var(--gray-500)",
                                fontSize: "0.9rem",
                                margin: "0.25rem 0 0",
                              }}
                            >
                              {selectedFile.type.split("/")[1].toUpperCase()} •{" "}
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: "0.5rem" }}
                            onClick={() => {
                              setSelectedFile(null);
                              setCsvColumns([]);
                              setSelectedColumn("");
                              setCsvResults([]);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Column picker — shown once CSV is loaded */}
                    {csvColumns.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <label
                          style={{
                            display: "block",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--gray-700)",
                            marginBottom: "0.4rem",
                          }}
                        >
                          Which column contains the article text?
                        </label>
                        <select
                          value={selectedColumn}
                          onChange={(e) => setSelectedColumn(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.55rem 0.85rem",
                            borderRadius: "var(--radius-md)",
                            border: "1.5px solid var(--gray-300)",
                            fontSize: "0.9rem",
                            color: "var(--gray-800)",
                            background: "var(--white)",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">-- Select a column --</option>
                          {csvColumns.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                        {selectedColumn && (
                          <p style={{
                            marginTop: "0.4rem",
                            fontSize: "0.8rem",
                            color: "var(--success-green)",
                          }}>
                            ✓ Using column: <strong>{selectedColumn}</strong>
                          </p>
                        )}

                        {/* Optional label column for model evaluation */}
                        <div style={{ marginTop: "1.25rem", paddingTop: "1.1rem", borderTop: "1px dashed var(--gray-200)" }}>
                          <label style={{
                            display: "block", fontWeight: 600, fontSize: "0.875rem",
                            color: "var(--gray-700)", marginBottom: "0.3rem",
                          }}>
                            Optional: which column has the true REAL/FAKE label?
                          </label>
                          <p style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                            If your dataset already has correct labels, pick that column to check how accurate the model is on your data — without retraining it.
                          </p>
                          <select
                            value={selectedLabelColumn}
                            onChange={(e) => { setSelectedLabelColumn(e.target.value); setEvalResult(null); }}
                            style={{
                              width: "100%", padding: "0.55rem 0.85rem", borderRadius: "var(--radius-md)",
                              border: "1.5px solid var(--gray-300)", fontSize: "0.9rem",
                              color: "var(--gray-800)", background: "var(--white)", cursor: "pointer",
                            }}
                          >
                            <option value="">-- No label column / skip evaluation --</option>
                            {csvColumns.map((col) => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>

                          {selectedLabelColumn && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={evaluateModel}
                              disabled={evaluating}
                              style={{ marginTop: "0.85rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                            >
                              {evaluating ? "Evaluating…" : "🧪 Evaluate Model Accuracy on This Dataset"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {fieldErrors.file && (
                      <div className="form-error">{fieldErrors.file}</div>
                    )}

                    {evalResult && (
                      <ModelEvaluationCard evalResult={evalResult} />
                    )}
                  </div>
                )}

                {/* Options */}
                <div className="analyze-options">
                  {[
                    {
                      id: "opt-detailed",
                      label: "Detailed analysis (slower but more thorough)",
                      defaultChecked: true,
                    },
                    { id: "opt-sources", label: "Check source credibility" },
                    {
                      id: "opt-sentiment",
                      label: "Analyze emotional language",
                    },
                  ].map((o) => (
                    <label key={o.id} className="checkbox-group">
                      <input
                        type="checkbox"
                        id={o.id}
                        defaultChecked={o.defaultChecked}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg mt-lg"
                  style={{ width: "100%" }}
                >
                  <SearchIcon /> Analyze Content
                </button>
              </form>
            </div>
          </div>

          {/* Sample Buttons */}
          <div className="mt-xl text-center">
            <p className="text-muted mb-md">Try with sample content:</p>
            <div className="flex-center gap-md" style={{ flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => loadSample("authentic")}
              >
                Load Authentic Sample
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => loadSample("fake")}
              >
                Load Fake News Sample
              </button>
            </div>
          </div>
        </div>
        {csvResults.length > 0 && (
          <CsvResultsPanel
            csvResults={csvResults}
            selectedColumn={selectedColumn}
            navigate={navigate}
          />
        )}
      </section>

      <Footer />
    </>
  );
}

/* ── CSV Results Panel with Charts + Download ── */
/** Shows accuracy/precision/recall/F1 + confusion matrix when evaluating
 *  the existing trained model against a user's labeled dataset. */
function ModelEvaluationCard({ evalResult }) {
  const { accuracy, precision, recall, f1_score, confusion_matrix, rows_evaluated, rows_skipped_unmatched_label } = evalResult;
  const cm = confusion_matrix || {};

  const metrics = [
    { label: "Accuracy", value: accuracy, color: "var(--primary-blue)" },
    { label: "Precision", value: precision, color: "#10b981" },
    { label: "Recall", value: recall, color: "#f59e0b" },
    { label: "F1 Score", value: f1_score, color: "#8b5cf6" },
  ];

  return (
    <div className="card" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
      <h4 style={{ marginBottom: "0.25rem" }}>🧪 Model Evaluation Results</h4>
      <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginBottom: "1.25rem" }}>
        How the existing trained model performs on your labeled dataset (evaluated on {rows_evaluated.toLocaleString()} rows
        {rows_skipped_unmatched_label > 0 ? `, ${rows_skipped_unmatched_label} skipped due to unrecognized labels` : ""}). No retraining was performed.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.85rem", marginBottom: "1.5rem" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ textAlign: "center", background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "0.85rem 0.5rem" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: m.color }}>{m.value}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--gray-700)", marginBottom: "0.6rem" }}>Confusion Matrix</p>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "0.4rem", maxWidth: "420px", fontSize: "0.82rem" }}>
        <div></div>
        <div style={{ textAlign: "center", fontWeight: 600, color: "var(--gray-500)" }}>Predicted Real</div>
        <div style={{ textAlign: "center", fontWeight: 600, color: "var(--gray-500)" }}>Predicted Fake</div>

        <div style={{ fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center" }}>Actual Real</div>
        <div style={{ background: "rgba(16,185,129,0.12)", borderRadius: "8px", padding: "0.7rem", textAlign: "center", fontWeight: 700, color: "#10b981" }}>
          {cm.true_negative ?? 0}
        </div>
        <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: "8px", padding: "0.7rem", textAlign: "center", fontWeight: 700, color: "#ef4444" }}>
          {cm.false_positive ?? 0}
        </div>

        <div style={{ fontWeight: 600, color: "var(--gray-500)", display: "flex", alignItems: "center" }}>Actual Fake</div>
        <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: "8px", padding: "0.7rem", textAlign: "center", fontWeight: 700, color: "#ef4444" }}>
          {cm.false_negative ?? 0}
        </div>
        <div style={{ background: "rgba(16,185,129,0.12)", borderRadius: "8px", padding: "0.7rem", textAlign: "center", fontWeight: 700, color: "#10b981" }}>
          {cm.true_positive ?? 0}
        </div>
      </div>
    </div>
  );
}

function CsvResultsPanel({ csvResults, selectedColumn, navigate }) {
  const canvasRef = useRef(null);
  const barRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  const total = csvResults.length;
  const realCount = csvResults.filter((r) => r.prediction === "REAL NEWS").length;
  const fakeCount = csvResults.filter((r) => r.prediction === "FAKE NEWS").length;
  const realPct = total ? Math.round((realCount / total) * 100) : 0;
  const fakePct = total ? Math.round((fakeCount / total) * 100) : 0;

  // Donut chart
  useEffect(() => {
    if (!canvasRef.current) return;
    if (pieChartRef.current) pieChartRef.current.destroy();
    pieChartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["Real News", "Fake News"],
        datasets: [{
          data: [realCount, fakeCount],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 3,
          borderColor: "#fff",
          hoverOffset: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom", labels: { padding: 16, font: { size: 13 } } },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} articles` } },
        },
      },
    });
    return () => { if (pieChartRef.current) pieChartRef.current.destroy(); };
  }, [csvResults]);

  // Bar chart
  useEffect(() => {
    if (!barRef.current) return;
    if (barChartRef.current) barChartRef.current.destroy();
    barChartRef.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: ["Real News", "Fake News"],
        datasets: [{
          label: "Articles",
          data: [realCount, fakeCount],
          backgroundColor: ["rgba(16,185,129,0.8)", "rgba(239,68,68,0.8)"],
          borderColor: ["#10b981", "#ef4444"],
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} articles` } },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
          x: { grid: { display: false } },
        },
      },
    });
    return () => { if (barChartRef.current) barChartRef.current.destroy(); };
  }, [csvResults]);

  const handleDownload = () => {
    const headers = Object.keys(csvResults[0]).join(",");
    const rows = csvResults.map((row) =>
      Object.values(row).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "truthguard_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card" style={{ marginTop: "30px" }}>
      {/* Header */}
      <div className="card-header" style={{ paddingBottom: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>📊 CSV Analysis Results</h3>
      </div>

      {/* Summary strip */}
      <div style={{
        display: "flex", gap: "1rem", flexWrap: "wrap",
        padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--gray-200)",
      }}>
        {[
          { label: "Total Records", value: total, color: "var(--primary-blue)" },
          { label: "Real News", value: realCount, color: "#10b981" },
          { label: "Fake News", value: fakeCount, color: "#ef4444" },
          { label: "Fake Rate", value: `${fakePct}%`, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{
            flex: "1 1 120px", textAlign: "center",
            background: "var(--gray-50)", borderRadius: "var(--radius-md)",
            padding: "0.85rem 1rem",
          }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem", padding: "1.5rem",
      }}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--gray-700)" }}>Distribution</p>
          <div style={{ height: "240px" }}><canvas ref={canvasRef} /></div>
        </div>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "0.75rem", color: "var(--gray-700)" }}>Count Breakdown</p>
          <div style={{ height: "240px" }}><canvas ref={barRef} /></div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button
          className="btn btn-primary"
          onClick={handleDownload}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 2rem" }}
        >
          ⬇️ Download Results as CSV
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("batch-results")}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 2rem" }}
        >
          📈 View ML Results Page
        </button>
      </div>
    </div>
  );
}

const CSV_KEYWORD_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for",
  "from", "had", "has", "have", "he", "her", "his", "i", "if", "in", "is",
  "it", "its", "me", "my", "not", "of", "on", "or", "our", "she", "so",
  "that", "the", "their", "them", "they", "this", "to", "was", "we", "were",
  "what", "when", "where", "which", "who", "will", "with", "would", "you",
  "your",
]);

function getPaginationPages(currentPage, totalPages, visiblePages = 5) {
  if (totalPages <= visiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(visiblePages / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + visiblePages - 1);
  start = Math.max(1, end - visiblePages + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function createCsvAnalysisSnapshot(results, fileName, textColumn = "cleaned_text") {
  const realRows = results.filter((row) => row.prediction === "REAL NEWS");
  const fakeRows = results.filter((row) => row.prediction === "FAKE NEWS");
  const confidenceBins = [0, 0, 0, 0, 0];
  const keywordCounts = new Map();

  results.forEach((row) => {
    const confidence = Math.min(
      100,
      Math.max(0, Number(row.confidence) || 0),
    );
    const binIndex = confidence === 100 ? 4 : Math.floor(confidence / 20);
    confidenceBins[binIndex] += 1;

    const words = String(row[textColumn] || row.cleaned_text || "")
      .toLowerCase()
      .match(/[a-z][a-z']+/g) || [];
    words.forEach((word) => {
      if (word.length > 1 && !CSV_KEYWORD_STOP_WORDS.has(word)) {
        keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
      }
    });
  });

  const averageFor = (rows) =>
    rows.length
      ? rows.reduce(
          (sum, row) => sum + (Number(row.confidence) || 0),
          0,
        ) / rows.length
      : 0;
  const averageConfidence = results.length
    ? results.reduce(
        (sum, row) => sum + (Number(row.confidence) || 0),
        0,
      ) / results.length
    : 0;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName,
    textColumn,
    uploadDate: new Date().toISOString(),
    totalRecords: results.length,
    realNews: realRows.length,
    fakeNews: fakeRows.length,
    averageConfidence: Number(averageConfidence.toFixed(2)),
    results,
    charts: {
      classificationDistribution: [realRows.length, fakeRows.length],
      confidenceDistribution: confidenceBins,
      averageConfidenceByType: [
        Number(averageFor(realRows).toFixed(2)),
        Number(averageFor(fakeRows).toFixed(2)),
      ],
      topKeywords: [...keywordCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    },
  };
}

/** Analysis Results Page — renders a saved CSV analysis without rerunning prediction. */
function BatchResultsPage({ navigate, currentPage, user, logout, analysis }) {
  const distributionRef = useRef(null);
  const confidenceDistributionRef = useRef(null);
  const averageConfidenceRef = useRef(null);
  const keywordsRef = useRef(null);
  const chartsRef = useRef([]);
  const [tablePage, setTablePage] = useState(1);

  const csvResults = analysis?.results || [];
  const total = analysis?.totalRecords || 0;
  const realCount = analysis?.realNews || 0;
  const fakeCount = analysis?.fakeNews || 0;
  const averageConfidence = analysis?.averageConfidence || 0;
  const rowsPerPage = 20;
  const tableTotalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const activeTablePage = Math.min(tablePage, tableTotalPages);
  const tableStartIndex = (activeTablePage - 1) * rowsPerPage;
  const tableRows = csvResults.slice(
    tableStartIndex,
    tableStartIndex + rowsPerPage,
  );
  const tablePageNumbers = getPaginationPages(
    activeTablePage,
    tableTotalPages,
  );

  useEffect(() => {
    chartsRef.current.forEach((chart) => chart.destroy());
    chartsRef.current = [];

    if (!analysis || csvResults.length === 0) return undefined;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    };

    chartsRef.current = [
      new Chart(distributionRef.current, {
        type: "pie",
        data: {
          labels: ["REAL NEWS", "FAKE NEWS"],
          datasets: [{
            data: analysis.charts.classificationDistribution,
            backgroundColor: ["#7c6bab", "#c15c8a"],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 10,
          }],
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { padding: 18, usePointStyle: true },
            },
            tooltip: {
              callbacks: {
                label: (context) =>
                  ` ${context.label}: ${context.parsed.toLocaleString()}`,
              },
            },
          },
        },
      }),
      new Chart(confidenceDistributionRef.current, {
        type: "bar",
        data: {
          labels: ["0–20", "20–40", "40–60", "60–80", "80–100"],
          datasets: [{
            label: "Records",
            data: analysis.charts.confidenceDistribution,
            backgroundColor: "rgba(107,91,149,0.82)",
            borderColor: "#5a4a7a",
            borderWidth: 1,
            borderRadius: 8,
          }],
        },
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "rgba(107,91,149,0.08)" },
            },
            x: { grid: { display: false } },
          },
        },
      }),
      new Chart(averageConfidenceRef.current, {
        type: "bar",
        data: {
          labels: ["REAL NEWS", "FAKE NEWS"],
          datasets: [{
            label: "Average Confidence",
            data: analysis.charts.averageConfidenceByType,
            backgroundColor: ["#7c6bab", "#c15c8a"],
            borderRadius: 8,
            maxBarThickness: 90,
          }],
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` Average confidence: ${context.parsed.y}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => `${value}%` },
              grid: { color: "rgba(107,91,149,0.08)" },
            },
            x: { grid: { display: false } },
          },
        },
      }),
      new Chart(keywordsRef.current, {
        type: "bar",
        data: {
          labels: analysis.charts.topKeywords.map(([word]) => word),
          datasets: [{
            label: "Frequency",
            data: analysis.charts.topKeywords.map(([, count]) => count),
            backgroundColor: "rgba(107,91,149,0.82)",
            hoverBackgroundColor: "#5a4a7a",
            borderRadius: 7,
            borderSkipped: false,
          }],
        },
        options: {
          ...commonOptions,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              ticks: { precision: 0 },
              grid: { color: "rgba(107,91,149,0.08)" },
            },
            y: { grid: { display: false } },
          },
        },
      }),
    ];

    return () => {
      chartsRef.current.forEach((chart) => chart.destroy());
      chartsRef.current = [];
    };
  }, [analysis, csvResults.length]);

  if (total === 0) {
    return (
      <>
        <Navbar currentPage={currentPage} user={user} navigate={navigate} logout={logout} />
        <section className="batch-empty">
          <h2>No CSV predictions yet</h2>
          <p>Upload a CSV file to generate its dashboard automatically.</p>
          <button className="btn btn-primary" onClick={() => navigate("analyze")}>
            Upload CSV
          </button>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar currentPage={currentPage} user={user} navigate={navigate} logout={logout} />
      <section className="batch-dashboard">
        <div className="container">
          <div className="batch-dashboard-header">
            <h1>Analysis Results</h1>
            <p>
              {analysis.fileName} · {new Date(analysis.uploadDate).toLocaleString()}
            </p>
          </div>

          <div className="batch-summary-grid">
            {[
              ["Total Records", total.toLocaleString()],
              ["Real News Count", realCount.toLocaleString()],
              ["Fake News Count", fakeCount.toLocaleString()],
              ["Average Confidence", `${averageConfidence.toFixed(2)}%`],
            ].map(([label, value]) => (
              <div className="batch-summary-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="batch-chart-grid">
            <div className="batch-chart-card">
              <h3>Classification Distribution</h3>
              <p>Real and fake predictions in this upload</p>
              <div className="batch-chart"><canvas ref={distributionRef} /></div>
            </div>
            <div className="batch-chart-card">
              <h3>Prediction Confidence Distribution</h3>
              <p>Record count across 20-point confidence ranges</p>
              <div className="batch-chart"><canvas ref={confidenceDistributionRef} /></div>
            </div>
            <div className="batch-chart-card">
              <h3>Average Confidence by Prediction Type</h3>
              <p>Mean model confidence for each predicted class</p>
              <div className="batch-chart"><canvas ref={averageConfidenceRef} /></div>
            </div>
            <div className="batch-chart-card">
              <h3>Top Keywords From Uploaded CSV</h3>
              <p>Most frequent meaningful words in the <code>{analysis?.textColumn || "text"}</code> column</p>
              <div className="batch-chart batch-keywords-chart">
                <canvas ref={keywordsRef} />
              </div>
            </div>
          </div>

          <div className="batch-table-card">
            <h3>Prediction Results</h3>
            <div className="batch-table-wrap">
              <table className="batch-results-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{analysis?.textColumn || "Text"}</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, index) => (
                    <tr key={tableStartIndex + index}>
                      <td>{tableStartIndex + index + 1}</td>
                      <td>
                        {String(row[analysis?.textColumn] || row.cleaned_text || row.text || "").slice(0, 140)}
                        {String(row[analysis?.textColumn] || row.cleaned_text || row.text || "").length > 140 ? "…" : ""}
                      </td>
                      <td>
                        <span className={`batch-badge ${row.prediction === "FAKE NEWS" ? "fake" : "real"}`}>
                          {row.prediction}
                        </span>
                      </td>
                      <td>{Number(row.confidence || 0).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pagination-summary">
              Showing {tableStartIndex + 1}–
              {Math.min(tableStartIndex + rowsPerPage, total)} of{" "}
              {total.toLocaleString()} records
            </p>
            <div className="pagination-controls" aria-label="Prediction table pagination">
              <button
                className="pagination-button pagination-nav"
                disabled={activeTablePage === 1}
                onClick={() => setTablePage(activeTablePage - 1)}
              >
                &lt;&lt; Previous
              </button>
              {tablePageNumbers.map((page) => (
                <button
                  className={`pagination-button ${page === activeTablePage ? "active" : ""}`}
                  key={page}
                  onClick={() => setTablePage(page)}
                  aria-current={page === activeTablePage ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                className="pagination-button pagination-nav"
                disabled={activeTablePage === tableTotalPages}
                onClick={() => setTablePage(activeTablePage + 1)}
              >
                Next &gt;&gt;
              </button>
            </div>
          </div>

          <div className="batch-actions">
            <button className="btn btn-primary" onClick={() => navigate("analyze")}>
              Upload Another CSV
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

/* ── Pie Chart: Classification Distribution ── */
function PieChart({ stats }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: ["Real News", "Fake News"],
        datasets: [
          {
            data: [stats.real_news, stats.fake_news],
            backgroundColor: ["#7c6bab", "#c15c8a"],
            borderWidth: 3,
            borderColor: "#fff",
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 16, font: { size: 13 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const percentage = stats.total_records
                  ? ((ctx.parsed / stats.total_records) * 100).toFixed(1)
                  : 0;
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [stats]);

  return <canvas ref={canvasRef} />;
}

/* ── Bar Charts: Dataset Counts and Average Text Length ── */
function DatasetBarChart({ labels, values, datasetLabel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data: values,
            backgroundColor: ["rgba(124,107,171,0.86)", "rgba(193,92,138,0.86)"],
            borderColor: ["#6b5b95", "#a94673"],
            borderWidth: 1,
            borderRadius: 9,
            maxBarThickness: 90,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${datasetLabel}: ${ctx.parsed.y.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: "rgba(107,91,149,0.08)" },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#495057", font: { weight: 600 } },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [datasetLabel, labels, values]);

  return <canvas ref={canvasRef} />;
}

/* ── Horizontal Bar Chart: Top Fake News Keywords ── */
function KeywordsChart({ keywords }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: keywords.map(([word]) => word),
        datasets: [
          {
            label: "Frequency",
            data: keywords.map(([, count]) => count),
            backgroundColor: "rgba(107,91,149,0.82)",
            hoverBackgroundColor: "#5a4a7a",
            borderRadius: 7,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Frequency: ${ctx.parsed.x.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: "rgba(107,91,149,0.08)" },
          },
          y: {
            ticks: { color: "#495057", font: { weight: 600 } },
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [keywords]);

  return <canvas ref={canvasRef} />;
}

/** Results page with dataset-driven visualizations */
function ResultsPage({
  navigate,
  currentPage,
  user,
  logout,
  currentAnalysis,
}) {
  const result = currentAnalysis || MockData.sampleResult;
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        setStatsError("");
        const response = await fetch("http://127.0.0.1:8000/stats", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Statistics request failed (${response.status})`);
        }
        setStats(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatsError(
            "Unable to load dataset statistics. Please ensure the FastAPI backend is running.",
          );
        }
      }
    }

    loadStats();
    return () => controller.abort();
  }, []);

  const verdictClass =
    result.verdict === "authentic"
      ? "authentic"
      : result.verdict === "misinformation"
        ? "misinformation"
        : "uncertain";
  const verdictIcon =
    result.verdict === "authentic" ? (
      <CheckIcon />
    ) : result.verdict === "misinformation" ? (
      <XIcon />
    ) : (
      <WarningIcon />
    );
  const confidenceClass =
    result.confidence >= 80
      ? "high"
      : result.confidence >= 50
        ? "medium"
        : "low";

  const downloadReport = () => {
    const report = `TruthGuard Analysis Report\n\nPrediction:\n${result.verdictTitle}\n\nConfidence:\n${result.confidence}%\n\nGenerated:\n${new Date().toLocaleString()}\n\nModel:\nLinear SVM + TF-IDF\n\nTraining Accuracy:\n93.13%\n`;
    const blob = new Blob([report], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "analysis_report.txt";
    link.click();
  };

  const shareResult = () => {
    if (navigator.share) {
      navigator.share({
        title: "TruthGuard Analysis Result",
        text: "Check out this misinformation analysis result",
        url: window.location.href,
      });
    } else {
      alert("Share feature — copy the URL to share");
    }
  };

  return (
    <>
      <Navbar
        currentPage={currentPage}
        user={user}
        navigate={navigate}
        logout={logout}
      />

      <section className="results-page">
        <div className="container">
          <div className="results-header">
            <h1>Analysis Results</h1>
            <p className="text-muted">Here&apos;s what our AI found</p>
          </div>

          {/* Main verdict card */}
          <div className="card result-summary">
            <div className="result-verdict">
              <div className={`verdict-icon ${verdictClass}`}>
                {verdictIcon}
              </div>
              <div className="verdict-content">
                <h2>{result.verdictTitle}</h2>
                <p>{result.verdictDescription}</p>
              </div>
            </div>
            <div className="confidence-meter">
              <div className="confidence-label">
                <span>Confidence Level</span>
                <span>{result.confidence}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className={`confidence-fill ${confidenceClass}`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Model info */}
          <div
            className="card"
            style={{
              marginBottom: 20,
              maxWidth: 760,
              margin: "0 auto var(--spacing-xl)",
            }}
          >
            <div className="card-body">
              <h3>Model Information</h3>
              <p>
                <strong>Model Used:</strong> Linear SVM + TF-IDF
              </p>
              <p>
                <strong>Training Accuracy:</strong> 93.13%
              </p>
              <p>
                <strong>Datasets:</strong> Twitter Misinformation + Fake News
                Dataset
              </p>
            </div>
          </div>

          {/* Analysis details */}
          <div className="analysis-details">
            <div className="detail-card">
              <div className="detail-card-header">
                <ChartIcon /> Analysis Factors
              </div>
              <div className="detail-card-body">
                <ul className="factor-list">
                  {result.factors.map((f) => (
                    <li key={f.name} className="factor-item">
                      <span className="factor-name">
                        <span className={`factor-indicator ${f.status}`} />
                        {f.name}
                      </span>
                      <span className={`factor-score ${f.scoreClass}`}>
                        {f.score}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-card-header">
                <DocumentIcon /> Analyzed Content
              </div>
              <div className="detail-card-body">
                <div className="original-content">{result.originalContent}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex-center gap-md mt-xl"
            style={{ flexWrap: "wrap" }}
          >
            <button
              className="btn btn-primary"
              onClick={() => navigate("analyze")}
            >
              Analyze Another
            </button>
            <button className="btn btn-secondary" onClick={downloadReport}>
              Download Report
            </button>
            <button className="btn btn-secondary" onClick={shareResult}>
              Share Result
            </button>
          </div>
        </div>
      </section>

      {/* ── Dataset statistics dashboard ── */}
      <section className="visualization-section">
        <div className="container">
          <div className="visualization-header">
            <h2>Data Visualization</h2>
            <p>Live insights from the cleaned TruthGuard dataset</p>
          </div>

          {statsError ? (
            <div className="visualization-status visualization-error">
              {statsError}
            </div>
          ) : !stats ? (
            <div className="visualization-status">
              <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
              Loading dataset statistics...
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Records</span>
                  <span className="stat-value">
                    {stats.total_records.toLocaleString()}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Real News</span>
                  <span className="stat-value">
                    {stats.real_news.toLocaleString()}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Fake News</span>
                  <span className="stat-value">
                    {stats.fake_news.toLocaleString()}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Average Length</span>
                  <span className="stat-value">
                    {(
                      (stats.real_average_length + stats.fake_average_length) /
                      2
                    ).toFixed(2)}
                    <span className="stat-unit">words</span>
                  </span>
                </div>
              </div>

              <div className="viz-grid">
                <div className="viz-card">
                  <h4>
                    <ChartIcon /> Classification Distribution
                  </h4>
                  <p className="viz-card-subtitle">
                    Proportion of real and fake news records
                  </p>
                  <div className="chart-container">
                    <PieChart stats={stats} />
                  </div>
                </div>

                <div className="viz-card">
                  <h4>
                    <ChartIcon /> Dataset Distribution
                  </h4>
                  <p className="viz-card-subtitle">
                    Record count for each classification
                  </p>
                  <div className="chart-container">
                    <DatasetBarChart
                      labels={["Real News Count", "Fake News Count"]}
                      values={[stats.real_news, stats.fake_news]}
                      datasetLabel="Records"
                    />
                  </div>
                </div>

                <div className="viz-card">
                  <h4>
                    <ChartIcon /> Average Text Length
                  </h4>
                  <p className="viz-card-subtitle">
                    Average number of words per cleaned article
                  </p>
                  <div className="chart-container">
                    <DatasetBarChart
                      labels={[
                        "Real News Average Length",
                        "Fake News Average Length",
                      ]}
                      values={[
                        stats.real_average_length,
                        stats.fake_average_length,
                      ]}
                      datasetLabel="Words"
                    />
                  </div>
                </div>

                <div className="viz-card">
                  <h4>
                    <ChartIcon /> Top Fake News Keywords
                  </h4>
                  <p className="viz-card-subtitle">
                    Most frequent words in fake news records
                  </p>
                  <div className="chart-container keywords-chart">
                    <KeywordsChart keywords={stats.top_keywords} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

/** History page */
function HistoryPage({
  navigate,
  currentPage,
  user,
  logout,
  analysisHistory,
  viewHistoryResult,
  csvAnalysisHistory,
  viewCsvAnalysis,
  deleteCsvAnalysis,
  clearAllHistory,
}) {
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [csvHistoryPage, setCsvHistoryPage] = useState(1);

  const allHistory = analysisHistory;
  const csvCardsPerPage = 6;
  const csvHistoryTotalPages = Math.max(
    1,
    Math.ceil(csvAnalysisHistory.length / csvCardsPerPage),
  );
  const activeCsvHistoryPage = Math.min(
    csvHistoryPage,
    csvHistoryTotalPages,
  );
  const csvHistoryStartIndex =
    (activeCsvHistoryPage - 1) * csvCardsPerPage;
  const visibleCsvHistory = csvAnalysisHistory.slice(
    csvHistoryStartIndex,
    csvHistoryStartIndex + csvCardsPerPage,
  );
  const csvHistoryPageNumbers = getPaginationPages(
    activeCsvHistoryPage,
    csvHistoryTotalPages,
  );

  const filtered = allHistory.filter((item) => {
    const matchResult =
      filter === "all"
        ? true
        : filter === "authentic"
          ? item.result === "Authentic"
          : item.result === "Misinformation";
    const matchDate = !dateFilter ? true : item.date.includes(dateFilter);
    return matchResult && matchDate;
  });

  return (
    <>
      <Navbar
        currentPage={currentPage}
        user={user}
        navigate={navigate}
        logout={logout}
      />

      <section className="history-page">
        <div className="container">
          <h1>Analysis History</h1>
          <button
            className="btn btn-secondary"
            onClick={clearAllHistory}
            style={{
              marginBottom: "20px",
            }}
          >
            Clear History
          </button>
          <p className="text-muted mb-xl">
            View saved CSV dashboards and individual text analyses
          </p>

          <h2 className="csv-history-heading">CSV Analysis History</h2>
          {csvAnalysisHistory.length === 0 ? (
            <div className="history-empty">
              No CSV analyses saved yet. Upload a CSV file to create one.
            </div>
          ) : (
            <>
              <div className="csv-history-grid">
                {visibleCsvHistory.map((analysis) => (
                  <article className="csv-history-card" key={analysis.id}>
                    <h3 title={analysis.fileName}>{analysis.fileName}</h3>
                    <p className="csv-history-date">
                      {new Date(analysis.uploadDate).toLocaleString()}
                    </p>
                    <div className="csv-history-stats">
                      <div className="csv-history-stat">
                        <strong>{analysis.totalRecords.toLocaleString()}</strong>
                        <span>Total</span>
                      </div>
                      <div className="csv-history-stat">
                        <strong>{analysis.realNews.toLocaleString()}</strong>
                        <span>Real</span>
                      </div>
                      <div className="csv-history-stat">
                        <strong>{analysis.fakeNews.toLocaleString()}</strong>
                        <span>Fake</span>
                      </div>
                    </div>
                    <div className="csv-history-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => viewCsvAnalysis(analysis)}
                      >
                        View Analysis
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => deleteCsvAnalysis(analysis.id)}
                      >
                        Delete Analysis
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <p className="pagination-summary">
                Showing {csvHistoryStartIndex + 1}–
                {Math.min(
                  csvHistoryStartIndex + csvCardsPerPage,
                  csvAnalysisHistory.length,
                )}{" "}
                of {csvAnalysisHistory.length.toLocaleString()} analyses
              </p>
              <div className="pagination-controls" aria-label="CSV history pagination">
                <button
                  className="pagination-button pagination-nav"
                  disabled={activeCsvHistoryPage === 1}
                  onClick={() => setCsvHistoryPage(activeCsvHistoryPage - 1)}
                >
                  &lt;&lt; Previous
                </button>
                {csvHistoryPageNumbers.map((page) => (
                  <button
                    className={`pagination-button ${page === activeCsvHistoryPage ? "active" : ""}`}
                    key={page}
                    onClick={() => setCsvHistoryPage(page)}
                    aria-current={page === activeCsvHistoryPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-button pagination-nav"
                  disabled={activeCsvHistoryPage === csvHistoryTotalPages}
                  onClick={() => setCsvHistoryPage(activeCsvHistoryPage + 1)}
                >
                  Next &gt;&gt;
                </button>
              </div>
            </>
          )}

          <h2 className="csv-history-heading">Text Analysis History</h2>
          <div className="history-filters">
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Results</option>
              <option value="authentic">Authentic Only</option>
              <option value="misinformation">Misinformation Only</option>
            </select>
            <input
              type="date"
              className="form-input"
              style={{ width: "auto" }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Content Preview</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--gray-400)",
                      padding: "2rem",
                    }}
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.preview}</td>
                    <td>
                      <span
                        className={`badge ${item.result === "Authentic" ? "badge-success" : "badge-danger"}`}
                      >
                        {item.result}
                      </span>
                    </td>
                    <td>{item.confidence}%</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => viewHistoryResult(item.fullResult)}
                        title="View result"
                      >
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </>
  );
}

/** About page (minimal placeholder matching original nav link) */
function AboutPage({ navigate, currentPage, user, logout }) {
  return (
    <>
      <Navbar
        currentPage={currentPage}
        user={user}
        navigate={navigate}
        logout={logout}
      />
      <section
        style={{ padding: "4rem 2rem", maxWidth: 800, margin: "0 auto" }}
      >
        <h1
          style={{ fontFamily: "var(--font-display)", marginBottom: "1.5rem" }}
        >
          About TruthGuard
        </h1>
        <p
          style={{
            color: "var(--gray-600)",
            lineHeight: 1.8,
            marginBottom: "1.5rem",
          }}
        >
          TruthGuard is an AI-powered misinformation detection platform built
          for COS30049 Group 10. It uses a Linear SVM model trained on the
          TF-IDF features of real and fake news datasets to classify whether a
          given piece of content is authentic or likely misinformation.
        </p>
        <p style={{ color: "var(--gray-600)", lineHeight: 1.8 }}>
          The system achieves 93.13% accuracy on the held-out test set and
          provides confidence scores alongside factor-level breakdowns to help
          users understand the basis for each classification.
        </p>
        <button
          className="btn btn-primary mt-xl"
          onClick={() => navigate("analyze")}
        >
          <SearchIcon /> Try It Now
        </button>
      </section>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────
// 6.  SIDEBAR
// ─────────────────────────────────────────────
function Sidebar({ currentPage, navigate }) {
  const navItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "analyze", label: "Analyze", icon: <SearchIcon /> },
    { id: "results", label: "Results", icon: <BarChartIcon /> },
    { id: "history", label: "History", icon: <HistoryIcon /> },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div
        className="sidebar-brand"
        onClick={() => navigate("home")}
        title="Go to Home"
      >
        <div className="brand-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <span className="brand-name">
          TRUTH
          <br />
          GUARD
        </span>
      </div>

      <div className="sidebar-divider" />

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => navigate(item.id)}
            title={item.label}
          >
            <div className="nav-icon">{item.icon}</div>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Profile footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <div
          className="sidebar-nav-item"
          onClick={() => navigate("login")}
          title="Profile / Sign In"
        >
          <div className="nav-icon">
            <ProfileIcon />
          </div>
          <span className="nav-label">Profile</span>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// 7.  ROOT APP
// ─────────────────────────────────────────────
function readCsvAnalysisHistory() {
  try {
    const raw = localStorage.getItem("truthguard_csv_history") || "[]";
    const parsed = JSON.parse(raw);
    // Strip any leftover full-results rows saved by older versions
    const cleaned = parsed.map(({ results: _rows, ...rest }) => rest);
    // If we cleaned anything, write the smaller version back immediately
    if (JSON.stringify(cleaned).length < raw.length) {
      try { localStorage.setItem("truthguard_csv_history", JSON.stringify(cleaned)); } catch {}
    }
    return cleaned;
  } catch {
    return [];
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [csvAnalysisHistory, setCsvAnalysisHistory] = useState(
    readCsvAnalysisHistory,
  );
  const [currentCsvAnalysis, setCurrentCsvAnalysis] = useState(
    () => readCsvAnalysisHistory()[0] || null,
  );
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    const saved = localStorage.getItem("truthguard_history");

    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  const login = (username) => setUser(username);
  const logout = () => {
    setUser(null);
    navigate("home");
  };

  const viewHistoryResult = (result) => {
    setCurrentAnalysis(result);
    navigate("results");
  };

  const onAnalysisComplete = (result, historyItem) => {
    setCurrentAnalysis(result);

    setAnalysisHistory((prev) => {
      const updated = [historyItem, ...prev];

      localStorage.setItem("truthguard_history", JSON.stringify(updated));

      return updated;
    });
  };

  const saveCsvAnalysis = (results, fileName, textColumn) => {
    const snapshot = createCsvAnalysisSnapshot(results, fileName, textColumn);
    setCurrentCsvAnalysis(snapshot);
    setCsvAnalysisHistory((previous) => {
      const updated = [snapshot, ...previous];
      try {
        // Strip the full results rows before saving to localStorage — they can
        // be hundreds of KB and quickly blow past the 5 MB quota. Charts data
        // (numbers only) is kept so history cards still render correctly.
        const lightweight = updated.map(({ results: _rows, ...rest }) => rest);
        localStorage.setItem(
          "truthguard_csv_history",
          JSON.stringify(lightweight),
        );
      } catch (error) {
        console.error("Unable to save CSV analysis history:", error);
        // Silent fail — analysis still works in-memory for this session
      }
      return updated;
    });
    navigate("batch-results");
  };

  const viewCsvAnalysis = (analysis) => {
    setCurrentCsvAnalysis(analysis);
    navigate("batch-results");
  };

  const deleteCsvAnalysis = (analysisId) => {
    setCsvAnalysisHistory((previous) => {
      const updated = previous.filter((item) => item.id !== analysisId);
      localStorage.setItem("truthguard_csv_history", JSON.stringify(updated));
      return updated;
    });
    if (currentCsvAnalysis?.id === analysisId) {
      setCurrentCsvAnalysis(null);
    }
  };

  const clearAllHistory = () => {
    localStorage.removeItem("truthguard_history");
    localStorage.removeItem("truthguard_csv_history");
    setAnalysisHistory([]);
    setCsvAnalysisHistory([]);
    setCurrentCsvAnalysis(null);
  };

  // Login page is full-screen (no sidebar)
  if (currentPage === "login") {
    return (
      <>
        <GlobalStyle />
        <div id="tg-app">
          <LoginPage navigate={navigate} login={login} />
        </div>
      </>
    );
  }

  const sharedProps = { navigate, currentPage, user, logout };

  return (
    <>
      <GlobalStyle />
      <div id="tg-app">
        <Sidebar currentPage={currentPage} navigate={navigate} />

        <div className="app-content">
          {currentPage === "home" && <HomePage {...sharedProps} />}
          {currentPage === "analyze" && (
            <AnalyzePage
              {...sharedProps}
              onAnalysisComplete={onAnalysisComplete}
              onCsvComplete={saveCsvAnalysis}
            />
          )}
          {currentPage === "results" && (
            <ResultsPage
              {...sharedProps}
              currentAnalysis={currentAnalysis}
            />
          )}
          {currentPage === "batch-results" && (
            <BatchResultsPage
              key={currentCsvAnalysis?.id || "empty-csv-analysis"}
              {...sharedProps}
              analysis={currentCsvAnalysis}
            />
          )}
          {currentPage === "history" && (
            <HistoryPage
              {...sharedProps}
              analysisHistory={analysisHistory}
              viewHistoryResult={viewHistoryResult}
              csvAnalysisHistory={csvAnalysisHistory}
              viewCsvAnalysis={viewCsvAnalysis}
              deleteCsvAnalysis={deleteCsvAnalysis}
              clearAllHistory={clearAllHistory}
            />
          )}
          {currentPage === "about" && <AboutPage {...sharedProps} />}
        </div>
      </div>
    </>
  );
}
