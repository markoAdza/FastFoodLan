/* ==========================================================================
   Fast Food LAN — zbere vse objave iz content/novice/*.json (ustvari jih
   urejevalnik na /admin) v eno datoteko content/novice.json, ki jo prebere
   js/main.js. Vercel to skripto pozene ob vsaki objavi (glej vercel.json).

   Rocno:  node scripts/build-novice.js
   Brez dodatnih paketov — samo Node.
   ========================================================================== */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var SRC = path.join(ROOT, 'content', 'novice');
var OUT = path.join(ROOT, 'content', 'novice.json');

var MESECI = ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij',
  'avgust', 'september', 'oktober', 'november', 'december'];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* povezave samo na splet, telefon, e-posto ali znotraj strani */
function safeUrl(url) {
  return /^(https?:|tel:|mailto:|\/|#)/i.test(url) ? url : '';
}

/* slika ali video: pot na tej strani ali https naslov */
function safeMedia(v) {
  return typeof v === 'string' && /^(\/|https:\/\/)/.test(v.trim()) ? v.trim() : '';
}

/* ------------------------------------------------- zelo majhen markdown ---
   Urejevalnik ponuja le krepko, lezece, povezavo in seznam, zato tukaj
   podpiramo samo to. Vse besedilo se najprej pobegne (escape), tako da v
   objavi ne more nikoli nastati lasten HTML ali skripta.                   */
function inline(text) {
  var keep = [];
  function stash(html) {
    keep.push(html);
    return '\u0000' + (keep.length - 1) + '\u0000';
  }

  /* \* \_ \[ ... — Decap tako zapise znake, ki naj ostanejo dobesedni */
  var s = text.replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, function (m, c) {
    return stash(escapeHtml(c));
  });
  /* koncni \ ali dva presledka pomenita prelom vrstice, tega uredi block() */
  s = s.replace(/(\\| {2,})$/, '');

  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (m, label, url) {
    var href = safeUrl(url);
    var inner = emphasis(escapeHtml(label));
    if (!href) return stash(inner);
    var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
    return stash('<a href="' + escapeHtml(href) + '"' + ext + '>' + inner + '</a>');
  });

  s = emphasis(escapeHtml(s));

  return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return keep[+i]; });
}

function emphasis(s) {
  return s
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, '<strong>$1$2</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_([^_]+)_(?!\w)/g, '$1<em>$2</em>');
}

function block(chunk) {
  var lines = chunk.split('\n').filter(function (l) { return l.trim() !== ''; });
  var isList = lines.every(function (l) { return /^\s*[-*+]\s+/.test(l); });
  if (isList) {
    return '<ul>' + lines.map(function (l) {
      return '<li>' + inline(l.replace(/^\s*[-*+]\s+/, '').trim()) + '</li>';
    }).join('') + '</ul>';
  }
  return '<p>' + lines.map(function (l) { return inline(l.trim()); }).join('<br>') + '</p>';
}

function markdown(src) {
  if (typeof src !== 'string') return '';
  return src.replace(/\r\n?/g, '\n').trim()
    .split(/\n\s*\n/)
    .filter(function (c) { return c.trim() !== ''; })
    .map(block)
    .join('');
}

/* "2026-10-28" -> "28. oktober 2026" */
function dateLabel(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return '';
  return (+m[3]) + '. ' + MESECI[+m[2] - 1] + ' ' + m[1];
}

/* ------------------------------------------------------------- zbiranje --- */
var files = fs.existsSync(SRC)
  ? fs.readdirSync(SRC).filter(function (f) { return /\.json$/i.test(f); })
  : [];

var posts = [];
var hidden = 0;

files.forEach(function (file) {
  var data;
  try {
    data = JSON.parse(fs.readFileSync(path.join(SRC, file), 'utf8'));
  } catch (err) {
    /* pokvarjena datoteka ne sme ustaviti objave cele strani */
    console.warn('! preskocena ' + file + ': ' + err.message);
    return;
  }
  if (!data || typeof data !== 'object' || !data.naslov) {
    console.warn('! preskocena ' + file + ': manjka naslov');
    return;
  }
  if (data.objavljeno === false) {
    hidden++;
    return;
  }

  var datum = typeof data.datum === 'string' ? data.datum.slice(0, 10) : '';
  posts.push({
    slug: file.replace(/\.json$/i, '').replace(/[^\w-]/g, '-'),
    naslov: String(data.naslov),
    datum: datum,
    datumLabel: dateLabel(datum),
    nalepka: data.nalepka ? String(data.nalepka) : '',
    slika: safeMedia(data.slika),
    slika_opis: data.slika_opis ? String(data.slika_opis) : '',
    video: safeMedia(data.video),
    podpis: data.podpis ? String(data.podpis) : '',
    html: markdown(data.besedilo)
  });
});

/* najnovejsa prva; pri enakem datumu odloci ime datoteke */
posts.sort(function (a, b) {
  if (a.datum !== b.datum) return a.datum < b.datum ? 1 : -1;
  return a.slug < b.slug ? 1 : -1;
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n');

console.log('novice: ' + posts.length + ' objavljenih' +
  (hidden ? ', ' + hidden + ' skritih' : '') + ' -> content/novice.json');
