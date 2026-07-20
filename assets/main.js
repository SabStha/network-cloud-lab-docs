(function(){
  // Highlight the current page in the sidebar
  var here = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav a')).forEach(function(a){
    if(a.getAttribute('data-page') === here){ a.classList.add('active'); }
  });

  // Persist checklist state across page visits
  var allBoxes = Array.prototype.slice.call(document.querySelectorAll('.check-list input[type="checkbox"]'));
  allBoxes.forEach(function(cb){
    var key = 'task-' + cb.id;
    if(localStorage.getItem(key) === '1'){ cb.checked = true; }
    cb.addEventListener('change', function(){
      localStorage.setItem(key, cb.checked ? '1' : '0');
      updateStatusChips();
    });
  });

  var phaseGroupsWithTasks = Array.prototype.slice.call(document.querySelectorAll('[data-phase]'));
  function updateStatusChips(){
    phaseGroupsWithTasks.forEach(function(g){
      var boxes = Array.prototype.slice.call(g.querySelectorAll('input[type="checkbox"]'));
      var d = boxes.filter(function(b){ return b.checked; }).length;
      var scope = g.closest('.page-card') || g.closest('.phase-card') || document;
      var chip = scope.querySelector('[data-status]');
      if(!chip) return;
      chip.classList.remove('st-todo','st-progress','st-done');
      if(d === 0){ chip.textContent = 'Not started'; chip.classList.add('st-todo'); }
      else if(d === boxes.length){ chip.textContent = 'Complete'; chip.classList.add('st-done'); }
      else { chip.textContent = d + '/' + boxes.length + ' done'; chip.classList.add('st-progress'); }
    });
  }
  updateStatusChips();

  // Step-by-step story (index page only)
  (function(){
    var slides = Array.prototype.slice.call(document.querySelectorAll('.story-slide'));
    if(!slides.length) return;
    var dotsWrap = document.getElementById('storyDots');
    var prevBtn = document.getElementById('storyPrev');
    var nextBtn = document.getElementById('storyNext');
    var current = 0;
    var dots = slides.map(function(_, i){
      var d = document.createElement('button');
      d.className = 'story-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to step ' + (i + 1) + ' of ' + slides.length);
      d.addEventListener('click', function(){ go(i); });
      dotsWrap.appendChild(d);
      return d;
    });
    function go(i){
      i = Math.max(0, Math.min(slides.length - 1, i));
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = i;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      prevBtn.disabled = (current === 0);
      nextBtn.disabled = (current === slides.length - 1);
    }
    prevBtn.addEventListener('click', function(){ go(current - 1); });
    nextBtn.addEventListener('click', function(){ go(current + 1); });
    document.getElementById('story').addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight') go(current + 1);
      if(e.key === 'ArrowLeft') go(current - 1);
    });
    var touchX = null;
    var viewport = document.getElementById('storyViewport');
    viewport.addEventListener('touchstart', function(e){ touchX = e.changedTouches[0].clientX; }, {passive:true});
    viewport.addEventListener('touchend', function(e){
      if(touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40){ dx < 0 ? go(current + 1) : go(current - 1); }
      touchX = null;
    }, {passive:true});
    go(0);
  })();

  // Interactive architecture chain (index page only)
  var archNodes = Array.prototype.slice.call(document.querySelectorAll('.arch-node'));
  var archPanel = document.getElementById('archPanel');
  var archCat = document.getElementById('archCat');
  var archTitle = document.getElementById('archTitle');
  var archDesc = document.getElementById('archDesc');
  archNodes.forEach(function(btn){
    btn.addEventListener('click', function(){
      archNodes.forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
      var nc = btn.style.getPropertyValue('--nc');
      var ncSoft = btn.style.getPropertyValue('--nc-soft');
      archPanel.style.setProperty('--nc', nc);
      archPanel.style.setProperty('--nc-soft', ncSoft);
      archPanel.style.background = 'var(--nc-soft)';
      archCat.textContent = btn.dataset.cat || '';
      archTitle.textContent = btn.dataset.title || '';
      archDesc.textContent = btn.dataset.desc || '';
    });
  });

  // Scroll-reveal — defensive: content must never stay invisible if this fails or is slow
  try {
    var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.page-card, .phase-nav-card, .kpi, .group-heading'));
    revealTargets.forEach(function(el){ el.classList.add('reveal'); });
    if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      var ro = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('visible'); ro.unobserve(e.target); }
        });
      }, { threshold:0.08, rootMargin:'0px 0px -40px 0px' });
      revealTargets.forEach(function(el){ ro.observe(el); });
    } else {
      revealTargets.forEach(function(el){ el.classList.add('visible'); });
    }
    // Safety net: whatever happens above, force everything visible shortly after load
    setTimeout(function(){
      revealTargets.forEach(function(el){ el.classList.add('visible'); });
    }, 1200);
  } catch(e) {
    Array.prototype.slice.call(document.querySelectorAll('.reveal')).forEach(function(el){ el.classList.add('visible'); });
  }
})();
