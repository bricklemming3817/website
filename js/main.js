(function(){
  const state = {
    projects: [],
    tag: 'all'
  };

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    fetch('./assets/content.json')
      .then(r => r.json())
      .then(data => {
        buildHome(data);
        buildProjects(data);
        buildSkills(data);
        buildResume(data);
        buildContact(data);
        buildFooter(data);
      })
      .catch(() => {});
    setupTheme();
    setupScroll();
  }

  function buildHome(data){
    const home = document.getElementById('home');
    home.innerHTML = `
      <h1>${data.owner.name}</h1>
      <p>${data.owner.title}</p>
      <p>${data.owner.value_prop}</p>
      <div class="chips">${data.highlights.slice(0,3).map(h=>`<span class="chip">${h}</span>`).join('')}</div>
      <p><a class="btn" href="#projects">View Projects</a> <a class="btn" href="${data.resume.pdf}" download>Download Resume</a></p>
    `;
  }

  function buildProjects(data){
    state.projects = data.projects;
    const filters = document.getElementById('project-filters');
    const tags = ['all','Analytics','Business Analysis','Systems'];
    tags.forEach(t=>{
      const chip = document.createElement('button');
      chip.className='chip';
      chip.textContent=t=== 'all'? 'All' : t;
      chip.dataset.tag=t.toLowerCase().replace(/\s+/g,'-');
      chip.addEventListener('click',()=>{
        state.tag=chip.dataset.tag;
        renderProjects();
        updateHash();
      });
      filters.appendChild(chip);
    });
    const hashTag = location.hash.match(/tag=([^&]+)/);
    if(hashTag){ state.tag = hashTag[1]; }
    renderProjects();
  }

  function renderProjects(){
    const list = document.getElementById('project-list');
    list.innerHTML='';
    document.querySelectorAll('#project-filters .chip').forEach(ch=>{
      ch.classList.toggle('active', ch.dataset.tag===state.tag);
    });
    state.projects.filter(p=>{
      if(state.tag==='all') return true;
      return p.tags.some(t=>t.toLowerCase().includes(state.tag));
    }).forEach(p=>{
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML=`<h3>${p.name} <small>${p.year}</small></h3><p>${p.summary}</p><div class="chips">${p.tags.map(t=>`<span class="chip" aria-hidden="true">${t}</span>`).join('')}</div><button class="btn expand" aria-expanded="false">Details</button><div class="details" hidden><ul>${p.impact.map(i=>`<li>${i}</li>`).join('')}</ul><p><a href="${p.links.doc}" target="_blank">Open doc</a></p></div>`;
      const btn = card.querySelector('.expand');
      const details = card.querySelector('.details');
      btn.addEventListener('click',()=>{
        const exp = btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded', !exp);
        details.hidden = exp;
      });
      btn.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }});
      list.appendChild(card);
    });
  }

  function buildSkills(data){
    const cols = document.getElementById('skills-columns');
    const groups = ['core','data','tools','methods'];
    groups.forEach(g=>{
      const div = document.createElement('div');
      div.className='card';
      div.innerHTML=`<h3>${g[0].toUpperCase()+g.slice(1)}</h3><ul>${data.skills[g].map(s=>`<li>${s}</li>`).join('')}</ul>`;
      cols.appendChild(div);
    });
  }

  function buildResume(data){
    document.getElementById('resume-pdf').href = data.resume.pdf;
    document.getElementById('resume-summary').textContent = `Last updated ${data.resume.last_updated}`;
  }

  function buildContact(data){
    const email = document.getElementById('contact-email');
    email.href = `mailto:${data.owner.email}`;
    email.textContent = data.owner.email;
    document.getElementById('contact-location').textContent = data.owner.location;
    const links = document.getElementById('contact-links');
    Object.entries(data.owner.links).forEach(([k,v])=>{
      const a = document.createElement('a');
      a.href=v; a.className='btn'; a.textContent=k;
      links.appendChild(a);
    });
  }

  function buildFooter(data){
    document.getElementById('year').textContent = new Date().getFullYear();
    const list = document.getElementById('footer-links');
    const linkItems = {
      LinkedIn: data.owner.links.linkedin,
      GitHub: data.owner.links.github,
      Email: `mailto:${data.owner.email}`
    };
    Object.entries(linkItems).forEach(([k,v])=>{
      const li = document.createElement('li');
      li.innerHTML=`<a href="${v}">${k}</a>`;
      list.appendChild(li);
    });
  }

  function setupTheme(){
    const btn = document.getElementById('theme-toggle');
    const pref = localStorage.getItem('theme');
    if(pref==='dark'){ document.documentElement.classList.add('dark'); }
    btn.addEventListener('click',()=>{
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark')?'dark':'light');
    });
  }

  function setupScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        if(a.getAttribute('href').startsWith('#')){
          const el = document.querySelector(a.getAttribute('href'));
          if(el){
            e.preventDefault();
            const opts = window.matchMedia('(prefers-reduced-motion: reduce)').matches? {behavior:'auto'}:{behavior:'smooth'};
            el.scrollIntoView(opts);
          }
        }
      });
    });

    const sections = document.querySelectorAll('main section');
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          document.querySelectorAll('.nav a').forEach(a=>{
            a.classList.toggle('active', a.getAttribute('href')==`#${entry.target.id}`);
          });
        }
      });
    }, {rootMargin:'-50% 0px -50% 0px'});
    sections.forEach(sec=>observer.observe(sec));
  }

  function updateHash(){
    if(state.tag==='all'){ history.replaceState(null,null,'#projects'); return; }
    history.replaceState(null,null,`#tag=${state.tag}`);
  }
})();
