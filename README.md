# Fast Food LAN — spletna stran

Enostavna statična stran. Ni potrebna nobena namestitev, ni baze podatkov, ni
prijave. Stran odpreš tako, da dvakrat klikneš na `index.html`.

```
index.html      celotna stran (besedila, cenik, objava meseca, lokacije)
css/style.css   oblika in barve
js/main.js      premikajoči se trak, animacije, oznaka Odprto/Zaprto
assets/         logotip in slika cenika
```

Izvirni datoteki `logo.png`, `logo.jpg` in `cenik.jpg` v glavni mapi ostanejo
nespremenjene — stran uporablja kopiji v mapi `assets/`.

---

## 1. Objava meseca (novica)

V `index.html` poišči veliki komentar `OBJAVA MESECA` (približno na sredini
datoteke). Zamenjaj samo te tri stvari:

```html
<p class="post__date">Avgust 2025</p>              <!-- 1. datum -->
<h3 class="post__h">Sem napiši naslov objave</h3>  <!-- 2. naslov -->
<div class="post__body">
  <p>Prvi odstavek …</p>                            <!-- 3. besedilo -->
  <p>Drugi odstavek …</p>
</div>
```

Nasveti:

- Odstavkov je lahko en, dva ali tri. Vsak odstavek naj bo v svojem `<p> … </p>`.
- Rumeno nalepko `Novo` lahko zamenjaš z drugo besedo
  (`<span class="sticker">Novo</span>`) ali celo vrstico izbrišeš.
- Ničesar drugega (imen razredov, oklepajev, oznak) ne spreminjaj.
- Če v besedilu potrebuješ znak `<` ali `&`, napiši `&lt;` oziroma `&amp;`.

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
2. `index.html` — razdelek `LOKACIJE`, tabela `<dl class="hrs">` pri obeh lokalih
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
je na šestih mestih (glava, uvod, novica, obe lokaciji, noga).

---

## 4. Objava na splet

Vse skupaj so navadne datoteke. Na gostovanje naloži celotno mapo:

```
index.html
css/
js/
assets/
```

Deluje na vsakem gostovanju (Netlify, GitHub Pages, običajen FTP). Nič ni treba
prevajati ali nameščati.

### Pisave

Stran uporablja pisavi **Anton** in **Barlow Condensed** z Google Fonts. Če
interneta ni ali je Google Fonts blokiran, se samodejno uporabijo podobne
sistemske pisave — stran ostane povsem berljiva, le videz je nekoliko drugačen.

---

## 5. Kaj je še vgrajeno

- **Deluje brez JavaScripta.** Cenik, novica, lokacije in kontakt so navaden
  HTML. Brez JavaScripta manjka le premikajoči se trak in animacije.
- **Manj gibanja.** Če ima obiskovalec v napravi vklopljeno nastavitev
  »zmanjšaj gibanje«, se trak ustavi in se ga da povleči s prstom, animacije pa
  se izklopijo.
- **Telefon in tablica.** Postavitev se prilagodi širini zaslona; v ožjih
  zaslonih se meni skrije pod gumb s tremi črtami.
- **Tipkovnica.** Po strani se da premikati s tabulatorjem, izbrani element ima
  rumen obroč.
