# Fast Food LAN — spletna stran

Enostavna statična stran brez baze podatkov. Novice se urejajo v brskalniku na
`/admin` (Decap CMS), vse ostalo neposredno v `index.html`.

```
index.html                celotna stran (besedila, cenik, lokacije)
css/style.css             oblika in barve
js/main.js                trak, animacije, oznaka Odprto/Zaprto, novice
assets/                   logotip in slika cenika
assets/novice/            slike in videi iz objav (nalaga jih /admin)
admin/                    urejevalnik objav (Decap CMS)
content/novice/           ena datoteka .json = ena objava (piše jih /admin)
scripts/build-novice.js   zbere objave v content/novice.json (poganja Vercel)
vercel.json               pove Vercelu, naj ob objavi pozene zgornjo skripto
```

Izvirni datoteki `logo.png`, `logo.jpg` in `cenik.jpg` v glavni mapi ostanejo
nespremenjene — stran uporablja kopiji v mapi `assets/`.

---

## 1. Novice (objave)

Objave se urejajo na **<https://fast-food-lan.vercel.app/admin/>** — prijava
z e-pošto in geslom, brez programiranja.

**Nova objava:** Objave → *Nova Objava* → izpolni polja → **Objavi**. Po
približno pol minute do minute je objava na strani.

| Polje | Pomen |
|---|---|
| Naslov | velik naslov kartice |
| Datum objave | datum in ura (samodejno zdaj); najnovejša objava je velika kartica |
| Rumena nalepka | beseda na nalepki v kotu (Novo, Akcija …); prazno = brez nalepke |
| Slika | JPG/PNG/WEBP do 10 MB; vedno se pokaže cela, nič se ne obreže |
| Opis slike | ena poved, kaj je na sliki (za slabovidne in iskalnike) |
| Video | MP4 ali GIF do 25 MB (≈ 30 s); s sliko vred se pokažeta drug ob drugem |
| Besedilo | 2–3 kratki odstavki; krepko, ležeče, povezava, seznam |
| Podpis | vrstica na dnu (privzeto »ekipa Fast Food LAN«) |
| Prikaži na strani | izklopi, da objavo skriješ, ne da bi jo izbrisal |

Na strani se najnovejša objava prikaže kot velika kartica. Vse starejše
ostanejo shranjene in so dostopne pod gumbom **Starejše objave (N)**, kjer se
vsaka razpre s klikom. Vsaka objava ima svojo povezavo, npr.
`https://fast-food-lan.vercel.app/#objava-2026-10-28-nov-kebab-xxl`, ki odpre
točno to objavo (tudi če je v arhivu).

Video naj bo kratek in stisnjen — telefonski posnetek 30 s v 1080p je običajno
okoli 20 MB. Daljše videe je bolje objaviti na Facebooku in v objavo dati
povezavo.

### Prijava v /admin — enkratna nastavitev (DecapBridge)

