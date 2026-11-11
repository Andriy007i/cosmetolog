import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import {
  Menu, X, ArrowUpRight, Star, MapPin, Phone, Clock,
  Camera, Check, ChevronRight, ChevronLeft, Send,
  Plus, Trash2, Lock, Settings as SettingsIcon, Image as ImageIcon,
  ListChecks, MessageSquare, RotateCcw, Upload, Bell, ToggleLeft, ToggleRight, Play
} from 'lucide-react';
import heroImage from './assets/heroImage.jpg';

const NAV = [
  { id: 'home', label: 'Головна' },
  { id: 'services', label: 'Послуги' },
  { id: 'spa', label: 'SPA' },
  { id: 'portfolio', label: 'Портфоліо' },
  { id: 'reviews', label: 'Відгуки' },
  { id: 'contacts', label: 'Контакти' },
];

const MONTHS_UA = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const WEEKDAYS_UA = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
const TIME_SLOTS = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
const ADMIN_CODE = 'L_Cosmetolog2012';

const SUPABASE_URL = 'https://nkdgittctxmvbpwpskzv.supabase.co';    
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZGdpdHRjdHhtdmJwd3Bza3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTIwMTEsImV4cCI6MjEwMDYyODAxMX0.Lpg6Kaf11_b0-4c0CmapEtTc_B1jARB014A_YjOAo_U';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvzedgbk'; 

const TELEGRAM_BOT_TOKEN = '8733289642:AAH3yI5RVU435qPUng14_FxgMDtE54rEHxk'; 
const TELEGRAM_CHAT_ID = '478064270';

async function sendTelegramMessage(text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Помилка при відправці в Telegram');
    }
    return true;
  } catch (error) {
    console.error('Telegram Send Error:', error);
    return false;
  }
}

async function remoteGetSiteData() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data?select=payload&id=eq.1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) throw new Error('supabase get failed');
    const rows = await res.json();
    return rows && rows[0] ? rows[0].payload : null;
  }
  if (typeof window !== 'undefined' && window.storage && window.storage.get) {
    const r = await window.storage.get('site-data', true);
    return r && r.value ? JSON.parse(r.value) : null;
  }
  try {
    const local = window.localStorage.getItem('linea-site-data');
    return local ? JSON.parse(local) : null;
  } catch (e) { return null; }
}

async function remoteSetSiteData(data) {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_data?id=eq.1`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ payload: data }),
    });
    if (!res.ok) throw new Error('supabase set failed');
    return;
  }
  if (typeof window !== 'undefined' && window.storage && window.storage.set) {
    await window.storage.set('site-data', JSON.stringify(data), true);
    return;
  }
  window.localStorage.setItem('linea-site-data', JSON.stringify(data));
}

const DEFAULT_DATA = {
  settings: {
    heroEyebrow: 'Студія косметології She· Харків',
    heroTitle: 'Твоя ідеальна шкіра без зайвих рухів',
    heroSubtitle: 'Діагностика шкіри, персональний план процедур та супровід косметолога на кожному етапі — від першої чистки до курсу ін’єкційної корекції.',
    phone: '+38 (067) 723-96-41',
    address: 'м. Харків, вул. Трінклера, 2',
    hours: 'Пн–Ср, Пт–Сб 11:00–19:00. Четвер та неділя — вихідні.',
    instagramUrl: 'https://www.instagram.com/cosmetolog_shulaeva?igsh=aTludnRlb2N4MTl6',
    telegramUrl: 'https://t.me/ElenaShe1',
    whatsappUrl: 'https://wa.me/380677239641',
    viberUrl: 'viber://chat?number=%2B380677239641',
  },
  serviceGroups: [
    {
      title: 'Догляд за обличчям',
      items: [
        { name: 'Комбінована чистка обличчя', price: 1200, time: '60 хв' },
        { name: 'Хімічний пілінг', price: 900, time: '40 хв' },
        { name: 'Догляд для проблемної шкіри', price: 1100, time: '50 хв' },
        { name: 'Експрес-догляд перед подією', price: 800, time: '30 хв' },
      ],
    },
    {
      title: 'Апаратна косметологія',
      note: 'робота з обладнанням',
      items: [
        { name: 'Мезотерапія', price: 1500, time: '45 хв' },
        { name: 'Дарсонваль', price: 600, time: '30 хв' },
        { name: 'RF-ліфтинг', price: 1800, time: '50 хв' },
        { name: 'Мікротокова терапія', price: 1300, time: '40 хв' },
      ],
    },
    {
      title: 'Ін’єкційна косметологія',
      note: 'проводить косметолог',
      items: [
        { name: 'Біоревіталізація', price: 2500, time: '40 хв' },
        { name: 'Контурна пластика губ', price: 3200, time: '45 хв' },
        { name: 'Ботулінотерапія', price: 3500, time: '30 хв', from: true },
      ],
    },
  ],
  cases: [
    { type: 'before_after', title: 'Комбінована чистка обличчя', tag: 'Догляд за обличчям', beforeImg: '', afterImg: '', before: 'linear-gradient(135deg,#C9B8A6,#A4917E)', after: 'linear-gradient(135deg,#F5E6D6,#FFF8EE)' },
    { type: 'before_after', title: 'RF-ліфтинг, курс 5 процедур', tag: 'Апаратна косметологія', beforeImg: '', afterImg: '', before: 'linear-gradient(135deg,#BCAC98,#8E8272)', after: 'linear-gradient(135deg,#F1E0CB,#FBEEDD)' },
    { type: 'single', title: 'Біоревіталізація шкіри', tag: 'Ін’єкційна косметологія', singleImg: '' },
    { type: 'before_after', title: 'Контурна пластика губ', tag: 'Ін’єкційна косметологія', beforeImg: '', afterImg: '', before: 'linear-gradient(135deg,#D2B7AC,#AD897C)', after: 'linear-gradient(135deg,#F1D9CE,#FBEAE1)' },
  ],
  reviews: [
    { name: 'Анна К.', service: 'Біоревіталізація', rating: 5, text: 'Шкіра стала помітно щільнішою вже після другої процедури. Косметолог детально пояснила та підібрала домашній догляд.' },
    { name: 'Ірина С.', service: 'Комбінована чистка', rating: 5, text: 'Записалася вперше, боялася болю та почервонінь — усе пройшло акуратно, без стресу для шкіри. Записалася на курс.' },
    { name: 'Марія Д.', service: 'RF-ліфтинг', rating: 5, text: 'Результат видно вже після трьох сеансів із курсу. Овал обличчя підтягнувся, шкіра виглядає відпочилою.' },
    { name: 'Ольга П.', service: 'Контурна пластика губ', rating: 4, text: 'Дуже акуратна, природна корекція — саме те, про що я просила. Набряк зійшов на другий день.' },
  ],
  pendingReviews: [],
  spa: {
    heroEyebrow: 'SPA-ритуали · Харків',
    heroTitle: 'Head & Body SPA',
    heroSubtitle: 'Глибокий релакс для голови, обличчя, тіла та ніг. Повні та короткі протоколи тривалістю від 1,5 до 2,5 години.',
    hours: 'Пн–Сб 9:00–20:30, неділя — за запитом',
    programs: [
      { group: 'full', name: 'Head & Body SPA', parts: 'Голова · Обличчя · Тіло', duration: '2,5 год', price: '', img: '', text: 'Повний ритуал для голови, обличчя та тіла: догляд за шкірою голови, масаж обличчя та розслаблювальна робота з тілом.' },
      { group: 'full', name: 'Head & Face SPA', parts: 'Голова · Обличчя', duration: '2,5 год', price: '', img: '', text: 'Догляд за шкірою голови та обличчя: очищення, масаж і зволожувальні маски для відновлення та спокою.' },
      { group: 'full', name: 'Head SPA', parts: 'Голова', duration: '2,5 год', price: '', img: '', text: 'Ритуал для шкіри голови та волосся: очищення, масаж голови й шиї, живильні засоби.' },
      { group: 'full', name: 'Foot SPA', parts: 'Ноги', duration: '2,5 год', price: '', img: '', text: 'Догляд за стопами та ногами: пом’якшення шкіри, розслаблювальний масаж і зволоження.' },
      { group: 'short', name: 'Голова + обличчя', parts: 'Head & Face', duration: '1,5 год', price: '', img: '', text: 'Скорочений ритуал: догляд за шкірою голови та експрес-догляд за обличчям.' },
      { group: 'short', name: 'Голова + ноги', parts: 'Head & Foot', duration: '1,5 год', price: '', img: '', text: 'Скорочений ритуал: масаж голови та розслаблювальний догляд за ногами.' },
      { group: 'short', name: 'Голова', parts: 'Head', duration: '1,5 год', price: '', img: '', text: 'Скорочений ритуал для голови: очищення шкіри голови та розслаблювальний масаж.' },
    ],
    portfolio: [
      { type: 'photo', src: '', poster: '', caption: 'Head & Body SPA' },
      { type: 'photo', src: '', poster: '', caption: 'Head SPA' },
      { type: 'video', src: '', poster: '', caption: 'Відео ритуалу' },
      { type: 'photo', src: '', poster: '', caption: 'Foot SPA' },
    ],
    reviews: [],
  },
};

const SiteDataContext = createContext(null);
function useSiteData() { return useContext(SiteDataContext); }

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
        -webkit-tap-highlight-color: transparent;
      }

      .ls-root {
        --bg: #F1E8C7;
        --surface: #F1E8C7;
        --surface-soft: #F1E8C7;
        --ink: #26221F;
        --ink-soft: #746B62;
        --ink-faint: #A79E92;
        --sage: #9CA764;
        --sage-dark: #7D8650;
        --clay: #C97B6D;
        --clay-dark: #A9584B;
        --taupe: #B7A78C;
        --line: #E3D9CB;
        --header-bg: rgba(241,232,199,0.95);
        --footer-bg: #7D8650;
        --on-accent: #F6F0EC;
        background: var(--bg);
        color: var(--ink);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.55;
        -webkit-font-smoothing: antialiased;
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .ls-root * { box-sizing: border-box; }

      /* ===== SPA: шоколадно-графітова тема ===== */
      .ls-root.ls-theme-spa {
        --bg: #1C1714;
        --surface: #261F1B;
        --surface-soft: #211A17;
        --ink: #F2E9DE;
        --ink-soft: #C2B5A7;
        --ink-faint: #8E8173;
        --sage: #D2A679;
        --sage-dark: #A57C54;
        --clay: #C98B73;
        --clay-dark: #E0A58E;
        --taupe: #8E7B6A;
        --line: rgba(242,233,222,0.14);
        --header-bg: rgba(28,23,20,0.92);
        --footer-bg: #120E0C;
        --on-accent: #FFF6EA;
        color-scheme: dark;
      }
      .ls-theme-spa .ls-input option { background: #261F1B; color: #F2E9DE; }
      .ls-theme-spa .ls-btn-primary { background: #8C6641; }
      .ls-theme-spa .ls-btn-primary:hover { background: #A57C54; }
      .ls-theme-spa .ls-day.selected,
      .ls-theme-spa .ls-slot.selected { background: #8C6641; border-color: #8C6641; color: var(--on-accent); }
      .ls-theme-spa .ls-btn-primary:hover { box-shadow: 0 8px 22px rgba(210,166,121,0.28); }
      .ls-theme-spa .ls-card-hover:hover { box-shadow: 0 16px 34px rgba(0,0,0,0.45); }
      .ls-theme-spa .ls-btn-outline { color: var(--ink); border-color: rgba(242,233,222,0.35); }
      .ls-theme-spa .ls-btn-outline:hover { color: var(--sage); border-color: var(--sage); }

      .spa-hero {
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(ellipse 70% 80% at 12% 0%, rgba(210,166,121,0.24), transparent 60%),
          radial-gradient(ellipse 60% 70% at 95% 100%, rgba(120,84,60,0.42), transparent 55%),
          linear-gradient(165deg, #3E2A20 0%, #2B2019 38%, #1D1815 72%, #151210 100%);
      }
      .spa-hero::after {
        content: '';
        position: absolute; left: 0; right: 0; bottom: 0; height: 90px;
        background: linear-gradient(to bottom, transparent, var(--bg));
        pointer-events: none;
      }
      .spa-glow {
        position: absolute; width: 420px; height: 420px; border-radius: 50%;
        right: -120px; top: -140px;
        background: radial-gradient(circle, rgba(210,166,121,0.20), transparent 68%);
        pointer-events: none;
      }
      .spa-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--sage), transparent);
        opacity: 0.55;
      }
      .spa-chip {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px; border-radius: 40px;
        border: 1px solid rgba(210,166,121,0.35);
        background: linear-gradient(90deg, rgba(210,166,121,0.14), rgba(210,166,121,0.03));
        font-size: 13px; color: var(--ink);
      }
      .spa-card {
        position: relative; display: flex; flex-direction: column; overflow: hidden;
        border-radius: 2px; border: 1px solid var(--line);
        background: linear-gradient(165deg, #2E2520 0%, #221B18 55%, #1B1613 100%);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      }
      .spa-card:hover { transform: translateY(-4px); border-color: rgba(210,166,121,0.5); box-shadow: 0 18px 38px rgba(0,0,0,0.45); }
      .spa-tile { position: relative; overflow: hidden; border-radius: 2px; border: 1px solid var(--line); }
      .f-display { font-family: 'Fraunces', serif; }
      .f-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }

      .ls-eyebrow {
        font-family: 'JetBrains Mono', monospace;
        font-size: clamp(10px, 1.2vw, 11px);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--sage);
      }

      .ls-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: clamp(13px, 1.5vw, 14px);
        padding: 12px 22px;
        border-radius: 2px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        touch-action: manipulation;
        white-space: nowrap;
      }
      .ls-btn:active { transform: scale(0.97); }
      .ls-btn-primary { background: var(--sage); color: var(--on-accent); }
      .ls-btn-primary:hover { background: var(--sage-dark); box-shadow: 0 6px 18px rgba(56,69,51,0.28); }
      .ls-btn-outline { background: transparent; color: var(--ink); border-color: var(--ink); }
      .ls-btn-outline:hover { border-color: var(--sage); color: var(--sage); }
      .ls-btn-ghost { background: transparent; color: var(--surface); border-color: rgba(255,255,255,0.35); }
      .ls-btn-ghost:hover { border-color: #fff; }
      .ls-btn-sm { padding: 8px 14px; font-size: 13px; }
      .ls-btn-danger { background: transparent; color: var(--clay-dark); border-color: transparent; padding: 6px 10px; cursor: pointer; }
      .ls-btn-danger:hover { background: rgba(201,123,109,0.12); }

      .ls-phone-link {
        color: inherit;
        text-decoration: none;
        transition: color 0.15s ease;
      }
      .ls-phone-link:hover {
        color: var(--sage);
        text-decoration: underline;
      }

      .ls-card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 2px;
        transition: box-shadow 0.25s ease, transform 0.25s ease;
      }
      .ls-card-hover:hover { box-shadow: 0 14px 30px rgba(38,34,31,0.08); transform: translateY(-3px); }

      .ls-scan {
        position: relative;
        height: 1px;
        background: var(--line);
        overflow: visible;
        margin: 0 auto;
      }
      .ls-scan::after {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--sage);
        animation: ls-sweep 5.5s ease-in-out infinite;
      }
      @keyframes ls-sweep {
        0% { left: 0%; opacity: 0; }
        8% { opacity: 1; }
        48% { opacity: 1; }
        50% { left: calc(100% - 5px); opacity: 1; }
        58% { opacity: 0; }
        100% { left: calc(100% - 5px); opacity: 0; }
      }

      .ls-input {
        width: 100%;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        padding: 12px 14px;
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--ink);
        border-radius: 2px;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .ls-input:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(78,95,71,0.12); }
      .ls-input::placeholder { color: var(--ink-faint); }
      .ls-label {
        display: block;
        font-size: 12px;
        color: var(--ink-soft);
        margin-bottom: 6px;
      }

      .ls-navlink {
        font-size: 14px;
        color: var(--ink-soft);
        cursor: pointer;
        position: relative;
        padding-bottom: 3px;
        border-bottom: 1px solid transparent;
        transition: color 0.15s ease, border-color 0.15s ease;
        background: none;
        border-top: none; border-left: none; border-right: none;
      }
      .ls-navlink:hover { color: var(--ink); }
      .ls-navlink.active { color: var(--ink); border-bottom-color: var(--sage); }

      .ls-ba-handle {
        position: absolute;
        top: 0; bottom: 0;
        width: 2px;
        background: #fff;
        cursor: ew-resize;
        touch-action: none;
      }
      .ls-ba-handle::after {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 34px; height: 34px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 6px rgba(0,0,0,0.25);
      }
      .ls-ba-handle::before {
        content: '';
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 8px; height: 8px;
        border-radius: 50%;
        border: 1.5px solid var(--sage-dark);
        z-index: 1;
      }

      .ls-day {
        aspect-ratio: 1;
        border: 1px solid transparent;
        background: none;
        border-radius: 2px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: var(--ink);
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ls-day:hover:not(:disabled) { border-color: var(--sage); }
      .ls-day:disabled { color: var(--ink-faint); cursor: not-allowed; opacity: 0.4; }
      .ls-day.selected { background: var(--sage); color: var(--on-accent); }

      .ls-slot {
        padding: 10px 4px;
        text-align: center;
        border: 1px solid var(--line);
        border-radius: 2px;
        background: var(--surface);
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }
      .ls-slot:hover { border-color: var(--sage); }
      .ls-slot.selected { background: var(--sage); color: var(--on-accent); border-color: var(--sage); }

      .ls-responsive-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .ls-admin-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .ls-admin-item-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      @media (max-width: 1100px) {
        .ls-hide-mobile {
        display: none !important;
        }
      }
      /* Медіа-запити для чутливості екранів */
      @media (max-width: 1024px) {
        .ls-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        .ls-contacts-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      }

      @media (max-width: 768px) {
        .ls-hide-mobile { display: none !important; }
        .ls-stack-mobile { grid-template-columns: 1fr !important; gap: 28px !important; }
        .ls-responsive-grid-2 { grid-template-columns: 1fr !important; gap: 12px; }
        .ls-admin-grid-2 { grid-template-columns: 1fr !important; }
        .ls-admin-item-row { grid-template-columns: 1fr 1fr !important; }
        .ls-admin-item-row > button { grid-column: span 2; }
        .ls-slots-grid { grid-template-columns: repeat(3, 1fr) !important; }
      }

      @media (max-width: 480px) {
        .ls-slots-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .ls-btn { width: 100%; }
        .ls-card { padding: 18px !important; }
      }

      @media (min-width: 769px) {
        .ls-hide-desktop { display: none !important; }
      }

      @media (min-width: 1440px) {
        .ls-container { max-width: 1280px !important; }
      }
      /* ===== SPA: примусово світлий текст ===== */
      .ls-theme-spa { color: var(--ink); }
      .ls-theme-spa :is(h1, h2, h3, h4, h5, h6) { color: var(--ink); }
      :where(.ls-theme-spa) :is(p, span, li, label) { color: var(--ink); }
      :where(.ls-theme-spa) button { color: var(--ink); }

      .ls-slot { color: var(--ink); }
      .ls-slot.selected { color: var(--on-accent); }
      .ls-theme-spa .ls-day { color: var(--ink); }
      .ls-theme-spa .ls-day.selected { color: var(--on-accent); }
      .ls-theme-spa .ls-input,
      .ls-theme-spa select,
      .ls-theme-spa textarea { color: var(--ink); }
    `}</style>
  );
}

