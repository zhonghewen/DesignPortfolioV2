const projects = [
  {
    id: 0,
    brief: 'AI-Assisted Support Funnels @Amazon',
    tags: '#Complex workflow #Building trust with AI  #Business Impact',
    bgColor: '#F2F7F8',
    textColor: '#47799D',
    highlightColor: '#E2F2F5',
    title: 'AI-Assisted Support Funnels @Amazon',
    description: 'Designed guided interaction patterns that turned low-signal seller inputs into high-quality data for Applied Science models, delivering $8.7M in annual savings.',
    role: 'lead UX designer',
    highlights: '#Complex workflow #Building trust with AI  #Business Impact',
    img: 'images/Cover_AmazonSupportFunnels.png',
    link: 'project01.html'
  },
  {
    id: 1,
    brief: 'Agentic Support Assistant @Amazon',
    tags: '#Conversational AI #Minimum Lovable Experience',
    bgColor: '#EEEFF6',
    textColor: '#54479D',
    highlightColor: '#E5E6F0',
    title: 'Agentic Support Assistant @Amazon',
    description: 'Architected long-term inline seller interactions and defined the "Minimum Lovable Experience" for a 4-phased launch, transforming legacy support into an integrated multi-agent assistant.',
    role: 'lead UX designer',
    highlights: '#Conversational AI #Minimum Lovable Experience',
    img: 'images/Cover_AgenticAssistant.png',
    link: 'project02.html'
  },
  {
    id: 2,
    brief: 'Context-Aware Support Orchestration @Amazon',
    tags: '#Complex workflows #Rapid AI Prototyping',
    bgColor: '#F6EEF3',
    textColor: '#9D475A',
    highlightColor: '#EEE0EA',
    title: 'Context-Aware Support Orchestration @Amazon',
    description: 'Streamlined 5+ widgets into a unified flow to boost seller support productivity, using AI prototyping to accelerate concept exploration and validation.',
    role: 'lead UX designer',
    highlights: '#Complex workflows #Rapid AI Prototyping',
    img: 'images/Cover_ContextAware.png',
    link: 'project03.html'
  }
];

const secret = {
  id: 3,
  bgColor: '#FCF9E7',
  textColor: '#E3AA50',
  highlightColor: '#F5F0D8',
  title: '0-to-1 Market Validation',
  description: 'Coming soon.',
  role: '',
  highlights: '',
  img: 'images/Zhonghe_Photo.png',
  link: '#'
};

let activeId = 0;

function renderProjectList() {
  const list = document.getElementById('project-list');
  list.innerHTML = projects.map(p => `
    <li class="project-item relative inline-flex cursor-pointer py-0.5"
        data-id="${p.id}"
        onmouseenter="activateProject(${p.id})">
      <div class="highlight-bar absolute bottom-[2px] left-0 h-[14px] w-0" style="background-color: ${p.highlightColor}; z-index: 0;"></div>
      <span class="project-name relative z-10 text-[14px] font-medium" style="color: #4a4a4a;">${p.brief}</span>
      <span class="relative z-10 text-[12px] ml-1" style="color: #4a4a4a; font-weight: 400;">&nbsp;${p.tags}</span>
    </li>
  `).join('');
}

function activateProject(id) {
  const p = id === 3 ? secret : projects.find(proj => proj.id === id);
  if (!p) return;
  activeId = id;

  // Update right panel background
  document.getElementById('bg-panel').style.backgroundColor = p.bgColor;

  // Fade screenshot
  const screenshot = document.getElementById('project-screenshot');
  screenshot.style.opacity = '0';
  setTimeout(() => {
    screenshot.src = p.img;
    screenshot.style.opacity = '1';
  }, 150);

  // Update project details text
  document.getElementById('project-title').textContent = p.title;
  document.getElementById('project-desc').textContent = p.description;
  document.getElementById('project-role').innerHTML = p.role
    ? `<span style="font-weight:700;">My role</span> ${p.role}` : '';
  document.getElementById('project-highlights').innerHTML = p.highlights
    ? `<span style="font-weight:700;">Highlights</span> ${p.highlights}` : '';

  const viewDetails = document.getElementById('view-details');
  viewDetails.style.color = p.textColor;
  viewDetails.href = p.link;

  // Update active states on all project list items
  document.querySelectorAll('.project-item').forEach(item => {
    const itemId = parseInt(item.dataset.id);
    const isActive = itemId === id;
    const activeProjColor = (itemId === 3 ? secret : projects.find(proj => proj.id === itemId))?.textColor || '#4a4a4a';

    const nameEl = item.querySelector('.project-name');
    if (nameEl) nameEl.style.color = isActive ? activeProjColor : '#4a4a4a';

    const bar = item.querySelector('.highlight-bar');
    if (bar) bar.style.width = isActive ? '100%' : '0';
  });
}

renderProjectList();
activateProject(0);
