(function(){
  document.addEventListener('DOMContentLoaded',()=>{
    document.documentElement.classList.add('js');

    document.querySelectorAll('.card .toggle').forEach(btn=>{
      const panel=document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click',()=>{
        const expanded=btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded',String(!expanded));
        panel.hidden=expanded;
      });
    });

    const tabs=[...document.querySelectorAll('[role="tab"]')];
    const panels=[...document.querySelectorAll('[role="tabpanel"]')];
    const valid=['discover','define','build','validate','deliver'];

    function activate(id){
      tabs.forEach(t=>t.setAttribute('aria-selected',t.id==='tab-'+id?'true':'false'));
      panels.forEach(p=>{
        const isActive=p.id==='panel-'+id;
        p.classList.toggle('is-active',isActive);
        if(isActive){p.removeAttribute('hidden');}else{p.setAttribute('hidden','');}
      });
      if(location.hash!=='#phase='+id) history.replaceState(null,'','#phase='+id);
    }

    tabs.forEach((t,i)=>{
      t.addEventListener('click',()=>activate(t.id.replace('tab-','')));
      t.addEventListener('keydown',e=>{
        const k=e.key;
        if(k==='ArrowRight'||k==='ArrowLeft'||k==='Home'||k==='End'){
          e.preventDefault();
          let idx=i;
          if(k==='ArrowRight') idx=(i+1)%tabs.length;
          if(k==='ArrowLeft') idx=(i-1+tabs.length)%tabs.length;
          if(k==='Home') idx=0;
          if(k==='End') idx=tabs.length-1;
          tabs[idx].focus();
        }
        if(k==='Enter'||k===' '){e.preventDefault();activate(t.id.replace('tab-',''));}
      });
    });

    const hashId=(location.hash.match(/^#phase=([a-z]+)/)||[])[1];
    activate(valid.includes(hashId)?hashId:'discover');

    window.addEventListener('hashchange',()=>{
      const h=(location.hash.match(/^#phase=([a-z]+)/)||[])[1];
      if(valid.includes(h)) activate(h);
    });
  });
})();