function Container({ children, style }) {
  return (
    <div className="ls-container" style={{ maxWidth: 1080, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 4vw, 32px)', ...style }}>
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0, y = 22 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(.22,.61,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,.61,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function ScanDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: 'clamp(36px, 6vw, 64px) 0' }}>
      <div className="ls-scan" style={{ flex: 1 }} />
      {label && <span className="ls-eyebrow" style={{ whiteSpace: 'nowrap' }}>{label}</span>}
      <div className="ls-scan" style={{ flex: 1 }} />
    </div>
  );
}

function Logo({ onClick, dark }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6 }}>
    <span className="f-display" style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 600, letterSpacing: '0.02em', color: dark ? '#fff' : 'var(--ink)' }}>Студія Косметології She</span>
    <span className="f-mono" style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.6)' : 'var(--sage)' }}>studio</span>
    </div>
  );
}

function ImageUploader({ value, onChange, label }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label className="ls-label">{label}</label>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          className="ls-input" 
          placeholder="https://... або завантажте фото" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          style={{ flex: 1, minWidth: 180 }}
        />
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
        />
        <button 
          type="button" 
          className="ls-btn ls-btn-outline ls-btn-sm" 
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '10px 12px' }}
        >
          <Upload size={14} /> Файл
        </button>
      </div>
      {value && (
        <div style={{ marginTop: 8, position: 'relative', width: 60, height: 60, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <img src={value} alt="Прев’ю" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            type="button"
            onClick={() => onChange('')} 
            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
const SPA_BUCKET = 'spa-media';

function VideoUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Оберіть відеофайл (mp4, mov, webm).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('Файл більший за 50 МБ. Стисніть відео або вставте посилання YouTube.');
      return;
    }
    setError('');
    setProgress(0);

    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
    const path = `video-${Date.now()}.${ext}`;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${SPA_BUCKET}/${path}`);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        onChange(`${SUPABASE_URL}/storage/v1/object/public/${SPA_BUCKET}/${path}`);
      } else {
        setError(`Помилка завантаження (${xhr.status}). Перевірте bucket і політики в Supabase.`);
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError('Не вдалося завантажити — перевірте інтернет-з’єднання.');
    };
    xhr.send(file);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label className="ls-label">Відео: посилання YouTube або завантажте файл</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="ls-input"
          placeholder="https://youtube.com/... або завантажте файл"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
        <input type="file" accept="video/*" ref={inputRef} style={{ display: 'none' }} onChange={handleFile} />
        <button
          type="button"
          className="ls-btn ls-btn-outline ls-btn-sm"
          disabled={progress !== null}
          onClick={() => inputRef.current?.click()}
          style={{ padding: '10px 12px' }}
        >
          <Upload size={14} /> {progress !== null ? `${progress}%` : 'Файл'}
        </button>
      </div>
      {progress !== null && (
        <div style={{ height: 4, background: 'var(--line)', marginTop: 8, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--sage)', transition: 'width 0.2s' }} />
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: 'var(--clay-dark)', marginTop: 6 }}>{error}</p>}
      {value && !youtubeId(value) && (
        <p className="f-mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 6, wordBreak: 'break-all' }}>{value}</p>
      )}
    </div>
  );
}
function Header({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const go = (id) => { setPage(id); setOpen(false); };
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'var(--header-bg)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--line)', boxShadow: scrolled ? '0 6px 20px rgba(38,34,31,0.06)' : 'none', transition: 'box-shadow 0.25s ease' }}>
      <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(60px, 8vw, 76px)' }}>
        <Logo onClick={() => go('home')} />
        <nav className="ls-hide-mobile" style={{ display: 'flex', gap: 'clamp(16px, 2.5vw, 32px)', alignItems: 'center' }}>
          {NAV.map(n => (
            <button key={n.id} className={`ls-navlink ${page === n.id ? 'active' : ''}`} onClick={() => go(n.id)}>{n.label}</button>
          ))}
        </nav>
        <button className="ls-btn ls-btn-primary ls-hide-mobile" onClick={() => go('contacts')}>Записатися</button>
        <button className="ls-hide-desktop" onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: 4 }} aria-label="Меню">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>
      {open && (
        <div className="ls-hide-desktop" style={{ borderTop: '1px solid var(--line)', background: 'var(--surface)', width: '100%' }}>
          <Container style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px 24px', gap: 4 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)} style={{ textAlign: 'left', background: 'none', border: 'none', padding: '12px 0', fontSize: 16, color: page === n.id ? 'var(--sage)' : 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>{n.label}</button>
            ))}
            <button className="ls-btn ls-btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={() => go('contacts')}>Записатися</button>
          </Container>
        </div>
      )}
    </header>
  );
}

function TelegramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 4 L2.5 11.3 L9.5 13.4 M21 4 L17.7 20.5 L9.5 13.4 M21 4 L9.5 13.4 M9.5 13.4 L9 18.2" />
    </svg>
  );
}
function WhatsAppGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L5.3 15.7 A8 8 0 1 1 8.4 18.8 Z" />
      <path d="M8.6 8.8 C8.4 9.6 9 10.7 9.5 11.2 C10.2 12 11.2 12.7 12.1 13 C12.6 13.2 13.6 13.4 14 12.9 C14.3 12.6 14.5 12 14.4 11.6 C14.3 11.3 13 10.7 12.8 10.7 C12.6 10.7 12.4 11.1 12.2 11.3 C12 11.5 11.8 11.5 11.5 11.4 C10.9 11.1 10.1 10.4 9.8 9.8 C9.7 9.6 9.7 9.4 9.9 9.2 C10.1 9 10.4 8.7 10.3 8.5 C10.2 8.2 9.7 7 9.4 6.9 C9.1 6.8 8.8 8 8.6 8.8 Z" />
    </svg>
  );
}
function ViberGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4c-4.4 0-7.5 2.8-7.5 7.2 0 2.8 1.4 5 3.7 6.3l-.5 3 3.2-2c.4 0 .7.1 1.1.1 4.4 0 7.5-2.8 7.5-7.4S16.4 4 12 4Z" />
      <path d="M9.3 9.5c0 3 2.2 5.2 5.2 5.2M9.3 9.5c0-1.2.8-1.8 1.2-1.8M14.5 14.7c1.2 0 1.9-.9 1.9-1.3" />
    </svg>
  );
}

function Footer({ setPage }) {
  const { data } = useSiteData();
  const cleanPhone = data.settings.phone.replace(/[^0-9+]/g, '');

  return (
    <footer style={{ background: 'var(--footer-bg)', color: 'rgba(246,240,236,0.85)', marginTop: 'auto' }}>
      <Container style={{ padding: 'clamp(40px, 6vw, 56px) clamp(16px, 4vw, 24px) 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 32 }}>
        <div>
          <Logo dark onClick={() => setPage('home')} />
          <p style={{ fontSize: 13, marginTop: 16, maxWidth: 260, color: 'rgba(246,240,236,0.65)' }}>Студія косметології She у Харкові. Індивідуальний підхід під контролем косметолога.</p>
        </div>
        <div>
          <p className="ls-eyebrow" style={{ color: 'rgba(246,240,236,0.5)', marginBottom: 14 }}>Розділи</p>
          {NAV.map(n => (
            <div key={n.id} style={{ marginBottom: 10 }}>
              <button onClick={() => setPage(n.id)} style={{ background: 'none', border: 'none', color: 'inherit', fontSize: 14, cursor: 'pointer', padding: 0, opacity: 0.85 }}>{n.label}</button>
            </div>
          ))}
        </div>
        <div>
          <p className="ls-eyebrow" style={{ color: 'rgba(246,240,236,0.5)', marginBottom: 14 }}>Контакти</p>
          <p style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <Phone size={14} /> 
            <a href={`tel:${cleanPhone}`} className="ls-phone-link">{data.settings.phone}</a>
          </p>
          <p style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}><MapPin size={14} /> {data.settings.address}</p>
          <p style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}><Clock size={14} /> {data.settings.hours}</p>
        </div>
        <div>
          <p className="ls-eyebrow" style={{ color: 'rgba(246,240,236,0.5)', marginBottom: 14 }}>Соцмережі</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { href: data.settings.instagramUrl, icon: <Camera size={16} />, label: 'Instagram' },
              { href: data.settings.telegramUrl, icon: <TelegramGlyph />, label: 'Telegram' },
              { href: data.settings.whatsappUrl, icon: <WhatsAppGlyph />, label: 'WhatsApp' },
              { href: data.settings.viberUrl, icon: <ViberGlyph />, label: 'Viber' },
            ].filter(s => s.href).map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(246,240,236,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', textDecoration: 'none' }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </Container>
      <div style={{ borderTop: '1px solid rgba(246,240,236,0.15)' }}>
        <Container style={{ padding: '18px 24px', fontSize: 12, color: 'rgba(246,240,236,0.5)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>© {new Date().getFullYear()} Студія Косметології She. Усі процедури проводяться кваліфікованими фахівцями.</span>
          <button onClick={() => setPage('admin')} style={{ background: 'none', border: 'none', color: 'rgba(246,240,236,0.5)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Панель адміністратора</button>
        </Container>
      </div>
    </footer>
  );
}

function Calendar({ value, onChange }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useState(() => value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1));

  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1);
  let startOffset = firstDay.getDay() - 1; if (startOffset < 0) startOffset = 6;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d));

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 2, cursor: 'pointer', padding: 6, display: 'flex' }} aria-label="Попередній місяць"><ChevronLeft size={15} /></button>
        <span className="f-mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{MONTHS_UA[view.getMonth()]} {view.getFullYear()}</span>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 2, cursor: 'pointer', padding: 6, display: 'flex' }} aria-label="Наступний місяць"><ChevronRight size={15} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
        {WEEKDAYS_UA.map(w => <span key={w} className="f-mono" style={{ fontSize: 10, textAlign: 'center', color: 'var(--ink-faint)' }}>{w}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((d, i) => d ? (
          <button
            type="button"
            key={i}
            disabled={d < today}
            className={`ls-day ${isSameDay(d, value) ? 'selected' : ''}`}
            onClick={() => onChange(d)}
          >{d.getDate()}</button>
        ) : <span key={i} />)}
      </div>
    </div>
  );
}

function TimeSlots({ value, onChange, slots }) {
  return (
    <div className="ls-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
      {(slots || TIME_SLOTS).map(t => (
        <button type="button" key={t} className={`ls-slot ${value === t ? 'selected' : ''}`} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

function BookingForm({ dark, spaOnly = false, preset = null, slots = null, onSuccess = null }) {
  const { data } = useSiteData();
  const who = spaOnly ? 'майстер' : 'косметолог';
  const Who = spaOnly ? 'Майстер' : 'Косметолог';
  const spaNames = ((data.spa && data.spa.programs) || []).filter(p => p.name).map(spaLabel);
  const allServiceNames = spaOnly ? spaNames : [...data.serviceGroups.flatMap(g => g.items.map(i => i.name)), ...spaNames];
  const [form, setForm] = useState({ firstName: '', lastName: '', service: '', date: null, time: '', phone: '' });
  useEffect(() => { if (preset && preset.name) setForm(f => ({ ...f, service: preset.name })); }, [preset]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    
    if (!form.firstName.trim() || !form.lastName.trim() || !form.service || !form.phone.trim() || !form.date || !form.time) {
      setError('Заповніть ім’я, прізвище, послугу, бажані дату і час, а також телефон.');
      return;
    }
    setError('');
    setSending(true);

    const dateLabelForSend = form.date 
      ? form.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) 
      : 'Не вказано';

    const message = `<b>✨ НОВА ЗАЯВКА НА ЗАПИС!</b>\n\n<b>Клієнт:</b> ${form.firstName.trim()} ${form.lastName.trim()}\n<b>Телефон:</b> ${form.phone.trim()}\n<b>Послуга:</b> ${form.service}\n<b>Дата:</b> ${dateLabelForSend}\n<b>Час:</b> ${form.time}`;

    const ok = await sendTelegramMessage(message);
    setSending(false);

    if (ok) {
      if (onSuccess) {                                   // ← НОВОЕ
        onSuccess({                                      // ← НОВОЕ
          firstName: form.firstName.trim(),
          service: form.service,
          date: dateLabelForSend,
          time: form.time,
          phone: form.phone.trim(),
        });
      } else {
        setSent(true);
      }
    } else {
      setError('Не вдалося надіслати заявку — перевірте інтернет-з’єднання та спробуйте ще раз.');
    }
  };

  const labelColor = dark ? 'rgba(246,240,236,0.7)' : 'var(--ink-soft)';
  const dateLabel = form.date ? form.date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) : '';

  if (sent) {
    return (
      <div className="ls-card" style={{ padding: 'clamp(20px, 4vw, 32px)', background: dark ? 'rgba(255,255,255,0.06)' : 'var(--surface)', borderColor: dark ? 'rgba(255,255,255,0.2)' : 'var(--line)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Check size={20} color="#F6F0EC" />
        </div>
        <p className="f-display" style={{ fontSize: 20, marginBottom: 8, color: dark ? '#fff' : 'var(--ink)' }}>Заявку відправлено</p>
        <p style={{ fontSize: 14, color: labelColor, marginBottom: 20 }}>
          {form.firstName}, ми отримали вашу заявку на «{form.service}». {Who} зв’яжеться з вами за номером {form.phone}, щоб узгодити візит — постараємося потрапити у бажаний час: {dateLabel}, {form.time}.
        </p>
        <button className="ls-btn ls-btn-outline" style={dark ? { color: '#fff', borderColor: 'rgba(255,255,255,0.4)' } : {}} onClick={() => { setSent(false); setForm({ firstName: '', lastName: '', service: '', date: null, time: '', phone: '' }); }}>
          Надіслати ще одну заявку
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ls-card" style={{ padding: 'clamp(20px, 4vw, 32px)', background: dark ? 'rgba(255,255,255,0.06)' : 'var(--surface)', borderColor: dark ? 'rgba(255,255,255,0.2)' : 'var(--line)' }}>
      <div className="ls-responsive-grid-2" style={{ marginBottom: 16 }}>
        <div>
          <label className="ls-label" style={{ color: labelColor }}>Ім’я</label>
          <input className="ls-input" placeholder="Анна" value={form.firstName} onChange={update('firstName')} />
        </div>
        <div>
          <label className="ls-label" style={{ color: labelColor }}>Прізвище</label>
          <input className="ls-input" placeholder="Ковальчук" value={form.lastName} onChange={update('lastName')} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="ls-label" style={{ color: labelColor }}>Послуга</label>
        <select className="ls-input" value={form.service} onChange={update('service')}>
          <option value="">Оберіть послугу</option>
          {allServiceNames.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="ls-label" style={{ color: labelColor }}>Бажана дата</label>
        <div style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'var(--surface-soft)', border: '1px solid var(--line)', borderRadius: 2, padding: 14 }}>
          <Calendar value={form.date} onChange={(d) => setForm(f => ({ ...f, date: d }))} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="ls-label" style={{ color: labelColor }}>Бажаний час</label>
        <TimeSlots value={form.time} slots={slots} onChange={(t) => setForm(f => ({ ...f, time: t }))} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label className="ls-label" style={{ color: labelColor }}>Телефон</label>
        <input className="ls-input" placeholder="+38 (0__) ___-__-__" value={form.phone} onChange={update('phone')} />
      </div>
      {error && <p style={{ fontSize: 13, color: 'var(--clay-dark)', marginBottom: 16 }}>{error}</p>}
      <button type="submit" disabled={sending} className="ls-btn ls-btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.7 : 1, cursor: sending ? 'wait' : 'pointer' }}>
        {sending ? 'Надсилаємо…' : <>Надіслати заявку <Send size={15} /></>}
      </button>
      <p style={{ fontSize: 12, color: labelColor, marginTop: 12 }}>
        Це заявка на зв’язок, а не підтверджений запис — точну дату та час узгодить {who}.
      </p>
    </form>
  );
}

function PortfolioCard({ item }) {
  const ref = useRef(null);
  const [pct, setPct] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(96, Math.max(4, p)));
  }, []);

  useEffect(() => {
    const move = (e) => { if (!dragging.current) return; setFromClientX(e.touches ? e.touches[0].clientX : e.clientX); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [setFromClientX]);

  const isSingle = item.type === 'single';

  if (isSingle) {
    const singleStyle = item.singleImg ? { backgroundImage: `url(${item.singleImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg,#C9B8A6,#F5E6D6)' };
    return (
      <div>
        <div style={{ position: 'relative', height: 'clamp(220px, 35vw, 280px)', borderRadius: 2, overflow: 'hidden', ...singleStyle }}>
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10 }} className="f-mono">
            <span style={{ background: 'rgba(255,255,255,0.85)', padding: '3px 8px', borderRadius: 2, color: 'var(--sage-dark)' }}>РЕЗУЛЬТАТ</span>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <p className="ls-eyebrow" style={{ marginBottom: 4 }}>{item.tag}</p>
          <p style={{ fontSize: 15, fontWeight: 500 }}>{item.title}</p>
        </div>
      </div>
    );
  }

  const afterStyle = item.afterImg ? { backgroundImage: `url(${item.afterImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: item.after || 'linear-gradient(135deg,#F5E6D6,#FFF8EE)' };
  const beforeStyle = item.beforeImg ? { backgroundImage: `url(${item.beforeImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: item.before || 'linear-gradient(135deg,#C9B8A6,#A4917E)' };

  return (
    <div>
      <div ref={ref} style={{ position: 'relative', height: 'clamp(220px, 35vw, 280px)', borderRadius: 2, overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
        onMouseDown={(e) => { dragging.current = true; setFromClientX(e.clientX); }}
        onTouchStart={(e) => { dragging.current = true; setFromClientX(e.touches[0].clientX); }}>
        <div style={{ position: 'absolute', inset: 0, ...afterStyle }} />
        <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10 }} className="f-mono">
          <span style={{ background: 'rgba(255,255,255,0.85)', padding: '3px 8px', borderRadius: 2, color: 'var(--sage-dark)' }}>ПІСЛЯ</span>
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, overflow: 'hidden', ...beforeStyle }}>
          <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 10 }} className="f-mono">
            <span style={{ background: 'rgba(255,255,255,0.85)', padding: '3px 8px', borderRadius: 2, color: 'var(--ink-soft)' }}>ДО</span>
          </div>
        </div>
        <div className="ls-ba-handle" style={{ left: `${pct}%` }} />
      </div>
      <div style={{ marginTop: 14 }}>
        <p className="ls-eyebrow" style={{ marginBottom: 4 }}>{item.tag}</p>
        <p style={{ fontSize: 15, fontWeight: 500 }}>{item.title}</p>
      </div>
    </div>
  );
}

