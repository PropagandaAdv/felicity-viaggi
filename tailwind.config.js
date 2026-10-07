/** Design token Felicity Viaggi: unica fonte di verità per colori, font, curve e motion. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#005B96',   // blu profondo: titoli, link, superfici istituzionali
          secondary: '#FFC300', // giallo sole: SOLO CTA principali (sempre con testo brand-ink)
          accent: '#03B5AA',    // turchese: dettagli, hover, focus, link su fondo scuro
          ink: '#333333',       // testo
          bg: '#F8F9FA',        // sfondo pagina
          night: '#06233A',     // derivato dal primario: hero, newsletter, footer (fondi scuri)
          deep: '#004A7A',      // derivato dal primario: hover dei pulsanti blu
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
      boxShadow: {
        soft: '0 30px 80px -30px rgba(6,35,58,0.18)',
        lift: '0 40px 100px -30px rgba(6,35,58,0.28)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        soft: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate3d(-4%, -3%, 0) scale(1)' },
          '100%': { transform: 'translate3d(4%, 3%, 0) scale(1.08)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0, -14px, 0) rotate(8deg)' },
        },
        hint: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.55' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
        },
      },
      animation: {
        drift: 'drift 70s ease-in-out -12s infinite alternate',
        float: 'floaty 11s ease-in-out -3s infinite',
        hint: 'hint 2.6s ease-in-out -0.8s infinite',
      },
    },
  },
  plugins: [],
};
