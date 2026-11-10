/* SIXRADAR — dependency-free launch hub. All content rendered locally; no analytics, ads or cookies are set by this code. */
(() => {
  'use strict';
  // Rockstar has confirmed release at midnight local time on Nov 19 in each region.
  const RELEASE = new Date(2026, 10, 19, 0, 0, 0, 0);
  const NOV_START = new Date(2026, 10, 1, 0, 0, 0, 0);
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const els = ['days','hours','minutes','seconds'].map($);
  const fmt = new Intl.DateTimeFormat('en-US', {timeZoneName:'short'});
  try { $('timezone-label').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_',' ').toUpperCase(); } catch (_e) { $('timezone-label').textContent = 'YOUR LOCAL TIME'; }
  function updateCountdown() {
    const now = new Date();
    const remaining = Math.max(0, RELEASE.getTime() - now.getTime());
    const seconds = Math.floor(remaining / 1000);
    const values = [Math.floor(seconds/86400),Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60];
    values.forEach((v,i) => { els[i].textContent = i === 0 ? String(v).padStart(2,'0') : pad(v); });
    const pct = Math.min(100, Math.max(0, ((now - NOV_START)/(RELEASE-NOV_START))*100));
    $('progress-fill').style.width = pct.toFixed(2) + '%';
    $('progress-pct').textContent = pct.toFixed(0) + '%';
    $('progressbar').setAttribute('aria-valuenow', pct.toFixed(0));
    if (remaining === 0) {
      $('countdown-note').innerHTML = 'The official <strong>midnight local-time launch</strong> has arrived! Check your console store for access.';
      $('countdown-heading').innerHTML = 'THE BIG<br/><em>DAY IS HERE.</em>';
    }
  }
  updateCountdown(); setInterval(updateCountdown, 1000);
  const menu = $('menu-toggle'), mobile = $('mobile-nav');
  menu.addEventListener('click', () => { const open = mobile.hidden; mobile.hidden = !open; menu.setAttribute('aria-expanded',String(open)); });
  mobile.querySelectorAll('a').forEach(a => a.addEventListener('click',() => {mobile.hidden = true;menu.setAttribute('aria-expanded','false');}));
  let toastTimeout;
  function toast(message) { const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),2700); }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch(_e) {
      try { const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok; } catch(_e2){return false;}
    }
  }
  async function shareWebsite() {
    const url = location.protocol==='file:' ? 'SIXRADAR — GTA VI release Nov 19, 2026' : location.href.split('#')[0];
    try { if(navigator.share && location.protocol !== 'file:') {await navigator.share({title:'GTA 6 Countdown | SixRadar',text:'The countdown to Vice City is on. 🌴',url});return;} } catch(e){if(e.name==='AbortError')return;}
    if(await copyText(url)) toast('Link copied — spread the hype!'); else toast('Share this page with your friends.');
  }
  $('share-header').addEventListener('click',shareWebsite); $('share-countdown').addEventListener('click',shareWebsite);
  $('copy-date').addEventListener('click',async()=>toast(await copyText('Grand Theft Auto VI — November 19, 2026 (PS5, Xbox Series X|S)')?'Release date copied!':'November 19, 2026'));
  const modal=$('video-modal'),player=$('video-player'),title=$('modal-title'),close=$('close-modal');let previousFocus=null;
  function openVideo(id,name){ previousFocus=document.activeElement;title.textContent=name;player.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0" title="'+escapeHtml(name)+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>'; modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');close.focus(); }
  function closeVideo(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');player.innerHTML='';document.body.classList.remove('modal-open');if(previousFocus)previousFocus.focus();}
  document.querySelectorAll('[data-video]').forEach(btn=>btn.addEventListener('click',()=>openVideo(btn.dataset.video,btn.dataset.title||'Official GTA VI trailer')));
  close.addEventListener('click',closeVideo);modal.querySelector('[data-close]').addEventListener('click',closeVideo);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeVideo();if(e.key==='Tab'&&modal.classList.contains('open')){e.preventDefault();close.focus();}});
})();