function Hero({ setPage }) {
  const { data } = useSiteData();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const s = data.settings;
  return (
    <div style={{ background: 'var(--sage-dark)', color: '#F6F0EC', position: 'relative', overflow: 'hidden' }}>
      <Container style={{ padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 24px) clamp(40px, 7vw, 88px)' }}>
        <div className="ls-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'center' }}>
          <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(18px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
            <p className="ls-eyebrow" style={{ color: 'rgba(246,240,236,0.6)', marginBottom: 18 }}>{s.heroEyebrow}</p>
            <h1 className="f-display" style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', lineHeight: 1.08, fontWeight: 500, marginBottom: 22, color: '#FFFFFF' }}>{s.heroTitle}</h1>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'rgba(246,240,236,0.75)', maxWidth: 460, marginBottom: 34 }}>{s.heroSubtitle}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="ls-btn ls-btn-primary" style={{ background: '#F1E8C7', color: 'var(--sage-dark)' }} onClick={() => setPage('contacts')}>Залишити заявку <ArrowUpRight size={15} /></button>
              <button className="ls-btn ls-btn-ghost" onClick={() => setPage('services')}>Переглянути послуги</button>
            </div>
          </div>
          <div  className="ls-hide-mobile" // <-- Цей клас сховає весь блок на мобільних/звужених екранах
            style={{ 
              position: 'relative', 
              opacity: mounted ? 1 : 0, 
              transform: mounted ? 'scale(1)' : 'scale(0.96)', 
              transition: 'opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s' 
            }}>
          <div style={{ position: 'relative', height: 340, borderRadius: 2, overflow: 'hidden' }}>
            <img 
              src={heroImage}
              alt="Діагностика шкіри" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} 
            />
          </div>
          <div 
  style={{ 
    position: 'absolute', 
    bottom: -22, 
    left: -22, 
    background: 'rgba(25, 35, 25, 0.85)', // напівпрозорий темний фон, щоб білий текст і рамка виглядали контрастно
    backdropFilter: 'blur(8px)',           // ефект розмиття фону під плашкою
    padding: '16px 20px', 
    borderRadius: 4, 
    maxWidth: 220, 
    border: '1.5px solid #FFFFFF',          // суцільна біла рамка
    boxShadow: '0 10px 25px rgba(0,0,0,0.25)' 
  }}
>
  <p 
    className="f-mono" 
    style={{ 
      fontSize: 11, 
      color: '#FFFFFF',                     // білий колір
      marginBottom: 4, 
      opacity: 0.9, 
      letterSpacing: '0.05em' 
    }}
  >
    ДІАГНОСТИКА
  </p>
  <p 
    style={{ 
      fontSize: 13, 
      color: '#FFFFFF',                     // білий колір
      lineHeight: 1.4 
    }}
  >
    Кожна процедура починається з розбору стану шкіри
  </p>
</div>
        </div>
        </div>
      </Container>
    </div>
  );
}

function StatRow() {
  const stats = [
    { n: '14 років', l: 'практики студії' },
    { n: '24000+', l: 'проведених процедур' },
    { n: '4.9', l: 'середня оцінка клієнтів' },
  ];
  return (
    <Container>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 'clamp(16px, 3vw, 24px)', padding: 'clamp(32px, 5vw, 56px) 0' }}>
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.08}>
            <p className="f-display" style={{ fontSize: 'clamp(24px, 3.5vw, 30px)', marginBottom: 4 }}>{s.n}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{s.l}</p>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function ServicesTeaser({ setPage }) {
  const { data } = useSiteData();
  return (
    <Container>
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Що ми робимо</p>
            <h2 className="f-display" style={{ fontSize: 'clamp(24px, 3.5vw, 32px)' }}>Напрямки догляду</h2>
          </div>
          <button className="ls-btn ls-btn-outline" onClick={() => setPage('services')}>Усі послуги та ціни <ChevronRight size={15} /></button>
        </div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 20 }}>
        {data.serviceGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.1}>
            <div className="ls-card ls-card-hover" style={{ padding: 'clamp(20px, 3vw, 28px)', height: '100%' }}>
              <p className="f-mono" style={{ fontSize: 11, color: 'var(--sage)', marginBottom: 10 }}>{g.note}</p>
              <p className="f-display" style={{ fontSize: 20, marginBottom: 16 }}>{g.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {g.items.slice(0, 3).map(i2 => (
                  <li key={i2.name} style={{ fontSize: 13, color: 'var(--ink-soft)', padding: '6px 0', borderTop: '1px solid var(--line)' }}>{i2.name}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function ReviewsTeaser({ setPage }) {
  const { data } = useSiteData();
  return (
    <div style={{ background: 'var(--surface-soft)' }}>
      <Container style={{ padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 24px)' }}>
        <Reveal>
          <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Відгуки</p>
          <h2 className="f-display" style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: 32 }}>Що кажуть клієнти</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {data.reviews.slice(0, 3).map((r, i) => (
            <Reveal key={r.name} delay={i * 0.1}>
              <div className="ls-card ls-card-hover" style={{ padding: 24, height: '100%' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={13} fill={si < r.rating ? '#C97B6D' : 'none'} color={si < r.rating ? '#C97B6D' : 'var(--line)'} />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>{r.text}</p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>{r.name} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>· {r.service}</span></p>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <button className="ls-btn ls-btn-outline" onClick={() => setPage('reviews')}>Усі відгуки <ChevronRight size={15} /></button>
        </div>
      </Container>
    </div>
  );
}

function HomePage({ setPage }) {
  return (
    <div>
      <Hero setPage={setPage} />
      <StatRow />
      <ScanDivider label="НАПРЯМКИ" />
      <ServicesTeaser setPage={setPage} />
      <div style={{ marginTop: 'clamp(40px, 6vw, 72px)' }}><SpaTeaser setPage={setPage} /></div>
      <div style={{ marginTop: 'clamp(40px, 6vw, 88px)' }}><ReviewsTeaser setPage={setPage} /></div>
      <Container style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
        <div className="ls-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>
          <Reveal>
            <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Записатися</p>
            <h2 className="f-display" style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: 16 }}>Залиште заявку — ми передзвонимо</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 400 }}>Вкажіть бажану послугу, дату та час — косметолог зв'яжеться з вами особисто, щоб узгодити точний візит.</p>
          </Reveal>
          <Reveal delay={0.1}><BookingForm /></Reveal>
        </div>
      </Container>
    </div>
  );
}

function ServicesPage() {
  const { data } = useSiteData();
  return (
    <Container style={{ padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
      <Reveal>
        <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Прайс-лист</p>
        <h1 className="f-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 16 }}>Послуги та ціни</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 560, marginBottom: 48 }}>Підсумкова вартість та процедура уточнюються після діагностики шкіри на первинній консультації — ціни нижче дійсні для однієї процедури.</p>
      </Reveal>
      {data.serviceGroups.map((g) => (
        <Reveal key={g.title}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <h2 className="f-display" style={{ fontSize: 'clamp(20px, 3vw, 24px)' }}>{g.title}</h2>
              <span className="f-mono" style={{ fontSize: 11, color: 'var(--sage)' }}>{g.note}</span>
            </div>
            <div className="ls-card">
              {g.items.map((it, ii) => (
                <div key={it.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 24px)', borderTop: ii === 0 ? 'none' : '1px solid var(--line)', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 'clamp(14px, 1.8vw, 15px)', marginBottom: 4 }}>{it.name}</p>
                    <p className="f-mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{it.time}</p>
                  </div>
                  <p className="f-mono" style={{ fontSize: 'clamp(14px, 2vw, 15px)', whiteSpace: 'nowrap' }}>{it.from ? 'від ' : ''}{formatPrice(it.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </Container>
  );
}

function PortfolioPage() {
  const { data } = useSiteData();
  return (
    <Container style={{ padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
      <Reveal>
        <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Результати</p>
        <h1 className="f-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 16 }}>Портфоліо</h1>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 560, marginBottom: 40 }}>Наші роботи та результати процедур до і після.</p>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
        {data.cases.map((c, i) => (
          <Reveal key={i} delay={i * 0.08}><PortfolioCard item={c} /></Reveal>
        ))}
      </div>
    </Container>
  );
}

function ReviewSubmitForm() {
  const { data, submitPendingReview } = useSiteData();
  const serviceNames = [...data.serviceGroups.flatMap(g => g.items.map(i => i.name)), ...((data.spa && data.spa.programs) || []).filter(p => p.name).map(spaLabel)];
  const [form, setForm] = useState({ name: '', service: '', rating: 5, text: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.service || !form.text.trim()) {
      setError('Заповніть ім’я, послугу і текст відгуку.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await submitPendingReview(form);
      setSent(true);
    } catch (err) {
      setError('Не вдалося надіслати відгук. Спробуйте ще раз трохи пізніше.');
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="ls-card" style={{ padding: 24, marginBottom: 32 }}>
        <p className="f-display" style={{ fontSize: 18, marginBottom: 8 }}>Дякуємо за відгук!</p>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Він з’явиться на сайті протягом доби — щойно його перевірить адміністратор.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ls-card" style={{ padding: 24, marginBottom: 32 }}>
      <div className="ls-admin-grid-2" style={{ marginBottom: 12 }}>
        <div>
          <label className="ls-label">Ваше ім’я</label>
          <input className="ls-input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Анна" />
        </div>
        <div>
          <label className="ls-label">Послуга</label>
          <select className="ls-input" value={form.service} onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))}>
            <option value="">Оберіть послугу</option>
            {serviceNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="ls-label">Оцінка</label>
        <select className="ls-input" value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="ls-label">Текст відгуку</label>
        <textarea className="ls-input" rows={4} value={form.text} onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))} />
      </div>
      {error && <p style={{ fontSize: 13, color: 'var(--clay-dark)', marginBottom: 12 }}>{error}</p>}
      <button type="submit" disabled={sending} className="ls-btn ls-btn-primary" style={{ opacity: sending ? 0.7 : 1 }}>
        {sending ? 'Надсилаємо…' : 'Надіслати відгук'}
      </button>
    </form>
  );
}

function ReviewsPage() {
  const { data } = useSiteData();
  const [showForm, setShowForm] = useState(false);
  return (
    <Container style={{ padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
      <Reveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div>
            <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Думки клієнтів</p>
            <h1 className="f-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>Відгуки</h1>
          </div>
          <button className="ls-btn ls-btn-outline" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Сховати форму' : 'Залишити відгук'}
          </button>
        </div>
      </Reveal>
      {showForm && <ReviewSubmitForm />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
        {data.reviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.06}>
            <div className="ls-card ls-card-hover" style={{ padding: 26, height: '100%' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={14} fill={si < r.rating ? '#C97B6D' : 'none'} color={si < r.rating ? '#C97B6D' : 'var(--line)'} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18 }}>{r.text}</p>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{r.name} <span style={{ color: 'var(--ink-faint)', fontWeight: 400 }}>· {r.service}</span></p>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}

function ContactsPage() {
  const { data } = useSiteData();
  const s = data.settings;
  const cleanPhone = s.phone.replace(/[^0-9+]/g, '');

  return (
    <Container style={{ padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
      <Reveal>
        <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Зв'язатися з нами</p>
        <h1 className="f-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 48 }}>Контакти та запис</h1>
      </Reveal>
      <div className="ls-contacts-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56 }}>
        <Reveal>
          <div style={{ marginBottom: 28 }}>
            <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Адреса</p>
            <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}><MapPin size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" /> {s.address}</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Телефон</p>
            <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Phone size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" /> 
              <a href={`tel:${cleanPhone}`} className="ls-phone-link">{s.phone}</a>
            </p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Години роботи</p>
            <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}><Clock size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" /> {s.hours}</p>
          </div>
          <div style={{ height: 200, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <iframe
            src="https://www.google.com/maps?q=вул.+Трінклера,+2,+Харків&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Карта проїзду"
          ></iframe>
          </div>

        </Reveal>
        <Reveal delay={0.1}><BookingForm /></Reveal>
      </div>
    </Container>
  );
}

function AdminGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (code === ADMIN_CODE) { setError(''); onUnlock(); }
    else setError('Невірний код доступу.');
  };
  return (
    <Container style={{ padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 24px)', maxWidth: 420 }}>
      <div className="ls-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-soft)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Lock size={17} color="var(--sage)" />
        </div>
        <p className="f-display" style={{ fontSize: 22, marginBottom: 8 }}>Панель адміністратора</p>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>Введіть код доступу, щоб редагувати вміст сайту.</p>
        <form onSubmit={submit}>
          <input className="ls-input" type="password" placeholder="Код доступу" value={code} onChange={(e) => setCode(e.target.value)} style={{ marginBottom: 12 }} />
          {error && <p style={{ fontSize: 13, color: 'var(--clay-dark)', marginBottom: 12 }}>{error}</p>}
          <button className="ls-btn ls-btn-primary" style={{ width: '100%', justifyContent: 'center' }} type="submit">Увійти</button>
        </form>
      </div>
    </Container>
  );
}

function AdminSection({ title, icon, children, actions }) {
  return (
    <div className="ls-card" style={{ padding: 'clamp(16px, 3vw, 24px)', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <p className="f-display" style={{ fontSize: 19 }}>{title}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function AdminField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <label className="ls-label">{label}</label>}
      <input className="ls-input" {...props} />
    </div>
  );
}

function structuredCloneSafe(obj) { return JSON.parse(JSON.stringify(obj)); }

function AdminPage() {
  const { data, persist } = useSiteData();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState('services');
  const [draft, setDraft] = useState(data);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => { setDraft(data); }, [data]);

  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;

  const save = async () => {
    await persist(draft);
    setSavedMsg('Зміни збережено і вони вже видимі усім відвідувачам сайту.');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const pendingCount = (data.pendingReviews || []).length;
  const categoryOptions = Array.from(new Set(draft.serviceGroups.map(g => g.title).filter(Boolean)));

  const tabs = [
    { id: 'services', label: 'Послуги', icon: <ListChecks size={16} /> },
    { id: 'portfolio', label: 'Портфоліо', icon: <ImageIcon size={16} /> },
    { id: 'spa', label: 'SPA', icon: <Star size={16} /> },
    { id: 'reviews', label: 'Відгуки', icon: <MessageSquare size={16} /> },
    { id: 'moderation', label: `Модерація${pendingCount ? ` (${pendingCount})` : ''}`, icon: <Bell size={16} /> },
    { id: 'settings', label: 'Налаштування', icon: <SettingsIcon size={16} /> },
  ];
  const approveReview = async (review) => {
    const updated = {
      ...data,
      reviews: [...data.reviews, { name: review.name, service: review.service, rating: review.rating, text: review.text }],
      pendingReviews: (data.pendingReviews || []).filter(r => r.id !== review.id),
    };
    await persist(updated);
  };

  const rejectReview = async (review) => {
    const updated = { ...data, pendingReviews: (data.pendingReviews || []).filter(r => r.id !== review.id) };
    await persist(updated);
  };

  return (
    <Container style={{ padding: 'clamp(32px, 5vw, 48px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Управління сайтом</p>
          <h1 className="f-display" style={{ fontSize: 'clamp(26px, 4vw, 34px)' }}>Панель адміністратора</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: 'auto' }}>
          <button className="ls-btn ls-btn-outline ls-btn-sm" onClick={() => setDraft(structuredCloneSafe(DEFAULT_DATA))}><RotateCcw size={14} /> Скинути</button>
          <button className="ls-btn ls-btn-primary ls-btn-sm" onClick={save}>Зберегти</button>
        </div>
      </div>
      {savedMsg && <p style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 8 }}>{savedMsg}</p>}
      <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginBottom: 32 }}>Зміни зберігаються у загальному сховищі сайту: їх побачать усі, хто відкриває цю сторінку.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="ls-btn ls-btn-sm" style={{
            background: tab === t.id ? 'var(--sage)' : 'transparent',
            color: tab === t.id ? '#F6F0EC' : 'var(--ink)',
            borderColor: tab === t.id ? 'var(--sage)' : 'var(--line)',
            flex: '1 1 auto',
            maxWidth: '180px'
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === 'services' && (
        <div>
          {draft.serviceGroups.map((g, gi) => (
            <AdminSection
              key={gi}
              title={g.title || 'Без назви'}
              icon={<ListChecks size={16} color="var(--sage)" />}
              actions={<button className="ls-btn-danger" onClick={() => setDraft(d => ({ ...d, serviceGroups: d.serviceGroups.filter((_, i) => i !== gi) }))}><Trash2 size={15} /></button>}
            >
              <div className="ls-admin-grid-2" style={{ marginBottom: 14 }}>
                <AdminField label="Назва групи" value={g.title} onChange={(e) => setDraft(d => { const sg = [...d.serviceGroups]; sg[gi] = { ...sg[gi], title: e.target.value }; return { ...d, serviceGroups: sg }; })} />
                <AdminField label="Підпис" value={g.note} onChange={(e) => setDraft(d => { const sg = [...d.serviceGroups]; sg[gi] = { ...sg[gi], note: e.target.value }; return { ...d, serviceGroups: sg }; })} />
              </div>
              {g.items.map((it, ii) => (
                <div key={ii} className="ls-admin-item-row">
                  <input className="ls-input" placeholder="Назва послуги" value={it.name} onChange={(e) => setDraft(d => { const sg = [...d.serviceGroups]; const items = [...sg[gi].items]; items[ii] = { ...items[ii], name: e.target.value }; sg[gi] = { ...sg[gi], items }; return { ...d, serviceGroups: sg }; })} />
                  <input className="ls-input" type="text" inputMode="text" placeholder="800 або 800-900" value={it.price} onChange={(e) => setDraft(d => { const sg = [...d.serviceGroups]; const items = [...sg[gi].items]; items[ii] = { ...items[ii], price: e.target.value }; sg[gi] = { ...sg[gi], items }; return { ...d, serviceGroups: sg }; })} />
                  <input className="ls-input" placeholder="60 хв" value={it.time} onChange={(e) => setDraft(d => { const sg = [...d.serviceGroups]; const items = [...sg[gi].items]; items[ii] = { ...items[ii], time: e.target.value }; sg[gi] = { ...sg[gi], items }; return { ...d, serviceGroups: sg }; })} />
                  <button className="ls-btn-danger" onClick={() => setDraft(d => { const sg = [...d.serviceGroups]; sg[gi] = { ...sg[gi], items: sg[gi].items.filter((_, x) => x !== ii) }; return { ...d, serviceGroups: sg }; })}><Trash2 size={15} /></button>
                </div>
              ))}
              <button className="ls-btn ls-btn-outline ls-btn-sm" style={{ marginTop: 8 }} onClick={() => setDraft(d => { const sg = [...d.serviceGroups]; sg[gi] = { ...sg[gi], items: [...sg[gi].items, { name: '', price: 0, time: '' }] }; return { ...d, serviceGroups: sg }; })}><Plus size={14} /> Додати послугу</button>
            </AdminSection>
          ))}
          <button className="ls-btn ls-btn-outline" onClick={() => setDraft(d => ({ ...d, serviceGroups: [...d.serviceGroups, { title: 'Нова група', note: '', items: [] }] }))}><Plus size={15} /> Додати групу послуг</button>
        </div>
      )}

      {tab === 'portfolio' && (
        <div>
          {draft.cases.map((c, ci) => {
            const isSingle = c.type === 'single';
            return (
              <AdminSection
                key={ci}
                title={c.title || 'Без назви'}
                icon={<ImageIcon size={16} color="var(--sage)" />}
                actions={<button className="ls-btn-danger" onClick={() => setDraft(d => ({ ...d, cases: d.cases.filter((_, i) => i !== ci) }))}><Trash2 size={15} /></button>}
              >
                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label className="ls-label" style={{ margin: 0 }}>Тип картки:</label>
                  <button
                    type="button"
                    className="ls-btn ls-btn-outline ls-btn-sm"
                    onClick={() => setDraft(d => {
                      const cs = [...d.cases];
                      cs[ci] = { ...cs[ci], type: isSingle ? 'before_after' : 'single' };
                      return { ...d, cases: cs };
                    })}
                  >
                    {isSingle ? <ToggleLeft size={16} color="var(--ink-soft)" /> : <ToggleRight size={16} color="var(--sage)" />}
                    {isSingle ? 'Одне фото' : 'До / Після (слайдер)'}
                  </button>
                </div>

                <div className="ls-admin-grid-2">
                  <AdminField label="Назва кейсу" value={c.title} onChange={(e) => setDraft(d => { const cs = [...d.cases]; cs[ci] = { ...cs[ci], title: e.target.value }; return { ...d, cases: cs }; })} />
                  <div>
                    <label className="ls-label">Категорія</label>
                    <select
                      className="ls-input"
                      value={c.tag}
                      onChange={(e) => setDraft(d => { const cs = [...d.cases]; cs[ci] = { ...cs[ci], tag: e.target.value }; return { ...d, cases: cs }; })}
                    >
                      <option value="">Оберіть категорію</option>
                      {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      {!categoryOptions.includes(c.tag) && c.tag && <option value={c.tag}>{c.tag}</option>}
                    </select>
                  </div>
                </div>

                {isSingle ? (
                  <ImageUploader 
                    label="Фото результату" 
                    value={c.singleImg} 
                    onChange={(val) => setDraft(d => { const cs = [...d.cases]; cs[ci] = { ...cs[ci], singleImg: val }; return { ...d, cases: cs }; })} 
                  />
                ) : (
                  <div className="ls-admin-grid-2">
                    <ImageUploader 
                      label="Фото «до»" 
                      value={c.beforeImg} 
                      onChange={(val) => setDraft(d => { const cs = [...d.cases]; cs[ci] = { ...cs[ci], beforeImg: val }; return { ...d, cases: cs }; })} 
                    />
                    <ImageUploader 
                      label="Фото «після»" 
                      value={c.afterImg} 
                      onChange={(val) => setDraft(d => { const cs = [...d.cases]; cs[ci] = { ...cs[ci], afterImg: val }; return { ...d, cases: cs }; })} 
                    />
                  </div>
                )}
                <p className="f-mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 6 }}>Якщо поле з фото порожнє — використовується естетична заглушка.</p>
              </AdminSection>
            );
          })}
          <button className="ls-btn ls-btn-outline" onClick={() => setDraft(d => ({ ...d, cases: [...d.cases, { type: 'before_after', title: 'Новий кейс', tag: categoryOptions[0] || '', beforeImg: '', afterImg: '', singleImg: '' }] }))}><Plus size={15} /> Додати кейс</button>
        </div>
      )}

      {tab === 'spa' && (() => {
        const spa = draft.spa || DEFAULT_DATA.spa;
        const setSpa = (fn) => setDraft(d => ({ ...d, spa: fn(d.spa || structuredCloneSafe(DEFAULT_DATA.spa)) }));
        const setField = (key, val) => setSpa(sp => ({ ...sp, [key]: val }));
        const setList = (list, i, patch) => setSpa(sp => { const arr = [...(sp[list] || [])]; arr[i] = { ...arr[i], ...patch }; return { ...sp, [list]: arr }; });
        const delFrom = (list, i) => setSpa(sp => ({ ...sp, [list]: (sp[list] || []).filter((_, x) => x !== i) }));
        const addTo = (list, item) => setSpa(sp => ({ ...sp, [list]: [...(sp[list] || []), item] }));
        return (
          <div>
            <AdminSection title="Тексти сторінки SPA" icon={<Star size={16} color="var(--sage)" />}>
              <AdminField label="Напис над заголовком" value={spa.heroEyebrow || ''} onChange={(e) => setField('heroEyebrow', e.target.value)} />
              <AdminField label="Заголовок" value={spa.heroTitle || ''} onChange={(e) => setField('heroTitle', e.target.value)} />
              <div style={{ marginBottom: 10 }}>
                <label className="ls-label">Підзаголовок</label>
                <textarea className="ls-input" rows={3} value={spa.heroSubtitle || ''} onChange={(e) => setField('heroSubtitle', e.target.value)} />
              </div>
              <AdminField label="Години роботи SPA" value={spa.hours || ''} onChange={(e) => setField('hours', e.target.value)} />
              <p className="f-mono" style={{ fontSize: 10, color: 'var(--ink-faint)' }}>Адреса, телефон та месенджери беруться з вкладки «Налаштування».</p>
            </AdminSection>

            {(spa.programs || []).map((p, i) => (
              <AdminSection
                key={i}
                title={p.name || 'Без назви'}
                icon={<Star size={16} color="var(--sage)" />}
                actions={<button className="ls-btn-danger" onClick={() => delFrom('programs', i)}><Trash2 size={15} /></button>}
              >
                <div className="ls-admin-grid-2">
                  <div>
                    <label className="ls-label">Протокол</label>
                    <select className="ls-input" value={p.group || 'full'} onChange={(e) => setList('programs', i, { group: e.target.value })}>
                      <option value="full">Повний протокол</option>
                      <option value="short">Короткий протокол</option>
                    </select>
                  </div>
                  <AdminField label="Назва" value={p.name || ''} onChange={(e) => setList('programs', i, { name: e.target.value })} />
                </div>
                <div className="ls-admin-grid-2">
                  <AdminField label="Що входить (напр. Голова · Обличчя · Тіло)" value={p.parts || ''} onChange={(e) => setList('programs', i, { parts: e.target.value })} />
                  <AdminField label="Тривалість (1,5 год або 2,5 год)" value={p.duration || ''} onChange={(e) => setList('programs', i, { duration: e.target.value })} />
                </div>
                <AdminField label="Ціна, ₴ (порожньо = «за запитом»)" value={p.price || ''} onChange={(e) => setList('programs', i, { price: e.target.value })} />
                <div style={{ marginBottom: 10 }}>
                  <label className="ls-label">Короткий опис процедури</label>
                  <textarea className="ls-input" rows={3} value={p.text || ''} onChange={(e) => setList('programs', i, { text: e.target.value })} />
                </div>
                <ImageUploader label="Фото програми" value={p.img} onChange={(val) => setList('programs', i, { img: val })} />
              </AdminSection>
            ))}
            <button className="ls-btn ls-btn-outline" style={{ marginBottom: 28 }} onClick={() => addTo('programs', { group: 'full', name: 'Нова програма', parts: '', duration: '2,5 год', price: '', img: '', text: '' })}><Plus size={15} /> Додати програму</button>

            {(spa.portfolio || []).map((c, i) => (
              <AdminSection
                key={i}
                title={c.caption || 'Без підпису'}
                icon={<ImageIcon size={16} color="var(--sage)" />}
                actions={<button className="ls-btn-danger" onClick={() => delFrom('portfolio', i)}><Trash2 size={15} /></button>}
              >
                <div className="ls-admin-grid-2">
                  <div>
                    <label className="ls-label">Тип</label>
                    <select className="ls-input" value={c.type || 'photo'} onChange={(e) => setList('portfolio', i, { type: e.target.value })}>
                      <option value="photo">Фото</option>
                      <option value="video">Відео</option>
                    </select>
                  </div>
                  <AdminField label="Підпис" value={c.caption || ''} onChange={(e) => setList('portfolio', i, { caption: e.target.value })} />
                </div>
                {c.type === 'video' ? (
                  <div>
                    <VideoUploader value={c.src} onChange={(val) => setList('portfolio', i, { src: val })} />
                    <ImageUploader label="Обкладинка відео (необов’язково)" value={c.poster} onChange={(val) => setList('portfolio', i, { poster: val })} />
                  </div>
                ) : (
                  <ImageUploader label="Фото" value={c.src} onChange={(val) => setList('portfolio', i, { src: val })} />
                )}
              </AdminSection>
            ))}
            <button className="ls-btn ls-btn-outline" style={{ marginBottom: 12 }} onClick={() => addTo('portfolio', { type: 'photo', src: '', poster: '', caption: '' })}><Plus size={15} /> Додати фото / відео</button>
            <p className="f-mono" style={{ fontSize: 10, color: 'var(--ink-faint)', marginBottom: 28 }}>Порада: великі файли краще класти в папку public/spa у проєкті й вказувати шлях на кшталт /spa/photo1.jpg — так сайт працює швидше, ніж із завантаженими прямо в адмінці.</p>

            {(spa.reviews || []).map((r, i) => (
              <AdminSection
                key={i}
                title={r.name || 'Без імені'}
                icon={<MessageSquare size={16} color="var(--sage)" />}
                actions={<button className="ls-btn-danger" onClick={() => delFrom('reviews', i)}><Trash2 size={15} /></button>}
              >
                <div className="ls-admin-grid-2">
                  <AdminField label="Ім’я" value={r.name || ''} onChange={(e) => setList('reviews', i, { name: e.target.value })} />
                  <div>
                    <label className="ls-label">Оцінка</label>
                    <select className="ls-input" value={r.rating || 5} onChange={(e) => setList('reviews', i, { rating: Number(e.target.value) })}>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <label className="ls-label">Текст відгуку</label>
                <textarea className="ls-input" rows={3} value={r.text || ''} onChange={(e) => setList('reviews', i, { text: e.target.value })} />
              </AdminSection>
            ))}
            <button className="ls-btn ls-btn-outline" onClick={() => addTo('reviews', { name: '', rating: 5, text: '' })}><Plus size={15} /> Додати відгук про SPA</button>
          </div>
        );
      })()}

      {tab === 'reviews' && (
        <div>
          {draft.reviews.map((r, ri) => (
            <AdminSection
              key={ri}
              title={r.name || 'Без імені'}
              icon={<MessageSquare size={16} color="var(--sage)" />}
              actions={<button className="ls-btn-danger" onClick={() => setDraft(d => ({ ...d, reviews: d.reviews.filter((_, i) => i !== ri) }))}><Trash2 size={15} /></button>}
            >
              <div className="ls-admin-grid-2">
                <AdminField label="Ім’я" value={r.name} onChange={(e) => setDraft(d => { const rv = [...d.reviews]; rv[ri] = { ...rv[ri], name: e.target.value }; return { ...d, reviews: rv }; })} />
                <div>
                  <label className="ls-label">Послуга</label>
                  <select className="ls-input" value={r.service} onChange={(e) => setDraft(d => { const rv = [...d.reviews]; rv[ri] = { ...rv[ri], service: e.target.value }; return { ...d, reviews: rv }; })}>
                    <option value="">Оберіть послугу</option>
                    {[...draft.serviceGroups.flatMap(g => g.items.map(i => i.name)), ...((draft.spa && draft.spa.programs) || []).filter(p => p.name).map(spaLabel)].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label className="ls-label">Оцінка</label>
                <select className="ls-input" value={r.rating} onChange={(e) => setDraft(d => { const rv = [...d.reviews]; rv[ri] = { ...rv[ri], rating: Number(e.target.value) }; return { ...d, reviews: rv }; })}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <label className="ls-label" style={{ marginTop: 8 }}>Текст відгуку</label>
              <textarea className="ls-input" rows={3} value={r.text} onChange={(e) => setDraft(d => { const rv = [...d.reviews]; rv[ri] = { ...rv[ri], text: e.target.value }; return { ...d, reviews: rv }; })} />
            </AdminSection>
          ))}
          <button className="ls-btn ls-btn-outline" onClick={() => setDraft(d => ({ ...d, reviews: [...d.reviews, { name: '', service: '', rating: 5, text: '' }] }))}><Plus size={15} /> Додати відгук</button>
        </div>
      )}

      {tab === 'moderation' && (
        <div>
          {(data.pendingReviews || []).length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--ink-faint)' }}>Немає відгуків, що очікують модерації.</p>
          )}
          {(data.pendingReviews || []).map((r) => (
            <AdminSection
              key={r.id}
              title={r.name || 'Без імені'}
              icon={<MessageSquare size={16} color="var(--sage)" />}
              actions={
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="ls-btn ls-btn-primary ls-btn-sm" onClick={() => approveReview(r)}><Check size={14} /> Підтвердити</button>
                  <button className="ls-btn-danger" onClick={() => rejectReview(r)}><X size={15} /></button>
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} size={14} fill={si < r.rating ? '#C97B6D' : 'none'} color={si < r.rating ? '#C97B6D' : 'var(--line)'} />
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 8 }}>{r.text}</p>
              <p className="f-mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{r.service} · {new Date(r.createdAt).toLocaleString('uk-UA')}</p>
            </AdminSection>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <AdminSection title="Тексти та контакти" icon={<SettingsIcon size={16} color="var(--sage)" />}>
          <AdminField label="Напис над заголовком" value={draft.settings.heroEyebrow} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, heroEyebrow: e.target.value } }))} />
          <AdminField label="Заголовок головного екрана" value={draft.settings.heroTitle} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, heroTitle: e.target.value } }))} />
          <div style={{ marginBottom: 10 }}>
            <label className="ls-label">Підзаголовок</label>
            <textarea className="ls-input" rows={3} value={draft.settings.heroSubtitle} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, heroSubtitle: e.target.value } }))} />
          </div>
          <AdminField label="Телефон" value={draft.settings.phone} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, phone: e.target.value } }))} />
          <AdminField label="Адреса" value={draft.settings.address} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, address: e.target.value } }))} />
          <AdminField label="Години роботи" value={draft.settings.hours} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, hours: e.target.value } }))} />
          <AdminField label="Instagram (посилання)" value={draft.settings.instagramUrl} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, instagramUrl: e.target.value } }))} />
          <AdminField label="Telegram (посилання)" value={draft.settings.telegramUrl} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, telegramUrl: e.target.value } }))} />
          <AdminField label="WhatsApp (посилання wa.me/...)" value={draft.settings.whatsappUrl} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, whatsappUrl: e.target.value } }))} />
          <AdminField label="Viber (посилання)" value={draft.settings.viberUrl} onChange={(e) => setDraft(d => ({ ...d, settings: { ...d.settings, viberUrl: e.target.value } }))} />
        </AdminSection>
      )}

      {tab === 'settings' && (
        <div className="ls-card" style={{ padding: 20, background: 'var(--surface-soft)' }}>
          <p style={{ fontSize: 13, marginBottom: 6 }}>
            <strong>Спільне сховище (Supabase):</strong> {SUPABASE_URL ? 'підключено ✓' : 'не підключено — зміни бачите поки що лише ви, налаштуйте перед запуском'}
          </p>
          <p style={{ fontSize: 13 }}>
            <strong>Пошта для заявок (Formspree):</strong> {FORMSPREE_ENDPOINT ? 'підключено ✓' : 'не підключено — заявки поки нікуди не надсилаються'}
          </p>
        </div>
      )}
    </Container>
  );
}


