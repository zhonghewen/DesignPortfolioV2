/* ——— loader ——— */
/* CSS handles both the ink-reveal animation and the 5s fallback dismiss.
   JS only adds .done earlier (at ~4.4s) when images are ready. */
(function(){
  var loader = document.getElementById('page-loader');
  if (!loader) return;

  function dismissLoader(){ loader.classList.add('done'); }

  /* bfcache: page restored from frozen snapshot */
  window.addEventListener('pageshow', function(e){ if(e.persisted) dismissLoader(); });

  var KEY_IMAGES = [
    'assets/images/bg-1.jpg',
    'assets/images/bg-2.jpg',
    'assets/images/bg-3.png',
    'assets/images/bg-4.jpg',
    'assets/images/bg-secret.jpg',
    'assets/images/imac.png',
    'assets/images/screen-p0.png',
    'assets/images/zhonghe.png',
  ];

  var imagesReady = Promise.all(KEY_IMAGES.map(function(src){
    return new Promise(function(res){
      var img = new Image();
      img.onload = img.onerror = res;
      img.src = src;
    });
  }));

  var minTime = new Promise(function(res){ setTimeout(res, 4400); });

  Promise.all([imagesReady, minTime]).then(dismissLoader);
})();

/* ——— data ——— */
const PROJECTS = [
  { id:0, title:"AI-Assisted Support Funnels @Amazon",
    tags:"#Building trust with AI  #Business Impact #Complex workflows",
    role:"Sole UX Designer, UX researcher",
    desc:"Designed guided interaction patterns that turned low-signal seller inputs into high-quality data for Applied Science models, delivering $8.7M in annual savings.",
    high:"#Building trust with AI  #Business Impact #Complex workflows",
    panel:"rgb(246,241,238)", hl:"rgba(246,241,238,1)", ink:"rgb(152,74,35)",
    texture:"b4", screen:"assets/images/screen-p0.png", scroll:0, link:"View Details  →", url:"project-p0.html" },
  { id:1, title:"Agentic Support Assistant @Amazon",
    tags:"#Conversational AI  #Minimum Lovable Experience",
    role:"Sole UX Designer",
    desc:"Set the quality bar and inline interaction architecture for evolving legacy support into an integrated multi-agent assistant — defining what 'good enough to ship' truly means at each phase.",
    high:"#Conversational AI  #Minimum Lovable Experience",
    panel:"rgb(238,239,246)", hl:"rgba(226,228,243,1)", ink:"rgb(84,71,157)",
    texture:"b2", screen:"assets/images/screen-p1.mov", scroll:0, link:"View Details  →", url:"project-p1.html" },
  { id:2, title:"Unifying AI Tools for Complex Support Cases @Amazon",
    tags:"#Complex workflows  #Rapid AI Prototyping",
    role:"Sole UX Designer, UX researcher",
    desc:"Streamlined 5+ widgets into a unified flow to boost seller support productivity, using AI prototyping to accelerate concept exploration and validation.",
    high:"#Complex workflows  #Rapid AI Prototyping",
    panel:"rgb(246,238,243)", hl:"rgba(243,226,235,1)", ink:"rgb(157,71,90)",
    texture:"b3", screen:"assets/images/screen-p2.jpg", scroll:0, link:"View Details  →", comingSoon:true },
];
const SECRET = {
  id:4, title:"0-to-1 Market Validation",
  role:"Sole Content Creator",
  desc:"Outside my 9-to-5, I founded a consumer clothing insight channel and scaled it to a 48K+ cross-platform audience. I treat this as my personal R&D lab to test generative AI workflows and data-driven growth strategies in the real world.",
  high:"#Data-driven market growth",
  panel:"rgb(246,245,238)", hl:"rgba(243,240,215,1)", ink:"rgb(126,104,7)",
  texture:"bs", link:"View the Channel  →", url:"https://space.bilibili.com/596909417?spm_id_from=333.1007.0.0", external:true
};

