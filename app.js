'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const main = $('#main');
const cacheKey = 'it352-haraj-v1';
let prefs = { lang: 'ar', scale: 'normal' };
let memoryBids = {};
try {
  const saved = JSON.parse(localStorage.getItem(cacheKey) || '{}') || {};
  if (['ar', 'en'].includes(saved.lang)) prefs.lang = saved.lang;
  if (['normal', 'large', 'xl'].includes(saved.scale)) prefs.scale = saved.scale;
} catch {}

const en = () => prefs.lang === 'en';
const t = (ar, english) => en() ? english : ar;
const local = (pair) => pair[Number(en())];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);
const num = (value) => new Intl.NumberFormat(t('ar-SA', 'en-SA')).format(value);
const money = (value) => `<bdi>${num(value)} ${t('ر.س', 'SAR')}</bdi>`;
const normalize = (value) => value.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u0640\u064b-\u065f]/g, '')
  .replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) % 16));
const numericText = (value) => normalize(value.trim()).replace(/[٬,\s]/g, '');
const amount = (value) => /^\d{1,9}$/.test(numericText(value)) ? Number(numericText(value)) : null;
const modelFor = { camry: 'camry', elantra: 'elantra' };
const brands = { toyota: ['تويوتا', 'Toyota'], hyundai: ['هيونداي', 'Hyundai'] };
const models = { camry: ['كامري', 'Camry'], elantra: ['إلنترا', 'Elantra'] };
const brandFor = { camry: 'toyota', elantra: 'hyundai' };
const paths = {
  search: '<circle cx="10.8" cy="10.8" r="6.1"/><path d="m15.2 15.2 4.8 4.8"/>',
  home: '<path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6"/>',
  settings: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2" fill="var(--white)"/><circle cx="15" cy="12" r="2" fill="var(--white)"/><circle cx="10" cy="17" r="2" fill="var(--white)"/>',
  car: '<path d="m4 11 2-5h12l2 5m0 0H4l-1 2v5h18v-5zM5 18v2m14-2v2M6 14h2m8 0h2"/>',
  wrench: '<path d="m13 14-6 6a2 2 0 0 1-3-3l6-6a6 6 0 0 1 7-8l-3 3 1 3 3 1 3-3a6 6 0 0 1-8 7Z"/>',
  camera: '<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M7 6l2-2h6l2 2"/>',
  sofa: '<path d="M6 13V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5M4 18v2m16-2v2"/><path d="M4 12a2 2 0 0 1 2 2v1h12v-1a2 2 0 1 1 4 0v4H2v-4a2 2 0 0 1 2-2z"/>',
  pin: '<path d="M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  bid: '<path d="m11 4 7 7m-9-5 4-4 7 7-4 4zM13 10 4 19m-1 2h18"/>'
};
function icon(name) {
  const turn = !en() && ['arrow', 'back'].includes(name);
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"${turn ? ' style="transform:scaleX(-1)"' : ''}>${paths[name]}</svg>`;
}
function route() {
  const [path, query = ''] = location.hash.slice(2).split('?');
  const [page = '', id] = path.split('/');
  return { page: location.hash.startsWith('#/') ? page || 'home' : 'home', id, params: new URLSearchParams(query) };
}
function searchHash(filters) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '')).toString();
  return '#/search' + (query ? '?' + query : '');
}
function listingHash(page, item, params) {
  const query = params.toString();
  return `#/${page}/${item.id}${query ? '?' + query : ''}`;
}
function savedBids() {
  try {
    const data = JSON.parse(localStorage.getItem(cacheKey + '-bids') || '{}');
    return data && !Array.isArray(data) && typeof data === 'object' ? { ...data, ...memoryBids } : memoryBids;
  } catch { return memoryBids; }
}
function bidValues(item) {
  const extras = savedBids()[item.id];
  return [...(item.offers || []), ...(Array.isArray(extras) ? extras : []).filter(Number.isSafeInteger)]
    .sort((a, b) => b - a);
}
function shell(page) {
  document.documentElement.lang = prefs.lang;
  document.documentElement.dir = t('rtl', 'ltr');
  document.documentElement.dataset.scale = prefs.scale;
  document.title = t('حراج', 'Haraj');
  $('#skip').textContent = t('تخطَّ إلى المحتوى', 'Skip to content');
  $('#header').innerHTML = `<div class="shell top">
    <a class="brand" href="#/"><img src="./assets/haraj-logo.svg" alt="${t('حراج', 'Haraj')}" width="371" height="77"></a>
    <nav class="nav" aria-label="${t('التنقل الرئيسي', 'Main navigation')}">
      ${[['home', '#/', t('الرئيسية','Home')], ['search', '#/search', t('بحث','Search')], ['settings', '#/settings', t('الإعدادات','Settings')]]
        .map(([key, href, label]) => `<a href="${href}"${page === key ? ' aria-current="page"' : ''}>${icon(key)} ${label}</a>`).join('')}
    </nav></div>`;
}
function imageFor(item, className = '', lazy = false) {
  return `<img class="${className}" src="./assets/${item.image}.jpg" alt="${escapeHTML(local(item.title))}"${lazy ? ' loading="lazy"' : ''}>`;
}
function searchBar(query = '') {
  const label = t('ابحث في الإعلانات', 'Search listings');
  return `<form class="searchbar" id="keyword-form" role="search"><label class="searchbox">
    ${icon('search')}<input name="q" type="search" dir="auto" maxlength="100" aria-label="${label}"
    placeholder="${t('ابحث عن سلعة', 'Search for an item')}" value="${escapeHTML(query)}"></label>
    <button class="btn" type="submit">${t('ابحث','Search')}</button></form>`;
}
function cards(items, params = new URLSearchParams()) {
  return `<div class="card-grid">${items.map((item) => `<article><a class="card" href="${escapeHTML(listingHash('listing', item, params))}">
    ${imageFor(item, '', true)}<div class="card-body">
      <div class="meta"><span>${icon('pin')} ${local(cities[item.city])}</span><span>· ${local(categories[item.type].label)}</span></div>
      <h3><bdi>${local(item.title)}</bdi></h3>
      <span class="price">${money(item.price)}</span>
    </div></a></article>`).join('')}</div>`;
}
function attachSearch(filters = {}) {
  $('#keyword-form').addEventListener('submit', (event) => {
    event.preventDefault();
    location.hash = searchHash({ ...filters, q: event.currentTarget.elements.q.value.trim() });
  });
}
function home() {
  const featured = listings[0];
  main.innerHTML = `<section class="hero" aria-labelledby="hero-title"><div>
    <h1 id="hero-title">${t('وش تدور عليه؟','What are you looking for?')}</h1>
    ${searchBar()}
  </div><a class="hero-image" href="#/listing/camry">
    ${imageFor(featured)}<span><bdi>${local(featured.title)}</bdi>${icon('arrow')}</span></a></section>
  <section class="section" aria-labelledby="category-title"><div class="section-heading"><h2 id="category-title">${t('الأقسام','Categories')}</h2></div>
    <div class="cat-grid">${Object.entries(categories).map(([key, cat]) => `<a class="category" href="${searchHash({ type: key })}">
      ${icon(cat.icon)}<strong>${local(cat.label)}</strong></a>`).join('')}</div></section>
  <section class="section" aria-labelledby="list-title"><div class="section-heading"><h2 id="list-title">${t('أحدث الإعلانات','Recent listings')}</h2>
    <a href="#/search">${t('كل الإعلانات','All listings')} ${icon('arrow')}</a></div>${cards(listings)}</section>`;
  attachSearch();
}
function selectField(name, label, values, chosen, allLabel = t('الكل','Any')) {
  return `<label class="field">${label}<select name="${name}"><option value="">${allLabel}</option>${Object.entries(values)
    .map(([key, pair]) => `<option value="${key}"${chosen === key ? ' selected' : ''}>${local(pair)}</option>`).join('')}</select></label>`;
}
function searchPage(params) {
  const values = {
    q: (params.get('q') || '').slice(0, 100),
    type: Object.hasOwn(categories, params.get('type')) ? params.get('type') : '',
    city: Object.hasOwn(cities, params.get('city')) ? params.get('city') : '',
    brand: Object.hasOwn(brands, params.get('brand')) ? params.get('brand') : '',
    model: Object.hasOwn(models, params.get('model')) ? params.get('model') : '',
    min: amount(params.get('min') || '') === null ? '' : String(amount(params.get('min'))),
    max: amount(params.get('max') || '') === null ? '' : String(amount(params.get('max')))
  };
  if (values.type !== 'cars') values.brand = values.model = '';
  if (values.brand && brandFor[values.model] !== values.brand) values.model = '';

  const terms = normalize(values.q).split(/\s+/).filter(Boolean);
  const filtered = listings.filter((item) => {
    const text = normalize([...item.title, ...categories[item.type].label, ...cities[item.city]].join(' '));
    return terms.every((term) => text.includes(term)) &&
      (!values.type || values.type === item.type) && (!values.city || values.city === item.city) &&
      (!values.brand || values.brand === brandFor[item.id]) && (!values.model || values.model === modelFor[item.id]) &&
      (values.min === '' || item.price >= Number(values.min)) && (values.max === '' || item.price <= Number(values.max));
  });
  const labels = [
    values.q, values.type && local(categories[values.type].label), values.city && local(cities[values.city]),
    values.brand && local(brands[values.brand]), values.model && local(models[values.model]),
    values.min !== '' && t('من ', 'From ') + num(Number(values.min)),
    values.max !== '' && t('إلى ', 'Up to ') + num(Number(values.max))
  ].filter(Boolean);
  const cleanHash = searchHash(values);
  main.innerHTML = `<div class="page-heading"><h1>${t('البحث في الإعلانات','Search listings')}</h1></div>
    ${searchBar(values.q)}
    <div class="split"><div class="filter-pane">
      <button class="btn outline filter-toggle" id="filter-toggle" type="button" aria-expanded="false" aria-controls="filter-form">
        ${icon('settings')} ${t('عرض الفلاتر','Show filters')}</button>
    <form class="panel filters" id="filter-form" aria-labelledby="filter-title" novalidate>
      <h2 id="filter-title">${t('الفلاتر','Filters')}</h2>
      ${selectField('type', t('القسم','Category'), Object.fromEntries(Object.entries(categories).map(([k,v]) => [k,v.label])), values.type, t('جميع الأقسام','All categories'))}
      <div id="vehicle-fields" class="stack"${values.type === 'cars' ? '' : ' hidden'}>
        ${selectField('brand', t('الماركة','Brand'), brands, values.brand)}
        <div id="model-field"></div>
      </div>
      ${selectField('city', t('المدينة','City'), cities, values.city)}
      <div class="range">
        <label class="field">${t('من ر.س','From SAR')} <input name="min" inputmode="numeric" maxlength="13" value="${values.min}" aria-describedby="filter-message"></label>
        <label class="field">${t('إلى ر.س','To SAR')} <input name="max" inputmode="numeric" maxlength="13" value="${values.max}" aria-describedby="filter-message"></label>
      </div>
      <p class="error" id="filter-message" role="alert" hidden></p>
      <button class="btn" type="submit">${t('تطبيق الفلاتر','Apply filters')}</button>
      <a class="btn outline" href="${searchHash({ q: values.q })}">${t('مسح الفلاتر','Clear filters')}</a>
    </form></div>
    <section aria-labelledby="results-title"><div class="results-head" role="status">
      <h2 id="results-title">${t('عدد النتائج: ', 'Results: ')}${num(filtered.length)}</h2>
      ${labels.length ? `<p class="applied">${labels.map((label) => `<bdi>${escapeHTML(label)}</bdi>`).join(' · ')}</p>` : ''}
    </div>${filtered.length ? cards(filtered, new URLSearchParams(cleanHash.split('?')[1] || '')) :
      `<div class="panel stack empty"><h3>${t('لا توجد إعلانات مطابقة','No matching listings')}</h3>
      <p class="muted">${t('جرّب كلمة أقصر أو وسّع نطاق الفلاتر.','Try a shorter search or broaden your filters.')}</p>
      <a class="btn soft" href="#/search">${t('عرض كل الإعلانات','Show all listings')}</a></div>`}
    </section></div>`;
  attachSearch(values);
  const form = $('#filter-form');
  const fields = form.elements;
  const toggle = $('#filter-toggle');
  function toggleFilters(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = icon('settings') + ' ' + (open ? t('إخفاء الفلاتر','Hide filters') : t('عرض الفلاتر','Show filters'));
    form.classList.toggle('filters-open', open);
  }
  toggle.addEventListener('click', () => toggleFilters(toggle.getAttribute('aria-expanded') !== 'true'));
  function updateModels(chosen = '') {
    const available = Object.fromEntries(Object.entries(models).filter(([key]) => !fields.brand.value || brandFor[key] === fields.brand.value));
    $('#model-field').innerHTML = selectField('model', t('الموديل','Model'), available, chosen);
  }
  updateModels(values.model);
  fields.type.addEventListener('change', () => { $('#vehicle-fields').hidden = fields.type.value !== 'cars'; });
  fields.brand.addEventListener('change', () => updateModels());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const min = amount(fields.min.value);
    const max = amount(fields.max.value);
    const error = $('#filter-message');
    fields.min.removeAttribute('aria-invalid');
    fields.max.removeAttribute('aria-invalid');
    let invalidField = [fields.min, fields.max].find((field) => field.value.trim() && amount(field.value) === null);
    let message = t('اكتب مبلغًا صحيحًا من صفر إلى ٩٩٩٬٩٩٩٬٩٩٩.', 'Enter a whole amount between 0 and 999,999,999.');
    if (!invalidField && min !== null && max !== null && min > max) {
      invalidField = fields.max;
      message = t('الحد الأعلى يجب أن يساوي الحد الأدنى أو يتجاوزه.', 'The maximum must be at least the minimum.');
    }
    error.hidden = !invalidField;
    if (invalidField) {
      error.textContent = message;
      invalidField.setAttribute('aria-invalid', 'true');
      invalidField.focus();
      return;
    }
    const next = { ...values, q: $('#keyword-form').elements.q.value.trim(), type: fields.type.value,
      city: fields.city.value, min: min ?? '', max: max ?? '',
      brand: fields.type.value === 'cars' ? fields.brand.value : '', model: fields.type.value === 'cars' ? fields.model.value : '' };
    const target = searchHash(next);
    if (location.hash === target && window.matchMedia('(max-width: 680px)').matches) {
      toggleFilters(false);
      toggle.focus();
    } else location.hash = target;
  });
}
function listingPage(item, params) {
  const backLink = searchHash(Object.fromEntries(params));
  main.innerHTML = `<a class="back" href="${escapeHTML(backLink)}">${icon('back')} ${t('العودة للإعلانات','Back to listings')}</a>
    <div class="page-heading"><h1><bdi>${local(item.title)}</bdi></h1>
      <p class="meta"><span>${icon('pin')} ${local(cities[item.city])}</span><span>· ${local(categories[item.type].label)}</span></p></div>
    <div class="detail-grid listing-grid">
      ${imageFor(item, 'detail-photo')}
      <section class="panel stack detail-side" aria-labelledby="details-title">
        <h2 id="details-title">${t('السعر والمواصفات','Price and specifications')}</h2>
        <div><span class="muted">${t('السعر المطلوب','Asking price')}</span><p class="price">${money(item.price)}</p></div>
        <dl class="specs divider">${item.specs.map((s) => `<div><dt>${s[Number(en())]}</dt><dd><bdi>${s[2 + Number(en())]}</bdi></dd></div>`).join('')}</dl>
        ${item.offers ? `<div class="callout"><strong>${t('أعلى سوم حالي','Current highest bid')}</strong><span class="price">${money(bidValues(item)[0])}</span>
          <a class="btn" href="${escapeHTML(listingHash('bid', item, params))}">${icon('bid')} ${t('عرض السوم','View bids')}</a></div>` : ''}
      </section>
      <section class="panel stack description"><h2>${t('وصف الإعلان','Description')}</h2><p>${local(item.summary)}</p></section>
    </div>`;
}
function bidPage(item, params, submitted) {
  const bids = bidValues(item);
  main.innerHTML = `<a class="back" href="${escapeHTML(listingHash('listing', item, params))}">${icon('back')} ${t('العودة للإعلان','Back to listing')}</a>
    <div class="page-heading"><h1>${t('السوم','Bids')}</h1><p class="muted"><bdi>${local(item.title)}</bdi></p></div>
    <div class="detail-grid bid-grid">
      <section class="panel stack"><div class="callout"><h2>${t('أعلى سوم حالي','Current highest bid')}</h2><span class="price">${money(bids[0])}</span>
      <p class="muted">${t('السعر المطلوب','Asking price')} · ${money(item.price)}</p></div>
        <h2>${t('سجل السوم','Bid history')}</h2><ol class="bid-list">${bids.map((value, index) =>
          `<li><span>${index === 0 ? t('الأعلى','Highest') : t('سوم سابق','Earlier bid')}</span><strong>${money(value)}</strong></li>`).join('')}</ol>
      </section>
      <section class="panel stack"><h2>${t('قدّم سومك','Place a bid')}</h2>
        ${submitted ? `<p class="success" id="bid-success" role="status" tabindex="-1">${t('تم حفظ السوم بقيمة','Bid saved for')} ${money(submitted)}.</p>` : ''}
        <form id="bid-form" class="stack" novalidate>
          <label class="field">${t('المبلغ بالريال السعودي','Amount in Saudi riyals')}
          <input name="offer" inputmode="numeric" maxlength="13" aria-describedby="minimum bid-error"></label>
          <p id="minimum" class="muted">${t('الحد الأدنى للسوم التالي','Minimum next bid')} · ${money(bids[0] + 1)}</p>
          <p id="bid-error" class="error" role="alert" hidden></p>
          <button class="btn" type="submit">${t('مراجعة السوم','Review bid')}</button>
        </form>
        <div id="review" class="callout" hidden>
          <h3 id="review-title" tabindex="-1">${t('تأكيد السوم','Confirm bid')}</h3><p id="review-amount"></p>
          <div class="actions"><button class="btn" type="button" id="confirm">${t('تأكيد السوم','Confirm bid')}</button>
          <button class="btn outline" type="button" id="edit">${t('تعديل المبلغ','Edit amount')}</button></div>
        </div>
      </section>
    </div>`;
  const form = $('#bid-form');
  const input = form.elements.offer;
  const review = $('#review');
  const error = $('#bid-error');
  let pending = null;
  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = amount(input.value);
    const highest = bidValues(item)[0];
    if (value === null) {
      showError(t('اكتب مبلغًا صحيحًا لا يتجاوز تسعة أرقام.', 'Enter a whole amount of up to nine digits.'));
      return;
    }
    if (value <= highest) {
      showError(t('اكتب مبلغًا أعلى من السوم الحالي: ', 'Enter an amount above the current bid: ') + num(highest));
      return;
    }
    pending = value;
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    $('#review-amount').innerHTML = money(value);
    form.hidden = true;
    review.hidden = false;
    $('#review-title').focus();
  });
  $('#edit').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    pending = null;
    input.focus();
  });
  $('#confirm').addEventListener('click', () => {
    if (pending <= bidValues(item)[0]) {
      $('#edit').click();
      showError(t('تغيّر أعلى سوم. أدخل مبلغًا جديدًا.', 'The highest bid changed. Enter a new amount.'));
      return;
    }
    const saved = savedBids();
    saved[item.id] = [...(Array.isArray(saved[item.id]) ? saved[item.id] : []), pending];
    try {
      localStorage.setItem(cacheKey + '-bids', JSON.stringify(saved));
      memoryBids = {};
    } catch { memoryBids = saved; }
    bidPage(item, params, pending);
    $('#bid-success').focus();
  });
}
function settings() {
  function choices(name, values, legend) {
    return `<fieldset><legend>${legend}</legend><div class="actions">${values.map(([key, label]) => `<label class="choice">
      <input type="radio" name="${name}" value="${key}"${prefs[name] === key ? ' checked' : ''}> ${label}</label>`).join('')}</div></fieldset>`;
  }
  main.innerHTML = `<div class="page-heading"><h1>${t('الإعدادات','Settings')}</h1></div>
    <form class="panel stack settings" id="preferences">
      ${choices('lang', [['ar','<span lang="ar">العربية</span>'], ['en','<span lang="en">English</span>']], t('لغة الواجهة','Interface language'))}
      ${choices('scale', [['normal',t('عادي','Default')], ['large',t('كبير','Large')], ['xl',t('أكبر','Extra large')]], t('حجم الخط','Text size'))}
      <div class="callout"><strong>${t('معاينة حجم الخط','Text size preview')}</strong><p><bdi>${local(listings[0].title)}</bdi> · ${money(listings[0].price)}</p></div>
      <p class="muted" id="prefs-status" role="status"></p>
    </form>`;
  $('#preferences').addEventListener('change', (event) => {
    const { name, value } = event.target;
    prefs[name] = value;
    let saved = true;
    try { localStorage.setItem(cacheKey, JSON.stringify(prefs)); } catch { saved = false; }
    render();
    $(`input[name="${name}"][value="${value}"]`).focus();
    $('#prefs-status').textContent = saved ? t('تم حفظ إعداداتك.','Your preferences were saved.') :
      t('تغيّرت الإعدادات لهذه الجلسة.','Preferences changed for this session.');
  });
}
function render() {
  const { page, id, params } = route();
  shell(page);
  const item = listings.find((entry) => entry.id === id);
  if (page === 'home') home();
  else if (page === 'search') searchPage(params);
  else if (page === 'listing' && item) listingPage(item, params);
  else if (page === 'bid' && item?.offers) bidPage(item, params);
  else if (page === 'settings') settings();
  else main.innerHTML = `<div class="panel stack empty"><h1>${t('الصفحة غير متاحة','Page unavailable')}</h1>
    <a class="btn" href="#/search">${t('عرض الإعلانات','Browse listings')}</a></div>`;
}
$('#skip').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});
window.addEventListener('hashchange', () => {
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
});
render();
