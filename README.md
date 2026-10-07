# Felicity Viaggi · Nuova homepage

Homepage premium per **Felicity Viaggi e Vacanze** (Mestre), pensata per la vendita B2C, come landing per le campagne Meta e Google e per la raccolta di iscritti alla newsletter.

- **Stack:** React 18 + Tailwind CSS 3 + Vite 5, icone `lucide-react` (sempre `strokeWidth={1.5}`).
- **Un solo componente:** tutta la pagina vive in [`src/Homepage.jsx`](src/Homepage.jsx), con i sottocomponenti definiti nello stesso file.
- **Token di brand:** in [`tailwind.config.js`](tailwind.config.js) (`brand-primary`, `brand-secondary`, `brand-accent`, `brand-ink`, `brand-bg`, più due derivati scuri: `brand-night` e `brand-deep`).
- **CSS esterno:** solo [`src/index.css`](src/index.css) (direttive Tailwind, overflow, reduced motion e pausa delle animazioni a scheda nascosta).

## Avvio

```bash
npm install
```

```bash
npm run dev
```

Il server di sviluppo gira su http://localhost:5198. Per la build di produzione:

```bash
npm run build
```

```bash
npm run preview
```

L'anteprima della build gira su http://localhost:5199. La cartella `dist/` è statica: si pubblica su qualsiasi hosting (Vercel, Netlify, Hostinger, server Apache/Nginx).

## Variabili d'ambiente

Copia [`.env.example`](.env.example) in `.env.local` (sviluppo) oppure imposta le variabili sull'hosting. Nessun ID è inserito nel codice.

| Variabile | A cosa serve | Se vuota |
|---|---|---|
| `VITE_GTM_ID` | Carica Google Tag Manager (`GTM-XXXXXXX`) | GTM non viene caricato; il `dataLayer` si popola comunque |
| `VITE_META_PIXEL_ID` | Carica il Meta Pixel e invia `PageView` | Pixel non caricato |
| `VITE_FORM_ENDPOINT` | Endpoint POST JSON del modulo preventivo | Si apre un'email precompilata verso info@felicityviaggi.it (mailto) |
| `VITE_NEWSLETTER_ENDPOINT` | Endpoint POST JSON per l'iscrizione alla newsletter | Si apre un'email precompilata (mailto) |

> **Prima di attivare GTM o Pixel in produzione** serve un banner cookie (CMP) con consenso preventivo, collegato al Consent Mode di Google e al consenso del Pixel. Oggi la pagina carica gli script appena l'ID è presente: va agganciata alla CMP scelta dal cliente (vedi DA-CONFERMARE.md).

## Tracciamento (dataLayer)

Ogni evento è un `window.dataLayer.push({ event, ...parametri })`. Se il Meta Pixel è attivo, `generate_lead` invia anche `Lead` e `sign_up` invia `CompleteRegistration`.

| Evento | Quando | Parametri principali |
|---|---|---|
| `cta_click` | Click su CTA (hero, header, menu mobile, contatti, telefono, WhatsApp) | `cta_label`, `cta_location` |
| `select_item` | Click su una card viaggio o su una meta ispirazione | `item_list_id`, `item_list_name`, `items[]` (`item_id`, `item_name`, `item_category`, `price`, `currency`, `index`) |
| `filter_select` | Click su un filtro della vetrina | `filter_type` |
| `generate_lead` | Invio valido del modulo preventivo | `form_name`, `destination`, `travelers`, `lead_method` (`endpoint` o `mailto`) |
| `sign_up` | Iscrizione valida alla newsletter | `method: newsletter`, `form_location`, `lead_method` |

Con `lead_method: mailto` l'utente ha solo aperto l'email precompilata, non l'ha ancora inviata: in GTM conviene usare come conversione solo `lead_method = endpoint`, una volta configurato l'endpoint.

## SEO

In [`index.html`](index.html): title, meta description, canonical, Open Graph e Twitter card, dati strutturati `TravelAgency` (ragione sociale, P.IVA, indirizzo, telefono, email, orari, social) con i dati reali del sito attuale. `og:url`, `og:image` e `canonical` puntano a `https://www.felicityviaggi.eu/`: se il dominio di pubblicazione cambia, vanno aggiornati. In `public/robots.txt` è indicata una `sitemap.xml` da generare sul sito finale.

## La hero: tre scene guidate dallo scroll

Sezione sticky di 500vh (circa 400vh di scroll utile) che attraversa **Caraibi → Patagonia con aurora → deserto al tramonto**.