/* ——— render lists ——— */
const pList = document.getElementById('project-list');
PROJECTS.forEach(p => {
  const el = document.createElement('div');
  el.className = 'item';
  el.dataset.id = p.id;
  el.innerHTML = `<span class="head">${p.title}</span> <span class="hash">${p.tags}</span>`;
  pList.appendChild(el);
  el.addEventListener('mouseenter', () => select(p.id));
  el.addEventListener('click', () => { select(p.id); if (p.url) window.location.href = p.url; });
});

const sList = document.getElementById('secret-list');
const sEl = document.createElement('div');
sEl.className = 'item';
sEl.dataset.id = SECRET.id;
sEl.innerHTML = `<span class="head">${SECRET.title}</span>`;
sList.appendChild(sEl);
sEl.addEventListener('mouseenter', () => select(SECRET.id));
sEl.addEventListener('click', () => select(SECRET.id, true));

function isVideo(src){ return /\.(mov|mp4|webm)$/i.test(src || ''); }
function screenEl(src){
  const s = src || 'assets/images/screen-1.png';
  return isVideo(s)
    ? `<video src="${s}" autoplay loop muted playsinline style="width:100%;height:100%;display:block;object-fit:cover"></video>`
    : `<img src="${s}" alt="" />`;
}

/* ——— mobile stacked cards ——— */
const mStack = document.getElementById('mobile-stack');
if (mStack){
  const ALL = [...PROJECTS, SECRET];
  ALL.forEach(p => {
    const isSecret = p.id === 4;
    const card = document.createElement('article');
    card.className = 'm-card' + (isSecret ? ' secret' : '');
    card.style.setProperty('--panel', p.panel);
    card.style.setProperty('--ink', p.ink);
    card.innerHTML = `
      <div class="m-preview b${isSecret ? 's' : p.id+1}">
        ${isSecret
          ? `<div class="m-photo"></div>`
          : `<div class="m-imac"><div class="m-screen">${screenEl(p.screen)}</div></div>`}
      </div>
      <div class="m-body">
        <h3>${p.title}</h3>
        <p class="m-desc">${p.desc || ''}</p>
        <div class="m-row"><b>My role</b><span>${p.role}</span></div>
        <div class="m-row"><b>Highlights</b><span>${p.high}</span></div>
        <a href="#" class="m-view"${p.comingSoon ? ' style="pointer-events:none;opacity:.45;cursor:default"' : ''}>${p.link}${p.comingSoon ? '&nbsp;&nbsp;(Coming soon)' : ''}</a>
      </div>`;
    mStack.appendChild(card);
  });
}

/* ——— selection state ——— */
const panel   = document.getElementById('panel');
const texture = document.getElementById('texture');
const scroller= document.getElementById('scroller');
function updateScroller(src){
  if (!scroller) return;
  const s = src || 'assets/images/screen-1.png';
  scroller.innerHTML = isVideo(s)
    ? `<video src="${s}" autoplay loop muted playsinline style="width:100%;height:100%;display:block;object-fit:cover"></video>`
    : `<img src="${s}" alt="Project preview" />`;
}
const right   = document.getElementById('right');
const dTitle  = document.getElementById('d-title');
const dRole   = document.getElementById('d-role');
const dDesc   = document.getElementById('d-desc');
const dHigh   = document.getElementById('d-high');
const dLink   = document.getElementById('d-link');

let active = 0;
function select(id){
  active = id;
  document.querySelectorAll('.item').forEach(x => x.classList.remove('active'));
  const cur = document.querySelector(`.item[data-id="${id}"]`);
  if (!cur) return;

  const data = id === 4 ? SECRET : PROJECTS[id];

  const w = Math.min(100, 35 + (data.title.length + (data.tags?.length || 0)) * 0.45);
  cur.style.setProperty('--hl', data.hl);
  cur.style.setProperty('--hl-ink', tint(data.ink));
  cur.style.setProperty('--hl-w', w + '%');
  cur.classList.add('active');

  panel.style.background = tint(data.panel, true);
  texture.classList.remove('b1','b2','b3','b4','bs');
  texture.classList.add(data.texture);

  right.classList.toggle('is-secret', id === 4);

  dTitle.textContent = data.title;
  dDesc.textContent  = data.desc || '';
  dRole.textContent  = data.role;
  dHigh.textContent  = data.high;
  const soon = !!data.comingSoon;
  dLink.textContent  = data.link + (soon ? '  (Coming soon)' : '');
  dLink.style.color  = tint(data.ink);
  dLink.href         = data.url || '#';
  dLink.target       = data.external ? '_blank' : '_self';
  dLink.rel          = data.external ? 'noopener noreferrer' : '';
  dLink.style.pointerEvents = soon ? 'none' : '';
  dLink.style.opacity       = soon ? '0.45' : '';
  dLink.style.cursor        = soon ? 'default' : '';

  if (id !== 4){
    if (data.screen) updateScroller(data.screen);
    if (typeof data.scroll === 'number') scroller.style.transform = `translateY(${data.scroll}px)`;
  }
}