/* ===================== SPA ===================== */
const SPA_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const SPA_GRADIENTS = [
  'linear-gradient(135deg,#5A3E2E 0%,#2A1F1A 100%)',
  'linear-gradient(135deg,#3A3633 0%,#1B1816 100%)',
  'linear-gradient(135deg,#7A5640 0%,#3A281F 100%)',
  'linear-gradient(135deg,#46413D 0%,#241F1C 100%)',
];
function formatPrice(price) {
  const raw = String(price == null ? '' : price).trim();
  if (!raw) return '';
  const fmt = (n) => Number(n.replace(',', '.')).toLocaleString('uk-UA');
  const range = raw.match(/^(\d+(?:[.,]\d+)?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)$/);
  if (range) return `${fmt(range[1])}–${fmt(range[2])} ₴`;
  if (/^\d+(?:[.,]\d+)?$/.test(raw)) return `${fmt(raw)} ₴`;
  return raw;
}

function spaLabel(p) {
  return `SPA ${p.group === 'short' ? '(короткий)' : '(повний)'} · ${p.name}`;
}

function assetUrl(src) {
  if (!src) return '';
  if (/^(https?:|data:|blob:|\/\/)/.test(src)) return src;
  if (src.startsWith('/')) return `${BASE_PATH}${src}`;
  return src;
}

