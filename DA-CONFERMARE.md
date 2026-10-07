# Da confermare con Felicity Viaggi

Tutti i contenuti della homepage vengono da www.felicityviaggi.eu (letto il 7 ottobre 2026). Qui sotto: ciò che non ho trovato, ciò che sul sito risulta scaduto o incoerente e le scelte da validare. In ordine di priorità.

## 1. Bloccanti prima della pubblicazione

- [ ] **Polizza RC e fondo di garanzia scaduti.** Il sito attuale riporta la polizza UnipolSai n. 1/47492/319/157052775 «scad. 01/01/2026» e il certificato Vacanze Assicurate n. A/224.4801/14/2021/R «scad. 31/12/2025». Oggi sono entrambe date passate. Servono i numeri e le scadenze rinnovati: compaiono nel footer e nella fascia «Fondo di garanzia Vacanze Assicurate».
- [ ] **Dove arrivano le richieste di preventivo.** Non esiste un endpoint: oggi il modulo apre un'email precompilata verso info@felicityviaggi.it. Per le campagne serve un endpoint vero (Formspree, CRM, webhook o il gestionale OTO), da impostare in `VITE_FORM_ENDPOINT`.
- [ ] **Servizio newsletter.** Sul sito c'è un modulo «Iscriviti alla newsletter» ma non ho trovato il fornitore (Brevo, Mailchimp, OTO...). Serve l'endpoint (`VITE_NEWSLETTER_ENDPOINT`), il doppio opt-in e la conferma che la disiscrizione sia «con un clic», come promette il testo.
- [ ] **Banner cookie (CMP) e informative.** Prima di attivare GTM e Meta Pixel serve un banner con consenso preventivo collegato al Consent Mode. Privacy e cookie policy (oggi linkate alle pagine del sito attuale) vanno aggiornate con newsletter, modulo preventivo, Meta Pixel e Google.
- [ ] **ID di tracciamento:** ID del container GTM e del Meta Pixel.

## 2. Offerte in vetrina

- [ ] **Prezzi e date sono una fotografia al 7 ottobre 2026.** Le sei card riportano le offerte pubblicate in homepage quel giorno («da» a persona, partenza, durata, trattamento) e linkano alle rispettive schede del motore OTO. Vanno aggiornate a mano oppure collegate a un feed: come preferite gestirle?
- [ ] **Booking engine:** cerca solo tra le partenze in vetrina e, per la disponibilità reale, rimanda alle schede OTO con le età dei viaggiatori. Per cercare in tutto il catalogo dei tour operator serve un accesso alle API o a un URL di ricerca del motore OTO: chiedete a OTO S.r.l. se è disponibile. Il widget di ricerca del sito attuale non espone parametri nell'URL.
- [ ] **Stelle delle strutture:** dalla ricerca sul sito i numeri «5» e «4» risultano stelle. Volete mostrarle nelle card?
- [ ] **Costa Smeralda (Canarie, Spagna, Madera):** la card del sito dice «8 giorni», ma il link della scheda indica 13/12/2026-27/12/2026 (14 giorni). Quale dato è corretto?
- [ ] **Costa Deliziosa (Mediterraneo, da 245 €)** è esclusa: il link sul sito punta a date del 2022, probabilmente un'offerta scaduta rimasta nello slider.
- [ ] **«Cerca tra tutte le offerte»** porta alla homepage del sito attuale, dove c'è il motore di ricerca. Se nascerà una pagina «tutte le offerte» o «catalogo», va sostituito il link.
- [ ] **Mete ispirazione** (Tenerife, Maldive, Capo Verde, Zanzibar): sono le quattro destinazioni promosse oggi in homepage e linkano a `/offerte/<meta>`. Confermate che restino queste?

## 3. Immagini

