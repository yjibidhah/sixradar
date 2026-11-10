/* SixRadar verified GTA VI release time checker. All timezone rules come from the browser's Intl / IANA data. */
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const picker=byId("release-zone"),platform=byId("release-console");
  if(!picker||!platform)return;
  const local=byId("release-local"),zoneText=byId("release-zone-label"),device=byId("release-device"),preload=byId("preload-local"),status=byId("release-status");
  const numbers=["release-days","release-hours","release-mins","release-secs"].map(byId);
  const TARGET=Date.UTC(2026,10,19,0,0,0);
  const PS_PRE=Date.UTC(2026,10,10,0,0,0);
  const XBOX_PRE=Date.UTC(2026,10,10,0,0,0); // 00:00 GMT / UTC November 10
  let deviceZone="UTC";
  try {deviceZone=Intl.DateTimeFormat().resolvedOptions().timeZone||"UTC"}catch(_){}
  let releaseMs=TARGET,selectedZone=deviceZone,preloadMs=PS_PRE;
  const localFormat=(ms,tz)=>new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"}).format(new Date(ms));
  const partsFormatter=(tz)=>new Intl.DateTimeFormat("en-GB",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
  function partsAsUtc(ms,formatter){
    const p=Object.fromEntries(formatter.formatToParts(new Date(ms)).filter(o=>o.type!=="literal").map(o=>[o.type,Number(o.value)]));
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
  }
  // Resolve November 19 (or 10) 00:00 in a selected civil timezone to a real UTC timestamp.
  function midnightInZone(year,monthZero,day,tz){
    const target=Date.UTC(year,monthZero,day,0,0,0);
    let guess=target;
    const fmt=partsFormatter(tz);
    for(let i=0;i<5;i++){
      const delta=partsAsUtc(guess,fmt)-target;
      if(!delta) break;
      guess-=delta;
    }
    if(partsAsUtc(guess,fmt)!==target)throw new Error("Local midnight could not be resolved");
    return guess;
  }
  function getZone(){
    const val=picker.value;
    return val==="device"?deviceZone:val;
  }
  function refresh(){
    selectedZone=getZone();
    try{
      releaseMs=midnightInZone(2026,10,19,selectedZone);
      preloadMs=platform.value==="ps5"?midnightInZone(2026,10,10,selectedZone):XBOX_PRE;
      local.textContent=localFormat(releaseMs,selectedZone);
      zoneText.textContent="Timezone: "+selectedZone.replaceAll("_"," ")+". Official rule: midnight, Nov 19, 2026.";
      device.textContent=localFormat(releaseMs,deviceZone);
      preload.textContent=localFormat(preloadMs,selectedZone)+(platform.value==="xbox"?" (global Xbox 00:00 GMT start)":" (PS5 local-midnight start)");
      tick();
    }catch(e){
      releaseMs=NaN;
      local.textContent="Timezone unavailable";
      device.textContent="Please try a different city.";
      preload.textContent="Not available";
      status.textContent="Your browser cannot calculate this timezone. Try updating the browser or choose another city.";
    }
  }
  function tick(){
    if(!Number.isFinite(releaseMs))return;
    const diff=Math.max(0,releaseMs-Date.now());
    const t=Math.floor(diff/1000);
    const values=[Math.floor(t/86400),Math.floor(t%86400/3600),Math.floor(t%3600/60),t%60];
    numbers.forEach((el,i)=>{if(el)el.textContent=String(values[i]).padStart(2,"0")});
    status.textContent=diff===0?"The scheduled local release midnight has arrived. Check your official console store for access.":"Countdown to November 19 at 12:00 a.m. in "+selectedZone.replaceAll("_"," ")+".";
  }
  picker.addEventListener("change",refresh);
  platform.addEventListener("change",refresh);
  const copy=byId("copy-release");
  if(copy)copy.addEventListener("click",async()=>{
    const msg="GTA VI release (Rockstar official local-midnight rule): "+localFormat(releaseMs,selectedZone)+" in "+selectedZone+". On my device: "+localFormat(releaseMs,deviceZone)+". https://sixradar.pages.dev/gta-6-release-time.html";
    try{await navigator.clipboard.writeText(msg);copy.textContent="COPIED!";setTimeout(()=>{copy.textContent="COPY THIS RESULT"},1600)}
    catch(_){copy.textContent="COPY UNAVAILABLE";setTimeout(()=>{copy.textContent="COPY THIS RESULT"},1600)}
  });
  refresh();
  setInterval(tick,1000);
})();