/* tint presets */
function tint(rgb, isPanel){
  const mode = document.getElementById('tw-tint')?.value || 'default';
  if (mode === 'mono')  return isPanel ? 'rgb(244,244,244)' : 'rgb(60,60,60)';
  if (mode === 'warm')  return isPanel ? 'rgb(248,243,236)' : 'rgb(152,74,35)';
  return rgb;
}

select(0);

/* ——— subtitle typing animation ——— */
(function typeSubtitle(){
  const full   = "Designing complex enterprise workflow and high-stakes AI interaction patterns.";
  const host   = document.getElementById('subtitle');
  const txt    = host.querySelector('.txt');
  const loader = document.getElementById('page-loader');

  let started = false;
  function startOnce() {
    if (started) return;
    started = true;
    let i = 0;
    (function tick(){
      txt.textContent = full.slice(0, i);
      i++;
      if (i <= full.length) {
        setTimeout(tick, 22 + Math.random() * 18);
      } else {
        setTimeout(() => host.classList.add('done'), 1200);
      }
    })();
  }

  /* JS fast path: wait for the loader fade transition to fully complete */
  const observer = new MutationObserver(function() {
    if (loader.classList.contains('done')) {
      observer.disconnect();
      loader.addEventListener('transitionend', function() {
        setTimeout(startOnce, 80);
      }, { once: true });
    }
  });
  observer.observe(loader, { attributes: true, attributeFilter: ['class'] });

  /* CSS fallback path: fires when loaderFadeOut animation ends (~5.5s) */
  loader.addEventListener('animationend', function(e) {
    if (e.animationName !== 'loaderFadeOut') return;
    setTimeout(startOnce, 200);
  });
})();

/* ——— tweak hooks ——— */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "autoCycle": false,
  "tips": true,
  "tint": "default"
}/*EDITMODE-END*/;

const tw     = document.getElementById('tweaks');
const twAuto = document.getElementById('tw-auto');
const twTips = document.getElementById('tw-tips');
const twTint = document.getElementById('tw-tint');

let cycleT;
function restartCycle(on){
  clearInterval(cycleT);
  if (!on) return;
  cycleT = setInterval(() => {
    const seq = [0,1,2,3,4];
    const next = seq[(seq.indexOf(active) + 1) % seq.length];
    select(next);
  }, 3500);
}

function applyTweaks(t){
  twAuto.checked = !!t.autoCycle;
  twTips.checked = !!t.tips;
  twTint.value   = t.tint || 'default';
  document.body.classList.toggle('no-tips', !t.tips);
  restartCycle(t.autoCycle);
  select(active);
}

[twAuto, twTips, twTint].forEach(el => {
  el.addEventListener('change', () => {
    const edits = {
      autoCycle: twAuto.checked,
      tips: twTips.checked,
      tint: twTint.value,
    };
    applyTweaks(edits);
    try { window.parent.postMessage({type:'__edit_mode_set_keys', edits}, '*'); } catch(e) {}
  });
});

applyTweaks(TWEAK_DEFAULTS);

/* tweak mode protocol */
window.addEventListener('message', e => {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === '__activate_edit_mode')   tw.classList.add('on');
  if (e.data.type === '__deactivate_edit_mode') tw.classList.remove('on');
});
try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(e) {}
