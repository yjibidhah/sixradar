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
      updateSharePreview();
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
  const shareButton=byId("share-native"),linkButton=byId("copy-share-link"),downloadButton=byId("download-share-card");
  const waLink=byId("share-whatsapp"),xLink=byId("share-x"),feedback=byId("share-feedback");
  const previewCity=byId("share-city"),previewPlatform=byId("share-platform"),previewTime=byId("share-time");
  const previewDate=byId("share-date"),previewCount=byId("share-countdown");
  const SHARE_PAGE="https://sixradar.pages.dev/gta-6-release-time";

  function applySharedSettings(){
    const query=new URLSearchParams(window.location.search);
    const tz=query.get("tz"),chosenPlatform=query.get("platform");
    // Keep shared links safe and portable. Never render arbitrary query strings as HTML.
    if(tz && tz.length<=64 && /^[A-Za-z0-9_+\-\/]+$/.test(tz)){
      try{
        new Intl.DateTimeFormat("en-US",{timeZone:tz});
        let opt=[...picker.options].find(o=>o.value===tz);
        if(!opt){
          opt=document.createElement("option");
          opt.value=tz;
          opt.textContent="Shared timezone / "+tz.split("/").pop().replaceAll("_"," ");
          picker.add(opt);
        }
        picker.value=tz;
      }catch(_){}
    }
    if(chosenPlatform==="ps5"||chosenPlatform==="xbox")platform.value=chosenPlatform;
  }
  function shareUrl(){
    const url=new URL(SHARE_PAGE);
    url.searchParams.set("tz",selectedZone);
    url.searchParams.set("platform",platform.value);
    url.hash="release-checker";
    return url.toString();
  }
  function cityLabel(){
    const opt=picker.selectedOptions[0];
    const text=opt?opt.textContent.trim():"";
    if(picker.value==="device")return selectedZone.split("/").pop().replaceAll("_"," ");
    if(text.startsWith("Shared timezone / "))return text.slice("Shared timezone / ".length);
    return (text.split(" / ")[0]||selectedZone).replaceAll("_"," ");
  }
  function platformLabel(){return platform.value==="ps5"?"PlayStation 5":"Xbox Series X|S";}
  function timeLabel(){
    return new Intl.DateTimeFormat("en-US",{timeZone:selectedZone,hour:"numeric",minute:"2-digit",hour12:true}).format(new Date(releaseMs));
  }
  function dateLabel(){
    return new Intl.DateTimeFormat("en-US",{timeZone:selectedZone,weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(new Date(releaseMs));
  }
  function remainingLabel(){
    const sec=Math.max(0,Math.floor((releaseMs-Date.now())/1000));
    if(!sec)return "THE LAUNCH MIDNIGHT HAS ARRIVED";
    return Math.floor(sec/86400)+" DAYS · "+Math.floor((sec%86400)/3600)+" HOURS · "+Math.floor((sec%3600)/60)+" MINUTES LEFT";
  }
  function shareMessage(){
    return "GTA VI unlocks in "+cityLabel()+" on "+platformLabel()+" at "+timeLabel()+" ("+dateLabel()+"). Check your own city's countdown:";
  }
  function updateSharePreview(){
    if(!Number.isFinite(releaseMs))return;
    if(previewCity)previewCity.textContent=cityLabel().toUpperCase();
    if(previewPlatform)previewPlatform.textContent=platformLabel().toUpperCase();
    if(previewTime)previewTime.textContent=timeLabel();
    if(previewDate)previewDate.textContent=dateLabel().toUpperCase();
    if(previewCount)previewCount.textContent=remainingLabel();
    if(waLink)waLink.href="https://wa.me/?text="+encodeURIComponent(shareMessage()+" "+shareUrl());
    if(xLink)xLink.href="https://twitter.com/intent/tweet?text="+encodeURIComponent(shareMessage())+"&url="+encodeURIComponent(shareUrl());
  }
  function announce(text){if(feedback)feedback.textContent=text;}
  async function copyText(value){
    if(navigator.clipboard && window.isSecureContext){
      try{await navigator.clipboard.writeText(value);return true;}catch(_){}
    }
    const temp=document.createElement("textarea");
    temp.value=value;
    temp.setAttribute("readonly","");
    temp.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(temp);
    temp.select();
    let ok=false;
    try{ok=document.execCommand("copy");}catch(_){}
    temp.remove();
    return ok;
  }
  function signalCopy(button,ok,original){
    if(button){button.textContent=ok?"COPIED!":"COPY UNAVAILABLE";setTimeout(()=>{button.textContent=original;},2000);}
  }
  if(copy)copy.addEventListener("click",async()=>{
    if(!Number.isFinite(releaseMs))return;
    const message=shareMessage()+" "+shareUrl();
    const ok=await copyText(message);
    signalCopy(copy,ok,"COPY THIS RESULT");
    announce(ok?"Release time and personal link copied.":"Couldn't copy automatically. Use your browser's share menu.");
  });
  if(linkButton)linkButton.addEventListener("click",async()=>{
    if(!Number.isFinite(releaseMs))return;
    const ok=await copyText(shareUrl());
    signalCopy(linkButton,ok,"COPY PERSONAL LINK");
    announce(ok?"Personal link copied. Your selected city and console are saved in it.":"Automatic copying isn't supported in this browser.");
  });
  if(shareButton)shareButton.addEventListener("click",async()=>{
    if(!Number.isFinite(releaseMs))return;
    const url=shareUrl();
    if(typeof navigator.share==="function"){
      try{
        await navigator.share({title:"My GTA VI release countdown | SixRadar",text:shareMessage(),url});
        announce("Shared your countdown.");
        return;
      }catch(error){
        if(error && error.name==="AbortError")return;
      }
    }
    const ok=await copyText(shareMessage()+" "+url);
    announce(ok?"Share text and personal link copied. Paste them into your favorite app.":"Choose WhatsApp, X, or copy the link manually from the address bar.");
  });
  function drawShareCard(){
    const c=document.createElement("canvas");
    c.width=1200;c.height=630;
    const ctx=c.getContext("2d");
    if(!ctx)throw new Error("Canvas unsupported");
    const grad=ctx.createLinearGradient(0,0,1200,630);
    grad.addColorStop(0,"#1c1730");grad.addColorStop(.55,"#0a1728");grad.addColorStop(1,"#12101e");
    ctx.fillStyle=grad;ctx.fillRect(0,0,1200,630);
    const glow=ctx.createRadialGradient(870,160,20,870,160,590);
    glow.addColorStop(0,"rgba(252,72,151,.35)");glow.addColorStop(1,"rgba(252,72,151,0)");
    ctx.fillStyle=glow;ctx.fillRect(0,0,1200,630);
    ctx.strokeStyle="rgba(92,228,233,.11)";ctx.lineWidth=1;
    for(let x=-300;x<1500;x+=90){ctx.beginPath();ctx.moveTo(x,630);ctx.lineTo(x+220,200);ctx.stroke();}
    ctx.strokeStyle="rgba(255,255,255,.13)";ctx.strokeRect(34,34,1132,562);
    ctx.fillStyle="#ff4b9a";ctx.fillRect(62,59,57,5);
    ctx.font="800 35px Arial, sans-serif";ctx.fillStyle="#ffffff";ctx.fillText("SIX",62,110);
    ctx.fillStyle="#ff4b9a";ctx.fillText("RADAR",121,110);
    ctx.font="700 22px Arial, sans-serif";ctx.fillStyle="#72e5ee";ctx.fillText("MY GTA VI LAUNCH TIME",64,169);
    function fit(text,maxSize,maxWidth){
      let size=maxSize;
      while(size>34){ctx.font="900 "+size+"px Arial, sans-serif";if(ctx.measureText(text).width<=maxWidth)break;size-=2;}
      return size;
    }
    const city=cityLabel().toUpperCase();
    ctx.fillStyle="#ffffff";ctx.font="900 "+fit(city,95,1068)+"px Arial, sans-serif";ctx.fillText(city,60,280);
    ctx.fillStyle="#f8d5e7";ctx.font="800 27px Arial, sans-serif";ctx.fillText(platformLabel().toUpperCase(),64,328);
    ctx.fillStyle="#ff4b9a";ctx.font="900 92px Arial, sans-serif";ctx.fillText(timeLabel().toUpperCase(),58,434);
    const formattedDate=dateLabel().toUpperCase();
    ctx.fillStyle="#ffffff";ctx.font="700 26px Arial, sans-serif";ctx.fillText(formattedDate,65,473);
    ctx.fillStyle="#78e5e9";ctx.font="700 23px Arial, sans-serif";ctx.fillText(remainingLabel(),65,525);
    ctx.fillStyle="rgba(255,255,255,.65)";ctx.font="600 17px Arial, sans-serif";
    ctx.fillText("SIXRADAR.PAGES.DEV/GTA-6-RELEASE-TIME",64,568);
    ctx.textAlign="right";ctx.fillText("UNOFFICIAL FAN TOOL",1136,568);ctx.textAlign="left";
    return c;
  }
  if(downloadButton)downloadButton.addEventListener("click",()=>{
    if(!Number.isFinite(releaseMs))return;
    try{
      const card=drawShareCard();
      card.toBlob(blob=>{
        if(!blob){announce("Unable to prepare an image in this browser.");return;}
        const objectUrl=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=objectUrl;
        a.download="sixradar-gta6-"+selectedZone.split("/").pop().toLowerCase().replaceAll(/[^a-z0-9-]/g,"-")+".png";
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(objectUrl),3000);
        announce("Your GTA VI countdown image is ready to share.");
      },"image/png");
    }catch(_){announce("Your browser couldn't generate the image. Try a modern browser.");}
  });
  applySharedSettings();
  refresh();
  setInterval(()=>{tick();if(previewCount&&Number.isFinite(releaseMs))previewCount.textContent=remainingLabel();},1000);
})();
