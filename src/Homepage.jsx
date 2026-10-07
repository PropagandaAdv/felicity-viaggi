import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowRight, BadgeCheck, Briefcase, CalendarDays, Check, CircleAlert, Clock, Compass,
  Facebook, Headphones, Heart, Instagram, Loader2, Mail, MapPin, Menu, MessageCircle, Moon, Phone,
  Plane, Send, ShieldCheck, Ship, Bus, Users, Utensils, X,
} from 'lucide-react';

/* =============================================================================
   CONFIG: dati reali di Felicity Viaggi (fonte: felicityviaggi.eu, 07/10/2026)
   Gli endpoint e gli ID di tracciamento arrivano da variabili d'ambiente (vedi README).
   ============================================================================= */
const ENV = import.meta.env;
const CONFIG = {
  formEndpoint: ENV.VITE_FORM_ENDPOINT || '',        // es. https://formspree.io/f/xxxx (POST JSON)
  newsletterEndpoint: ENV.VITE_NEWSLETTER_ENDPOINT || '',
  gtmId: ENV.VITE_GTM_ID || '',                      // es. GTM-XXXXXXX
  metaPixelId: ENV.VITE_META_PIXEL_ID || '',         // es. 123456789012345
  phone: '041 980899',
  phoneHref: 'tel:+39041980899',
  mobile: '331 323 2477',
  whatsappHref: 'https://wa.me/393313232477',
  email: 'info@felicityviaggi.it',
  emailSposi: 'sposi@felicityviaggi.it',
  address: 'Via Riviera Magellano 4, Mestre (VE)',
  mapsHref: 'https://www.google.com/maps/search/?api=1&query=Via+Riviera+Magellano+4+Mestre',
  facebook: 'https://www.facebook.com/felicityviaggi/',
  instagram: 'https://www.instagram.com/felicityviaggi/',
  site: 'https://www.felicityviaggi.eu',
};

const ICON = { strokeWidth: 1.5 };

/* =============================================================================
   TRACKING: dataLayer (GTM) + Meta Pixel opzionale
   ============================================================================= */
function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  const fbMap = { generate_lead: 'Lead', sign_up: 'CompleteRegistration' };
  if (fbMap[event] && typeof window.fbq === 'function') window.fbq('track', fbMap[event]);
}

function useTrackingScripts() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    if (CONFIG.gtmId && !document.getElementById('gtm-script')) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      const s = document.createElement('script');
      s.id = 'gtm-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CONFIG.gtmId)}`;
      document.head.appendChild(s);
    }
    if (CONFIG.metaPixelId && !window.fbq) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', CONFIG.metaPixelId);
      window.fbq('track', 'PageView');
    }
  }, []);
}

const ctaClick = (label, location) => track('cta_click', { cta_label: label, cta_location: location });

/* =============================================================================
   CONTENUTI
   ============================================================================= */
const SCENES = [
  {
    key: 'caraibi',
    place: 'Caraibi',
    eyebrow: 'Felicity Viaggi · Mestre, dal 1993',
    title: ['Il', 'mondo,', 'scelto', 'per', 'te.'],
    gradientWord: 3, // "per": l'unica parola in gradiente della hero
    body: 'Mare, tour e crociere selezionati uno per uno dai nostri consulenti. Tu pensi a partire, al resto pensiamo noi.',
    img: '/assets/hero-caraibi-1920.webp',
    imgMobile: '/assets/hero-caraibi-mobile.webp',
    alt: 'Laguna caraibica turchese con una lingua di sabbia bianca e palme, alla luce del mattino',
    tick: '#03B5AA',
  },
  {
    key: 'patagonia',
    place: 'Patagonia',
    eyebrow: 'Patagonia · una notte d’aurora',
    title: ['Dove', 'finisce', 'la', 'mappa,', 'inizia', 'la', 'meraviglia.'],
    body: 'Itinerari su misura anche verso le mete più lontane, con voli, trasferimenti ed escursioni organizzati per te.',
    img: '/assets/hero-patagonia-1920.webp',
    imgMobile: '/assets/hero-patagonia-mobile.webp',
    alt: 'Picchi di granito e un ghiacciaio della Patagonia sotto un’aurora verde e viola, riflessi in un lago',
    tick: '#8B6FE0',
  },
  {
    key: 'deserto',
    place: 'Deserto',
    eyebrow: 'Deserto · luce d’oro',
    title: ['Torni', 'a', 'casa', 'con', 'un', 'ricordo,', 'non', 'con', 'un', 'pensiero.'],
    body: 'Un consulente dedicato prima, durante e dopo il viaggio. Ti risponde una persona vera, al telefono, su WhatsApp o in agenzia.',
    img: '/assets/hero-deserto-1920.webp',
    imgMobile: '/assets/hero-deserto-mobile.webp',
    alt: 'Grandi dune di sabbia dorata al tramonto con il sole basso sull’orizzonte',
    tick: '#FFC300',
  },
];

// Fasce di progresso (0..1) in cui ogni scena è leggibile. Punti di partenza validati col flick test.
const BANDS_SCRUB = [[0, 0.24], [0.37, 0.64], [0.77, 1]];
const BANDS_LITE = [[0, 0.28], [0.36, 0.64], [0.72, 1]];
// Mappa progresso -> secondi del video (20 s: 0-10 Caraibi->Patagonia, 10-20 Patagonia->Deserto).
// Il movimento rallenta sulle tre scene, dove si legge, e corre nelle transizioni.
const TIME_MAP = [[0, 0], [0.16, 0.9], [0.4, 9.2], [0.6, 10.8], [0.84, 19.0], [1, 20]];
const VIDEO_URL = '/assets/hero-scrub.mp4';
const VIDEO_BYTES = 7062030; // fallback se manca Content-Length; aggiornato all'encode

const TYPES = [
  { id: 'tutti', label: 'Tutti i viaggi' },
  { id: 'vacanze', label: 'Vacanze' },
  { id: 'crociere', label: 'Crociere' },
  { id: 'tour', label: 'Tour' },
];

// Offerte reali pubblicate su felicityviaggi.eu il 07/10/2026. Prezzi "a partire da" a persona.
const OFFERS = [
  {
    id: 'nicolaus-three-corners-marsa-alam', type: 'vacanze', badge: 'Volo + Soggiorno', BadgeIcon: Plane,
    name: 'Nicolaus Club Three Corners Sea Beach Resort', place: 'Mar Rosso · Marsa Alam',
    date: '25 ottobre 2026', nights: '7 notti', board: 'All inclusive', price: 931,
    img: '/assets/offer-marsaalam.webp', alt: 'Barriera corallina nel Mar Rosso vista a pelo d’acqua, con le colline del deserto sullo sfondo',
    href: `${CONFIG.site}/vacanze/dettaglio/36919/312/LIVENCL-NC-PORTGHALIB-5162-20261025-7-MXP-294127294156-FLY-BASIS/54/struttura/Nicolaus-Club-Three-Corners-Sea-Beach-Resort/dal/25-10-2026/al/01-11-2026/durata/7/eta/35,35`,
  },
  {
    id: 'seaclub-cape-panwa', type: 'vacanze', badge: 'Volo + Soggiorno', BadgeIcon: Plane,
    name: 'SeaClub Cape Panwa', place: 'Thailandia · Phuket',
    date: '23 novembre 2026', nights: '7 notti', board: 'Pensione completa + 1 bevanda', price: 1593,
    img: '/assets/offer-phuket.webp', alt: 'Baia tropicale di Phuket con isolotti calcarei e acqua color smeraldo',
    href: `${CONFIG.site}/vacanze/dettaglio/38385/5035/LIVEALP-FR-FR-001337-E6C5920-25215A5LR-FR25215A5LR-8-20261123112000-MXP/51/struttura/SeaClub-Cape-Panwa/dal/23-11-2026/al/30-11-2026/durata/7/eta/35,35`,
  },
  {
    id: 'veraclub-sunscape-dominicus', type: 'vacanze', badge: 'Volo + Soggiorno', BadgeIcon: Plane,
    name: 'Veraclub Sunscape Dominicus', place: 'Rep. Dominicana · Bayahibe',
    date: '27 novembre 2026', nights: '7 notti', board: 'All inclusive', price: 2222,
    img: '/assets/offer-dominicana.webp', alt: 'Spiaggia caraibica di sabbia bianca con palme inclinate sul mare turchese',
    href: `${CONFIG.site}/vacanze/dettaglio/38662/1101/453490/11/struttura/Veraclub-Sunscape-Dominicus/dal/27-11-2026/al/04-12-2026/durata/7/eta/35,35`,
  },
  {
    id: 'mercatini-monaco', type: 'tour', badge: 'Bus + Tour', BadgeIcon: Bus,
    name: 'Mercatini di Natale a Monaco di Baviera', place: 'Germania · Baviera',
    date: '5 dicembre 2026', nights: '3 notti', board: null, price: 880,
    img: '/assets/offer-monaco.webp', alt: 'Mercatino di Natale in una piazza bavarese all’ora blu, con bancarelle illuminate e un grande albero',
    href: `${CONFIG.site}/tour/dettaglio/2187/246/BSCLive-WH-NORD-20261205/63/struttura/Mercatini-di-Natale-a-Monaco-di-Baviera/dal/05-12-2026/al/12-12-2026/durata/3/eta/35,35`,
  },
  {
    id: 'costa-smeralda-canarie', type: 'crociere', badge: 'Crociera', BadgeIcon: Ship,
    name: 'Costa Smeralda · Isole Canarie, Spagna, Madera', place: 'Partenza da Santa Cruz de Tenerife',
    date: '13 dicembre 2026', nights: '8 giorni', board: null, price: 449,
    img: '/assets/offer-crociera.webp', alt: 'Nave da crociera bianca in navigazione sull’oceano davanti alla costa vulcanica delle Canarie',
    href: `${CONFIG.site}/crociere/dettaglio/TCI07A5I/0/pacchetto/Isole%20Canarie-Spagna-Madera/volo/NO/dal/13-12-2026/al/27-12-2026`,
  },
  {
    id: 'valtur-cervinia', type: 'vacanze', badge: 'Solo soggiorno', BadgeIcon: Moon,
    name: 'Valtur Cervinia Cristallo Ski Resort', place: 'Italia · Valle d’Aosta',
    date: '17 gennaio 2027', nights: '7 notti', board: 'Pernottamento e colazione', price: 2414,
    img: '/assets/offer-cervinia.webp', alt: 'Cervino innevato in una limpida mattina d’inverno, con abeti carichi di neve',
    href: `${CONFIG.site}/vacanze/dettaglio/36042/1/LIVENCLHO-VT-CERVINIA-5045-20270117-7-BASIS/54/struttura/Valtur-Cervinia-Cristallo-Ski-Resort/dal/17-01-2027/al/24-01-2027/durata/7/eta/35,35`,
  },
];