function youtubeId(url) {
  const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

function spaPrice(price) {
  return formatPrice(price) || 'Ціна за запитом';
}

function SpaHeading({ eyebrow, title, text }) {
  return (
    <Reveal>
      <p className="ls-eyebrow" style={{ marginBottom: 10 }}>{eyebrow}</p>
      <h2 className="f-display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', margin: `0 0 ${text ? 12 : 28}px` }}>{title}</h2>
      {text && <p style={{ fontSize: 15, color: 'var(--ink-soft)', maxWidth: 560, marginBottom: 32 }}>{text}</p>}
    </Reveal>
  );
}

function SpaProgramCard({ p, index, onChoose }) {
  const bg = p.img
    ? { backgroundImage: `url(${assetUrl(p.img)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: SPA_GRADIENTS[index % SPA_GRADIENTS.length] };
  return (
    <div className="spa-card" style={{ height: '100%' }}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3', ...bg }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(20,16,14,0) 40%, rgba(20,16,14,0.65) 100%)' }} />
        <span className="spa-chip" style={{ position: 'absolute', left: 14, bottom: 14, background: 'rgba(20,16,14,0.65)', backdropFilter: 'blur(6px)' }}>
          <Clock size={13} color="var(--sage)" /> {p.duration}
        </span>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <p className="ls-eyebrow">{p.parts}</p>
        <h3 className="f-display" style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{p.name}</h3>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', flex: 1 }}>{p.text}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 6 }}>
          <span className="f-mono" style={{ fontSize: 14 }}>{spaPrice(p.price)}</span>
          <button className="ls-btn ls-btn-primary ls-btn-sm" onClick={() => onChoose(p)}>Записатися</button>
        </div>
      </div>
    </div>
  );
}

function SpaMedia({ item, index }) {
  const isVideo = item.type === 'video';
  const src = assetUrl(item.src);
  const yt = isVideo ? youtubeId(item.src) : null;
  const placeholder = { background: SPA_GRADIENTS[index % SPA_GRADIENTS.length] };
  let inner;
  if (isVideo && yt) {
    inner = <iframe src={`https://www.youtube.com/embed/${yt}`} title={item.caption || 'Відео'} loading="lazy" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />;
  } else if (isVideo && src) {
    inner = <video src={src} poster={assetUrl(item.poster) || undefined} controls playsInline preload="metadata" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#120E0C' }} />;
  } else if (!isVideo && src) {
    inner = <img src={src} alt={item.caption || 'SPA'} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  } else {
    inner = (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...placeholder }}>
        {isVideo
          ? <div style={{ width: 54, height: 54, borderRadius: '50%', border: '1px solid rgba(210,166,121,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={20} color="#D2A679" /></div>
          : <Camera size={24} color="rgba(242,233,222,0.35)" />}
      </div>
    );
  }
  return (
    <div>
      <div className="spa-tile" style={{ aspectRatio: '4 / 5' }}>{inner}</div>
      {item.caption && <p className="f-mono" style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 10 }}>{item.caption}</p>}
    </div>
  );
}