- [ ] **Tutte le immagini sono generate con l'intelligenza artificiale** e il footer lo dichiara. Sono evocative della destinazione, non mostrano le strutture vendute: per hotel e navi conviene usare, dove possibile, le foto ufficiali dei tour operator (con licenza).
- [ ] **Cervinia:** l'immagine mostra il profilo classico del Cervino, quello visto dal versante svizzero. Chi conosce Breuil-Cervinia può notarlo: valutare una foto reale dal versante italiano.
- [ ] **Logo:** l'unico file disponibile è un PNG 555×269 su sfondo bianco. L'ho scontornato e ne ho ricavato una versione bianca per i fondi scuri, ma per una resa nitida su schermi retina serve il vettoriale (SVG, AI o PDF).

## 4. Testi e affermazioni

- [ ] **«Dal 1993»:** ricavato dalla licenza n. 24951 del 04/01/1993. Confermate che si possa dire «organizziamo viaggi da Mestre dal 1993»?
- [ ] **«Agenzia partner Welcome Travel Group»:** dal banner «Agenzia partner di» con il logo Welcome Travel Group. Confermate la dicitura. Il logo del network non è usato: serve un'autorizzazione.
- [ ] **«Preventivo senza impegno»:** confermate che la consulenza e il preventivo siano gratuiti e senza impegno.
- [ ] **Tempi di risposta:** non ho promesso tempi («ti ricontattiamo al più presto»). Se avete uno standard (es. entro 24 ore lavorative), aumenta la conversione dalle campagne.
- [ ] **Assistenza durante il viaggio:** il testo dice che il consulente «resta raggiungibile» anche mentre siete via. Confermate canali e orari (es. WhatsApp 331 323 2477 anche fuori orario?).
- [ ] **Offerta di servizi:** dal «Chi siamo» risultano viaggi individuali, gruppi in pullman e in aereo, crociere, viaggi d'affari, meeting e incentive. Viaggi di nozze e liste: dedotti da sposi@felicityviaggi.it e dal link «Liste eventi». Confermate.
- [ ] **Recensioni, numeri, premi:** sul sito non ne ho trovati, quindi la pagina non ne mostra. Se avete recensioni Google verificabili, clienti serviti o anni di viaggi di gruppo, si può aggiungere una fascia di riprova sociale.
- [ ] **Nomi e volti del team:** non presenti sul sito. Una sezione «I nostri consulenti» con foto reali (con consenso) rafforzerebbe il messaggio «una persona vera».

## 5. Dati di contatto e legali

- [ ] **CAP** di Via Riviera Magellano 4, Mestre: non indicato sul sito, quindi omesso (anche nei dati strutturati).
- [ ] **WhatsApp:** usato il 331 323 2477 (link wa.me presente sul sito). Confermate che sia il numero WhatsApp ufficiale.
- [ ] **Orari:** Lun-Ven 9:30-12:30 e 15:30-19:00; sabato 9:30-12:00 solo su appuntamento; domenica chiuso. Confermate (anche eventuali chiusure estive o festive).
- [ ] **Social:** trovati solo Facebook e Instagram. Ci sono altri canali (YouTube, TikTok, LinkedIn)?
- [ ] **Dominio e canonical:** SEO e Open Graph puntano a https://www.felicityviaggi.eu/. Le email usano invece il dominio .it (info@felicityviaggi.it). Confermate il dominio su cui andrà la nuova homepage.
- [ ] **Sitemap:** `robots.txt` dichiara `https://www.felicityviaggi.eu/sitemap.xml`, da generare sul sito finale.

## 6. Scelte di progetto da validare

- [ ] **Hero su mobile:** nessun video (risparmio di dati e batteria), ma tre immagini in crossfade con lo scroll. Su desktop il video da 7 MB si carica dopo il poster.
- [ ] **Font Inter anche per i titoli**, come da Brand Identity.
- [ ] **Turchese solo come accento su fondo chiaro:** come testo su sfondo chiaro non raggiunge il contrasto AA (2,4:1). Per link e titoli su chiaro uso il blu #005B96 (6,8:1).