const DESTINATIONS = [
  { name: 'Tenerife', line: 'Vulcani sopra le nuvole', img: '/assets/dest-tenerife.webp', alt: 'Il Teide sopra un mare di nuvole al tramonto', href: `${CONFIG.site}/offerte/tenerife` },
  { name: 'Maldive', line: 'Lagune senza fine', img: '/assets/dest-maldive.webp', alt: 'Isola delle Maldive circondata da una laguna turchese, vista dall’alto', href: `${CONFIG.site}/offerte/maldive` },
  { name: 'Capo Verde', line: 'Dune sull’Atlantico', img: '/assets/dest-capoverde.webp', alt: 'Dune dorate che scendono verso l’oceano a Capo Verde', href: `${CONFIG.site}/offerte/capo-verde` },
  { name: 'Zanzibar', line: 'Dhow e acque basse', img: '/assets/dest-zanzibar.webp', alt: 'Barca dhow a vela bianca sull’acqua bassa e turchese di Zanzibar', href: `${CONFIG.site}/offerte/zanzibar` },
];

const PILLARS = [
  { Icon: Compass, title: 'Su misura, davvero', text: 'Partiamo da come vuoi viaggiare tu: ritmo, budget, compagni di viaggio. Poi costruiamo la proposta, non il contrario.' },
  { Icon: Headphones, title: 'Assistenza umana', text: 'Un consulente dedicato che ti risponde al telefono, su WhatsApp o in agenzia. Prima di partire e mentre sei via.' },
  { Icon: ShieldCheck, title: 'Viaggi protetti', text: 'Siamo agenzia partner di Welcome Travel Group e aderiamo al fondo di garanzia Vacanze Assicurate.' },
  { Icon: Users, title: 'Ogni tipo di viaggio', text: 'Viaggi individuali, gruppi in pullman e in aereo, crociere, viaggi di nozze, viaggi d’affari e incentive.' },
];

const STEPS = [
  { n: '01', title: 'Ci racconti il viaggio', text: 'In agenzia, al telefono o con il modulo qui sotto. Bastano un’idea, un periodo e con chi parti.' },
  { n: '02', title: 'Disegniamo la proposta', text: 'Confrontiamo strutture, voli ed escursioni e ti presentiamo un itinerario chiaro, con il prezzo finale.' },
  { n: '03', title: 'Parti sereno', text: 'Documenti, trasferimenti e assicurazioni sono pronti. E se serve, noi restiamo raggiungibili.' },
];

const NAV = [
  { href: '#viaggi', label: 'Viaggi' },
  { href: '#perche', label: 'Perché noi' },
  { href: '#newsletter', label: 'Newsletter' },
  { href: '#contatti', label: 'Contatti' },
];

/* =============================================================================
   UTILITY
   ============================================================================= */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const formatEuro = (n) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;

function bandOpacity(p, [a, b], i, last) {
  const f = Math.min(0.03, (b - a) / 3);
  const inn = i === 0 ? 1 : smoothstep(p, a, a + f);
  const out = i === last ? 1 : 1 - smoothstep(p, b - f, b);
  return inn * out;
}

// Le cinque condizioni per la hero statica: identiche in tutto il file (vedi skill 10k-websites).
const GATES_LITE = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
];
const GATE_REDUCED = '(prefers-reduced-motion: reduce)';

function getHeroMode() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'lite';
  if (window.matchMedia(GATE_REDUCED).matches) return 'static';
  if (GATES_LITE.some((q) => window.matchMedia(q).matches)) return 'lite';
  return 'scrub';
}

function useHeroMode() {
  const [mode, setMode] = useState(getHeroMode);
  useEffect(() => {
    const mqls = [...GATES_LITE, GATE_REDUCED].map((q) => window.matchMedia(q));
    const update = () => setMode(getHeroMode());
    mqls.forEach((m) => m.addEventListener('change', update));
    return () => mqls.forEach((m) => m.removeEventListener('change', update));
  }, []);
  return mode;
}

/** Entrata in viewport: aggiunge lo stato visibile una sola volta. Senza IO, mostra subito. */
function useInView(options = { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView];
}

function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-[1100ms] ease-out-expo ${inView ? 'opacity-100 translate-y-0' : 'motion-safe:opacity-0 motion-safe:translate-y-8'} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Eyebrow({ children, dark = false, className = '' }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? 'text-brand-accent' : 'text-brand-primary'} ${className}`}>
      {children}
    </p>
  );
}

function GradientWord({ children }) {
  return <span className="bg-gradient-to-r from-brand-accent to-brand-secondary bg-clip-text text-transparent [text-shadow:none] [filter:drop-shadow(0_2px_10px_rgba(3,16,28,.45))]">{children}</span>;
}

/** Il segno firma del sito: lo "schizzo" del logo, disegnato a mano in SVG. Solo decorativo. */
function Splash({ className = '', color = 'currentColor', rays = 11 }) {
  const items = Array.from({ length: rays }, (_, i) => {
    const a = (i / rays) * Math.PI * 2 + (i % 2) * 0.12;
    const len = i % 3 === 0 ? 44 : i % 3 === 1 ? 38 : 41;
    return { x1: 50 + Math.cos(a) * 18, y1: 50 + Math.sin(a) * 18, x2: 50 + Math.cos(a) * len, y2: 50 + Math.sin(a) * len, dot: i % 2 === 0 };
  });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="20" fill={color} />
      {items.map((r, i) => (
        <g key={i}>
          <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke={color} strokeWidth="6.5" strokeLinecap="round" />
          {r.dot && <circle cx={50 + (r.x2 - 50) * 1.13} cy={50 + (r.y2 - 50) * 1.13} r="2.6" fill={color} />}
        </g>
      ))}
    </svg>
  );
}

/* =============================================================================
   BOTTONI
   ============================================================================= */
const BTN_BASE = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-[transform,background-color,box-shadow,color,border-color] duration-500 ease-out-expo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent motion-safe:hover:-translate-y-0.5';
const BTN = {
  primary: `${BTN_BASE} bg-brand-secondary text-brand-ink shadow-[0_18px_40px_-16px_rgba(255,195,0,0.65)] hover:bg-[#ffcd2e]`,
  glass: `${BTN_BASE} border border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-brand-accent hover:bg-white/20`,
  blue: `${BTN_BASE} bg-brand-primary text-white hover:bg-brand-deep`,
  ghost: `${BTN_BASE} border border-brand-primary/25 text-brand-primary hover:border-brand-accent hover:bg-white`,
};

/* =============================================================================
   HEADER
   ============================================================================= */
