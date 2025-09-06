(function(){
  document.documentElement.classList.add('js');
  document.addEventListener('DOMContentLoaded', () => {
    setupScroll();
    setupObserver();
    setupAccordion();
    setupLifecycle();
  });

  function setupScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if(el){
          e.preventDefault();
          const opts = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {behavior:'auto'} : {behavior:'smooth'};
          el.scrollIntoView(opts);
        }
      });
    });
  }

  function setupObserver(){
    const links = document.querySelectorAll('.nav a');
    const sections = document.querySelectorAll('main section');
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          links.forEach(l=>l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, {rootMargin:'-50% 0px -50% 0px'});
    sections.forEach(s=>obs.observe(s));
  }

  function setupAccordion(){
    document.querySelectorAll('.card .toggle').forEach(btn=>{
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });
  }

  function setupLifecycle(){
    const rail = document.querySelector('#skills .rail');
    if(!rail) return;
    const tabs = Array.from(rail.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('#skills [role="tabpanel"]'));

    const ids = tabs.map(t=>t.id.replace('tab-',''));
    function activate(id){
      tabs.forEach(t=>{
        const sel = t.id === `tab-${id}`;
        t.setAttribute('aria-selected', sel);
      });
      panels.forEach(p=>{
        const active = p.id === `panel-${id}`;
        p.classList.toggle('is-active', active);
        p.hidden = !active;
      });
      history.replaceState(null, '', `#phase=${id}`);
    }

    tabs.forEach((tab,idx)=>{
      tab.addEventListener('click', ()=>activate(ids[idx]));
      tab.addEventListener('keydown', e=>{
        let i = idx;
        if(e.key === 'ArrowRight'){ e.preventDefault(); tabs[(i+1)%tabs.length].focus(); }
        else if(e.key === 'ArrowLeft'){ e.preventDefault(); tabs[(i-1+tabs.length)%tabs.length].focus(); }
        else if(e.key === 'Home'){ e.preventDefault(); tabs[0].focus(); }
        else if(e.key === 'End'){ e.preventDefault(); tabs[tabs.length-1].focus(); }
        else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(ids[i]); }
      });
    });

    const param = new URLSearchParams(location.hash.replace('#','')).get('phase');
    const start = ids.includes(param) ? param : ids[0];
    activate(start);
  }
})();

