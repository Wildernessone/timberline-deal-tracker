import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://jcmkoooivghwrgezxode.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbWtvb29pdmdod3JnZXp4b2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk4NjUsImV4cCI6MjA5NDA4NTg2NX0.mQJjh11x9nGen8KLYYwLLuHcm8Oyc89Nat9kwBxe3kA";
const timberlineStorage = {
  getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { /* ignore */ } },
  removeItem: (key) => { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    storageKey: "timberline-auth",
    storage: timberlineStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "implicit",
  }
});
const SB_H = {"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY};

function sbGet(table,params){
  const url=new URL(SB_URL+"/rest/v1/"+table);
  if(params)Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  return fetch(url,{headers:SB_H}).then(r=>r.json());
}

async function loadFamily(userId, token) {
  const r = await fetch(SB_URL+"/rest/v1/family_members?user_id=eq."+userId+"&order=sort_order.asc", {
    headers:{apikey:SB_KEY, Authorization:"Bearer "+token}
  });
  return r.json();
}

async function saveFamily(members, userId) {
  if (!members.length) return;
  const rows = members.map((m,i) => ({
    user_id:userId, name:m.name, gender:m.gender||"mens",
    jacket:m.jacket||"L", shirt:m.shirt||"L", base:m.base||"L", pants:m.pants||"34x32",
    boots:m.boots||"10", gloves:m.gloves||"L", socks:m.socks||"L", beanie:m.beanie||"L",
    sort_order:i,
  }));
  await supabase.from("family_members").upsert(rows, {onConflict:"user_id,name"});
}
function parseDeal(row){
  const orig=Math.round(parseFloat(row.orig_price)*100)/100;
  const sale=Math.round(parseFloat(row.sale_price)*100)/100;
  return {
    id:row.id,brand:row.brand,product:row.product,portal:row.portal,
    cat:row.cat,orig:orig,sale:sale,
    coupon:row.coupon,fake:row.fake_sale,fakeNote:row.fake_note,
    url:row.url,blurb:row.blurb,tags:[],
    sizes:{mens:row.sizes_mens||[],womens:row.sizes_womens||[],youth:row.sizes_youth||[]},
    history:[orig,sale],
  };
}
const CAT_TO_FIELDS = {
  insulation:["jacket"], jacket:["jacket"], windlayer:["jacket"],
  clothing:["jacket","shirt"], shirt:["shirt"],
  baselayer:["base"], base:["base"],
  pants:["pants"], bibs:["pants"], waders:["pants"],
  boots:["boots"],
  gloves:["gloves"],
  socks:["socks"],
  beanie:["beanie"], hat:["beanie"],
};
function fieldsForCat(cat){
  const c=(cat||"").toLowerCase().replace(/[^a-z]/g,"");
  for(const k in CAT_TO_FIELDS){if(c===k||c.includes(k))return CAT_TO_FIELDS[k];}
  return null;
}
function computeTags(deal, family){
  const fields=fieldsForCat(deal.cat);
  if(!fields) return family.map(m=>m.name);
  return family.filter(m=>{
    const ds=deal.sizes[m.gender]||[];
    if(!ds.length) return false;
    return fields.some(f=>m[f]&&ds.includes(m[f]));
  }).map(m=>m.name);
}
function parseCoupon(row){
  return {
    id:row.id,brand:row.brand,code:row.code,discount:row.discount,
    portal:row.portal,url:row.url,verified:row.verified,
    expires:row.expires_at?new Date(row.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"Soon",
  };
}

const MC = ["#2d6a4f","#1d4e89","#7b2d8b","#b5451b"];

const HUNT_TYPES = [
  {id:"whitetail",label:"Whitetail",icon:"🌳"},
  {id:"elk",label:"Elk",icon:"🦌"},
  {id:"muledeer",label:"Mule Deer",icon:"🏔"},
  {id:"waterfowl",label:"Waterfowl",icon:"🦆"},
  {id:"turkey",label:"Turkey",icon:"🦃"},
  {id:"archery",label:"Archery",icon:"🏹"},
  {id:"predator",label:"Predator",icon:"🐺"},
  {id:"upland",label:"Upland",icon:"🐦"},
];

const GEAR_CATS = [
  {id:"clothing",label:"Clothing",icon:"🧥"},
  {id:"optics",label:"Optics",icon:"🔭"},
  {id:"trailcams",label:"Trail Cams",icon:"📷"},
  {id:"boots",label:"Boots",icon:"🥾"},
  {id:"packs",label:"Packs",icon:"🎒"},
  {id:"electronics",label:"Electronics",icon:"📡"},
  {id:"knives",label:"Knives",icon:"🔪"},
];

const ALL_BRANDS = [
  "Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock",
  "Kings Camo","Drake","Avery","Banded","Browning",
  "Vortex","Leupold","Bushnell",
  "Stealth Cam","Reconyx","Tactacam",
  "Hoyt","Mathews",
  "Danner","LaCrosse","Muck",
  "Kifaru","Mystery Ranch",
  "Garmin","onX","GoHunt",
  "Cabelas","Bass Pro","BlackOvis","Scheels","Sportsmans Warehouse",
];

const STORES = [
  {id:"sitka",name:"Sitka",freeAt:199,ship:8,loyalty:null,cat:"boutique"},
  {id:"firstlite",name:"First Lite",freeAt:75,ship:7,loyalty:null,cat:"boutique"},
  {id:"kuiu",name:"Kuiu",freeAt:99,ship:8,loyalty:null,cat:"boutique"},
  {id:"stoneglacier",name:"Stone Glacier",freeAt:100,ship:8,cat:"boutique",loyalty:null},
  {id:"eberlestock",name:"Eberlestock",freeAt:75,ship:7,loyalty:null,cat:"boutique"},
  {
    id:"gohunt",name:"GoHunt Gear",freeAt:99,ship:9,cat:"specialty",
    loyalty:{name:"GoHunt Points",desc:"5% back in GoHunt points"},
  },
  {
    id:"blackovis",name:"BlackOvis",freeAt:99,ship:8,cat:"specialty",
    loyalty:{name:"Rewards",desc:"3% back in store credit"},
  },
  {
    id:"cabelas",name:"Cabelas",freeAt:50,ship:8,cat:"bigbox",
    loyalty:{name:"CLUB Points",desc:"2% back in CLUB points"},
  },
  {
    id:"basspro",name:"Bass Pro",freeAt:50,ship:8,cat:"bigbox",
    loyalty:{name:"Rewards",desc:"2% back in rewards"},
  },
  {
    id:"scheels",name:"Scheels",freeAt:50,ship:7,cat:"bigbox",
    loyalty:{name:"Gold Card",desc:"1% back in Gold"},
  },
  {id:"sportsmans",name:"Sportsmans Warehouse",freeAt:50,ship:7,cat:"bigbox",loyalty:null},
];

const PORTALS = {
  timberline:{
    name:"Timberline Deal Tracker",tagline:"Western - Elk - Backcountry",
    accent:"#2d6a4f",icon:"🏔",
    brands:["Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock","Kings Camo","Kifaru","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","GoHunt"],
    stores:["sitka","firstlite","kuiu","stoneglacier","eberlestock","gohunt","blackovis","cabelas","basspro","scheels","sportsmans"],
    searchHint:'Try "Sitka Kelvin Down" or "Vortex Razor HD 10x42"...',
    dealCats:["Insulation","Base Layer","Wind Layer","Pants","Bibs","Packs","Optics","Boots"],
    searchContext:"western hunting, elk, mule deer, backcountry, high country, pack-in, high altitude",
  },
  treestand:{
    name:"Treestand Saver",tagline:"Whitetail - Eastern - Food Plot",
    accent:"#7a4f1d",icon:"🌳",
    brands:["Realtree","Mossy Oak","Browning","Danner","LaCrosse","Muck","Stealth Cam","Reconyx","Tactacam","Hoyt","Mathews","Bear Archery","Cabelas","Bass Pro"],
    stores:["cabelas","basspro","scheels","sportsmans","blackovis"],
    searchHint:'Try "Mathews Phase4" or "Stealth Cam Fusion X"...',
    dealCats:["Clothing","Boots","Trail Cams","Archery","Treestands","Food Plot","Optics","Knives"],
    searchContext:"whitetail deer hunting, eastern hunting, treestands, food plots, archery, trail cameras, bow hunting",
  },
  blind:{
    name:"Duck Blind Deals",tagline:"Waterfowl - Duck - Goose",
    accent:"#1d4e89",icon:"🦆",
    brands:["Drake","Avery","Banded","Browning","Mossy Oak","Realtree","LaCrosse","Muck","Garmin"],
    stores:["cabelas","basspro","scheels","sportsmans"],
    searchHint:'Try "Drake MST Fleece" or "Banded RedZone waders"...',
    dealCats:["Waders","Clothing","Calls","Decoys","Blinds","Boats","Electronics","Boots"],
    searchContext:"waterfowl hunting, duck hunting, goose hunting, waders, decoys, calls, blinds, layout blinds",
  },
};

const LIGHT = {
  bg:"#f5f2ea",bgCard:"rgba(255,255,255,0.85)",bgSolid:"#ffffff",
  bgHeader:"rgba(250,248,242,0.94)",border:"#e2dbd0",borderHov:"#b7e4c7",
  text:"#1a1a14",textSub:"#6b6b5a",textMuted:"#a8a898",
  accent:"#2d6a4f",accentLight:"#edf7f1",accentBorder:"#b7e4c7",
  orange:"#d4813a",orangeLight:"#fff8ee",orangeBorder:"#f5c88a",
  red:"#c0392b",redLight:"#fdf0ee",redBorder:"#f5c6c0",
  topo:"#c4b48e",topoOp:0.55,navActive:"#edf7f1",
  shadow:"rgba(0,0,0,0.07)",shadowHov:"rgba(0,0,0,0.13)",toggle:"🌙",
};
const DARK = {
  bg:"#0f1409",bgCard:"rgba(20,26,10,0.9)",bgSolid:"#141a0a",
  bgHeader:"rgba(10,14,5,0.95)",border:"#2a3518",borderHov:"#3d6644",
  text:"#e8e4d0",textSub:"#8a9870",textMuted:"#4a5a38",
  accent:"#52b788",accentLight:"#0d2018",accentBorder:"#2a5a38",
  orange:"#e8a44a",orangeLight:"#1a1000",orangeBorder:"#6a4a10",
  red:"#e05a3a",redLight:"#1a0800",redBorder:"#6a2010",
  topo:"#4a6830",topoOp:0.45,navActive:"#0d2018",
  shadow:"rgba(0,0,0,0.4)",shadowHov:"rgba(0,0,0,0.6)",toggle:"☀️",
};

const INIT_FAMILY = [];

const SIZE_OPTIONS = {
  jacket: ["XS","S","M","L","XL","2XL","3XL","YXS","YS","YM","YL","YXL"],
  shirt:  ["XS","S","M","L","XL","2XL","3XL","YXS","YS","YM","YL","YXL"],
  base:   ["XS","S","M","L","XL","2XL","3XL","YXS","YS","YM","YL","YXL"],
  pants: [
    "28x28","28x30","28x32",
    "30x28","30x30","30x32","30x34",
    "32x28","32x30","32x32","32x34","32x36",
    "34x28","34x30","34x32","34x34","34x36",
    "36x30","36x32","36x34","36x36",
    "38x30","38x32","38x34","38x36",
    "40x30","40x32","40x34","40x36",
    "0","2","4","6","8","10","12","14","16","18",
    "YXS","YS","YM","YL","YXL",
  ],
  boots: ["4","4.5","5","5.5","6","6.5","7","7.5","8","8.5","9","9.5","10","10.5","11","11.5","12","12.5","13","14","15"],
  gloves: ["XS","S","M","L","XL","2XL","YS","YM","YL"],
  socks:  ["XS","S","M","L","XL","2XL","YS","YM","YL"],
  beanie: ["XS","S","M","L","XL","YS","YM","YL"],
};


const TOPO_D = [
  "M0,380 C120,340 280,400 440,360 C600,320 720,370 900,338 C1080,306 1160,340 1300,318",
  "M0,320 C120,282 280,338 440,300 C600,262 720,310 900,280 C1080,250 1160,282 1300,260",
  "M0,265 C120,229 280,282 440,246 C600,210 720,256 900,228 C1080,200 1160,230 1300,208",
  "M0,215 C120,181 280,232 440,197 C600,162 720,206 900,180 C1080,154 1160,182 1300,162",
  "M0,170 C120,138 280,186 440,153 C600,120 720,162 900,138 C1080,114 1160,138 1300,120",
  "M0,130 C120,100 280,144 440,114 C600,84 720,124 900,102 C1080,80 1160,100 1300,84",
  "M0,96 C120,68 280,108 440,80 C600,52 720,90 900,70 C1080,50 1160,68 1300,54",
  "M0,430 C120,396 280,456 440,418 C600,380 720,428 900,396 C1080,364 1160,396 1300,374",
];

const API_URL = "https://claude-proxy.jamesreed.workers.dev/timberline";
const AI_MODEL = "claude-haiku-4-5-20251001";

function callAI(prompt, maxTok) {
  return fetch(API_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:AI_MODEL,
      max_tokens:maxTok||600,
      messages:[{role:"user",content:prompt}],
    }),
  })
  .then(r=>r.json())
  .then(d=>{
    const txt=(d.content&&d.content[0]&&d.content[0].text)||"{}";
    return JSON.parse(txt.replace(/```json|```/g,"").trim());
  });
}

