/* ==========================================================================
   Predogled v urejevalniku: objava se izrise z istimi razredi in istim
   css/style.css kot na strani, zato urednik vidi tocno koncni videz.
   ========================================================================== */
(function () {
  'use strict';

  var CMS = window.CMS;
  var h = window.h;
  if (!CMS || !h) return;

  var MESECI = ['januar', 'februar', 'marec', 'april', 'maj', 'junij', 'julij',
    'avgust', 'september', 'oktober', 'november', 'december'];

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;500;600;700&display=swap');
  CMS.registerPreviewStyle('/css/style.css');

  function dateLabel(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(typeof v === 'string' ? v : '');
    if (!m && v instanceof Date) {
      return v.getDate() + '. ' + MESECI[v.getMonth()] + ' ' + v.getFullYear();
    }
    return m ? (+m[3]) + '. ' + MESECI[+m[2] - 1] + ' ' + m[1] : '';
  }

  var NovicePreview = window.createClass({
    render: function () {
      var data = this.props.entry.get('data');
      var get = function (k) { return data.get(k); };
      var getAsset = this.props.getAsset;
      var slika = get('slika') ? String(getAsset(get('slika'))) : '';
      var video = get('video') ? String(getAsset(get('video'))) : '';

      var media = null;
      if (slika || video) {
        media = h('figure', { className: 'post__media' + (slika && video ? ' post__media--duo' : '') },
          slika ? h('img', { src: slika, alt: get('slika_opis') || '' }) : null,
          video ? h('video', { src: video, controls: true, playsInline: true, preload: 'metadata' }) : null);
      }

      return h('section', { className: 'novice tex', style: { minHeight: '100vh' } },
        h('div', { className: 'novice__in' },
          get('objavljeno') === false
            ? h('p', { className: 'novice__empty' }, 'Ta objava je skrita in se na strani ne prikaže.')
            : null,
          h('h2', { className: 'tag tag--dark' }, h('span', null, 'Novo pri nas')),
          h('article', { className: 'post' },
            get('nalepka') ? h('span', { className: 'sticker' }, get('nalepka')) : null,
            media,
            h('p', { className: 'post__date' }, dateLabel(get('datum'))),
            h('h3', { className: 'post__h' }, get('naslov') || 'Naslov objave'),
            h('div', { className: 'post__body' }, this.props.widgetFor('besedilo')),
            get('podpis') ? h('p', { className: 'post__sign' }, '— ' + get('podpis')) : null)));
    }
  });

  CMS.registerPreviewTemplate('novice', NovicePreview);
})();