function Header() {
  const [onDark, setOnDark] = useState(true);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const read = () => {
      raf = null;
      const hero = document.getElementById('hero');
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - 72 : 0;
      const y = window.scrollY;
      setOnDark((prev) => (prev !== y < heroEnd ? y < heroEnd : prev));
      setCompact((prev) => (prev !== y > 24 ? y > 24 : prev));
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // il pannello diventa visibile in questo stesso frame: il focus va spostato al successivo
    const focusTimer = setTimeout(() => menuRef.current?.querySelector('a, button')?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
      if (e.key === 'Tab' && menuRef.current) {
        const f = [toggleRef.current, ...menuRef.current.querySelectorAll('a, button')].filter(Boolean);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(focusTimer); document.body.style.overflow = prevOverflow; document.removeEventListener('keydown', onKey); };
  }, [open]);

  const dark = onDark || open;
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`relative z-[60] mx-auto mt-3 flex max-w-7xl items-center justify-between gap-4 rounded-full border px-4 transition-[background-color,border-color,box-shadow,padding] duration-700 ease-out-expo sm:mx-4 sm:px-6 xl:mx-auto ${compact ? 'py-2' : 'py-3'} ${dark ? `border-white/10 backdrop-blur-md ${open ? 'bg-transparent border-transparent' : 'bg-brand-night/25'}` : 'border-brand-primary/10 bg-white/75 shadow-soft backdrop-blur-md'} mx-3`}>
        <a href="#top" className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent" aria-label="Felicity Viaggi, torna all'inizio">
          <img src={dark ? '/assets/logo-felicityviaggi-white.png' : '/assets/logo-felicityviaggi.png'} alt="Felicity Viaggi" width="498" height="232" className={`w-auto transition-[height] duration-500 ${compact ? 'h-10' : 'h-11 sm:h-12'}`} />
        </a>
        <nav aria-label="Navigazione principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent ${dark ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-brand-ink hover:text-brand-primary hover:bg-brand-primary/5'}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={CONFIG.phoneHref} onClick={() => ctaClick('Telefono header', 'header')} className={`hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium md:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent ${dark ? 'text-white/90 hover:text-white' : 'text-brand-primary'}`}>
            <Phone size={20} {...ICON} aria-hidden="true" /> {CONFIG.phone}
          </a>
          <a href="#preventivo" onClick={() => ctaClick('Richiedi un preventivo', 'header')} className={`${BTN.primary} hidden !px-5 sm:inline-flex`}>
            Richiedi un preventivo
          </a>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
            className={`relative z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent ${open ? 'text-white' : dark ? 'text-white hover:bg-white/10' : 'text-brand-primary hover:bg-brand-primary/5'}`}
          >
            {open ? <X size={28} {...ICON} /> : <Menu size={28} {...ICON} />}
          </button>
        </div>
      </div>

      {/* Menu mobile a tutto schermo */}
      <div
        id="menu-mobile"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-[55] flex flex-col bg-brand-night/95 px-6 pb-10 pt-28 backdrop-blur-md transition-[opacity,visibility] duration-500 ease-out-expo lg:hidden ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        <Splash className="pointer-events-none absolute -right-16 top-24 h-64 w-64 text-brand-accent/10 motion-safe:animate-float" />
        <nav aria-label="Menu mobile">
          <ul className="space-y-2">
            {NAV.map((n, i) => (
              <li key={n.href} style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }} className={`transition-[opacity,transform] duration-700 ease-out-expo ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <a href={n.href} onClick={() => setOpen(false)} className="block py-2 text-4xl font-semibold tracking-tight text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto space-y-4">
          <a href="#preventivo" onClick={() => { setOpen(false); ctaClick('Richiedi un preventivo', 'menu_mobile'); }} className={`${BTN.primary} w-full`}>Richiedi un preventivo</a>
          <div className="flex gap-3">
            <a href={CONFIG.phoneHref} onClick={() => ctaClick('Telefono', 'menu_mobile')} className={`${BTN.glass} flex-1`}><Phone size={20} {...ICON} aria-hidden="true" /> Chiama</a>
            <a href={CONFIG.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => ctaClick('WhatsApp', 'menu_mobile')} className={`${BTN.glass} flex-1`}><MessageCircle size={20} {...ICON} aria-hidden="true" /> WhatsApp</a>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =============================================================================
   HERO: tre scene (Caraibi -> Patagonia -> Deserto)
   - scrub:  video scrubbato dallo scroll (desktop)
   - lite:   tre immagini in crossfade con zoom leggero (telefoni e tablet in verticale)
   - static: tre immagini statiche in sequenza (prefers-reduced-motion)
   ============================================================================= */
function HeroCtas({ location, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      <a href="#viaggi" onClick={() => ctaClick('Scopri i viaggi', location)} className={BTN.primary}>
        Scopri i viaggi <ArrowRight size={20} {...ICON} aria-hidden="true" />
      </a>
      <a href="#preventivo" onClick={() => ctaClick('Parla con un consulente', location)} className={BTN.glass}>
        <Headphones size={20} {...ICON} aria-hidden="true" /> Parla con un consulente
      </a>
    </div>
  );
}

const TEXT_SHADOW = '[text-shadow:0_1px_2px_rgba(3,16,28,.9),0_3px_14px_rgba(3,16,28,.6),0_10px_44px_rgba(3,16,28,.55)]';

/** Titolo spezzato in parole: ogni parola entra con l'avanzamento --k della propria fascia. */
function SceneTitle({ scene, index, as: Tag }) {
  const n = scene.title.length;
  // Entrate diverse per scena, in eco con il girato: salita (laguna), avvicinamento (aurora), vento (deserto).
  const enter = [
    'translateY(calc((1 - var(--kc)) * 34px))',
    'scale(calc(0.86 + 0.14 * var(--kc)))',
    'translateX(calc((1 - var(--kc)) * 46px))',
  ][index];
  return (
    <Tag className={`text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl ${index === 0 ? 'lg:text-8xl' : 'lg:text-7xl'} ${TEXT_SHADOW}`}>
      <span className="sr-only">{scene.title.join(' ')}</span>
      <span aria-hidden="true">
        {scene.title.map((w, i) => (
          <span
            key={i}
            className="inline-block pb-[0.08em] will-change-transform"
            style={{
              '--th': (i / n) * 0.45,
              '--kc': 'clamp(0, (var(--k, 1) - var(--th)) * 2.6, 1)',
              opacity: 'var(--kc)',
              transform: enter,
              transformOrigin: '0% 80%',
            }}
          >
            {scene.gradientWord === i ? <GradientWord>{w}</GradientWord> : w}
            {i < n - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function SceneCopy({ scene, index }) {
  return (
    <div className="relative isolate max-w-[48rem]">
      {/* Scrim locale: scurisce il girato solo dietro il testo e solo mentre la scena è attiva */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[55%] -left-[40vw] -right-[40%] -top-[55%] -z-10 bg-[radial-gradient(closest-side,rgba(3,18,32,.76)_0%,rgba(3,18,32,.62)_45%,rgba(3,18,32,.3)_75%,rgba(3,18,32,0)_100%)]" style={{ opacity: 'calc(.35 + .65 * var(--k, 1))' }} />
      <p className={`mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white ${TEXT_SHADOW}`} style={{ opacity: 'clamp(0, var(--k, 1) * 3, 1)' }}>
        {scene.eyebrow}
      </p>
      <SceneTitle scene={scene} index={index} as={index === 0 ? 'h1' : 'h2'} />
      <p
        className={`mt-6 max-w-[34rem] text-lg font-light leading-relaxed text-white/90 ${TEXT_SHADOW}`}
        style={{ opacity: 'clamp(0, (var(--k, 1) - 0.55) * 3.2, 1)', transform: 'translateY(calc((1 - clamp(0, (var(--k, 1) - 0.55) * 3.2, 1)) * 14px))' }}
      >
        {scene.body}
      </p>
    </div>
  );
}

function SceneTicks({ tickRefs, labels = true }) {
  return (
    <ol className="pointer-events-none absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-5 sm:flex lg:right-10" aria-hidden="true">
      {SCENES.map((s, i) => (
        <li key={s.key} ref={(el) => { tickRefs.current[i] = el; }} className="group flex items-center justify-end gap-3 opacity-50 transition-opacity duration-700 [&.is-on]:opacity-100">
          {labels && <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white [text-shadow:0_1px_6px_rgba(3,16,28,.8)]">{s.place}</span>}
          <span className="relative block h-8 w-[3px] overflow-hidden rounded-full bg-white/25">
            <span className="absolute inset-0 origin-top scale-y-0 rounded-full transition-transform duration-700 ease-out-expo group-[.is-on]:scale-y-100" style={{ backgroundColor: s.tick }} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function HeroScrims() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,32,.82)_0%,rgba(3,18,32,.58)_34%,rgba(3,18,32,.12)_62%,rgba(3,18,32,0)_80%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(3,18,32,.75)_0%,rgba(3,18,32,0)_100%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(3,18,32,.55)_0%,rgba(3,18,32,0)_100%)]" aria-hidden="true" />
    </>
  );
}

function HeroScrub({ onFail }) {
  const sectionRef = useRef(null);
  const layerRef = useRef(null);
  const videoRef = useRef(null);
  const bandRefs = useRef([]);
  const tickRefs = useRef([]);
  const hintRef = useRef(null);
  const ringRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | failed

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const layer = layerRef.current;
    if (!section || !video) return undefined;

    let target = 0; let shown = 0; let raf = null; let lastTick = 0;
    let onScreen = true; // acceso di default: l'IO può solo spegnerlo (vedi memoria del progetto)
    let seekBusy = false; let pending = null; let objectUrl = null; let alive = true;
    const cache = SCENES.map(() => ({ op: -1, k: -1 }));
    let lastScale = -1; let lastScene = -1; let hintOn = true;
    const ctrl = new AbortController();

    const progress = () => {
      const range = section.offsetHeight - window.innerHeight;
      if (range <= 0) return 0;
      return clamp(-section.getBoundingClientRect().top / range, 0, 1);
    };
    const timeAt = (p) => {
      const dur = video.duration || 20;
      const scale = dur / 20;
      for (let i = 1; i < TIME_MAP.length; i++) {
        const [p1, t1] = TIME_MAP[i]; const [p0, t0] = TIME_MAP[i - 1];
        if (p <= p1) return (t0 + ((p - p0) / (p1 - p0)) * (t1 - t0)) * scale;
      }
      return dur;
    };
    const requestSeek = (t) => {
      if (!video.duration || !isFinite(video.duration)) return;
      const tt = clamp(t, 0, video.duration - 0.05);
      if (seekBusy) { pending = tt; return; }
      if (Math.abs(video.currentTime - tt) < 0.008) return;
      seekBusy = true;
      video.currentTime = tt;
    };
    const onSeeked = () => {
      seekBusy = false;
      if (pending !== null) { const t = pending; pending = null; requestSeek(t); }
    };
    const onVideoError = () => { seekBusy = false; pending = null; setStatus('failed'); onFail?.(); };

    const write = (p) => {
      const last = SCENES.length - 1;
      BANDS_SCRUB.forEach((band, i) => {
        const el = bandRefs.current[i];
        if (!el) return;
        const op = bandOpacity(p, band, i, last);
        let k = clamp((p - band[0]) / Math.min(0.06, (band[1] - band[0]) * 0.35), 0, 1);
        if (i === 0) k = 1; // la prima scena apre già composta (è anche nel guscio statico di index.html)
        const c = cache[i];
        if (Math.abs(op - c.op) > 0.004) { c.op = op; el.style.opacity = op.toFixed(3); el.style.visibility = op < 0.01 ? 'hidden' : 'visible'; }
        if (Math.abs(k - c.k) > 0.008) { c.k = k; el.style.setProperty('--k', k.toFixed(3)); }
      });
      const sc = 1.06 - 0.06 * p; // zoom lentissimo su tutta la sequenza: parallasse fra video e testi
      if (layer && Math.abs(sc - lastScale) > 0.0004) { lastScale = sc; layer.style.transform = `scale(${sc.toFixed(4)})`; }
      const scene = p < 0.31 ? 0 : p < 0.71 ? 1 : 2;
      if (scene !== lastScene) {
        lastScene = scene;
        tickRefs.current.forEach((t, i) => t && t.classList.toggle('is-on', i <= scene));
      }
      const wantHint = p < 0.02;
      if (wantHint !== hintOn && hintRef.current) { hintOn = wantHint; hintRef.current.style.opacity = wantHint ? '1' : '0'; }
    };

    const tick = (now) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      shown += (target - shown) * (1 - Math.pow(1 - 0.14, dt / 16.667));
      const converged = Math.abs(target - shown) < 0.0004;
      if (converged) shown = target;
      requestSeek(timeAt(shown));
      write(shown);
      if (!converged && onScreen) raf = requestAnimationFrame(tick);
      else { raf = null; lastTick = 0; }
    };
    const onScroll = () => {
      target = progress();
      if (raf === null && onScreen) raf = requestAnimationFrame(tick);
    };

    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) onScroll(); }, { threshold: 0 })
      : null;
    io?.observe(section);

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onVideoError);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    target = progress(); shown = target;
    raf = requestAnimationFrame(tick);

    // Blob in streaming con anello di caricamento; il poster vince la corsa alla banda.
    async function loadBlob() {
      let watchdog = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
      if (!res.ok || !res.body) throw new Error('video non disponibile');
      const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
      const reader = res.body.getReader();
      const chunks = []; let got = 0; let lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => ctrl.abort(), 20000);
        chunks.push(value); got += value.length;
        const now = performance.now();
        if (ringRef.current && (now - lastRing > 100)) { lastRing = now; ringRef.current.style.setProperty('--ld', String(Math.round(126 * (1 - Math.min(1, got / total))))); }
      }
      clearTimeout(watchdog);
      if (!alive) return;
      ringRef.current?.style.setProperty('--ld', '0');
      objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.src = objectUrl;
      video.load();
      video.addEventListener('loadeddata', () => {
        if (!alive) return;
        setStatus('ready');
        requestSeek(timeAt(shown));
      }, { once: true });
    }
    let started = false;
    const start = () => { if (started || !alive) return; started = true; loadBlob().catch(() => { if (alive) { setStatus('failed'); onFail?.(); } }); };
    const poster = new Image();
    poster.onload = start; poster.onerror = start;
    poster.src = SCENES[0].img;
    const safety = setTimeout(start, 4000);

    return () => {
      alive = false;
      ctrl.abort();
      clearTimeout(safety);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onVideoError);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[500vh] bg-brand-night" aria-label="Tre viaggi, tre mondi: Caraibi, Patagonia, deserto">
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden">
        <div ref={layerRef} className="absolute inset-0 origin-[62%_50%] will-change-transform" style={{ transform: 'scale(1.06)' }}>
          <img src={SCENES[0].img} alt="" fetchpriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <video
            ref={videoRef}
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 [transform:translateZ(0)] ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <HeroScrims />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 pb-32 pt-28 sm:px-10 lg:px-12">
          <div className="relative w-full">
            {SCENES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => { bandRefs.current[i] = el; }}
                className={`${i === 0 ? 'relative' : 'absolute inset-x-0 top-1/2 -translate-y-1/2'}`}
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', '--k': i === 0 ? 1 : 0 }}
              >
                <SceneCopy scene={s} index={i} />
              </div>
            ))}
          </div>
        </div>

        <SceneTicks tickRefs={tickRefs} />

        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-7xl items-end justify-between gap-6 px-6 pb-8 sm:px-10 lg:px-12 lg:pb-10">
            <HeroCtas location="hero" />
            <div ref={hintRef} className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 transition-opacity duration-700 md:flex" aria-hidden="true">
              {status === 'loading' ? (
                <svg ref={ringRef} viewBox="0 0 48 48" className="h-6 w-6 -rotate-90 text-brand-accent">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="126" strokeLinecap="round" style={{ strokeDashoffset: 'var(--ld, 126)', transition: 'stroke-dashoffset .2s linear' }} />
                </svg>
              ) : (
                <ArrowDown size={20} {...ICON} className="motion-safe:animate-hint" />
              )}
              Scorri per viaggiare
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLite({ wide = false }) {
  const sectionRef = useRef(null);
  const imgRefs = useRef([]);
  const bandRefs = useRef([]);
  const tickRefs = useRef([]);
  const hintRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    let raf = null; const cache = { img: [-1, -1, -1], band: [-1, -1, -1], k: [-1, -1, -1], scene: -1, hint: true };
    const write = () => {
      raf = null;
      const range = section.offsetHeight - window.innerHeight;
      const p = range > 0 ? clamp(-section.getBoundingClientRect().top / range, 0, 1) : 0;
      // Immagini impilate: la 2 e la 3 entrano in dissolvenza sopra la precedente, con zoom lento.
      const fades = [1, smoothstep(p, 0.27, 0.37), smoothstep(p, 0.63, 0.73)];
      imgRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = clamp((p - [0, 0.27, 0.63][i]) / 0.5, 0, 1);
        const v = fades[i] + local * 0.0001; // chiave di cache combinata
        if (Math.abs(v - cache.img[i]) > 0.002) {
          cache.img[i] = v;
          el.style.opacity = fades[i].toFixed(3);
          el.style.transform = `scale(${(1.08 - 0.08 * local).toFixed(4)})`;
        }
      });
      BANDS_LITE.forEach((band, i) => {
        const el = bandRefs.current[i];
        if (!el) return;
        const op = bandOpacity(p, band, i, SCENES.length - 1);
        let k = clamp((p - band[0]) / 0.07, 0, 1);
        if (i === 0) k = 1; // su mobile la prima scena apre già composta: niente attesa per l'LCP
        if (Math.abs(op - cache.band[i]) > 0.004) { cache.band[i] = op; el.style.opacity = op.toFixed(3); el.style.visibility = op < 0.01 ? 'hidden' : 'visible'; }
        if (Math.abs(k - cache.k[i]) > 0.008) { cache.k[i] = k; el.style.setProperty('--k', k.toFixed(3)); }
      });
      const scene = p < 0.32 ? 0 : p < 0.68 ? 1 : 2;
      if (scene !== cache.scene) { cache.scene = scene; tickRefs.current.forEach((t, i) => t && t.classList.toggle('is-on', i <= scene)); }
      const wantHint = p < 0.02;
      if (wantHint !== cache.hint && hintRef.current) { cache.hint = wantHint; hintRef.current.style.opacity = wantHint ? '1' : '0'; }
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(write); };
    write();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative h-[300vh] bg-brand-night" aria-label="Tre viaggi, tre mondi: Caraibi, Patagonia, deserto">
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden">
        {SCENES.map((s, i) => (
          <img
            key={s.key}
            ref={(el) => { imgRefs.current[i] = el; }}
            src={wide ? s.img : s.imgMobile}
            srcSet={wide ? undefined : `${s.imgMobile.replace('.webp', '-600.webp')} 600w, ${s.imgMobile} 900w`}
            sizes="100vw"
            alt={i === 0 ? s.alt : ''}
            fetchpriority={i === 0 ? 'high' : 'low'}
            decoding="async"
            width={wide ? 1920 : 900}
            height={wide ? 1080 : 1600}
            className="absolute inset-0 h-full w-full object-cover will-change-[opacity,transform]"
            style={{ opacity: i === 0 ? 1 : 0, transform: 'scale(1.08)' }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,32,.55)_0%,rgba(3,18,32,.25)_30%,rgba(3,18,32,.55)_62%,rgba(3,18,32,.88)_100%)]" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-48 pt-28 sm:px-10">
          <div className="relative">
            {SCENES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => { bandRefs.current[i] = el; }}
                className={i === 0 ? 'relative' : 'absolute inset-x-0 bottom-0'}
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', '--k': i === 0 ? 1 : 0 }}
              >
                <SceneCopy scene={s} index={i} />
              </div>
            ))}
          </div>
        </div>

        <SceneTicks tickRefs={tickRefs} labels={false} />
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-8 sm:px-10">
          <HeroCtas location="hero_mobile" />
          <div ref={hintRef} className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition-opacity duration-700" aria-hidden="true">
            <ArrowDown size={16} {...ICON} className="motion-safe:animate-hint" /> Scorri per viaggiare
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStatic() {
  return (
    <section id="hero" className="bg-brand-night" aria-label="Tre viaggi, tre mondi: Caraibi, Patagonia, deserto">
      {SCENES.map((s, i) => (
        <div key={s.key} className="relative flex min-h-[100svh] items-end overflow-hidden">
          <picture>
            <source media="(max-width: 720px)" srcSet={s.imgMobile} />
            <img src={s.img} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : 'auto'} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          </picture>
          <HeroScrims />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-32 sm:px-10 lg:px-12" style={{ '--k': 1 }}>
            <SceneCopy scene={s} index={i} />
            <HeroCtas location={`hero_static_${s.key}`} className="mt-10" />
          </div>
        </div>
      ))}
    </section>
  );
}

function Hero() {
  const mode = useHeroMode();
  const [videoFailed, setVideoFailed] = useState(false);
  if (mode === 'static') return <HeroStatic />;
  if (mode === 'lite') return <HeroLite />;
  // Se il video non arriva, la sequenza resta raccontata dalle tre immagini in crossfade.
  if (videoFailed) return <HeroLite wide />;
  return <HeroScrub onFail={() => setVideoFailed(true)} />;
}

/* =============================================================================
   VETRINA VIAGGI
   ============================================================================= */
function OfferCard({ offer, index }) {
  const { BadgeIcon } = offer;
  const onSelect = () => track('select_item', {
    item_list_id: 'vetrina_home',
    item_list_name: 'Vetrina viaggi homepage',
    items: [{ item_id: offer.id, item_name: offer.name, item_category: offer.type, item_variant: offer.badge, price: offer.price, currency: 'EUR', index }],
  });
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-brand-primary/5 transition-[transform,box-shadow] duration-700 ease-out-expo motion-safe:hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={offer.img} srcSet={`${offer.img.replace('.webp', '-480.webp')} 480w, ${offer.img} 960w`} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" alt={offer.alt} loading="lazy" decoding="async" width="960" height="720" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out-expo motion-safe:group-hover:scale-105" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-brand-night/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          <BadgeIcon size={16} {...ICON} aria-hidden="true" /> {offer.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">{offer.place}</p>
        <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-brand-ink">
          <a href={offer.href} onClick={onSelect} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-accent">
            {offer.name}
          </a>
        </h3>
        <ul className="mb-6 mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-light text-brand-ink">
          <li className="inline-flex items-center gap-1.5"><CalendarDays size={20} {...ICON} className="text-brand-primary" aria-hidden="true" /><span className="sr-only">Partenza:</span>{offer.date}</li>
          <li className="inline-flex items-center gap-1.5"><Clock size={20} {...ICON} className="text-brand-primary" aria-hidden="true" /><span className="sr-only">Durata:</span>{offer.nights}</li>
          {offer.board && <li className="inline-flex items-center gap-1.5"><Utensils size={20} {...ICON} className="text-brand-primary" aria-hidden="true" /><span className="sr-only">Trattamento:</span>{offer.board}</li>}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-brand-primary/10 pt-5">
          <p className="text-sm font-light text-brand-ink">
            a partire da
            <span className="block text-2xl font-semibold tracking-tight text-brand-primary">{formatEuro(offer.price)}</span>
            <span className="text-xs">a persona</span>
          </p>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary/5 text-brand-primary transition-[background-color,color,transform] duration-500 ease-out-expo group-hover:bg-brand-primary group-hover:text-white motion-safe:group-hover:translate-x-1" aria-hidden="true">
            <ArrowRight size={20} {...ICON} />
          </span>
        </div>
      </div>
    </article>
  );
}

function Showcase() {
  const [filter, setFilter] = useState('tutti');
  const list = useMemo(() => (filter === 'tutti' ? OFFERS : OFFERS.filter((o) => o.type === filter)), [filter]);
  const counts = useMemo(() => Object.fromEntries(TYPES.map((t) => [t.id, t.id === 'tutti' ? OFFERS.length : OFFERS.filter((o) => o.type === t.id).length])), []);

  return (
    <section id="viaggi" className="relative scroll-mt-24 px-6 py-24 sm:px-10 lg:py-36" aria-labelledby="viaggi-title">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Partenze selezionate</Eyebrow>
            <h2 id="viaggi-title" className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Viaggi pronti a partire, <span className="text-brand-primary">scelti con cura.</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5">
            <p className="text-lg font-light leading-relaxed text-brand-ink">
              Una selezione delle proposte dei tour operator con cui lavoriamo ogni giorno. Se una ti piace, la adattiamo insieme: date, camere, escursioni.
            </p>
          </Reveal>
        </div>

        <Reveal delay={160} className="mt-12">
          <div role="group" aria-label="Filtra per tipologia di viaggio" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {TYPES.map((t) => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { setFilter(t.id); track('filter_select', { filter_type: t.id }); }}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-[background-color,color,border-color] duration-500 ease-out-expo focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent ${active ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-primary/20 bg-white text-brand-ink hover:border-brand-accent'}`}
                >
                  {t.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-brand-primary/5 text-brand-primary'}`}>{counts[t.id]}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <p className="sr-only" aria-live="polite">{list.length} viaggi mostrati</p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {list.map((o, i) => (
            <Reveal as="li" key={`${filter}-${o.id}`} delay={Math.min(i, 5) * 90} className="h-full">
              <OfferCard offer={o} index={i} />
            </Reveal>
          ))}
        </ul>

        <p className="mt-8 text-sm font-light text-brand-ink">
          Prezzi a persona «a partire da», come pubblicati sul nostro sito il 7 ottobre 2026: soggetti a disponibilità, li confermiamo al momento del preventivo.
        </p>

        {/* Ispirazioni: layout diverso dalla griglia sopra, colonne alte a tutta immagine */}
        <div className="mt-24 lg:mt-32">
          <Reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>Lasciati ispirare</Eyebrow>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">Quattro mete, quattro modi di stare bene.</h3>
            </div>
            <a href={`${CONFIG.site}/`} onClick={() => ctaClick('Cerca tra tutte le offerte', 'ispirazioni')} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-[6px] transition-colors hover:text-brand-deep">
              Cerca tra tutte le offerte <ArrowRight size={20} {...ICON} aria-hidden="true" />
            </a>
          </Reveal>
          <ul className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6">
            {DESTINATIONS.map((d, i) => (
              <Reveal as="li" key={d.name} delay={i * 90} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <a
                  href={d.href}
                  onClick={() => track('select_item', { item_list_id: 'ispirazioni_home', item_list_name: 'Ispirazioni homepage', items: [{ item_id: d.name.toLowerCase().replace(/\s/g, '-'), item_name: d.name, item_category: 'destinazione', index: i }] })}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent"
                >
                  <img src={d.img} srcSet={`${d.img.replace('.webp', '-360.webp')} 360w, ${d.img} 720w`} sizes="(min-width: 1024px) 290px, (min-width: 640px) 50vw, 78vw" alt={d.alt} loading="lazy" decoding="async" width="720" height="960" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out-expo motion-safe:group-hover:scale-105" />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,32,0)_45%,rgba(3,18,32,.82)_100%)]" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="block text-2xl font-semibold tracking-tight">{d.name}</span>
                    <span className="mt-1 flex items-center justify-between text-sm font-light text-white/90">
                      {d.line}
                      <ArrowRight size={20} {...ICON} aria-hidden="true" className="transition-transform duration-500 motion-safe:group-hover:translate-x-1" />
                    </span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
   PERCHÉ FELICITY VIAGGI
   ============================================================================= */
function Why() {
  return (
    <section id="perche" className="relative scroll-mt-24 overflow-hidden bg-white px-6 py-24 sm:px-10 lg:py-36" aria-labelledby="perche-title">
      <Splash className="pointer-events-none absolute -left-24 top-24 h-80 w-80 text-brand-accent/[0.07] motion-safe:animate-float" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative lg:sticky lg:top-28">
              <img src="/assets/why-atelier.webp" alt="Diario di viaggio aperto, bussola d'ottone e biglietti su una scrivania chiara illuminata dal mattino" loading="lazy" decoding="async" width="900" height="1200" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lift" />
              <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-brand-night/80 p-5 text-white shadow-lift backdrop-blur-md sm:left-auto sm:w-72">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">La nostra formula</p>
                <p className="mt-2 text-lg font-light leading-snug">Qualità, professionalità, cordialità ed efficienza.</p>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>Perché Felicity Viaggi</Eyebrow>
              <h2 id="perche-title" className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
                Una persona vera, dall&rsquo;idea al ritorno.
              </h2>
              <p className="mt-6 max-w-[38rem] text-lg font-light leading-relaxed text-brand-ink">
                Dal 1993 organizziamo viaggi da Mestre. Scegliamo per te servizi personalizzati, hotel con un buon rapporto qualità prezzo, tour ed escursioni che valgono il viaggio, perché la tua vacanza diventi un bel ricordo.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {PILLARS.map(({ Icon, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 100}>
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/5 text-brand-primary">
                    <Icon size={28} {...ICON} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-brand-ink">{title}</h3>
                  <p className="mt-2 font-light leading-relaxed text-brand-ink">{text}</p>
                </Reveal>
              ))}
            </ul>

            <Reveal className="mt-16">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Come funziona</h3>
              <ol className="mt-6 divide-y divide-brand-primary/10 border-y border-brand-primary/10">
                {STEPS.map((s) => (
                  <li key={s.n} className="grid gap-2 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6">
                    <span className="text-3xl font-light tracking-tight text-brand-primary">{s.n}</span>
                    <div>
                      <p className="text-lg font-semibold text-brand-ink">{s.title}</p>
                      <p className="mt-1 font-light leading-relaxed text-brand-ink">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>

        {/* Fascia dei fatti verificati, su fondo scuro */}
        <Reveal className="mt-24 overflow-hidden rounded-3xl bg-brand-night text-white">
          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-4 lg:gap-8 lg:p-14">
            <Splash className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 text-brand-secondary/10 motion-safe:animate-float" />
            <div className="lg:col-span-1">
              <p className="text-5xl font-semibold tracking-tight lg:text-6xl"><GradientWord>1993</GradientWord></p>
              <p className="mt-2 font-light text-white/85">Licenza di agenzia viaggi n. 24951 del 4 gennaio 1993.</p>
            </div>
            <div className="flex gap-4">
              <BadgeCheck size={28} {...ICON} className="shrink-0 text-brand-accent" aria-hidden="true" />
              <div>
                <p className="font-semibold">Agenzia partner Welcome Travel Group</p>
                <p className="mt-1 text-sm font-light text-white/80">Il network di agenzie di viaggio a cui apparteniamo.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck size={28} {...ICON} className="shrink-0 text-brand-accent" aria-hidden="true" />
              <div>
                <p className="font-semibold">Fondo di garanzia Vacanze Assicurate</p>
                <p className="mt-1 text-sm font-light text-white/80">Garanzia Viaggi S.r.l. e polizza RC UnipolSai, come previsto per legge.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Heart size={28} {...ICON} className="shrink-0 text-brand-accent" aria-hidden="true" />
              <div>
                <p className="font-semibold">Viaggi di nozze e liste</p>
                <p className="mt-1 text-sm font-light text-white/80">
                  Scrivici a <a className="text-brand-accent underline underline-offset-4 hover:text-white" href={`mailto:${CONFIG.emailSposi}`}>{CONFIG.emailSposi}</a> o crea la tua <a className="text-brand-accent underline underline-offset-4 hover:text-white" href="https://listeinviaggio.vacanzewelcometravel.it/?codAgency=WTG6792&network=16" target="_blank" rel="noopener noreferrer">lista eventi</a>.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =============================================================================
   NEWSLETTER
   ============================================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function postJson(url, data) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | mailto | error

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Inserisci un indirizzo email valido, ad esempio nome@email.it.';
    if (!consent) errs.consent = 'Per iscriverti serve il consenso al trattamento dei dati.';
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(errs.email ? 'nl-email' : 'nl-consent')?.focus(); return; }
    setStatus('sending');
    try {
      if (CONFIG.newsletterEndpoint) {
        await postJson(CONFIG.newsletterEndpoint, { email: email.trim(), consent: true, source: 'homepage' });
        setStatus('success');
      } else {
        window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Iscrizione alla newsletter')}&body=${encodeURIComponent(`Vorrei iscrivermi alla newsletter di Felicity Viaggi con questo indirizzo: ${email.trim()}\nHo letto l'informativa privacy e acconsento.`)}`;
        setStatus('mailto');
      }
      track('sign_up', { method: 'newsletter', form_location: 'homepage', lead_method: CONFIG.newsletterEndpoint ? 'endpoint' : 'mailto' });
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'success' || status === 'mailto';
  return (
    <section id="newsletter" className="scroll-mt-24 px-6 py-24 sm:px-10 lg:py-32" aria-labelledby="nl-title">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-night">
        <img src="/assets/hero-deserto-1920.webp" alt="" loading="lazy" decoding="async" className="absolute -inset-[10%] h-[120%] w-[120%] max-w-none object-cover opacity-30 motion-safe:animate-drift" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(6,35,58,.96)_0%,rgba(6,35,58,.88)_45%,rgba(6,35,58,.55)_100%)]" aria-hidden="true" />
        <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
          <div>
            <Eyebrow dark>Newsletter</Eyebrow>
            <h2 id="nl-title" className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl">
              Le offerte migliori, <GradientWord>prima</GradientWord> che finiscano.
            </h2>
            <p className="mt-6 max-w-[34rem] text-lg font-light leading-relaxed text-white/85">
              Iscriviti e ricevi le promozioni scelte dai nostri consulenti, i nuovi cataloghi e le partenze speciali. Ti cancelli quando vuoi, con un clic.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md sm:p-8">
            {done ? (
              <div role="status" className="flex gap-4 text-white">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent"><Check size={28} {...ICON} aria-hidden="true" /></span>
                <div>
                  <p className="text-xl font-semibold">{status === 'success' ? 'Sei dei nostri. Grazie!' : 'Manca un ultimo passo.'}</p>
                  <p className="mt-1 font-light text-white/85">
                    {status === 'success'
                      ? 'La prossima selezione di offerte arriverà nella tua casella.'
                      : `Si è aperta un'email già pronta per ${CONFIG.email}: inviala per completare l'iscrizione.`}
                  </p>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="space-y-5">
                <div>
                  <label htmlFor="nl-email" className="block text-sm font-semibold text-white">La tua email</label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="nl-email" type="email" autoComplete="email" inputMode="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!errors.email} aria-describedby={errors.email ? 'nl-email-err' : undefined}
                      placeholder="nome@email.it"
                      className={`min-h-[48px] w-full rounded-full border bg-white/95 px-5 text-brand-ink placeholder:text-[#6b7280] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${errors.email ? 'border-[#ff8a80]' : 'border-transparent'}`}
                    />
                    <button type="submit" disabled={status === 'sending'} className={`${BTN.primary} shrink-0 disabled:opacity-70`}>
                      {status === 'sending' ? <Loader2 size={20} {...ICON} className="animate-spin" aria-hidden="true" /> : <Send size={20} {...ICON} aria-hidden="true" />}
                      Iscrivimi
                    </button>
                  </div>
                  {errors.email && <p id="nl-email-err" className="mt-2 text-sm text-[#ffb4ab]">{errors.email}</p>}
                </div>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm font-light text-white/85">
                    <input
                      id="nl-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'nl-consent-err' : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/40 accent-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent"
                    />
                    <span>
                      Ho letto l&rsquo;<a href={`${CONFIG.site}/privacy-policy`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-accent underline underline-offset-4 hover:text-white">informativa privacy</a> e acconsento a ricevere la newsletter di Felicity Viaggi.
                    </span>
                  </label>
                  {errors.consent && <p id="nl-consent-err" className="mt-2 text-sm text-[#ffb4ab]">{errors.consent}</p>}
                </div>
                {status === 'error' && (
                  <p role="alert" className="flex items-center gap-2 text-sm text-[#ffb4ab]"><CircleAlert size={20} {...ICON} aria-hidden="true" /> Iscrizione non riuscita. Riprova tra poco o scrivici a {CONFIG.email}.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* =============================================================================
   PREVENTIVO / CONTATTI
   ============================================================================= */
const EMPTY_FORM = { name: '', email: '', phone: '', destination: '', period: '', travelers: '2', message: '', privacy: false };

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Scrivi nome e cognome.';
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Inserisci un indirizzo email valido, ad esempio nome@email.it.';
  if (f.phone.trim() && !/^[+\d][\d\s./-]{5,}$/.test(f.phone.trim())) e.phone = 'Controlla il numero: solo cifre, spazi e il prefisso +.';
  if (!f.destination.trim()) e.destination = 'Indica una destinazione, anche solo un’idea.';
  const n = Number(f.travelers);
  if (!Number.isInteger(n) || n < 1 || n > 60) e.travelers = 'Indica un numero di viaggiatori tra 1 e 60.';
  if (!f.privacy) e.privacy = 'Per inviare la richiesta serve il consenso al trattamento dei dati.';
  return e;
}

function Field({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-ink">
        {label} {required ? <span className="text-brand-primary" aria-hidden="true">*</span> : <span className="font-light">(facoltativo)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs font-light text-brand-ink">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && <p id={`${id}-err`} className="mt-2 flex items-center gap-1.5 text-sm text-[#b42318]"><CircleAlert size={16} {...ICON} aria-hidden="true" />{error}</p>}
    </div>
  );
}

const INPUT = 'min-h-[48px] w-full rounded-2xl border bg-white px-4 py-3 text-brand-ink placeholder:text-[#6b7280] transition-[border-color,box-shadow] duration-300 focus:border-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60';

function QuoteForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | mailto | error
  const [sentName, setSentName] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const aria = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `q-${k}-err` : undefined });
  const border = (k) => (errors[k] ? 'border-[#b42318]' : 'border-brand-primary/20');

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { document.getElementById(`q-${first}`)?.focus(); return; }
    setStatus('sending');
    const payload = {
      nome: form.name.trim(), email: form.email.trim(), telefono: form.phone.trim(), destinazione: form.destination.trim(),
      periodo: form.period.trim(), viaggiatori: Number(form.travelers), messaggio: form.message.trim(), privacy: true, fonte: 'homepage',
    };
    try {
      if (CONFIG.formEndpoint) {
        await postJson(CONFIG.formEndpoint, payload);
        setStatus('success');
      } else {
        const body = `Nome: ${payload.nome}\nEmail: ${payload.email}\nTelefono: ${payload.telefono || '-'}\nDestinazione: ${payload.destinazione}\nPeriodo: ${payload.periodo || '-'}\nViaggiatori: ${payload.viaggiatori}\n\n${payload.messaggio}\n\nHo letto l'informativa privacy e acconsento al trattamento dei dati.`;
        window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Richiesta preventivo: ${payload.destinazione}`)}&body=${encodeURIComponent(body)}`;
        setStatus('mailto');
      }
      setSentName(payload.nome.split(' ')[0]);
      track('generate_lead', { form_name: 'preventivo', destination: payload.destinazione, travelers: payload.viaggiatori, lead_method: CONFIG.formEndpoint ? 'endpoint' : 'mailto' });
      setForm(EMPTY_FORM);
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contatti" className="scroll-mt-24 bg-white px-6 py-24 sm:px-10 lg:py-36" aria-labelledby="preventivo-title">
      <div id="preventivo" className="mx-auto grid max-w-7xl scroll-mt-28 gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Richiedi un preventivo</Eyebrow>
            <h2 id="preventivo-title" className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Raccontaci il tuo prossimo viaggio.
            </h2>
            <p className="mt-6 text-lg font-light leading-relaxed text-brand-ink">
              Bastano pochi dati: un consulente ti ricontatta per costruire insieme la proposta, senza impegno.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-10 rounded-3xl bg-brand-bg p-8 ring-1 ring-brand-primary/5">
            <p className="text-lg font-semibold text-brand-ink">Preferisci parlarne a voce?</p>
            <ul className="mt-6 space-y-5">
              <li>
                <a href={CONFIG.phoneHref} onClick={() => ctaClick('Telefono', 'contatti')} className="group flex items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-primary shadow-soft transition-colors group-hover:bg-brand-primary group-hover:text-white"><Phone size={20} {...ICON} aria-hidden="true" /></span>
                  <span><span className="block text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Telefono</span><span className="text-lg font-semibold text-brand-ink">{CONFIG.phone}</span></span>
                </a>
              </li>
              <li>
                <a href={CONFIG.whatsappHref} target="_blank" rel="noopener noreferrer" onClick={() => ctaClick('WhatsApp', 'contatti')} className="group flex items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-primary shadow-soft transition-colors group-hover:bg-brand-primary group-hover:text-white"><MessageCircle size={20} {...ICON} aria-hidden="true" /></span>
                  <span><span className="block text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">WhatsApp</span><span className="text-lg font-semibold text-brand-ink">{CONFIG.mobile}</span></span>
                </a>
              </li>
              <li>
                <a href={`mailto:${CONFIG.email}`} onClick={() => ctaClick('Email', 'contatti')} className="group flex items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-accent">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-primary shadow-soft transition-colors group-hover:bg-brand-primary group-hover:text-white"><Mail size={20} {...ICON} aria-hidden="true" /></span>
                  <span><span className="block text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Email</span><span className="text-lg font-semibold text-brand-ink">{CONFIG.email}</span></span>
                </a>
              </li>
              <li className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-primary shadow-soft"><MapPin size={20} {...ICON} aria-hidden="true" /></span>
                <span className="font-light leading-relaxed text-brand-ink">
                  <a href={CONFIG.mapsHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4">{CONFIG.address}</a><br />
                  Lun-Ven 9:30-12:30 e 15:30-19:00<br />
                  Sabato mattina 9:30-12:00 solo su appuntamento
                </span>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={80} className="lg:col-span-7">
          <div className="rounded-3xl bg-brand-bg p-6 ring-1 ring-brand-primary/5 sm:p-10">
            {(status === 'success' || status === 'mailto') ? (
              <div role="status" className="py-10 text-center">
                <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-accent/15 text-brand-primary"><Check size={28} {...ICON} aria-hidden="true" /></span>
                <p className="mt-6 text-3xl font-semibold tracking-tight text-brand-ink">{status === 'success' ? `Grazie${sentName ? `, ${sentName}` : ''}! Richiesta inviata.` : 'Manca solo l’invio.'}</p>
                <p className="mx-auto mt-3 max-w-[30rem] font-light leading-relaxed text-brand-ink">
                  {status === 'success'
                    ? 'Un nostro consulente ti ricontatta al più presto per costruire la proposta insieme a te.'
                    : `Abbiamo preparato un'email con i tuoi dati per ${CONFIG.email}: inviala dal tuo programma di posta e ti rispondiamo al più presto.`}
                </p>
                <button type="button" onClick={() => setStatus('idle')} className={`${BTN.ghost} mt-8`}>Invia un&rsquo;altra richiesta</button>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="grid gap-6 sm:grid-cols-2" aria-describedby="q-required-note">
                <p id="q-required-note" className="text-sm font-light text-brand-ink sm:col-span-2">I campi con <span className="text-brand-primary">*</span> sono obbligatori.</p>
                <Field id="q-name" label="Nome e cognome" required error={errors.name}>
                  <input id="q-name" type="text" autoComplete="name" value={form.name} onChange={set('name')} {...aria('name')} className={`${INPUT} ${border('name')}`} />
                </Field>
                <Field id="q-email" label="Email" required error={errors.email}>
                  <input id="q-email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} {...aria('email')} className={`${INPUT} ${border('email')}`} />
                </Field>
                <Field id="q-phone" label="Telefono" error={errors.phone}>
                  <input id="q-phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={set('phone')} {...aria('phone')} className={`${INPUT} ${border('phone')}`} />
                </Field>
                <Field id="q-destination" label="Destinazione d'interesse" required error={errors.destination}>
                  <input id="q-destination" type="text" list="q-dest-list" value={form.destination} onChange={set('destination')} {...aria('destination')} placeholder="Es. Maldive, crociera, ancora da decidere" className={`${INPUT} ${border('destination')}`} />
                  <datalist id="q-dest-list">
                    {[...OFFERS.map((o) => o.place.split(' · ').pop()), ...DESTINATIONS.map((d) => d.name), 'Crociera', 'Viaggio di nozze', 'Viaggio di gruppo', 'Ancora da decidere'].map((d) => <option key={d} value={d} />)}
                  </datalist>
                </Field>
                <Field id="q-period" label="Periodo" error={errors.period}>
                  <input id="q-period" type="text" value={form.period} onChange={set('period')} placeholder="Es. fine novembre, Capodanno, agosto 2027" className={`${INPUT} border-brand-primary/20`} />
                </Field>
                <Field id="q-travelers" label="Numero di viaggiatori" required error={errors.travelers}>
                  <input id="q-travelers" type="number" min="1" max="60" inputMode="numeric" value={form.travelers} onChange={set('travelers')} {...aria('travelers')} className={`${INPUT} ${border('travelers')}`} />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="q-message" label="Messaggio" error={errors.message}>
                    <textarea id="q-message" rows={4} value={form.message} onChange={set('message')} placeholder="Raccontaci cosa sogni: ritmo del viaggio, budget, esigenze particolari." className={`${INPUT} min-h-[128px] resize-y border-brand-primary/20`} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 text-sm font-light text-brand-ink">
                    <input id="q-privacy" type="checkbox" checked={form.privacy} onChange={set('privacy')} {...aria('privacy')} className="mt-0.5 h-5 w-5 shrink-0 rounded accent-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent" />
                    <span>Ho letto l&rsquo;<a href={`${CONFIG.site}/privacy-policy`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4">informativa privacy</a> e acconsento al trattamento dei miei dati per ricevere il preventivo. <span className="text-brand-primary" aria-hidden="true">*</span></span>
                  </label>
                  {errors.privacy && <p id="q-privacy-err" className="mt-2 flex items-center gap-1.5 text-sm text-[#b42318]"><CircleAlert size={16} {...ICON} aria-hidden="true" />{errors.privacy}</p>}
                </div>
                {status === 'error' && (
                  <p role="alert" className="flex items-center gap-2 rounded-2xl bg-[#fef3f2] p-4 text-sm text-[#b42318] sm:col-span-2">
                    <CircleAlert size={20} {...ICON} aria-hidden="true" /> Qualcosa non ha funzionato. Riprova, oppure chiamaci allo {CONFIG.phone}.
                  </p>
                )}
                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <button type="submit" disabled={status === 'sending'} className={`${BTN.primary} w-full sm:w-auto disabled:opacity-70`}>
                    {status === 'sending' ? <Loader2 size={20} {...ICON} className="animate-spin" aria-hidden="true" /> : <Send size={20} {...ICON} aria-hidden="true" />}
                    {status === 'sending' ? 'Invio in corso' : 'Invia la richiesta'}
                  </button>
                  <p className="flex items-center gap-2 text-sm font-light text-brand-ink"><Briefcase size={20} {...ICON} className="text-brand-primary" aria-hidden="true" /> Anche per viaggi d&rsquo;affari e incentive.</p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =============================================================================
   FOOTER
   ============================================================================= */
function Footer() {
  return (
    <footer className="bg-brand-night px-6 pb-10 pt-20 text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <img src="/assets/logo-felicityviaggi-white.png" alt="Felicity Viaggi" width="498" height="232" loading="lazy" className="h-14 w-auto" />
            <p className="mt-6 max-w-[22rem] font-light leading-relaxed text-white/80">Agenzia di viaggi a Mestre dal 1993. Vacanze, crociere, tour e viaggi di gruppo con un consulente al tuo fianco.</p>
            <div className="mt-6 flex gap-3">
              <a href={CONFIG.facebook} target="_blank" rel="noopener noreferrer" aria-label="Felicity Viaggi su Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-brand-accent hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent"><Facebook size={20} {...ICON} /></a>
              <a href={CONFIG.instagram} target="_blank" rel="noopener noreferrer" aria-label="Felicity Viaggi su Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-brand-accent hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent"><Instagram size={20} {...ICON} /></a>
              <a href={CONFIG.whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Scrivici su WhatsApp" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-brand-accent hover:text-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent"><MessageCircle size={20} {...ICON} /></a>
            </div>
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Contatti</p>
            <ul className="mt-5 space-y-3 font-light text-white/85">
              <li><a className="hover:text-brand-accent" href={CONFIG.phoneHref}>Tel. {CONFIG.phone}</a></li>
              <li><a className="hover:text-brand-accent" href={`tel:+39${CONFIG.mobile.replace(/\s/g, '')}`}>Cell. {CONFIG.mobile}</a></li>
              <li><a className="hover:text-brand-accent" href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a></li>
              <li><a className="hover:text-brand-accent" href={`mailto:${CONFIG.emailSposi}`}>{CONFIG.emailSposi}</a></li>
              <li>{CONFIG.address}</li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Link utili</p>
            <ul className="mt-5 space-y-3 font-light text-white/85">
              <li><a className="hover:text-brand-accent" href={`${CONFIG.site}/chi-siamo`}>Chi siamo</a></li>
              <li><a className="hover:text-brand-accent" href={`${CONFIG.site}/news`}>News e promozioni</a></li>
              <li><a className="hover:text-brand-accent" href="https://listeinviaggio.vacanzewelcometravel.it/?codAgency=WTG6792&network=16" target="_blank" rel="noopener noreferrer">Liste eventi</a></li>
              <li><a className="hover:text-brand-accent" href={`${CONFIG.site}/privacy-policy`}>Privacy policy</a></li>
              <li><a className="hover:text-brand-accent" href={`${CONFIG.site}/cookie-policy`}>Cookie policy</a></li>
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Orari</p>
            <ul className="mt-5 space-y-3 font-light text-white/85">
              <li>Lun-Ven: 9:30-12:30 e 15:30-19:00</li>
              <li>Sabato: 9:30-12:00 solo su appuntamento</li>
              <li>Domenica: chiuso</li>
            </ul>
          </div>
        </div>
        <div className="grid gap-6 pt-10 text-xs font-light leading-relaxed text-white/70 lg:grid-cols-2">
          <p>
            Felicity Viaggi e Vacanze · TIZETATRE S.A.S. di Zamprogna Silvia &amp; C. · Sede legale Via Riviera Magellano 4, Mestre (VE) · P.IVA 02610000271 · REA VE 226844 · PEC tizetatresas@legalmail.it · Licenza n. 24951 del 04/01/1993
          </p>
          <p>
            Polizza RC: UnipolSai S.p.A. n. 1/47492/319/157052775 · Fondo di garanzia: Garanzia Viaggi S.r.l., Vacanze Assicurate, certificato n. A/224.4801/14/2021/R ·{' '}
            <a className="underline underline-offset-2 hover:text-brand-accent" href="https://www.offertetouroperator.com/oto3/resources/uploadedPdf/16979/1639585762_Felicityviaggi_modulo_aiuti_stato.pdf%20(1).pdf" target="_blank" rel="noopener noreferrer">Informazioni ex art. 1, comma 125-bis, L. 124/2017</a>
          </p>
        </div>
        <p className="mt-8 text-xs font-light text-white/70">© {new Date().getFullYear()} Felicity Viaggi e Vacanze. Immagini evocative delle destinazioni realizzate con intelligenza artificiale.</p>
      </div>
    </footer>
  );
}

/* =============================================================================
   PAGINA
   ============================================================================= */
function AmbientLayer() {
  // Un solo strato fisso dietro tutta la pagina: luce morbida nei colori del brand, deriva lentissima.
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-1/4 top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-brand-accent/[0.06] blur-3xl motion-safe:animate-drift" />
      <div className="absolute -right-1/4 bottom-0 h-[50vmax] w-[50vmax] rounded-full bg-brand-secondary/[0.06] blur-3xl motion-safe:animate-drift [animation-direction:alternate-reverse]" />
    </div>
  );
}

export default function Homepage() {
  useTrackingScripts();

  useEffect(() => {
    const onVis = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const onSkip = useCallback((e) => { e.preventDefault(); document.getElementById('main')?.focus(); document.getElementById('viaggi')?.scrollIntoView(); }, []);

  return (
    <div id="top" className="relative min-h-screen font-sans text-brand-ink">
      <a href="#main" onClick={onSkip} className="sr-only z-[70] rounded-full bg-brand-secondary px-5 py-3 font-semibold text-brand-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Vai al contenuto principale
      </a>
      <AmbientLayer />
      <Header />
      <Hero />
      <main id="main" tabIndex={-1} className="relative focus:outline-none">
        <Showcase />
        <Why />
        <Newsletter />
        <QuoteForm />
      </main>
      <Footer />
    </div>
  );
}