function TopoBG({T}) {
  return (
    <svg
      style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1300 600"
    >
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.topo} stopOpacity={T.topoOp*0.6}/>
          <stop offset="50%" stopColor={T.topo} stopOpacity={T.topoOp}/>
          <stop offset="100%" stopColor={T.topo} stopOpacity={T.topoOp*0.3}/>
        </linearGradient>
      </defs>
      {TOPO_D.map((d,i)=>(
        <path
          key={i} d={d} fill="none"
          stroke="url(#tg)"
          strokeWidth={i%4===0?"1.4":"0.75"}
          opacity={i%4===0?1:0.7}
        />
      ))}
    </svg>
  );
}

function Spark({history,fake,T}) {
  const max=Math.max(...history);
  const min=Math.min(...history);
  const W=150,H=42,P=5;
  const pts=history.map((v,i)=>[
    P+(i/(history.length-1))*(W-P*2),
    P+(1-(v-min)/(max-min||1))*(H-P*2),
  ]);
  const poly=pts.map(p=>p.join(",")).join(" ");
  const lx=pts[pts.length-1][0];
  const ly=pts[pts.length-1][1];
  const col=fake?T.red:T.accent;
  const gid=fake?"sfake":"sreal";
  return (
    <svg width={W} height={H} style={{display:"block"}}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`${pts[0][0]},${H} ${poly} ${lx},${H}`} fill={`url(#${gid})`}/>
      <polyline points={poly} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx={lx} cy={ly} r="3.5" fill={col} stroke={T.bgSolid} strokeWidth="1.5"/>
    </svg>
  );
}