function SpaPage({ setPage, onBooked }) {  // ← НОВОЕ: onBooked
  const { data } = useSiteData();
  const spa = data.spa || DEFAULT_DATA.spa;
  const s = data.settings;
  const cleanPhone = s.phone.replace(/[^0-9+]/g, '');
  const programsRef = useRef(null);
  const bookingRef = useRef(null);
  const [preset, setPreset] = useState(null);

  const programs = (spa.programs || []).filter(p => p.name);
  const full = programs.filter(p => p.group !== 'short');
  const short = programs.filter(p => p.group === 'short');
  const scrollTo = (ref) => { if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const choose = (p) => { setPreset({ name: spaLabel(p), n: Date.now() }); scrollTo(bookingRef); };

  const reviews = spa.reviews || [];
  const socials = [
    { href: s.instagramUrl, icon: <Camera size={16} />, label: 'Instagram' },
    { href: s.telegramUrl, icon: <TelegramGlyph />, label: 'Telegram' },
    { href: s.whatsappUrl, icon: <WhatsAppGlyph />, label: 'WhatsApp' },
    { href: s.viberUrl, icon: <ViberGlyph />, label: 'Viber' },
  ].filter(x => x.href);

  const renderGroup = (title, note, list, offset) => list.length > 0 && (
    <div style={{ marginBottom: 'clamp(36px, 6vw, 56px)' }}>
      <Reveal>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <h3 className="f-display" style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 500, margin: 0 }}>{title}</h3>
          <span className="f-mono" style={{ fontSize: 11, color: 'var(--sage)' }}>{note}</span>
        </div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>
        {list.map((p, i) => (
          <Reveal key={p.name + i} delay={i * 0.07}><SpaProgramCard p={p} index={offset + i} onChoose={choose} /></Reveal>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* HERO */}
      <div className="spa-hero">
        <div className="spa-glow" />
        <Container style={{ position: 'relative', zIndex: 1, padding: 'clamp(56px, 9vw, 112px) clamp(16px, 4vw, 24px) clamp(64px, 10vw, 120px)' }}>
          <Reveal>
            <p className="ls-eyebrow" style={{ marginBottom: 18 }}>{spa.heroEyebrow}</p>
            <h1 className="f-display" style={{ fontSize: 'clamp(36px, 7vw, 76px)', lineHeight: 1.04, fontWeight: 500, margin: '0 0 22px', background: 'linear-gradient(100deg,#F6EBDD 0%,#E3C29C 55%,#C8966A 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>{spa.heroTitle}</h1>
            <p style={{ fontSize: 'clamp(14px, 1.9vw, 17px)', color: 'var(--ink-soft)', maxWidth: 520, marginBottom: 28 }}>{spa.heroSubtitle}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
              <span className="spa-chip"><Clock size={14} color="var(--sage)" /> 1,5 або 2,5 години</span>
              <span className="spa-chip"><Clock size={14} color="var(--sage)" /> {spa.hours}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="ls-btn ls-btn-primary" onClick={() => scrollTo(programsRef)}>Обрати програму <ChevronRight size={15} /></button>
              <button className="ls-btn ls-btn-outline" onClick={() => scrollTo(bookingRef)}>Записатися</button>
            </div>
          </Reveal>
        </Container>
      </div>

      {/* PROGRAMS */}
      <div ref={programsRef} style={{ scrollMarginTop: 90 }}>
        <Container style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px) clamp(40px, 6vw, 72px)' }}>
          <SpaHeading eyebrow="Програми" title="Види SPA" text="Оберіть повний або короткий протокол. Остаточну програму та час узгодимо під ваш запит." />
          {renderGroup('Повний протокол', '2,5 години', full, 0)}
          {renderGroup('Короткий протокол', '1,5 години', short, full.length)}
        </Container>
      </div>

      <div className="spa-line" />

      {/* PORTFOLIO */}
      <Container style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 24px)' }}>
        <SpaHeading eyebrow="Портфоліо" title="Фото та відео" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
          {(spa.portfolio || []).map((item, i) => (
            <Reveal key={i} delay={(i % 4) * 0.06}><SpaMedia item={item} index={i} /></Reveal>
          ))}
        </div>
      </Container>

      <div className="spa-line" />

      {/* HOURS + CONTACTS */}
      <Container style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 24px)' }}>
        <SpaHeading eyebrow="Контакти" title="Години роботи та адреса" />
        <div className="ls-contacts-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(24px, 5vw, 56px)' }}>
          <Reveal>
            <div style={{ marginBottom: 26 }}>
              <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Години роботи SPA</p>
              <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}><Clock size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" /> {spa.hours}</p>
            </div>
            <div style={{ marginBottom: 26 }}>
              <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Адреса</p>
              <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}><MapPin size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" /> {s.address}</p>
            </div>
            <div style={{ marginBottom: 26 }}>
              <p className="ls-eyebrow" style={{ marginBottom: 8 }}>Телефон</p>
              <p style={{ fontSize: 15, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Phone size={16} style={{ marginTop: 3, flexShrink: 0 }} color="var(--sage)" />
                <a href={`tel:${cleanPhone}`} className="ls-phone-link">{s.phone}</a>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {socials.map(x => (
                <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label}
                  style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(210,166,121,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)', textDecoration: 'none' }}>
                  {x.icon}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ height: 260, borderRadius: 2, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <iframe
                src="https://www.google.com/maps?q=вул.+Трінклера,+2,+Харків&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.6) contrast(0.95)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Карта проїзду"
              ></iframe>
            </div>
          </Reveal>
        </div>
      </Container>

      <div className="spa-line" />

      {/* REVIEWS */}
      <Container style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 24px)' }}>
        <SpaHeading eyebrow="Відгуки" title="Що кажуть гості" />
        {reviews.length === 0 ? (
          <Reveal>
            <div className="ls-card" style={{ padding: 28, maxWidth: 560 }}>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 18 }}>Відгуки про SPA-ритуали з’являться тут. Ви вже були у нас? Поділіться враженнями — ваш відгук побачать інші гості.</p>
              <button className="ls-btn ls-btn-outline" onClick={() => setPage('reviews')}>Залишити відгук <ChevronRight size={15} /></button>
            </div>
          </Reveal>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {reviews.map((r, i) => (
                <Reveal key={i} delay={(i % 3) * 0.08}>
                  <div className="ls-card ls-card-hover" style={{ padding: 24, height: '100%' }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={13} fill={si < r.rating ? '#D2A679' : 'none'} color={si < r.rating ? '#D2A679' : 'var(--line)'} />
                      ))}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 16 }}>{r.text}</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <button className="ls-btn ls-btn-outline" onClick={() => setPage('reviews')}>Залишити відгук <ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </Container>

      <div className="spa-line" />

      {/* BOOKING */}
      <div ref={bookingRef} style={{ scrollMarginTop: 90 }}>
        <Container style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 24px) clamp(48px, 8vw, 96px)' }}>
          <div className="ls-stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(24px, 5vw, 56px)', alignItems: 'start' }}>
            <Reveal>
              <p className="ls-eyebrow" style={{ marginBottom: 10 }}>Запис</p>
              <h2 className="f-display" style={{ fontSize: 'clamp(26px, 4vw, 36px)', margin: '0 0 16px' }}>Забронюйте свій SPA-ритуал</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 400 }}>Оберіть програму, дату та час — адміністратор зв’яжеться з вами, щоб підтвердити візит. Останній початок ритуалу — о 18:00, щоб повний протокол завершився до 20:30.</p>
            </Reveal>
            <Reveal delay={0.1}><BookingForm spaOnly preset={preset} slots={SPA_SLOTS} onSuccess={onBooked} /></Reveal>
          </div>
        </Container>
      </div>
    </div>
  );
}

