/* ==========================================================================
   Fast Food LAN — vsa interaktivnost strani.
   Stran deluje tudi brez JavaScripta: cenik, novice in lokacije so navadni
   HTML. JavaScript doda samo premikajoci trak, animacije in oznako Odprto.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------- meni --- */
  var burger = document.querySelector('[data-burger]');
  var nav = document.querySelector('[data-nav]');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) closeNav();
    });
  }

  /* ------------------------------------------------- premikajoci se trak ---
     Kartice se sestavijo iz vrstic cenika, ki imajo oznako data-pick.
     Tako je cena zapisana samo na enem mestu in se ne more razlikovati.     */
  var beltSection = document.querySelector('[data-belt-section]');
  var belt = document.querySelector('[data-belt]');
  var shift = document.querySelector('[data-shift]');
  var track = document.querySelector('[data-track]');
  var picks = document.querySelectorAll('.row[data-pick]');

  if (beltSection && belt && shift && track && picks.length) {
    var set = document.createElement('ul');
    set.className = 'belt__set';

    Array.prototype.forEach.call(picks, function (row) {
      var nameEl = row.querySelector('.row__n');
      var priceEl = row.querySelector('.row__p');
      if (!nameEl || !priceEl) return;

      /* ime brez pojasnila v oklepaju (npr. "Piscancji, goveji, mesani") */
      var clone = nameEl.cloneNode(true);
      var note = clone.querySelector('em');
      if (note) note.parentNode.removeChild(note);

      var card = document.createElement('li');
      card.className = 'card';

      var tag = document.createElement('span');
      tag.className = 'card__tag';
      tag.textContent = row.getAttribute('data-tag') || '';

      var name = document.createElement('span');
      name.className = 'card__n';
      name.textContent = clone.textContent.trim();

      var price = document.createElement('span');
      price.className = 'card__p';
      price.textContent = priceEl.textContent.trim();

      card.appendChild(tag);
      card.appendChild(name);
      card.appendChild(price);
      set.appendChild(card);
    });

    /* dva enaka niza zapored: pri -50 % je slika pikselsko enaka izhodiscni,
       zato se trak zavrti brez vidnega preskoka                              */
    var twin = set.cloneNode(true);
    twin.setAttribute('aria-hidden', 'true');
    track.appendChild(set);
    track.appendChild(twin);

    beltSection.hidden = false;

    /* enaka hitrost (~78 px/s) ne glede na sirino zaslona in stevilo jedi */
    var setWidth = set.scrollWidth;
    if (setWidth > 0) {
      track.style.animationDuration = Math.max(18, setWidth / 78).toFixed(1) + 's';
    }

    /* vlecenje z misko ali prstom — samo majhen sunek, ki se sam vrne */
    if (!reduce && window.PointerEvent) {
      var dragging = false;
      var startX = 0;

      belt.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        dragging = true;
        startX = e.clientX;
        shift.style.transition = 'none';
        belt.classList.add('is-drag', 'is-paused');
      });

      belt.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = Math.max(-320, Math.min(320, e.clientX - startX));
        shift.style.setProperty('--drag', dx + 'px');
      });

      function endDrag() {
        if (!dragging) return;
        dragging = false;
        shift.style.transition = 'transform .45s cubic-bezier(.2,.7,.3,1)';
        shift.style.setProperty('--drag', '0px');
        belt.classList.remove('is-drag', 'is-paused');
      }

      belt.addEventListener('pointerup', endDrag);
      belt.addEventListener('pointercancel', endDrag);
      belt.addEventListener('pointerleave', endDrag);
    }
  }

  /* ------------------------------------------------------- pas z besedami --- */
  var strip = document.querySelector('[data-strip]');
  if (strip) {
    var words = ['Kebab', 'Jufka', 'Burger', 'Pizza', 'Čevapčiči', 'Pleskavica',
      'Pommes frites', 'Hot dog', 'Medaljoni', 'Kebab krožnik'];

    function buildStrip() {
      var ul = document.createElement('ul');
      ul.className = 'strip__set';
      words.forEach(function (w) {
        var li = document.createElement('li');
        li.textContent = w;
        ul.appendChild(li);
        var sep = document.createElement('li');
        sep.className = 'sep';
        sep.textContent = '✦';
        ul.appendChild(sep);
      });
      return ul;
    }
    strip.appendChild(buildStrip());
    strip.appendChild(buildStrip());
  }

  /* ------------------------------------------------- razkritje ob drsenju --- */
  var reveals = document.querySelectorAll('.reveal');
  Array.prototype.forEach.call(reveals, function (el, i) {
    el.style.setProperty('--i', i % 4);
  });

  function showAll() {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  }

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });

    /* varovalka: ce opazovalec zaradi cesarkoli ne sprozi, cenik vseeno
       prikazemo — vsebina ne sme nikoli ostati skrita */
    window.setTimeout(showAll, 2500);
  } else {
    showAll();
  }

  /* ------------------------------------------------------ Odprto / Zaprto ---
     Pon-pet 9.00-22.00, sobota in nedelja 12.00-22.00.
     Ce se delovni cas spremeni, popravi stevilki spodaj (in cas na strani).  */
  var OPEN_WEEKDAY = 9;
  var OPEN_WEEKEND = 12;
  var CLOSE = 22;

  var pill = document.querySelector('[data-openpill]');
  if (pill) {
    var now = new Date();
    var day = now.getDay();                       // 0 = nedelja, 6 = sobota
    var opensAt = (day === 0 || day === 6) ? OPEN_WEEKEND : OPEN_WEEKDAY;
    var minutes = now.getHours() * 60 + now.getMinutes();
    var isOpen = minutes >= opensAt * 60 && minutes < CLOSE * 60;

    pill.textContent = isOpen ? 'Odprto' : 'Zaprto';
    pill.classList.toggle('is-closed', !isOpen);
    pill.setAttribute('title', isOpen
      ? 'Danes zapremo ob ' + CLOSE + '.00'
      : 'Danes odpremo ob ' + opensAt + '.00');
  }
})();