function VideoPanel({deal,T}) {
  const [vids,setVids]=useState(null);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState("manufacturer");
  const dealId=deal?deal.id:null;
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(()=>{
    if(!deal)return;
    setVids(null);
    setLoading(true);
    const prompt=[
      "Hunting gear video curator.",
      "MINDFUL HUNTER PRIORITY: Jay Nichol covers Sitka/Kuiu/Stone Glacier/First Lite.",
      "Product: "+deal.brand+" "+deal.product,
      "Return ONLY valid JSON:",
      '{"manufacturer":{"title":"t","channel":"c","duration":"M:SS","views":"48K","youtubeId":"dQw4w9WgXcQ","snippet":"s"},"review":{"title":"t","channel":"c","duration":"M:SS","views":"287K","youtubeId":"jNQXAC9IVRw","snippet":"s","isMindfulHunter":true,"reviewerNote":"r"}}',
    ].join("\n");
    callAI(prompt,500).then(d=>setVids(d)).catch(()=>setVids(null)).finally(()=>setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dealId]);
  /* eslint-enable react-hooks/set-state-in-effect */
  if(loading)return <div style={{height:80,background:T.border,borderRadius:10,marginBottom:24,opacity:0.4}}/>;
  if(!vids)return null;
  const active=tab==="manufacturer"?vids.manufacturer:vids.review;
  const VTABS=[
    {key:"manufacturer",icon:"🎬",label:"Official Video",col:T.accent},
    {key:"review",icon:"⭐",label:"Top Review",col:T.orange},
  ];
  return (
    <div style={{marginBottom:24}}>
      <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:10,fontFamily:"monospace"}}>
        FIELD INTEL
      </div>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {VTABS.map(t=>(
          <button
            key={t.key}
            onClick={()=>setTab(t.key)}
            style={{
              padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",
              fontSize:12,fontWeight:600,transition:"all 0.15s",
              background:tab===t.key?t.col:T.border,
              color:tab===t.key?"white":T.textSub,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {active&&(
        <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
          <div style={{position:"relative",paddingBottom:"52%"}}>
            <iframe
              src={"https://www.youtube.com/embed/"+active.youtubeId+"?modestbranding=1&rel=0"}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div style={{padding:"12px 16px"}}>
            <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>{active.title}</div>
            <div style={{display:"flex",gap:10,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:600,color:tab==="manufacturer"?T.accent:T.orange}}>
                {active.channel}
                {active.isMindfulHunter&&(
                  <span style={{marginLeft:6,background:T.orangeLight,color:T.orange,border:`1px solid ${T.orangeBorder}`,borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>
                    Recommended
                  </span>
                )}
              </span>
              <span style={{fontSize:11,color:T.textMuted}}>{active.duration}</span>
              <span style={{fontSize:11,color:T.textMuted}}>{active.views} views</span>
            </div>
            <p style={{fontSize:12,color:T.textSub,margin:0,lineHeight:1.6}}>{active.snippet}</p>
            {active.reviewerNote&&(
              <div style={{marginTop:6,fontSize:11,color:T.textMuted,fontStyle:"italic"}}>
                {active.isMindfulHunter?"🎯 ":"📈 "}{active.reviewerNote}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function SizePicker({field, value, onChange, T, col}) {
  const opts = SIZE_OPTIONS[field] || [];
  const [open, setOpen] = useState(false);
  const cur = opts.includes(value) ? value : (opts[0] || value);
  return (
    <div style={{position:"relative"}}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background:T.bgSolid,border:`1px solid ${open ? col : T.border}`,
          borderRadius:7,padding:"4px 10px",
          width:90,textAlign:"center",
          fontSize:13,fontWeight:700,color:col,
          cursor:"pointer",fontFamily:"inherit",
          display:"flex",alignItems:"center",justifyContent:"center",gap:4,
        }}
      >
        {cur}
        <span style={{fontSize:9,opacity:0.6}}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{
          position:"absolute",right:0,top:"calc(100% + 4px)",
          background:T.bgSolid,border:`1px solid ${T.border}`,
          borderRadius:10,zIndex:500,
          boxShadow:`0 8px 32px rgba(0,0,0,0.18)`,
          maxHeight:200,overflowY:"auto",minWidth:90,
        }}>
          {opts.map((opt, i) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding:"8px 14px",cursor:"pointer",
                fontSize:13,fontWeight:opt===cur?700:500,
                color:opt===cur?col:T.text,
                background:opt===cur?col+"18":"transparent",
                borderBottom:i<opts.length-1?`1px solid ${T.border}`:"none",
                textAlign:"center",
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function DealCard({d,family,memberFilter,onOpen,T}) {
  const [hov,setHov]=useState(false);
  const disc=Math.round((1-d.sale/d.orig)*100);
  const save=d.orig-d.sale;
  const tags=memberFilter==="All"?d.tags:d.tags.filter(t=>t===memberFilter);
  if(memberFilter!=="All"&&tags.length===0)return null;
  return (
    <div
      onClick={()=>onOpen(d)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background:T.bgCard,backdropFilter:"blur(12px)",borderRadius:14,
        cursor:"pointer",overflow:"hidden",position:"relative",zIndex:1,
        transition:"all 0.2s",transform:hov?"translateY(-2px)":"none",
        border:`1px solid ${d.fake?T.redBorder:hov?T.borderHov:T.border}`,
        boxShadow:hov?`0 16px 48px ${T.shadowHov}`:`0 2px 12px ${T.shadow}`,
      }}
    >
      <div style={{height:3,background:d.fake?"linear-gradient(90deg,#e74c3c,#c0392b)":"linear-gradient(90deg,#2d6a4f,#52b788)"}}/>
      <div style={{padding:"18px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"0.12em",fontFamily:"monospace"}}>{d.brand.toUpperCase()}</span>
            <span style={{color:T.border}}>|</span>
            <span style={{fontSize:10,color:T.textMuted,letterSpacing:"0.08em",fontFamily:"monospace"}}>{d.cat.toUpperCase()}</span>
          </div>
          {d.fake?(
            <span style={{background:T.redLight,color:T.red,border:`1px solid ${T.redBorder}`,borderRadius:6,fontSize:10,fontWeight:700,padding:"3px 8px"}}>FAKE SALE</span>
          ):(
            <span style={{background:T.accentLight,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:6,fontSize:10,fontWeight:700,padding:"3px 8px"}}>-{disc}% OFF</span>
          )}
        </div>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:19,color:T.text,lineHeight:1.25,marginBottom:10}}>{d.product}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
          <span style={{fontWeight:800,fontSize:26,color:d.fake?T.red:T.text}}>${d.sale}</span>
          <span style={{fontSize:15,color:T.textMuted,textDecoration:"line-through"}}>${d.orig}</span>
          <span style={{fontSize:12,fontWeight:600,color:d.fake?T.red:T.accent}}>Save ${save}</span>
        </div>
        {d.fake&&(
          <div style={{background:T.redLight,border:`1px solid ${T.redBorder}`,borderRadius:8,padding:"8px 12px",marginBottom:10}}>
            <span style={{color:T.red,fontSize:12}}>{d.fakeNote}</span>
          </div>
        )}
        <p style={{fontSize:12,color:T.textSub,margin:"0 0 12px",lineHeight:1.65}}>{d.blurb}</p>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:T.textMuted,letterSpacing:"0.1em",marginBottom:5,fontFamily:"monospace"}}>PRICE HISTORY</div>
          <Spark history={d.history} fake={d.fake} T={T}/>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
          {tags.map(tag=>{
            const idx=family.findIndex(f=>f.name===tag);
            const col=MC[idx%MC.length];
            return (
              <span key={tag} style={{background:col+"18",color:col,border:`1px solid ${col}33`,borderRadius:999,padding:"2px 10px",fontSize:11,fontWeight:600}}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{margin:"14px 0 0",padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {[...d.sizes.mens,...d.sizes.womens,...d.sizes.youth].slice(0,4).map(sz=>(
            <span key={sz} style={{background:T.bgSolid,border:`1px solid ${T.border}`,borderRadius:5,padding:"2px 7px",fontSize:10,color:T.textSub,fontWeight:600}}>{sz}</span>
          ))}
        </div>
        <a
          href={d.url} target="_blank" rel="noopener noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{color:"white",borderRadius:8,padding:"7px 16px",fontSize:12,fontWeight:700,textDecoration:"none",background:d.fake?T.red:T.accent}}
        >
          {d.fake?"View anyway":"Shop Now"}
        </a>
      </div>
      {d.coupon&&(
        <div style={{padding:"8px 20px 12px",borderTop:`1px dashed ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:T.orange}}>Coupon:</span>
          <code style={{background:T.orangeLight,color:T.orange,border:`1px dashed ${T.orangeBorder}`,borderRadius:5,padding:"2px 10px",fontSize:12,fontWeight:700,letterSpacing:"0.1em"}}>{d.coupon}</code>
        </div>
      )}
    </div>
  );
}

function DealModal({deal,family,T,onClose}) {
  if(!deal)return null;
  const disc=Math.round((1-deal.sale/deal.orig)*100);
  const save=deal.orig-deal.sale;
  return (
    <div
      style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(6px)"}}
      onClick={onClose}
    >
      <div
        style={{background:T.bgSolid,borderRadius:20,maxWidth:580,width:"100%",maxHeight:"90vh",overflowY:"auto",border:`1px solid ${T.border}`,boxShadow:`0 32px 80px ${T.shadowHov}`}}
        onClick={e=>e.stopPropagation()}
      >
        <div style={{height:4,borderRadius:"20px 20px 0 0",background:deal.fake?"linear-gradient(90deg,#e74c3c,#c0392b)":"linear-gradient(90deg,#2d6a4f,#52b788)"}}/>
        <div style={{padding:"24px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:6}}>
                {deal.brand.toUpperCase()} | {deal.cat.toUpperCase()}
              </div>
              <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:26,color:T.text,lineHeight:1.2}}>{deal.product}</div>
            </div>
            <button onClick={onClose} style={{background:T.border,border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16,color:T.textSub,flexShrink:0}}>x</button>
          </div>
          {deal.fake&&(
            <div style={{background:T.redLight,border:`1px solid ${T.redBorder}`,borderRadius:10,padding:"12px 16px",marginBottom:20}}>
              <div style={{color:T.red,fontWeight:700,fontSize:13,marginBottom:4}}>Price Manipulation Detected</div>
              <div style={{color:T.red,fontSize:12,opacity:0.85}}>{deal.fakeNote}</div>
            </div>
          )}
          <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:20}}>
            <span style={{fontWeight:900,fontSize:42,color:deal.fake?T.red:T.text}}>${deal.sale}</span>
            <span style={{fontSize:22,color:T.textMuted,textDecoration:"line-through"}}>${deal.orig}</span>
            {!deal.fake&&<span style={{fontSize:14,color:T.accent,fontWeight:700}}>Save ${save} ({disc}% off)</span>}
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"monospace"}}>PRICE HISTORY</div>
            <Spark history={deal.history} fake={deal.fake} T={T}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textMuted,marginTop:4,fontFamily:"monospace"}}>
              <span>FIRST TRACKED</span><span>TODAY</span>
            </div>
          </div>
          <VideoPanel deal={deal} T={T}/>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"monospace"}}>SIZES IN STOCK</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[...deal.sizes.mens,...deal.sizes.womens,...deal.sizes.youth].map(sz=>(
                <span key={sz} style={{background:T.border,borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:600,color:T.textSub}}>{sz}</span>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"monospace"}}>FOR YOUR FAMILY</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {deal.tags.map(tag=>{
                const idx=family.findIndex(f=>f.name===tag);
                const col=MC[idx%MC.length];
                return <span key={tag} style={{background:col+"18",color:col,border:`1px solid ${col}33`,borderRadius:999,padding:"4px 14px",fontSize:12,fontWeight:600}}>{tag}</span>;
              })}
            </div>
          </div>
          {deal.coupon&&(
            <div style={{background:T.orangeLight,border:`1px dashed ${T.orangeBorder}`,borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <span style={{color:T.orange,fontSize:11,fontWeight:600,fontFamily:"monospace"}}>COUPON</span>
              <code style={{color:T.orange,fontSize:20,fontWeight:800,letterSpacing:"0.15em"}}>{deal.coupon}</code>
            </div>
          )}
          <a
            href={deal.url} target="_blank" rel="noopener noreferrer"
            style={{display:"block",width:"100%",textAlign:"center",color:"white",borderRadius:12,padding:"15px",fontSize:16,fontWeight:700,textDecoration:"none",background:deal.fake?T.red:T.accent}}
          >
            {deal.fake?"View on "+deal.brand+" (proceed with caution)":"Shop "+deal.brand+" -- $"+deal.sale}
          </a>
          <p style={{textAlign:"center",color:T.textMuted,fontSize:10,marginTop:8,fontFamily:"monospace"}}>
            Timberline earns a small commission -- never affects your price
          </p>
        </div>
      </div>
    </div>
  );
}

function GearAdvisor({member,deals,T}) {
  const [recs,setRecs]=useState(null);
  const [loading,setLoading]=useState(false);
  const [open,setOpen]=useState(false);
  const PRIOS={high:T.red,medium:T.orange,low:T.accent};
  const fetch_recs=()=>{
    if(recs||loading){setOpen(true);return;}
    setLoading(true);setOpen(true);
    const dc=deals.map(d=>d.brand+" "+d.product+" $"+d.sale+(d.fake?" [FAKE]":"")).join(", ");
    const prompt=[
      "Hunting gear advisor.",
      "Hunter: "+member.name+", "+member.gender,
      "Sizes: jacket "+member.jacket+", boots "+member.boots+", pants "+member.pants,
      "Deals: "+dc,
      "Return ONLY valid JSON:",
      '{"needs":[{"item":"gear","reason":"why","priority":"high"},{"item":"gear","reason":"why","priority":"medium"},{"item":"gear","reason":"why","priority":"low"}],"dealMatch":{"found":true,"product":"name","brand":"brand","price":0,"url":"url","whyGood":"reason"},"tip":"one tip"}',
    ].join("\n");
    callAI(prompt,500).then(d=>setRecs(d)).catch(()=>setRecs({error:true})).finally(()=>setLoading(false));
  };
  return (
    <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:16}}>
      {!open?(
        <button onClick={fetch_recs} style={{width:"100%",padding:"9px 14px",borderRadius:9,background:T.accentLight,border:`1px solid ${T.accentBorder}`,color:T.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>
          What does {member.name} need?
        </button>
      ):(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:10,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.1em"}}>AI GEAR ADVISOR</span>
            <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12}}>hide</button>
          </div>
          {loading&&[1,2,3].map(i=><div key={i} style={{height:52,borderRadius:8,background:T.border,opacity:0.4,marginBottom:8}}/>)}
          {recs&&!recs.error&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(recs.needs||[]).map((n,i)=>{
                const pc=PRIOS[n.priority]||T.accent;
                return (
                  <div key={i} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:pc,flexShrink:0,marginTop:5}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:2}}>{n.item}</div>
                      <div style={{fontSize:11,color:T.textSub,lineHeight:1.5}}>{n.reason}</div>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:pc,background:pc+"18",borderRadius:5,padding:"2px 7px",flexShrink:0,fontFamily:"monospace"}}>{(n.priority||"").toUpperCase()}</span>
                  </div>
                );
              })}
              {recs.dealMatch&&recs.dealMatch.found&&(
                <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:T.accent,fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:6}}>DEAL MATCH RIGHT NOW</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:3}}>{recs.dealMatch.product}</div>
                  <div style={{fontSize:12,color:T.textSub,marginBottom:8,lineHeight:1.5}}>{recs.dealMatch.whyGood}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontWeight:800,fontSize:20,color:T.accent}}>${recs.dealMatch.price}</span>
                    {recs.dealMatch.url&&(
                      <a href={recs.dealMatch.url} target="_blank" rel="noopener noreferrer" style={{background:T.accent,color:"white",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:700,textDecoration:"none"}}>Shop Now</a>
                    )}
                  </div>
                </div>
              )}
              {recs.tip&&(
                <div style={{background:T.orangeLight,border:`1px solid ${T.orangeBorder}`,borderRadius:9,padding:"10px 14px",display:"flex",gap:10}}>
                  <span style={{fontSize:14,flexShrink:0}}>💡</span>
                  <span style={{fontSize:12,color:T.orange,lineHeight:1.6}}>{recs.tip}</span>
                </div>
              )}
            </div>
          )}
          {recs&&recs.error&&<div style={{color:T.textMuted,fontSize:12,textAlign:"center",padding:"12px 0"}}>Could not load. Try again.</div>}
        </div>
      )}
    </div>
  );
}

function AuthModal({mode,setMode,T,P,onSuccess,onClose}) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [name,setName]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setLoading(true);setErr("");
    if(!email.includes("@")){setErr("Enter a valid email address.");setLoading(false);return;}
    if(pass.length<6){setErr("Password must be at least 6 characters.");setLoading(false);return;}
    try {
      if(mode==="signup"){
        const firstName=(name||email.split("@")[0]).split(" ")[0];
        const {data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{full_name:firstName}}});
        if(error){setErr(error.message);setLoading(false);return;}
        const u=data.user;
        onSuccess({email,name:firstName,avatar:email[0].toUpperCase(),token:data.session?.access_token,id:u?.id});
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error){setErr(error.message);setLoading(false);return;}
        const u=data.user;
        const firstName=(u.user_metadata?.full_name||email.split("@")[0]).split(" ")[0];
        onSuccess({email,name:firstName,avatar:email[0].toUpperCase(),token:data.session?.access_token,id:u?.id});
      }
    } catch {
      setErr("Something went wrong. Try again.");
    }
    setLoading(false);
  };
  const inp={padding:"12px 16px",borderRadius:10,border:`1px solid ${T.border}`,background:T.bgCard,color:T.text,fontSize:14,outline:"none",fontFamily:"inherit",width:"100%"};
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:T.bgSolid,borderRadius:20,maxWidth:420,width:"100%",overflow:"hidden",border:`1px solid ${T.border}`,boxShadow:`0 32px 80px ${T.shadowHov}`}} onClick={e=>e.stopPropagation()}>
        <div style={{height:4,background:`linear-gradient(90deg,${T.accent},#52b788)`}}/>
        <div style={{padding:"28px 32px"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>{P.icon} {P.name}</div>
            <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{mode==="login"?"Welcome back":"Create your free account"}</div>
          </div>
          <div style={{display:"flex",background:T.border,borderRadius:10,padding:3,marginBottom:24}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"8px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,transition:"all 0.15s",background:mode===m?T.bgSolid:"transparent",color:mode===m?T.text:T.textMuted,fontWeight:mode===m?700:500}}>
                {m==="login"?"Log In":"Sign Up"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="signup"&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={inp}/>}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" style={inp}/>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" type="password" onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
            {err&&<div style={{color:T.red,fontSize:12,padding:"8px 12px",background:T.redLight,border:`1px solid ${T.redBorder}`,borderRadius:8}}>{err}</div>}
            <button onClick={submit} disabled={loading} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"13px",fontWeight:700,fontSize:14,marginTop:4,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
              {loading?"...":mode==="login"?"Log In":"Create Account"}
            </button>
          </div>
          {mode==="signup"&&(
            <div style={{marginTop:16,padding:"12px 14px",background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10}}>
              <div style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:4}}>What you unlock:</div>
              <div style={{fontSize:11,color:T.textSub,lineHeight:1.8}}>Family profiles with size filtering<br/>Personalized deal feed<br/>AI gear advisor per family member</div>
            </div>
          )}
          <div style={{textAlign:"center",marginTop:14,fontSize:11,color:T.textMuted}}>
            {mode==="login"?(
              <span>No account? <button onClick={()=>setMode("signup")} style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontWeight:600,fontSize:11}}>Sign up free</button></span>
            ):(
              <span>Already have one? <button onClick={()=>setMode("login")} style={{background:"none",border:"none",color:T.accent,cursor:"pointer",fontWeight:600,fontSize:11}}>Log in</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefsModal({T,prefs,setPrefs,stores,setStores,onClose}) {
  const [sec,setSec]=useState("hunts");
  const toggle=(key,id)=>setPrefs(p=>{const a=p[key]||[];return {...p,[key]:a.includes(id)?a.filter(x=>x!==id):[...a,id]};});
  const toggleStore=id=>setStores(p=>p.includes(id)?p.filter(s=>s!==id):[...p,id]);
  const SECS=[{id:"hunts",label:"Hunt Types"},{id:"cats",label:"Gear Types"},{id:"brands",label:"Brands"},{id:"stores",label:"Stores"}];
  const bycat={boutique:STORES.filter(s=>s.cat==="boutique"),specialty:STORES.filter(s=>s.cat==="specialty"),bigbox:STORES.filter(s=>s.cat==="bigbox")};
  const SGRPS=[{label:"Boutique and Brand Direct",key:"boutique"},{label:"Specialty Hunting Retailers",key:"specialty"},{label:"Big Box Retailers",key:"bigbox"}];
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:T.bgSolid,borderRadius:20,maxWidth:680,width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",border:`1px solid ${T.border}`,boxShadow:`0 32px 80px ${T.shadowHov}`}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>My Preferences</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Your feed filters to match</div>
          </div>
          <button onClick={onClose} style={{background:T.border,border:"none",borderRadius:"50%",width:36,height:36,cursor:"pointer",fontSize:16,color:T.textSub}}>x</button>
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          {SECS.map(s=>(
            <button key={s.id} onClick={()=>setSec(s.id)} style={{flex:1,padding:"12px 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",background:sec===s.id?T.accentLight:"transparent",borderBottom:sec===s.id?`2px solid ${T.accent}`:"2px solid transparent",color:sec===s.id?T.accent:T.textMuted}}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{overflowY:"auto",padding:"20px 24px",flex:1}}>
          {sec==="hunts"&&(
            <div>
              <p style={{fontSize:12,color:T.textMuted,marginBottom:16,lineHeight:1.6}}>Select the types of hunting you do.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                {HUNT_TYPES.map(h=>{
                  const on=(prefs.hunts||[]).includes(h.id);
                  return (
                    <button key={h.id} onClick={()=>toggle("hunts",h.id)} style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",border:`1.5px solid ${on?T.accent:T.border}`,background:on?T.accentLight:T.bgCard}}>
                      <span style={{fontSize:20}}>{h.icon}</span>
                      <div style={{fontSize:12,fontWeight:700,color:on?T.accent:T.text}}>{h.label}</div>
                      {on&&<span style={{marginLeft:"auto",color:T.accent,fontSize:14}}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{marginTop:16,display:"flex",gap:8}}>
                <button onClick={()=>setPrefs(p=>({...p,hunts:HUNT_TYPES.map(h=>h.id)}))} style={{fontSize:11,color:T.accent,background:"none",border:`1px solid ${T.accentBorder}`,borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>Select All</button>
                <button onClick={()=>setPrefs(p=>({...p,hunts:[]}))} style={{fontSize:11,color:T.textMuted,background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>Clear All</button>
              </div>
            </div>
          )}
          {sec==="cats"&&(
            <div>
              <p style={{fontSize:12,color:T.textMuted,marginBottom:16,lineHeight:1.6}}>Only see deals for gear you buy.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                {GEAR_CATS.map(c=>{
                  const on=(prefs.cats||[]).includes(c.id);
                  return (
                    <button key={c.id} onClick={()=>toggle("cats",c.id)} style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",border:`1.5px solid ${on?T.accent:T.border}`,background:on?T.accentLight:T.bgCard}}>
                      <span style={{fontSize:20}}>{c.icon}</span>
                      <div style={{fontSize:12,fontWeight:700,color:on?T.accent:T.text}}>{c.label}</div>
                      {on&&<span style={{marginLeft:"auto",color:T.accent,fontSize:14}}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {sec==="brands"&&(
            <div>
              <p style={{fontSize:12,color:T.textMuted,marginBottom:16,lineHeight:1.6}}>Only show deals from brands you actually buy.</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {ALL_BRANDS.map(b=>{
                  const on=(prefs.brands||[]).includes(b);
                  return (
                    <button key={b} onClick={()=>toggle("brands",b)} style={{padding:"6px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",border:`1.5px solid ${on?T.accent:T.border}`,background:on?T.accentLight:"transparent",color:on?T.accent:T.textMuted}}>
                      {on?"✓ ":""}{b}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {sec==="stores"&&(
            <div>
              <p style={{fontSize:12,color:T.textMuted,marginBottom:20,lineHeight:1.6}}>Uncheck stores you do not want to see.</p>
              {SGRPS.map(g=>(
                <div key={g.key} style={{marginBottom:20}}>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.1em",marginBottom:8}}>{g.label.toUpperCase()}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {bycat[g.key].map(s=>{
                      const on=stores.includes(s.id);
                      return (
                        <div key={s.id} onClick={()=>toggleStore(s.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderRadius:10,cursor:"pointer",transition:"all 0.15s",opacity:on?1:0.6,border:`1.5px solid ${on?T.border:T.redBorder}`,background:on?T.bgCard:T.redLight}}>
                          <div style={{width:20,height:20,borderRadius:5,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${on?T.accent:T.red}`,background:on?T.accent:"transparent"}}>
                            {on&&<span style={{color:"white",fontSize:12,fontWeight:900}}>✓</span>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13,color:on?T.text:T.textMuted}}>{s.name}</div>
                            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Free shipping over ${s.freeAt}{s.loyalty?" | "+s.loyalty.desc:""}</div>
                          </div>
                          {!on&&<span style={{fontSize:11,color:T.red,fontWeight:600,fontFamily:"monospace"}}>HIDDEN</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{padding:"14px 24px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:T.bgCard}}>
          <div style={{fontSize:11,color:T.textMuted,fontFamily:"monospace"}}>{(prefs.hunts||[]).length} hunt types | {stores.length} stores</div>
          <button onClick={onClose} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"9px 24px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

function StoreRow({store,rank,isBest,isVal,T}) {
  const rankCol=rank===0?T.accent:rank===1?T.orange:T.textMuted;
  const badgeBg=isBest?T.accent:isVal?T.orange:"#888";
  const borderCol=isBest?T.accent:isVal?T.orange:T.border;
  const badgeLabel=isBest?"BEST DEAL":isVal?"BEST VALUE":store.honorableMention?"HONORABLE MENTION":"";
  return (
    <div style={{background:T.bgCard,border:`1.5px solid ${borderCol}`,borderRadius:12,overflow:"hidden",backdropFilter:"blur(12px)"}}>
      {(isBest||isVal||store.honorableMention)&&(
        <div style={{background:badgeBg,padding:"4px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"white",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{badgeLabel}</span>
          {(isVal||store.honorableMention)&&<span style={{color:"rgba(255,255,255,0.8)",fontSize:11}}>{isVal?store.loyaltyDesc:store.honorableMentionReason}</span>}
        </div>
      )}
      <div style={{padding:"14px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:140}}>
            <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:rankCol,background:rankCol+"18",border:`1px solid ${rankCol}33`,borderRadius:4,padding:"2px 7px"}}>#{rank+1}</span>
            <span style={{fontWeight:700,fontSize:15,color:T.text}}>{store.storeName}</span>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",flex:1}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:2}}>ITEM</div>
              <div style={{fontWeight:700,fontSize:16,color:T.text}}>${store.price}</div>
            </div>
            <span style={{color:T.border}}>+</span>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:2}}>SHIP</div>
              <div style={{fontWeight:700,fontSize:16,color:store.qualifiesForFreeShipping?T.accent:T.text}}>
                {store.qualifiesForFreeShipping?"FREE":"$"+store.shipping}
              </div>
            </div>
            {store.couponCode&&(
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{color:T.border}}>-</span>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:2}}>COUPON</div>
                  <div style={{fontWeight:700,fontSize:16,color:T.orange}}>-${store.couponDiscount}</div>
                </div>
              </div>
            )}
            <span style={{color:T.border,fontSize:16}}>=</span>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:2}}>YOU PAY</div>
              <div style={{fontWeight:900,fontSize:20,color:isBest?T.accent:T.text}}>${store.finalCost}</div>
            </div>
            {store.loyaltyValue>0&&(
              <div style={{textAlign:"center",opacity:0.85}}>
                <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",marginBottom:2}}>LOYALTY</div>
                <div style={{fontWeight:700,fontSize:14,color:T.orange}}>+${store.loyaltyValue}</div>
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0}}>
            {store.couponCode&&(
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <code style={{background:T.orangeLight,color:T.orange,border:`1px dashed ${T.orangeBorder}`,borderRadius:5,padding:"3px 10px",fontSize:12,fontWeight:700,letterSpacing:"0.1em"}}>{store.couponCode}</code>
                <button onClick={()=>{if(navigator.clipboard)navigator.clipboard.writeText(store.couponCode);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10,color:T.textMuted}}>Copy</button>
              </div>
            )}
            <a href={store.url} target="_blank" rel="noopener noreferrer" style={{borderRadius:8,padding:"7px 16px",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",background:isBest?T.accent:T.bgSolid,color:isBest?"white":T.textSub,border:`1px solid ${isBest?T.accent:T.border}`}}>
              Shop {store.storeName}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceVidPanel({vids,vtab,setVtab,T}) {
  const av=vtab==="manufacturer"?vids.manufacturer:vids.review;
  const VTABS=[{key:"manufacturer",icon:"🎬",label:"Official",col:T.accent},{key:"review",icon:"⭐",label:"Top Review",col:T.orange}];
  return (
    <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden",backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
        {VTABS.map(t=>(
          <button key={t.key} onClick={()=>setVtab(t.key)} style={{flex:1,padding:"10px 0",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s",background:vtab===t.key?t.col+"18":"transparent",borderBottom:vtab===t.key?`2px solid ${t.col}`:"2px solid transparent",color:vtab===t.key?t.col:T.textMuted}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {av&&(
        <div>
          <div style={{position:"relative",paddingBottom:"56%"}}>
            <iframe src={"https://www.youtube.com/embed/"+av.youtubeId+"?modestbranding=1&rel=0"} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
          </div>
          <div style={{padding:"12px 14px"}}>
            <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4,lineHeight:1.4}}>{av.title}</div>
            <div style={{display:"flex",gap:10,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:11,fontWeight:600,color:vtab==="manufacturer"?T.accent:T.orange}}>
                {av.channel}
                {av.isMindfulHunter&&<span style={{marginLeft:6,background:T.orangeLight,color:T.orange,border:`1px solid ${T.orangeBorder}`,borderRadius:4,padding:"1px 6px",fontSize:10}}>Recommended</span>}
              </span>
              <span style={{fontSize:11,color:T.textMuted}}>{av.duration}</span>
              <span style={{fontSize:11,color:T.textMuted}}>{av.views} views</span>
            </div>
            <p style={{fontSize:11,color:T.textSub,margin:0,lineHeight:1.55}}>{av.snippet}</p>
            {av.reviewerNote&&<div style={{marginTop:5,fontSize:10,color:T.textMuted,fontStyle:"italic"}}>{av.isMindfulHunter?"🎯 ":"📈 "}{av.reviewerNote}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceSearch({T,P,stores,wishlist,setWishlist}) {
  const [query,setQuery]=useState("");
  const [results,setResults]=useState(null);
  const [loading,setLoading]=useState(false);
  const [vids,setVids]=useState(null);
  const [vloading,setVloading]=useState(false);
  const [vtab,setVtab]=useState("manufacturer");
  const search=async()=>{
    if(!query.trim()||loading)return;
    setLoading(true);setResults(null);setVids(null);
    const sc=STORES.filter(s=>stores.includes(s.id)).map(s=>s.name+": free over $"+s.freeAt+", else $"+s.ship+(s.loyalty?" - "+s.loyalty.desc:"")).join("; ");
    const prompt=[
      "Hunting gear price comparison.",
      "User portal context: "+P.searchContext+". Prioritize relevant brands and stores for this context, but include all stores.",
      "Search: "+query,
      "Stores: "+sc,
      "Return ONLY valid JSON:",
      '{"productName":"name","brand":"brand","category":"cat","description":"2 sentences","msrp":0,"stores":[{"storeId":"id","storeName":"name","price":0,"shipping":0,"qualifiesForFreeShipping":true,"couponCode":null,"couponDiscount":0,"finalCost":0,"loyaltyValue":0,"loyaltyDesc":null,"adjustedCost":0,"url":"url","honorableMention":false,"honorableMentionReason":null}],"bestDeal":"storeId","bestValue":"storeId","insight":"one sentence"}',
    ].join("\n");
    try{
      const parsed=await callAI(prompt,1200);
      if(parsed.stores)parsed.stores.sort((a,b)=>a.adjustedCost-b.adjustedCost);
      setResults(parsed);
      fetchVids(parsed.productName,parsed.brand);
    }catch{setResults({error:true});}
    setLoading(false);
  };
  const fetchVids=async(pname,brand)=>{
    if(!pname)return;
    setVloading(true);
    const prompt=[
      "Hunting video curator. Mindful Hunter priority for Sitka/Kuiu/Stone Glacier/First Lite.",
      "Product: "+brand+" "+pname,
      "Return ONLY valid JSON:",
      '{"manufacturer":{"title":"t","channel":"c","duration":"M:SS","views":"48K","youtubeId":"dQw4w9WgXcQ","snippet":"s"},"review":{"title":"t","channel":"c","duration":"M:SS","views":"287K","youtubeId":"jNQXAC9IVRw","snippet":"s","isMindfulHunter":true,"reviewerNote":"r"}}',
    ].join("\n");
    try{const v=await callAI(prompt,400);setVids(v);}catch{setVids(null);}
    setVloading(false);
  };
  const isWishlisted=results&&wishlist.find(w=>w.productName===results.productName);
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:32}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search()} placeholder={P.searchHint} style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 20px",fontSize:15,color:T.text,outline:"none",backdropFilter:"blur(8px)",fontFamily:"inherit"}}/>
        <button onClick={search} disabled={loading||!query.trim()} style={{border:"none",borderRadius:12,padding:"14px 28px",fontWeight:700,fontSize:14,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s",background:loading||!query.trim()?T.border:T.accent,color:loading||!query.trim()?T.textMuted:"white"}}>
          {loading?"Searching...":"Find Best Price"}
        </button>
      </div>
      {wishlist.length>0&&!results&&(
        <div style={{marginBottom:28}}>
          <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:12,fontFamily:"monospace"}}>YOUR WISHLIST</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {wishlist.map((w,i)=>(
              <button key={i} onClick={()=>setQuery(w.productName)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:999,padding:"6px 16px",cursor:"pointer",color:T.textSub,fontSize:12,fontWeight:600}}>
                {w.productName}
              </button>
            ))}
          </div>
        </div>
      )}
      {results&&!results.error&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:24,alignItems:"start"}}>
          <div>
            <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 24px",marginBottom:16,backdropFilter:"blur(12px)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{fontSize:10,color:T.accent,fontWeight:700,letterSpacing:"0.12em",fontFamily:"monospace",marginBottom:6}}>
                    {(results.brand||"").toUpperCase()} | {(results.category||"").toUpperCase()}
                  </div>
                  <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:24,color:T.text,marginBottom:6}}>{results.productName}</div>
                  <p style={{fontSize:13,color:T.textSub,lineHeight:1.6,margin:0}}>{results.description}</p>
                </div>
                <button onClick={()=>isWishlisted?setWishlist(w=>w.filter(x=>x.productName!==results.productName)):setWishlist(p=>[...p,{...results,addedAt:new Date().toISOString()}])} style={{border:`1px solid ${isWishlisted?T.accent:T.border}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600,flexShrink:0,marginLeft:16,background:isWishlisted?T.accentLight:"transparent",color:isWishlisted?T.accent:T.textMuted}}>
                  {isWishlisted?"Wishlisted":"Wishlist"}
                </button>
              </div>
              {results.msrp>0&&<div style={{fontSize:11,color:T.textMuted,fontFamily:"monospace"}}>MSRP ${results.msrp} | {results.insight}</div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(results.stores||[]).map((store,i)=>(
                <StoreRow key={store.storeId} store={store} rank={i} isBest={store.storeId===results.bestDeal} isVal={store.storeId===results.bestValue&&store.storeId!==results.bestDeal} T={T}/>
              ))}
            </div>
          </div>
          <div style={{position:"sticky",top:84}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:12,fontFamily:"monospace"}}>FIELD INTEL</div>
            {vloading&&<div style={{background:T.bgCard,borderRadius:12,height:200,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${T.border}`}}><span style={{color:T.textMuted,fontSize:12}}>Loading videos...</span></div>}
            {vids&&!vloading&&<PriceVidPanel vids={vids} vtab={vtab} setVtab={setVtab} T={T}/>}
          </div>
        </div>
      )}
      {results&&results.error&&<div style={{color:T.textMuted,textAlign:"center",padding:40,fontFamily:"monospace",fontSize:12}}>Search failed. Try a more specific product name.</div>}
    </div>
  );
}

function AddMemberCard({setFamily, T}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("mens");

  const add = () => {
    const n = name.trim().split(" ")[0];
    if (!n) return;
    const defaults = gender === "youth"
      ? {jacket:"YM",shirt:"YM",base:"YS",pants:"YM",boots:"5",gloves:"YS",socks:"S",beanie:"YS"}
      : gender === "womens"
      ? {jacket:"M",shirt:"M",base:"S",pants:"8",boots:"8",gloves:"S",socks:"M",beanie:"M"}
      : {jacket:"L",shirt:"L",base:"L",pants:"34x32",boots:"10",gloves:"L",socks:"L",beanie:"L"};
    setFamily(prev => [...prev, {name:n, gender, ...defaults}]);
    setName("");
    setGender("mens");
    setAdding(false);
  };

  if (adding) {
    return (
      <div style={{background:T.bgCard,border:`1.5px solid ${T.accent}`,borderRadius:16,padding:"24px 20px",backdropFilter:"blur(12px)"}}>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:16,color:T.text,marginBottom:6}}>
          Add a family member
        </div>
        <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6,marginBottom:16}}>
          Select Youth for kids -- we track youth jacket, pant, and boot sizes separately so deals match the right person.
        </div>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="First name"
          autoFocus
          style={{width:"100%",padding:"10px 14px",borderRadius:9,border:`1px solid ${T.border}`,background:T.bgSolid,color:T.text,fontSize:15,fontWeight:600,outline:"none",fontFamily:"inherit",marginBottom:12}}
        />
        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[{v:"mens",label:"Men",icon:"🧔"},{v:"womens",label:"Women",icon:"👩"},{v:"youth",label:"Youth",icon:"🧒"}].map(g => (
            <button
              key={g.v}
              onClick={() => setGender(g.v)}
              style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${gender===g.v?T.accent:T.border}`,background:gender===g.v?T.accentLight:"transparent",color:gender===g.v?T.accent:T.textMuted,fontSize:12,fontWeight:600,cursor:"pointer"}}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={add} style={{flex:1,background:T.accent,color:"white",border:"none",borderRadius:9,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>
            Add {name.trim().split(" ")[0] || "Member"}
          </button>
          <button onClick={() => setAdding(false)} style={{background:T.border,color:T.textMuted,border:"none",borderRadius:9,padding:"10px 16px",fontWeight:600,fontSize:13,cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setAdding(true)}
      style={{background:T.bgCard,border:`2px dashed ${T.border}`,borderRadius:16,padding:"28px 20px",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:180,cursor:"pointer",gap:10,transition:"all 0.15s"}}
    >
      <span style={{fontSize:28,color:T.border}}>+</span>
      <div style={{textAlign:"center"}}>
        <div style={{fontWeight:700,fontSize:13,color:T.textSub,marginBottom:4}}>
          Add a family member
        </div>
        <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6,maxWidth:180}}>
          Track sizes for everyone -- including youth sizes for kids
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [theme,setTheme]=useState("light");
  const [portal,setPortal]=useState("timberline");
  const [tab,setTab]=useState("deals");
  const [family,setFamily]=useState(INIT_FAMILY);
  const [memberFilter,setMemberFilter]=useState("All");
  const [brandFilter,setBrandFilter]=useState("All");
  const [modalDeal,setModalDeal]=useState(null);
  const [editIdx,setEditIdx]=useState(null);
  const [wishlist,setWishlist]=useState([]);
  const [stores,setStores]=useState(STORES.map(s=>s.id));
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [showPrefs,setShowPrefs]=useState(false);
  const [prefs,setPrefs]=useState({hunts:HUNT_TYPES.map(h=>h.id),cats:GEAR_CATS.map(c=>c.id),brands:[...ALL_BRANDS]});
  const [user,setUser]=useState(null);
  const [deals,setDeals]=useState([]);
  const [dbCoupons,setDbCoupons]=useState([]);

  useEffect(()=>{
    if(user && user.id && family.length){
      supabase.auth.getSession().then(({data:{session}})=>{
        if(session) saveFamily(family, user.id).catch(()=>{});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[family]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){
        const u=session.user;
        const firstName=(u.user_metadata?.full_name||u.email.split("@")[0]).split(" ")[0];
        const userObj={email:u.email,name:firstName,avatar:u.email[0].toUpperCase(),token:session.access_token,id:u.id};
        setUser(userObj);
        loadFamily(u.id,session.access_token).then(rows=>{
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,gloves:r.gloves,socks:r.socks,beanie:r.beanie})));
        }).catch(()=>{});
      }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_OUT"){
        setUser(null);setFamily([]);
      } else if((event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="INITIAL_SESSION")&&session){
        const u=session.user;
        const firstName=(u.user_metadata?.full_name||u.email.split("@")[0]).split(" ")[0];
        const userObj={email:u.email,name:firstName,avatar:u.email[0].toUpperCase(),token:session.access_token,id:u.id};
        setUser(userObj);
        loadFamily(u.id,session.access_token).then(rows=>{
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,gloves:r.gloves,socks:r.socks,beanie:r.beanie})));
        }).catch(()=>{});
      }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc",limit:"100",offset:"0"})
      .then(rows=>{
        if(rows&&rows.length) setDeals(rows.map(parseDeal));
        return sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc",limit:"900",offset:"100"});
      })
      .then(rows=>{
        if(rows&&rows.length) setDeals(prev=>[...prev,...rows.map(parseDeal)]);
      })
      .catch(()=>{});
    sbGet("coupons",{select:"*",active:"eq.true",order:"verified.desc",limit:"50"})
      .then(rows=>{if(rows&&rows.length)setDbCoupons(rows.map(parseCoupon));})
      .catch(()=>{});
  },[]);
  const T=theme==="light"?LIGHT:DARK;
  const P=PORTALS[portal];
  const isGuest=!user;

  const taggedDeals=useMemo(
    ()=>deals.map(d=>({...d,tags:computeTags(d,family)})),
    [deals,family]
  );
  const sortedDeals=[
    ...taggedDeals.filter(d=>d.portal===portal),
    ...taggedDeals.filter(d=>d.portal!==portal),
  ];
  const filtered=sortedDeals.filter(d=>{
    if(brandFilter!=="All"&&d.brand!==brandFilter)return false;
    if(memberFilter!=="All"&&!d.tags.includes(memberFilter))return false;
    return true;
  });
  const portalCoupons=[
    ...dbCoupons.filter(c=>c.portal===portal),
    ...dbCoupons.filter(c=>c.portal!==portal),
  ];
  const BRANDS_LIST=P.brands.slice(0,6);
  const TABS=[{id:"deals",label:"Deals"},{id:"search",label:"Price Search"},{id:"coupons",label:"Coupon Codes"},...(user?[{id:"family",label:"Family"}]:[])];
  const memberNames=["All",...family.map(f=>f.name)];
  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"system-ui,sans-serif",position:"relative",transition:"background 0.3s"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <TopoBG T={T}/>
      <div style={{background:T.bgHeader,backdropFilter:"blur(16px)",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:100,boxShadow:`0 1px 24px ${T.shadow}`}}>
        <div style={{maxWidth:1160,margin:"0 auto",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:19,color:T.text}}>Timberline</div>
            <div style={{fontFamily:"monospace",fontWeight:500,fontSize:9,color:T.accent,letterSpacing:"0.22em",marginTop:2}}>DEAL TRACKER</div>
          </div>
          <nav style={{display:"flex",gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.15s",background:tab===t.id?T.navActive:"transparent",color:tab===t.id?T.accent:T.textMuted}}>
                {t.label}
              </button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",gap:2,background:T.border,borderRadius:8,padding:2}}>
              {Object.entries(PORTALS).map(([key,p])=>(
                <button key={key} onClick={()=>setPortal(key)} title={p.name} style={{padding:"5px 10px",border:"none",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s",background:portal===key?T.bgSolid:"transparent",color:portal===key?p.accent:T.textMuted}}>
                  {p.icon}
                </button>
              ))}
            </div>
            {user&&<button onClick={()=>setShowPrefs(true)} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:T.textMuted,fontWeight:600}}>Preferences</button>}
            <div style={{display:"flex",alignItems:"center",gap:6,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:999,padding:"5px 12px"}}>
              <div style={{width:6,height:6,background:T.accent,borderRadius:"50%"}}/>
              <span style={{fontSize:11,color:T.accent,fontWeight:600,fontFamily:"monospace"}}>LIVE</span>
            </div>
            <button onClick={()=>setTheme(t=>t==="light"?"dark":"light")} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:16}}>{T.toggle}</button>
            {user?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"white"}}>{user.avatar}</div>
                <button onClick={()=>{supabase.auth.signOut();setUser(null);setFamily([]);}} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,color:T.textMuted,fontWeight:600}}>Log out</button>
              </div>
            ):(
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,color:T.textSub,fontWeight:600}}>Log in</button>
                <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.accent,border:"none",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,color:"white",fontWeight:700}}>Sign up free</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isGuest&&(
        <div style={{background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`,padding:"10px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>{P.icon}</span>
            <span style={{fontSize:13,color:T.accent,fontWeight:600}}>Showing {P.tagline} deals</span>
            <span style={{fontSize:12,color:T.textMuted}}>| Log in to filter by sizes and family</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:"transparent",border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:T.accent,fontWeight:600}}>Log in</button>
            <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.accent,border:"none",borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:"white",fontWeight:700}}>Sign up free</button>
          </div>
        </div>
      )}
      {!isGuest&&(
        <div style={{background:T.accentLight,borderBottom:`1px solid ${T.accentBorder}`,padding:"6px 28px",display:"flex",alignItems:"center",gap:12,position:"relative",zIndex:1}}>
          <span style={{fontSize:11,fontWeight:700,color:T.accent,fontFamily:"monospace",letterSpacing:"0.1em"}}>{P.icon} {P.name.toUpperCase()}</span>
          <span style={{color:T.accentBorder,fontSize:10}}>|</span>
          <span style={{fontSize:11,color:T.accent,opacity:0.7,fontFamily:"monospace"}}>{P.tagline}</span>
        </div>
      )}
      <div style={{maxWidth:1160,margin:"0 auto",padding:"32px 28px",position:"relative",zIndex:1}}>
        {tab==="deals"&&(
          <div style={{animation:"fadeUp 0.25s ease"}}>
            <div style={{marginBottom:28}}>
              <h1 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:36,color:T.text,marginBottom:4}}>Active Drops</h1>
              <p style={{color:T.textMuted,fontSize:12,fontFamily:"monospace",letterSpacing:"0.04em"}}>{filtered.filter(d=>!d.fake).length} real deals | {filtered.filter(d=>d.fake).length} fake sales flagged</p>
            </div>
            <div style={{display:"flex",gap:20,marginBottom:28,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.08em"}}>MEMBER</span>
                {memberNames.map((m,i)=>{
                  const col=i===0?T.accent:MC[(i-1)%MC.length];
                  const active=memberFilter===m;
                  return (
                    <button key={m} onClick={()=>setMemberFilter(m)} style={{padding:"5px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",border:"1px solid",borderColor:active?col:T.border,background:active?col+"22":T.bgCard,color:active?col:T.textMuted}}>
                      {m}
                    </button>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.08em"}}>BRAND</span>
                {["All",...BRANDS_LIST].map(b=>(
                  <button key={b} onClick={()=>setBrandFilter(b)} style={{padding:"5px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",border:`1px solid ${brandFilter===b?T.accent:T.border}`,background:brandFilter===b?T.accentLight:T.bgCard,color:brandFilter===b?T.accent:T.textMuted}}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
              {filtered.length===0?(
                <div style={{color:T.textMuted,padding:40,fontFamily:"monospace",fontSize:12}}>No deals match these filters.</div>
              ):filtered.map(d=>(
                <DealCard key={d.id} d={d} family={family} memberFilter={memberFilter} onOpen={setModalDeal} T={T}/>
              ))}
            </div>
          </div>
        )}
        {tab==="search"&&(
          <div style={{animation:"fadeUp 0.25s ease"}}>
            <h1 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:36,color:T.text,marginBottom:4}}>Price Search</h1>
            <p style={{color:T.textMuted,fontSize:12,fontFamily:"monospace",letterSpacing:"0.04em",marginBottom:28}}>FIND THE CHEAPEST PLACE TO BUY ANY HUNTING GEAR</p>
            <PriceSearch T={T} P={P} stores={stores} wishlist={wishlist} setWishlist={setWishlist}/>
          </div>
        )}
        {tab==="coupons"&&(
          <div style={{animation:"fadeUp 0.25s ease"}}>
            <h1 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:36,color:T.text,marginBottom:4}}>Active Codes</h1>
            <p style={{color:T.textMuted,fontSize:12,fontFamily:"monospace",letterSpacing:"0.04em",marginBottom:28}}>VERIFIED TODAY | CLICK TO VISIT BRAND</p>
            <div style={{display:"grid",gap:14}}>
              {portalCoupons.map((c,i)=>(
                <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                  <div style={{background:T.bgCard,backdropFilter:"blur(12px)",borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,cursor:"pointer",boxShadow:`0 2px 12px ${T.shadow}`,border:`1px solid ${c.verified?T.border:T.redBorder}`}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:T.accent,letterSpacing:"0.1em",fontFamily:"monospace",marginBottom:5}}>{c.brand.toUpperCase()}</div>
                      <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:20,color:T.text,marginBottom:5}}>{c.discount}</div>
                      <div style={{fontSize:12,color:T.textMuted}}>Expires {c.expires} | {c.verified?"Verified today":"Unverified"}</div>
                    </div>
                    <code style={{background:T.orangeLight,color:T.orange,border:`1px dashed ${T.orangeBorder}`,borderRadius:10,padding:"10px 22px",fontSize:22,fontWeight:800,letterSpacing:"0.15em"}}>{c.code}</code>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        {tab==="family"&&(
          <div style={{animation:"fadeUp 0.25s ease"}}>
            {!user?(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:20}}>👨‍👩‍👧‍👦</div>
                <h2 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:28,color:T.text,marginBottom:12}}>Family Profiles</h2>
                <p style={{fontSize:15,color:T.textSub,maxWidth:440,lineHeight:1.7,marginBottom:32}}>Add everyone in your family with their sizes. Deals get automatically tagged to whoever they fit.</p>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"13px 32px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Create Free Account</button>
                  <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:T.bgCard,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 24px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Log In</button>
                </div>
              </div>
            ):(
              <div>
                <h1 style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:36,color:T.text,marginBottom:4}}>Family Profiles</h1>
                <p style={{color:T.textMuted,fontSize:12,fontFamily:"monospace",letterSpacing:"0.04em",marginBottom:28}}>DEALS AUTO-TAGGED BY SIZE | AI ADVISOR PER MEMBER</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
                  {family.map((m,idx)=>{
                    const col=MC[idx%MC.length];
                    const mDeals=taggedDeals.filter(d=>d.tags.includes(m.name));
                    const SIZE_FIELDS=[["🧥","JACKET",m.jacket],["👕","SHIRT",m.shirt],["👕","BASE",m.base],["👖","PANTS",m.pants],["🥾","BOOTS",m.boots],["🧤","GLOVES",m.gloves],["🧦","SOCKS",m.socks],["🧢","BEANIE",m.beanie]];
                    return (
                      <div key={idx} style={{background:T.bgCard,backdropFilter:"blur(12px)",border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:`0 2px 12px ${T.shadow}`,position:"relative",zIndex:1}}>
                        <div style={{height:4,background:col}}/>
                        <div style={{padding:"18px 18px 16px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                            <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:col}}>{m.name}</div>
                            <button onClick={()=>setEditIdx(editIdx===idx?null:idx)} style={{background:T.border,border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:11,color:T.textSub,fontWeight:600}}>{editIdx===idx?"Done":"Edit"}</button>
                          </div>
                          {editIdx===idx?(
                            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                              {["jacket","shirt","base","pants","boots","gloves","socks","beanie"].map(field=>(
                                <div key={field} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <span style={{fontSize:11,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.08em"}}>{field.toUpperCase()}</span>
                                  <SizePicker
                                    field={field}
                                    value={m[field]}
                                    onChange={val=>{const u=[...family];u[idx]={...u[idx],[field]:val};setFamily(u);}}
                                    T={T}
                                    col={col}
                                  />
                                </div>
                              ))}
                            </div>
                          ):(
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                              {SIZE_FIELDS.map(([icon,label,val])=>(
                                <div key={label} style={{background:T.bgSolid,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 8px",textAlign:"center"}}>
                                  <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
                                  <div style={{fontSize:9,color:T.textMuted,fontFamily:"monospace",letterSpacing:"0.08em",marginBottom:3}}>{label}</div>
                                  <div style={{fontSize:16,fontWeight:800,color:T.text}}>{val}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${T.border}`}}>
                            <span style={{fontSize:11,color:T.textMuted,fontFamily:"monospace"}}>ACTIVE DEALS</span>
                            <span style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:22,color:col}}>{mDeals.length}</span>
                          </div>
                          <GearAdvisor member={m} deals={deals} T={T}/>
                        </div>
                      </div>
                    );
                  })}
                  <AddMemberCard setFamily={setFamily} T={T}/>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {showAuth&&<AuthModal mode={authMode} setMode={setAuthMode} T={T} P={P} onSuccess={u=>{
              setUser(u);
              setShowAuth(false);
              if(u.id && u.token){
                supabase.auth.getSession().then(({data:{session}})=>{
                  const tok = session?.access_token || u.token;
                  loadFamily(u.id, tok).then(rows=>{
                    if(rows && rows.length){
                      setFamily(rows.map(r=>({
                        name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,
                        base:r.base,pants:r.pants,boots:r.boots,gloves:r.gloves,
                        socks:r.socks,beanie:r.beanie,
                      })));
                    }
                  }).catch(()=>{});
                });
              }
            }} onClose={()=>setShowAuth(false)}/>}
      {showPrefs&&<PrefsModal T={T} prefs={prefs} setPrefs={setPrefs} stores={stores} setStores={setStores} onClose={()=>setShowPrefs(false)}/>}
      <DealModal deal={modalDeal} family={family} T={T} onClose={()=>setModalDeal(null)}/>
    </div>
  );
}