- **Asset:** tre still fotorealistici (Seedream 5 Pro, 2560×1440) e due video di transizione da 10 s (Kling 2.5, 1080p) con fotogramma iniziale e finale bloccati sulle still. I due segmenti sono uniti con un crossfade di 0,25 s e codificati una sola volta: `hero-scrub.mp4`, 20 s, 1600 px, keyframe ogni 8 fotogrammi, 7 MB. Generati con Magnific.
- **Motore:** il video è scaricato come Blob in streaming con anello di avanzamento e watchdog (funziona anche su hosting senza HTTP Range). Il tempo mostrato insegue lo scroll con un lerp indipendente dal refresh rate; i seek sono serializzati (mai due in volo) e il DOM si aggiorna solo quando un valore cambia. Una mappa progresso→tempo rallenta il video sulle tre scene, dove si legge, e lo accelera nelle transizioni.
- **Testi:** ogni scena ha eyebrow, titolo e microcopy con un ingresso proprio, in eco con il girato (salita sulla laguna, avvicinamento sull'aurora, vento sul deserto). Le CTA «Scopri i viaggi» e «Parla con un consulente» restano sempre visibili; tre tacche indicano la scena e un hint invita a scorrere.
- **Leggibilità:** scrim globale più uno scrim radiale per scena che si accende solo con la sua scena. Audit sul fotogramma peggiore (testo nascosto, pixel più chiaro sotto le parole): titoli ≥ 4,0:1, paragrafi ≥ 11:1.
- **Mobile e tablet in verticale** (le cinque condizioni della skill, valutate dal vivo anche su rotazione): tre immagini 9:16 in crossfade con zoom leggero, nessun video scaricato.
- **`prefers-reduced-motion`:** tre immagini statiche in sequenza, a tutta altezza, nessuno scrub e nessun video.
- **Se il video non arriva** (rete, blocco, errore): la hero ripiega in automatico sulle tre immagini in crossfade.
- **Primo paint:** `index.html` contiene un guscio statico con il poster della scena 1 e il titolo, visibile prima del JavaScript; React lo sostituisce al montaggio nella stessa posizione.

## Asset ottimizzati (`public/assets`)

| File | Uso |
|---|---|
| `hero-scrub.mp4` | Video della hero desktop (7 MB) |
| `hero-{caraibi,patagonia,deserto}-1920.webp` | Poster desktop e ripieghi |
| `hero-*-mobile.webp`, `hero-*-mobile-600.webp` | Versione mobile 9:16 (900 e 600 px) |
| `offer-*.webp`, `offer-*-480.webp` | Immagini delle card viaggio (960 e 480 px) |
| `dest-*.webp`, `dest-*-360.webp` | Mete ispirazione (720 e 360 px) |
| `why-atelier.webp` | Sezione «Perché Felicity Viaggi» |
| `logo-felicityviaggi.png`, `logo-felicityviaggi-white.png` | Logo scontornato e variante bianca per i fondi scuri |
| `og-image.jpg`, `favicon.png` | Condivisione social e favicon |

Gli originali generati e i video grezzi sono in `../review/` (fuori dalla cartella di deploy).

## Verifiche eseguite

- Console senza errori a 375, 768, 1280 e 1920 px (Chrome headless). Screenshot in `../review/shots/`.
- Flick test della hero con eventi rotella reali: ogni scena resta leggibile per 5-7 scatti da 120 px e nessuna si salta a scatti da 360 px.
- Modulo preventivo e newsletter: validazione, focus sul primo errore, stati di invio, successo ed errore; eventi `dataLayer` verificati.
- Navigazione da tastiera: skip link, focus visibile, menu mobile con focus trap e chiusura con Esc.
- Reduced motion e video bloccato: pagina completa, nessuna richiesta del video in reduced motion.

### Lighthouse mobile (build di produzione, 7 ottobre 2026)

| Modalità | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Throttling reale (`devtools`, 4G lento + CPU 4x) | 88 | 100 | 100 | 100 | 1,6 s | 1,6 s | 410 ms | 0,005 |
| Simulato (`simulate`, default) | 92 | 100 | 100 | 100 | 1,3 s | 3,0 s* | 190 ms | 0,005 |

\* In modalità simulata Lighthouse registra il caricamento senza rallentamenti: in locale React sostituisce il guscio statico prima del primo paint, quindi l'LCP viene stimato sul paragrafo React, che dipende dal JavaScript. Con il throttling reale il guscio statico viene dipinto per primo e l'LCP misurato è 1,6 s. I report completi sono in `../review/lighthouse-mobile-*.report.html`. Il margine residuo è il tempo di esecuzione del JavaScript (TBT): se servisse, il passo successivo è sostituire React con Preact tramite alias, senza toccare il componente.

## Scelte che deviano dalle skill

- **React + Tailwind in un solo file** invece dell'HTML vanilla previsto da `/10k-websites`: lo chiede il brief, e il brief prevale.
- **Inter come font dei titoli:** la skill sconsiglia Inter per i display, ma è il font di brand indicato nella Brand Identity.
- **Hero di 500vh** invece di circa 400vh: le tre scene restano leggibili per almeno 5 scatti di rotella (flick test). Lo scroll utile è comunque 400vh.
- **Magnific** al posto di Higgsfield per immagini e video, come da preferenza dello studio.
- Il turchese `#03B5AA` su fondo chiaro arriva solo a 2,4:1, quindi lo uso per icone, bordi, focus e testo su fondo scuro, mai per testo su chiaro. Il gradiente turchese→giallo compare su una sola parola per sezione e solo su fondi scuri (hero, «1993», newsletter).