Urejevalnik shranjuje objave neposredno v GitHub repozitorij. Da se lastnik
lahko prijavi z e-pošto in geslom (brez GitHub računa), skrbi brezplačna
storitev [DecapBridge](https://decapbridge.com):

1. Registriraj se na <https://decapbridge.com/auth/signup>.
2. *Add site* → ponudnik **GitHub**, repozitorij `markoAdza/FastFoodLan`.
3. Na GitHubu ustvari *fine-grained* žeton (Settings → Developer settings →
   Personal access tokens → Fine-grained), omejen samo na repozitorij
   `FastFoodLan`, z dovoljenjem **Contents: Read and write**. Prilepi ga v
   DecapBridge.
4. Login URL: `https://fast-food-lan.vercel.app/admin/index.html`,
   način prijave **Classic** (e-pošta + geslo).
5. Klikni *Create site*. DecapBridge pokaže izsek `backend: …` — z njim
   zamenjaj blok `backend:` na vrhu `admin/config.yml`, commit in push.
   (Že narejeno — stran je povezana z DecapBridge.)
6. *Manage collaborators* → vpiši e-pošto lastnika → povabilo. Lastnik po
   e-pošti nastavi geslo in se lahko prijavi na `/admin`.

Vse spremembe v gitu bodo podpisane z imenom lastnika žetona.

### Preizkus na lastnem računalniku

```bash
npx decap-server                 # v enem terminalu (lokalni "backend")
npx serve .                      # v drugem terminalu
```

Odpri `http://localhost:3000/admin/` → *Prijava* (brez gesla). Objave se
shranjujejo neposredno v mapo `content/novice/`. Nato
`node scripts/build-novice.js` in osveži `http://localhost:3000`.
(Če `index.html` odpreš z dvoklikom, novic ne vidiš — brskalnik datoteke
`content/novice.json` z diska ne prebere; vse ostalo deluje.)

---

## 2. Cene in jedi

Ves cenik je v `index.html` v razdelku `CENIK`. Ena vrstica = ena jed:

```html
<li class="row" data-pick data-tag="Kebab">
  <span class="row__n">Kebab<em>Piščančji, goveji, mešani</em></span>
  <span class="row__d"></span>
  <span class="row__p">5,00&nbsp;€</span>
</li>
```

| Del | Pomen |
|---|---|
| `row__n` | ime jedi |
| `<em> … </em>` | manjše rumeno pojasnilo pod imenom (neobvezno) |
| `row__d` | pikčasta črta — pusti prazno |
| `row__p` | cena; `&nbsp;` je presledek, ki se ne prelomi |
| `data-pick` | jed se pokaže tudi na premikajočem se traku |
| `data-tag="…"` | oznaka na kartici traku (Kebab, Burger, Pizza …) |

Cena je zapisana **samo na enem mestu**. Trak si imena in cene vzame iz cenika,
zato se številki nikoli ne moreta razlikovati. Če dodaš ali odvzameš `data-pick`,
se trak sam prilagodi — tudi hitrost premikanja se preračuna samodejno.

Novo jed dodaš tako, da skopiraš celo vrstico `<li class="row"> … </li>` in
spremeniš ime ter ceno.

**Opomba o ceniku:** na tiskanem ceniku je `PIZZA KOS` napisan dvakrat — pri
2,50 € in pri 8,00 €. Na strani je prepisano natančno tako, kot je na tiskanem
ceniku. Drugi vnos je najbrž mišljen kot cela pizza; če je tako, popravi ime v
`index.html`.

---

## 3. Delovni čas in telefon

Delovni čas je zapisan na štirih mestih. Če se spremeni, popravi vsa štiri:

1. `index.html` — vrstica pod gumbi v uvodu (`Pon–pet 9.00–22.00 …`)
2. `index.html` — razdelek `LOKACIJE`, tabela `<dl class="hrs">`
3. `index.html` — noga, stolpec `Odprto`
4. `js/main.js` — na koncu datoteke:

```js
var OPEN_WEEKDAY = 9;    // od kdaj od ponedeljka do petka
var OPEN_WEEKEND = 12;   // od kdaj v soboto in nedeljo
var CLOSE        = 22;   // do kdaj vsak dan
```

Te tri številke krmilijo rumeno oznako **Odprto / Zaprto** v uvodu, ki se
izračuna iz ure na obiskovalčevi napravi.

Telefonska številka je zapisana kot `tel:+38682055080` (klikljiva povezava) in
kot vidno besedilo `0820 55080`. Če se spremeni, popravi oboje — v `index.html`
je na petih mestih (glava, uvod, novice, lokacija, noga).

---

## 4. Objava na splet (Vercel)

Stran gostuje na Vercelu in je povezana z GitHub repozitorijem
<https://github.com/markoAdza/FastFoodLan>. Ker gre za navadne datoteke, se nič
ne prevaja — Vercel le pozene `scripts/build-novice.js` (nastavljeno v
`vercel.json`), ki zbere novice, in datoteke postreže.

Objava v `/admin` je prav tako commit na `main`, zato se stran posodobi enako
kot pri ročnem pushu.

**Vsaka sprememba pride na splet takole:**

```bash
git add -A
git commit -m "Objava za oktober"
git push
```

Vercel sam zazna novo objavo na veji `main` in v pol minute posodobi stran.
Nobenega ročnega nalaganja ni.

Če stran postavljaš na Vercel na novo (Add New → Project → uvozi
`markoAdza/FastFoodLan`), so pravilne nastavitve:

| Nastavitev | Vrednost |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `./` (privzeto) |
| Build Command | **pusti prazno** (vzame se iz `vercel.json`) |
| Output Directory | **pusti prazno** (vzame se iz `vercel.json`) |
| Install Command | **pusti prazno** |

Pomembno: to ni Next.js projekt kot Ahil Fitnes, zato preset **ne sme** biti
Next.js — sicer bo Vercel iskal `package.json` in objava se bo ustavila.

Na drugem gostovanju (Netlify, GitHub Pages …) pred objavo poženi
`node scripts/build-novice.js`, sicer razdelek Novice ostane prazen.

### Pisave

Stran uporablja pisavi **Anton** in **Barlow Condensed** z Google Fonts. Če
interneta ni ali je Google Fonts blokiran, se samodejno uporabijo podobne
sistemske pisave — stran ostane povsem berljiva, le videz je nekoliko drugačen.

---

## 5. Kaj je še vgrajeno

- **Deluje brez JavaScripta.** Cenik, lokacije in kontakt so navaden HTML.
  Brez JavaScripta manjkajo premikajoči se trak, animacije in novice.
- **Manj gibanja.** Če ima obiskovalec v napravi vklopljeno nastavitev
  »zmanjšaj gibanje«, se trak ustavi in se ga da povleči s prstom, animacije pa
  se izklopijo.
- **Telefon in tablica.** Postavitev se prilagodi širini zaslona; v ožjih
  zaslonih se meni skrije pod gumb s tremi črtami.
- **Tipkovnica.** Po strani se da premikati s tabulatorjem, izbrani element ima
  rumen obroč.