function SpaTeaser({ setPage }) {
  const { data } = useSiteData();
  const spa = data.spa || DEFAULT_DATA.spa;
  return (
    <Container>
      <Reveal>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 2, padding: 'clamp(28px, 5vw, 56px)', color: '#F2E9DE', border: '1px solid rgba(210,166,121,0.3)', background: 'radial-gradient(ellipse 60% 90% at 100% 0%, rgba(210,166,121,0.28), transparent 60%), linear-gradient(120deg,#3E2A20 0%,#261D18 55%,#171412 100%)' }}>
          <p className="ls-eyebrow" style={{ color: '#D2A679', marginBottom: 12 }}>Новий напрямок</p>
          <h2 className="f-display" style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 500, margin: '0 0 14px' }}>{spa.heroTitle}</h2>
          <p style={{ fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'rgba(242,233,222,0.75)', maxWidth: 520, marginBottom: 26 }}>{spa.heroSubtitle}</p>
          <button className="ls-btn" style={{ background: '#D2A679', color: '#1C1410' }} onClick={() => setPage('spa')}>Дізнатися більше <ArrowUpRight size={15} /></button>
        </div>
      </Reveal>
    </Container>
  );
}
const THANKS_SECONDS = 8; // через скільки секунд повертати на SPA

function ThanksPage({ setPage, info }) {
  const [left, setLeft] = useState(THANKS_SECONDS);

  useEffect(() => {
    if (left <= 0) { setPage('spa', { replace: true }); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, setPage]);

  return (
    <div className="spa-hero" style={{ minHeight: 'calc(100vh - 76px)', display: 'flex', alignItems: 'center' }}>
      <div className="spa-glow" />
      <Container style={{ position: 'relative', zIndex: 1, padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 24px)', textAlign: 'center' }}>
        <Reveal>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#8C6641', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <Check size={32} color="#FFF6EA" />
          </div>
          <p className="ls-eyebrow" style={{ marginBottom: 14 }}>Заявку надіслано</p>
          <h1 className="f-display" style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 500, margin: '0 0 18px' }}>
            Дякуємо{info && info.firstName ? `, ${info.firstName}` : ''}!
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--ink-soft)', maxWidth: 520, margin: '0 auto 24px' }}>
            Ваш запис збережено. Майстер зв’яжеться з вами найближчим часом, щоб підтвердити візит.
          </p>

          {info && (
            <div className="ls-card" style={{ display: 'inline-block', textAlign: 'left', padding: '18px 24px', marginBottom: 28, maxWidth: '100%' }}>
              <p style={{ fontSize: 14, marginBottom: 6 }}><span style={{ color: 'var(--ink-faint)' }}>Програма: </span>{info.service}</p>
              <p style={{ fontSize: 14, marginBottom: 6 }}><span style={{ color: 'var(--ink-faint)' }}>Бажана дата: </span>{info.date}, {info.time}</p>
              <p style={{ fontSize: 14 }}><span style={{ color: 'var(--ink-faint)' }}>Телефон: </span>{info.phone}</p>
            </div>
          )}

          <div style={{ maxWidth: 320, margin: '0 auto 20px' }}>
            <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(left / THANKS_SECONDS) * 100}%`, height: '100%', background: 'var(--sage)', transition: 'width 1s linear' }} />
            </div>
            <p className="f-mono" style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10 }}>
              Повернення на сторінку SPA через {left} с
            </p>
          </div>

          <button className="ls-btn ls-btn-outline" onClick={() => setPage('spa', { replace: true })}>Повернутися зараз</button>
        </Reveal>
      </Container>
    </div>
  );
}

const PAGE_IDS = ['home', 'services', 'spa', 'portfolio', 'reviews', 'contacts', 'admin', 'thanks'];

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

function pathForPage(id) {
  const suffix = id === 'home' ? '' : `/${id}`;
  return `${BASE_PATH}${suffix}` || '/';
}

function pageForPath(pathname) {
  let clean = pathname || '/';
  if (BASE_PATH && clean.startsWith(BASE_PATH)) clean = clean.slice(BASE_PATH.length);
  clean = clean.replace(/\/+$/, '') || '/';
  const id = clean === '/' ? 'home' : clean.replace(/^\//, '');
  return PAGE_IDS.includes(id) ? id : 'home';
}

export default function App() {
  const [page, setPageState] = useState(() => (typeof window !== 'undefined' ? pageForPath(window.location.pathname) : 'home'));
  const [data, setData] = useState(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const [thanksInfo, setThanksInfo] = useState(null);   // ← НОВОЕ

  const navigate = useCallback((id, opts = {}) => {
    if (!PAGE_IDS.includes(id)) id = 'home';
    setPageState(id);
    const path = pathForPage(id);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      if (opts.replace) window.history.replaceState({ page: id }, '', path);
      else window.history.pushState({ page: id }, '', path);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setPageState(pageForPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await remoteGetSiteData();
        if (parsed && !cancelled) {
          setData(d => ({ ...d, ...parsed, settings: { ...d.settings, ...parsed.settings } }));
        }
      } catch (e) {
        /* сховище ще порожнє або недоступне */
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const persist = async (newData) => {
    setData(newData);
    try { await remoteSetSiteData(newData); }
    catch (e) { console.error('storage error', e); }
  };

  const submitPendingReview = async (review) => {
    let latest = data;
    try {
      const fresh = await remoteGetSiteData();
      if (fresh) latest = { ...data, ...fresh, settings: { ...data.settings, ...fresh.settings } };
    } catch (e) { /* якщо не вдалося — використовуємо поточний стейт */ }

    const newReview = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      name: review.name,
      service: review.service,
      rating: review.rating,
      text: review.text,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...latest, pendingReviews: [...(latest.pendingReviews || []), newReview] };
    await persist(updated);

    const stars = '⭐'.repeat(review.rating);
    const message = `<b>💬 НОВИЙ ВІДГУК НА МОДЕРАЦІЮ!</b>\n\n<b>Ім'я:</b> ${review.name}\n<b>Послуга:</b> ${review.service}\n<b>Оцінка:</b> ${stars} (${review.rating}/5)\n<b>Текст відгуку:</b>\n${review.text}`;

    try {
      await sendTelegramMessage(message);
    } catch (e) {
      /* сповіщення другорядне */
    }
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [page]);

    const pages = {
    home: <HomePage setPage={navigate} />,
    services: <ServicesPage />,
    spa: <SpaPage setPage={navigate} onBooked={(info) => { setThanksInfo(info); navigate('thanks'); }} />,  // ← НОВОЕ
    thanks: <ThanksPage setPage={navigate} info={thanksInfo} />,                                           // ← НОВОЕ
    portfolio: <PortfolioPage />,
    reviews: <ReviewsPage />,
    contacts: <ContactsPage />,
    admin: <AdminPage />,
  };

  if (!ready) {
    return <div className="ls-root" style={{ minHeight: 400 }}><GlobalStyle /></div>;
  }

  return (
    <SiteDataContext.Provider value={{ data, persist, submitPendingReview }}>
      <div className={`ls-root${page === 'spa' || page === 'thanks' ? ' ls-theme-spa' : ''}`}>
        <GlobalStyle />
        <Header page={page} setPage={navigate} />
        <div style={{ paddingTop: 'clamp(60px, 8vw, 76px)' }}>
          {pages[page]}
        </div>
        <Footer setPage={navigate} />
      </div>
    </SiteDataContext.Provider>
  );
}