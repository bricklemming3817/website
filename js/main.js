(function(){
  document.addEventListener('DOMContentLoaded', () => {
    setupScroll();
    setupObserver();
    setupAccordion();
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
      const panel = btn.nextElementSibling;
      btn.setAttribute('aria-expanded','false');
      panel.hidden = true;
      btn.addEventListener('click', ()=>{
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });
  }
})();

