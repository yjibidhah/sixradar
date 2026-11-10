/* SIXRADAR secondary pages: accessible mobile navigation and editorial filters */
(()=>{'use strict';
const btn=document.getElementById('menu-toggle'),nav=document.getElementById('mobile-nav');
if(btn&&nav){btn.addEventListener('click',()=>{const open=nav.hidden;nav.hidden=!open;btn.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;btn.setAttribute('aria-expanded','false')}));}
const buttons=[...document.querySelectorAll('[data-filter]')];
if(buttons.length){const cards=[...document.querySelectorAll('[data-kind]')];buttons.forEach(button=>button.addEventListener('click',()=>{
const selected=button.dataset.filter;buttons.forEach(b=>{const active=b===button;b.classList.toggle('filter-active',active);b.setAttribute('aria-pressed',String(active));});
cards.forEach(card=>{card.hidden=selected!=='all'&&card.dataset.kind!==selected;});}));}
})();