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
    tags:"#Complex workflow  #Building trust with AI  #Business Impact",
    role:"Lead UX Designer",
    desc:"Designed guided interaction patterns that turned low-signal seller inputs into high-quality data for Applied Science models, delivering $8.7M in annual savings.",
    high:"#Complex workflow  #Building trust with AI  #Business Impact",
    panel:"rgb(242,247,248)", hl:"rgba(226,242,245,1)", ink:"rgb(71,121,157)",
    texture:"b1", screen:"assets/images/screen-p0.png", scroll:0, link:"View Details  →", url:"project-p0.html" },
  { id:1, title:"Agentic Support Assistant @Amazon",
    tags:"#Conversational AI  #Minimum Lovable Experience",
    role:"Lead UX Designer",
    desc:"Architected long-term inline seller interactions and defined the “Minimum Lovable Experience” (MLE) for a 4-phased launch, transforming legacy support into an integrated multi-agent assistant.",
    high:"#Conversational AI  #Minimum Lovable Experience",
    panel:"rgb(238,239,246)", hl:"rgba(226,228,243,1)", ink:"rgb(84,71,157)",
    texture:"b2", screen:"assets/images/screen-1.png", scroll:0, link:"View Details  →", url:"project-p1.html" },
  { id:2, title:"Context-Aware Support Orchestration @Amazon",
    tags:"#Complex workflows  #Rapid AI Prototyping",
    role:"Lead UX Designer",
    desc:"Streamlined 5+ widgets into a unified flow to boost seller support productivity, using AI prototyping to accelerate concept exploration and validation.",
    high:"#Complex workflows  #Rapid AI Prototyping",
    panel:"rgb(246,238,243)", hl:"rgba(243,226,235,1)", ink:"rgb(157,71,90)",
    texture:"b3", screen:"assets/images/screen-1.png", scroll:0, link:"View Details  →" },
  { id:3, title:"Year End Dashboard @ADP",
    tags:"#Dashboard  #Business Impact",
    role:"Lead UX Designer",
    desc:"Rebuilt the year-end tax dashboard into a status-first workspace that let payroll teams resolve thousands of filings on time and unlocked measurable efficiency gains at enterprise scale.",
    high:"#Dashboard  #Business Impact",
    panel:"rgb(246,241,238)", hl:"rgba(246,235,226,1)", ink:"rgb(152,74,35)",
    texture:"b4", screen:"assets/images/screen-1.png", scroll:0, link:"View Details  →" },
];
const SECRET = {
  id:4, title:"0-to-1 Market Validation",
  role:"Sole Content Creator",
  desc:"Outside my 9-to-5, I founded a consumer clothing insight channel and scaled it to a 48K+ cross-platform audience. I treat this as my personal R&D lab to test generative AI workflows and data-driven growth strategies in the real world.",
  high:"#YouTube Channel  #Community  #Storytelling",
  panel:"rgb(246,245,238)", hl:"rgba(243,240,215,1)", ink:"rgb(126,104,7)",
  texture:"bs", link:"View the Channel  →"
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
  el.addEventListener('click', () => select(p.id, true));
});

const sList = document.getElementById('secret-list');
const sEl = document.createElement('div');
sEl.className = 'item';
sEl.dataset.id = SECRET.id;
sEl.innerHTML = `<span class="head">${SECRET.title}</span>`;
sList.appendChild(sEl);
sEl.addEventListener('mouseenter', () => select(SECRET.id));
sEl.addEventListener('click', () => select(SECRET.id, true));

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
          : `<div class="m-imac"><div class="m-screen"><img src="${p.screen || 'assets/images/screen-1.png'}" alt="" /></div></div>`}
      </div>
      <div class="m-body">
        <h3>${p.title}</h3>
        <p class="m-desc">${p.desc || ''}</p>
        <div class="m-row"><b>My role</b><span>${p.role}</span></div>
        <div class="m-row"><b>Highlights</b><span>${p.high}</span></div>
        <a href="#" class="m-view">${p.link}</a>
      </div>`;
    mStack.appendChild(card);
  });
}

/* ——— selection state ——— */
const panel   = document.getElementById('panel');
const texture = document.getElementById('texture');
const scroller= document.getElementById('scroller');
const scrollerImg = scroller?.querySelector('img');
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
  dLink.textContent  = data.link;
  dLink.style.color  = tint(data.ink);
  dLink.href         = data.url || '#';

  if (id !== 4){
    if (scrollerImg && data.screen) scrollerImg.src = data.screen;
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

  /* JS fast path: .done class added by portfolio.js at ~4.4s */
  const observer = new MutationObserver(function() {
    if (loader.classList.contains('done')) {
      observer.disconnect();
      setTimeout(startOnce, 520);
    }
  });
  observer.observe(loader, { attributes: true, attributeFilter: ['class'] });

  /* CSS fallback path: fires when loaderFadeOut animation ends (~5.5s) */
  loader.addEventListener('animationend', function() {
    setTimeout(startOnce, 200);
  }, { once: true });
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
