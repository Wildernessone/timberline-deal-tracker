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
    boots:m.boots||"10",
    looking_for: m.lookingFor || [],
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
    image:row.image_url,
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
};
function fieldsForCat(cat){
  const c=(cat||"").toLowerCase().replace(/[^a-z]/g,"");
  for(const k in CAT_TO_FIELDS){if(c===k||c.includes(k))return CAT_TO_FIELDS[k];}
  return null;
}
function computeTags(deal, family){
  const fields=fieldsForCat(deal.cat);
  if(!fields) return family.map(m=>m.name);
  const noSizeData = !deal.sizes.mens.length && !deal.sizes.womens.length && !deal.sizes.youth.length;
  if(noSizeData) return family.map(m=>m.name);
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
];

const STORES = [
  {id:"sitka",name:"Sitka",freeAt:199,ship:8,loyalty:null,cat:"boutique"},
  {id:"firstlite",name:"First Lite",freeAt:75,ship:7,loyalty:null,cat:"boutique"},
  {id:"kuiu",name:"Kuiu",freeAt:99,ship:8,loyalty:null,cat:"boutique"},
  {id:"stoneglacier",name:"Stone Glacier",freeAt:100,ship:8,cat:"boutique",loyalty:null},
  {id:"eberlestock",name:"Eberlestock",freeAt:75,ship:7,loyalty:null,cat:"boutique"},
  {id:"exomtn",name:"Exo Mtn Gear",freeAt:99,ship:9,loyalty:null,cat:"boutique"},
  {id:"bridgerwatch",name:"Bridger Watch",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {id:"aziak",name:"Aziak Equipment",freeAt:99,ship:8,loyalty:null,cat:"boutique"},
  {id:"wiserprecision",name:"Wiser Precision",freeAt:100,ship:10,loyalty:null,cat:"boutique"},
  {id:"kapturegear",name:"Kapture Gear",freeAt:75,ship:7,loyalty:null,cat:"boutique"},
  {id:"grakksaw",name:"Grakksaw",freeAt:75,ship:6,loyalty:null,cat:"boutique"},
  {id:"obigear",name:"OBI Gear",freeAt:99,ship:8,loyalty:null,cat:"boutique"},
  {id:"bridgerboiler",name:"Bridger Boiler",freeAt:99,ship:7,loyalty:null,cat:"boutique"},
  {id:"javelinbipod",name:"Javelin Bipod",freeAt:100,ship:9,loyalty:null,cat:"boutique"},
  {id:"sneektec",name:"Sneek Tec",freeAt:50,ship:5,loyalty:null,cat:"boutique"},
  {id:"keen",name:"Keen",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {id:"katabatic",name:"Katabatic Gear",freeAt:99,ship:10,loyalty:null,cat:"boutique"},
  {id:"zpacks",name:"Zpacks",freeAt:200,ship:12,loyalty:null,cat:"boutique"},
  {id:"flextail",name:"Flextail",freeAt:50,ship:6,loyalty:null,cat:"boutique"},
  {id:"ollin",name:"Ollin",freeAt:50,ship:5,loyalty:null,cat:"boutique"},
  {id:"magview",name:"Magview",freeAt:50,ship:5,loyalty:null,cat:"boutique"},
  {id:"mtntough",name:"Mtn Tough",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {id:"mtnops",name:"Mtn Ops",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {id:"crispi",name:"Crispi",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {id:"yeti",name:"Yeti",freeAt:0,ship:0,loyalty:null,cat:"boutique"},
  {
    id:"gohunt",name:"GoHunt Gear",freeAt:99,ship:9,cat:"specialty",
    loyalty:{name:"GoHunt Points",desc:"5% back in GoHunt points"},
  },
];

const PORTAL = {
  name:"Timberline Deal Tracker",tagline:"Western - Elk - Backcountry",
  accent:"#2d6a4f",icon:"🏔",
  brands:["Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock","Exo Mtn Gear","Kings Camo","Kifaru","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","GoHunt","Bridger Watch","Aziak","Wiser Precision","Kapture","Grakksaw","OBI","Bridger Boiler","Javelin Bipod","Spartan Precision","Sneek Tec","Keen","Katabatic Gear","Zpacks","Flextail","Ollin","Magview","Mtn Tough","Mtn Ops","Sig Sauer","Crispi","Yeti"],
  stores:["sitka","firstlite","kuiu","stoneglacier","eberlestock","exomtn","bridgerwatch","aziak","wiserprecision","kapturegear","grakksaw","obigear","bridgerboiler","javelinbipod","sneektec","keen","katabatic","zpacks","flextail","ollin","magview","mtntough","mtnops","crispi","yeti","gohunt"],
  searchHint:'Try "Sitka Kelvin Down" or "Vortex Razor HD 10x42"...',
  dealCats:["Insulation","Base Layer","Wind Layer","Pants","Bibs","Packs","Optics","Boots"],
  searchContext:"western hunting, elk, mule deer, backcountry, high country, pack-in, high altitude",
};

// Single brand palette — Sitka cinematic black panels + First Lite cream content + Kuiu orange CTA
const PALETTE = {
  bg:"#fbfaf6",bgCard:"#ffffff",bgSolid:"#ffffff",
  bgHeader:"#15140f",border:"#e6e1d4",borderHov:"#1a1815",
  text:"#1a1815",textSub:"#57544c",textMuted:"#9a968c",
  accent:"#2d5a3d",accentLight:"#eef3ee",accentBorder:"#b8cdbc",
  orange:"#c4501e",orangeLight:"#fdf3e8",orangeBorder:"#e8b890",
  red:"#a83a2a",redLight:"#fdf0ee",redBorder:"#e8b0a0",
  navActive:"#eef3ee",
  shadow:"rgba(20,18,12,0.05)",shadowHov:"rgba(20,18,12,0.14)",
  // Cinematic dark panels for header + page hero
  panelBg:"#15140f",panelText:"#f5f1e9",panelSub:"#b8b3a8",panelMuted:"#6a665c",panelBorder:"#2a2823",panelAccent:"#a8d4b0",
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
};


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

const APPAREL_RX=/\b(t-?shirt|tee|hoodie|sweatshirt|long\s*sleeve|crew|pullover|hat|cap|beanie|trucker|sticker|decal|patch|koozie|mug|tumbler|lanyard|keychain|flag|poster|logo)\b/i;
const isApparel=(...parts)=>APPAREL_RX.test(parts.filter(Boolean).join(" "));

function VideoPanel({deal,T}) {
  if(!deal)return null;
  if(isApparel(deal.cat,deal.product))return null;
  const query=deal.brand+" "+deal.product+" official review Mindful Hunter";
  const url="https://www.youtube.com/results?search_query="+encodeURIComponent(query);
  return (
    <div style={{marginBottom:24}}>
      <a href={url} target="_blank" rel="noopener noreferrer"
         style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 20px",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:10,textDecoration:"none",color:T.text,fontSize:13,fontWeight:600,transition:"border-color 0.15s, background 0.15s"}}>
        <span style={{color:T.accent,fontSize:16}}>▶</span>
        Click here for more info on this product
      </a>
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
  const save=Math.round((d.orig-d.sale)*100)/100;
  const tags=memberFilter==="All"?d.tags:d.tags.filter(t=>t===memberFilter);
  if(memberFilter!=="All"&&tags.length===0)return null;
  return (
    <div
      onClick={()=>onOpen(d)}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background:T.bgCard,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:16,
        cursor:"pointer",overflow:"hidden",position:"relative",zIndex:1,
        transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s, border-color 0.25s",
        transform:hov?"translateY(-3px)":"none",
        border:`1px solid ${d.fake?T.redBorder:hov?T.borderHov:T.border}`,
        boxShadow:hov?`0 20px 56px ${T.shadowHov}`:`0 2px 8px ${T.shadow}`,
      }}
    >
      {d.image&&(
        <div style={{position:"relative",width:"100%",paddingBottom:"66%",background:T.bgSolid,overflow:"hidden"}}>
          <img src={d.image} alt={d.product} loading="lazy"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s",transform:hov?"scale(1.04)":"none"}}
            onError={e=>{e.currentTarget.style.display="none";}}
          />
        </div>
      )}
      <div style={{padding:"22px 22px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"0.16em",fontFamily:"'JetBrains Mono',monospace"}}>{d.brand.toUpperCase()}</span>
            <span style={{width:3,height:3,borderRadius:"50%",background:T.borderHov}}/>
            <span style={{fontSize:10,color:T.textMuted,letterSpacing:"0.12em",fontFamily:"'JetBrains Mono',monospace"}}>{d.cat.toUpperCase()}</span>
          </div>
          {d.fake?(
            <span style={{background:T.redLight,color:T.red,border:`1px solid ${T.redBorder}`,borderRadius:6,fontSize:9,fontWeight:800,padding:"4px 9px",letterSpacing:"0.08em",fontFamily:"'JetBrains Mono',monospace"}}>FAKE SALE</span>
          ):(
            <span style={{background:T.orange,color:"white",borderRadius:6,fontSize:11,fontWeight:800,padding:"4px 10px",letterSpacing:"0.04em"}}>−{disc}%</span>
          )}
        </div>
        <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:600,fontSize:21,color:T.text,lineHeight:1.2,marginBottom:14,letterSpacing:"-0.01em"}}>{d.product}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:14}}>
          <span style={{fontWeight:800,fontSize:30,color:d.fake?T.red:T.text,letterSpacing:"-0.02em"}}>${d.sale}</span>
          <span style={{fontSize:15,color:T.textMuted,textDecoration:"line-through"}}>${d.orig}</span>
          <span style={{fontSize:12,fontWeight:700,color:d.fake?T.red:T.accent,marginLeft:"auto"}}>Save ${save}</span>
        </div>
        {d.fake&&(
          <div style={{background:T.redLight,border:`1px solid ${T.redBorder}`,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
            <span style={{color:T.red,fontSize:12,lineHeight:1.5}}>{d.fakeNote}</span>
          </div>
        )}
        <p style={{fontSize:13,color:T.textSub,margin:"0 0 16px",lineHeight:1.6}}>{d.blurb}</p>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:T.textMuted,letterSpacing:"0.18em",marginBottom:6,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>PRICE HISTORY</div>
          <Spark history={d.history} fake={d.fake} T={T}/>
        </div>
        {tags.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {tags.map(tag=>{
              const idx=family.findIndex(f=>f.name===tag);
              const col=MC[idx%MC.length];
              return (
                <span key={tag} style={{background:col+"15",color:col,border:`1px solid ${col}33`,borderRadius:999,padding:"3px 11px",fontSize:11,fontWeight:600}}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div style={{marginTop:6,padding:"14px 22px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",flex:1}}>
          {[...d.sizes.mens,...d.sizes.womens,...d.sizes.youth].slice(0,5).map(sz=>(
            <span key={sz} style={{background:T.bgSolid,border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 9px",fontSize:10,color:T.textSub,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{sz}</span>
          ))}
        </div>
        <a
          href={d.url} target="_blank" rel="noopener noreferrer"
          onClick={e=>e.stopPropagation()}
          style={{color:"white",borderRadius:9,padding:"9px 18px",fontSize:12,fontWeight:700,textDecoration:"none",background:d.fake?T.red:T.text,letterSpacing:"0.02em",whiteSpace:"nowrap",transition:"opacity 0.15s"}}
        >
          {d.fake?"View anyway →":"Shop →"}
        </a>
      </div>
      {d.coupon&&(
        <div style={{padding:"10px 22px 14px",borderTop:`1px dashed ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:10,color:T.orange,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,letterSpacing:"0.12em"}}>COUPON</span>
          <code style={{background:T.orangeLight,color:T.orange,border:`1px dashed ${T.orangeBorder}`,borderRadius:6,padding:"3px 11px",fontSize:12,fontWeight:700,letterSpacing:"0.14em",fontFamily:"'JetBrains Mono',monospace"}}>{d.coupon}</code>
        </div>
      )}
    </div>
  );
}

function DealModal({deal,family,T,onClose}) {
  if(!deal)return null;
  const disc=Math.round((1-deal.sale/deal.orig)*100);
  const save=Math.round((deal.orig-deal.sale)*100)/100;
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
              <div style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"0.12em",fontFamily:"'JetBrains Mono',monospace",marginBottom:6}}>
                {deal.brand.toUpperCase()} | {deal.cat.toUpperCase()}
              </div>
              <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:26,color:T.text,lineHeight:1.2}}>{deal.product}</div>
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
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>PRICE HISTORY</div>
            <Spark history={deal.history} fake={deal.fake} T={T}/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.textMuted,marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>
              <span>FIRST TRACKED</span><span>TODAY</span>
            </div>
          </div>
          <VideoPanel deal={deal} T={T}/>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>SIZES IN STOCK</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[...deal.sizes.mens,...deal.sizes.womens,...deal.sizes.youth].map(sz=>(
                <span key={sz} style={{background:T.border,borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:600,color:T.textSub}}>{sz}</span>
              ))}
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>FOR YOUR FAMILY</div>
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
              <span style={{color:T.orange,fontSize:11,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>COUPON</span>
              <code style={{color:T.orange,fontSize:20,fontWeight:800,letterSpacing:"0.15em"}}>{deal.coupon}</code>
            </div>
          )}
          <a
            href={deal.url} target="_blank" rel="noopener noreferrer"
            style={{display:"block",width:"100%",textAlign:"center",color:"white",borderRadius:12,padding:"15px",fontSize:16,fontWeight:700,textDecoration:"none",background:deal.fake?T.red:T.accent}}
          >
            {deal.fake?"View on "+deal.brand+" (proceed with caution)":"Shop "+deal.brand+" -- $"+deal.sale}
          </a>
          <p style={{textAlign:"center",color:T.textMuted,fontSize:10,marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>
            Timberline earns a small commission -- never affects your price
          </p>
        </div>
      </div>
    </div>
  );
}

function matchDealsForItem(item, deals, member) {
  const words = item.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (!words.length) return [];
  return deals
    .map(d => {
      const text = (d.product+" "+d.cat+" "+d.brand).toLowerCase();
      const wordScore = words.reduce((s, w) => s + (text.includes(w) ? 1 : 0), 0);
      const memberMatch = d.tags.includes(member.name) ? 0.5 : 0;
      return { deal: d, score: wordScore + memberMatch };
    })
    .filter(x => x.score >= 1)
    .sort((a, b) => b.score - a.score || a.deal.sale - b.deal.sale)
    .slice(0, 3)
    .map(x => x.deal);
}

function GearAdvisor({member,memberIdx,deals,setFamily,T}) {
  const [input, setInput] = useState("");
  const items = member.lookingFor || [];
  const addItem = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    setFamily(prev => {
      const u = [...prev];
      u[memberIdx] = {...u[memberIdx], lookingFor: [...(u[memberIdx].lookingFor||[]), v]};
      return u;
    });
    setInput("");
  };
  const removeItem = (it) => setFamily(prev => {
    const u = [...prev];
    u[memberIdx] = {...u[memberIdx], lookingFor: (u[memberIdx].lookingFor||[]).filter(x => x !== it)};
    return u;
  });
  return (
    <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:16}}>
      <div style={{fontSize:10,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em",marginBottom:8}}>LOOKING FOR</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
        {items.map(it => (
          <span key={it} style={{background:T.accentLight,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:999,padding:"4px 8px 4px 12px",fontSize:12,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6}}>
            {it}
            <button onClick={()=>removeItem(it)} style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontSize:14,lineHeight:1,padding:0,opacity:0.6}}>×</button>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:items.length?12:0}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&addItem()}
          placeholder="e.g. insulated jacket, lightweight pack"
          style={{flex:1,padding:"7px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.bgSolid,color:T.text,fontSize:12,outline:"none",fontFamily:"inherit"}}
        />
        <button onClick={addItem} style={{background:T.accent,color:"white",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Add</button>
      </div>
      {items.length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:12}}>
          {items.map(it => {
            const matches = matchDealsForItem(it, deals, member);
            return (
              <div key={it}>
                <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:6}}>{it}</div>
                {matches.length === 0 ? (
                  <div style={{fontSize:11,color:T.textMuted,fontStyle:"italic",padding:"6px 0"}}>No matches yet — check back as new deals scrape in.</div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {matches.map(d => {
                      const disc = Math.round((1 - d.sale/d.orig)*100);
                      return (
                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                          <div style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,cursor:"pointer"}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:10,color:T.accent,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>{d.brand.toUpperCase()}</div>
                              <div style={{fontSize:12,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.product}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:14,fontWeight:800,color:T.text}}>${d.sale}</div>
                              <div style={{fontSize:10,color:T.orange,fontWeight:700}}>−{disc}%</div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>{P.icon} {P.name}</div>
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

function PrefsModal({T,prefs,setPrefs,stores,setStores,brandList,onClose}) {
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
            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>My Preferences</div>
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
                {brandList.map(b=>{
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
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em",marginBottom:8}}>{g.label.toUpperCase()}</div>
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
                          {!on&&<span style={{fontSize:11,color:T.red,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>HIDDEN</span>}
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
          <div style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>{(prefs.hunts||[]).length} hunt types | {stores.length} stores</div>
          <button onClick={onClose} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"9px 24px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
}

function PriceSearch({T,P,wishlist,setWishlist,deals,family,onOpenDeal}) {
  const [query,setQuery]=useState("");
  const trimmed = query.trim().toLowerCase();

  const results = useMemo(()=>{
    const t = query.trim().toLowerCase();
    const words = t ? t.split(/\s+/).filter(w=>w.length>1) : [];
    if (!words.length) return [];
    return deals
      .map(d => {
        const text = ((d.product||"")+" "+(d.brand||"")+" "+(d.cat||"")).toLowerCase();
        const matched = words.filter(w => text.includes(w)).length;
        const productHit = words.filter(w => (d.product||"").toLowerCase().includes(w)).length;
        return { d, score: matched + productHit };
       })
      .filter(x => x.score >= words.length)
      .sort((a,b) => (a.d.fake?1:0) - (b.d.fake?1:0) || b.score - a.score || a.d.sale - b.d.sale)
      .slice(0, 60)
      .map(x => x.d);
  }, [query, deals]);

  const inWishlist = (q) => wishlist.some(w => (w.query||w.productName||"") === q);
  const toggleWishlist = () => {
    if (!trimmed) return;
    if (inWishlist(trimmed)) setWishlist(w => w.filter(x => (x.query||x.productName) !== trimmed));
    else setWishlist(p => [...p, { query: trimmed, addedAt: new Date().toISOString() }]);
  };

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={P.searchHint} style={{flex:1,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 20px",fontSize:15,color:T.text,outline:"none",backdropFilter:"blur(8px)",fontFamily:"inherit"}}/>
        {trimmed && (
          <button onClick={toggleWishlist} style={{border:`1px solid ${inWishlist(trimmed)?T.accent:T.border}`,borderRadius:12,padding:"14px 22px",fontWeight:600,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",background:inWishlist(trimmed)?T.accentLight:"transparent",color:inWishlist(trimmed)?T.accent:T.textSub}}>
            {inWishlist(trimmed) ? "★ Saved" : "☆ Save search"}
          </button>
        )}
      </div>

      {!trimmed && wishlist.length > 0 && (
        <div style={{marginBottom:28}}>
          <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.1em",marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>SAVED SEARCHES</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {wishlist.map((w,i)=>(
              <button key={i} onClick={()=>setQuery(w.query||w.productName||"")} style={{background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:999,padding:"6px 16px",cursor:"pointer",color:T.textSub,fontSize:12,fontWeight:600}}>
                {w.query||w.productName}
              </button>
            ))}
          </div>
        </div>
      )}

      {!trimmed && (
        <div style={{padding:"32px 24px",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,textAlign:"center"}}>
          <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:20,color:T.text,marginBottom:8}}>Search active deals</div>
          <p style={{fontSize:13,color:T.textSub,lineHeight:1.6,maxWidth:520,margin:"0 auto"}}>Type a brand or product (e.g. "kuiu attack pant", "exo k4 pack", "sitka kelvin"). Only shows items currently on sale across our {deals.length}+ tracked deals — no fake prices.</p>
        </div>
      )}

      {trimmed && (
        <>
          <div style={{marginBottom:16,color:T.textMuted,fontSize:12,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.06em"}}>
            {results.length} MATCH{results.length===1?"":"ES"} IN ACTIVE DEALS
          </div>
          {results.length > 0 ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
              {results.map(d => (
                <DealCard key={d.id} d={d} family={family} memberFilter="All" onOpen={onOpenDeal} T={T}/>
              ))}
            </div>
          ) : (
            <div style={{padding:"40px 24px",background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:12,textAlign:"center"}}>
              <div style={{fontSize:14,color:T.text,marginBottom:6,fontWeight:600}}>No active deals match "{trimmed}"</div>
              <p style={{fontSize:12,color:T.textMuted,lineHeight:1.6,maxWidth:440,margin:"0 auto"}}>Save this search and we'll show it next time a matching deal scrapes in. Or try fewer/different keywords.</p>
            </div>
          )}
        </>
      )}
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
      ? {jacket:"YM",shirt:"YM",base:"YS",pants:"YM",boots:"5"}
      : gender === "womens"
      ? {jacket:"M",shirt:"M",base:"S",pants:"8",boots:"8"}
      : {jacket:"L",shirt:"L",base:"L",pants:"34x32",boots:"10"};
    setFamily(prev => [...prev, {name:n, gender, ...defaults, lookingFor:[]}]);
    setName("");
    setGender("mens");
    setAdding(false);
  };

  if (adding) {
    return (
      <div style={{background:T.bgCard,border:`1.5px solid ${T.accent}`,borderRadius:16,padding:"24px 20px",backdropFilter:"blur(12px)"}}>
        <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:16,color:T.text,marginBottom:6}}>
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
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,lookingFor:r.looking_for||[]})));
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
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,lookingFor:r.looking_for||[]})));
        }).catch(()=>{});
      }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    // Initial fast fetch (100 for snappy first paint), then page through the rest in 1000-row chunks
    const PAGE = 1000;
    sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc",limit:"100",offset:"0"})
      .then(rows=>{
        if(rows&&rows.length) setDeals(rows.map(parseDeal));
        const loadMore = async (offset) => {
          const more = await sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc",limit:String(PAGE),offset:String(offset)});
          if (more && more.length) {
            setDeals(prev=>[...prev,...more.map(parseDeal)]);
            if (more.length === PAGE) await loadMore(offset + PAGE);
          }
        };
        return loadMore(100);
      })
      .catch(()=>{});
    sbGet("coupons",{select:"*",active:"eq.true",order:"verified.desc",limit:"50"})
      .then(rows=>{
        if(!rows||!rows.length)return;
        const now=Date.now();
        const valid=rows.filter(r=>!r.expires_at||new Date(r.expires_at).getTime()>now);
        setDbCoupons(valid.map(parseCoupon));
      })
      .catch(()=>{});
  },[]);
  const T=PALETTE;
  const P=PORTAL;
  const isGuest=!user;
  const liveBrands=useMemo(
    ()=>[...new Set(deals.map(d=>d.brand))].sort(),
    [deals]
  );

  const taggedDeals=useMemo(
    ()=>deals.map(d=>({...d,tags:computeTags(d,family)})),
    [deals,family]
  );
  const sortedDeals=taggedDeals;
  const filtered=sortedDeals.filter(d=>{
    if(brandFilter!=="All"&&d.brand!==brandFilter)return false;
    if(memberFilter!=="All"&&!d.tags.includes(memberFilter))return false;
    return true;
  });
  const portalCoupons=dbCoupons;
  const BRANDS_LIST=liveBrands;
  const TABS=[{id:"deals",label:"Deals"},{id:"search",label:"Price Search"},{id:"coupons",label:"Coupon Codes"},...(user?[{id:"family",label:"Family"}]:[])];
  const memberNames=["All",...family.map(f=>f.name)];
  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif",position:"relative",transition:"background 0.3s",color:T.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${T.borderHov};}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        a{color:inherit;text-decoration:none;}
        button{font-family:inherit;}
        input,select,textarea{font-family:inherit;}
        @media (max-width:768px){
          .tl-header-inner{padding:10px 14px !important;height:auto !important;flex-wrap:wrap !important;gap:10px !important;}
          .tl-header-brand-sub{display:none !important;}
          .tl-header-nav{order:3 !important;width:100% !important;justify-content:center !important;overflow-x:auto !important;flex-wrap:wrap !important;}
          .tl-header-pref{display:none !important;}
          .tl-page-hero{padding:32px 16px 28px !important;}
          .tl-page-hero h1{font-size:36px !important;}
          .tl-page-body{padding:20px 16px 48px !important;}
        }
      `}</style>
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.025,mixBlendMode:"multiply"}} aria-hidden="true">
        <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#paperNoise)"/>
      </svg>
      <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`,position:"sticky",top:0,zIndex:100}}>
        <div className="tl-header-inner" style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72}}>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:24,color:T.panelText,letterSpacing:"-0.02em"}}>Timberline</div>
            <div className="tl-header-brand-sub" style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:10,color:T.panelAccent,letterSpacing:"0.28em",textTransform:"uppercase"}}>Deal Tracker</div>
          </div>
          <nav className="tl-header-nav" style={{display:"flex",gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500,transition:"color 0.18s",background:"transparent",color:tab===t.id?T.panelText:T.panelMuted}}>
                {t.label}
              </button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {user&&<button className="tl-header-pref" onClick={()=>setShowPrefs(true)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:13,color:T.panelMuted,fontWeight:500}}>Preferences</button>}
            {user?(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:T.panelAccent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:T.panelBg}}>{user.avatar}</div>
                <button onClick={()=>{supabase.auth.signOut();setUser(null);setFamily([]);}} style={{background:"transparent",border:`1px solid ${T.panelBorder}`,borderRadius:6,padding:"6px 12px",cursor:"pointer",fontSize:12,color:T.panelMuted,fontWeight:500}}>Log out</button>
              </div>
            ):(
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:"transparent",border:`1px solid ${T.panelBorder}`,borderRadius:6,padding:"7px 16px",cursor:"pointer",fontSize:13,color:T.panelText,fontWeight:500}}>Log in</button>
                <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.panelText,border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontSize:13,color:T.panelBg,fontWeight:600}}>Sign up free</button>
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
      <div style={{position:"relative",zIndex:1}}>
        {tab==="deals"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
              <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:10,letterSpacing:"-0.02em",lineHeight:1.05}}>Active Drops</h1>
                <p style={{color:T.panelSub,fontSize:14,letterSpacing:"0.01em"}}><strong style={{color:T.panelText}}>{filtered.filter(d=>!d.fake).length}</strong> verified deals · <span style={{color:T.red}}>{filtered.filter(d=>d.fake).length}</span> fake sales flagged</p>
              </div>
            </div>
            <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
              <div style={{display:"flex",gap:20,marginBottom:32,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>MEMBER</span>
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
                  <span style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>BRAND</span>
                  {["All",...BRANDS_LIST].map(b=>(
                    <button key={b} onClick={()=>setBrandFilter(b)} style={{padding:"5px 14px",borderRadius:999,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",border:`1px solid ${brandFilter===b?T.accent:T.border}`,background:brandFilter===b?T.accentLight:T.bgCard,color:brandFilter===b?T.accent:T.textMuted}}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
              {filtered.length===0?(
                <div style={{color:T.textMuted,padding:40,fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>No deals match these filters.</div>
              ):filtered.map(d=>(
                <DealCard key={d.id} d={d} family={family} memberFilter={memberFilter} onOpen={setModalDeal} T={T}/>
              ))}
              </div>
            </div>
          </div>
        )}
        {tab==="search"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
              <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.05}}>Price Search</h1>
                <p style={{color:T.panelSub,fontSize:14}}>Find the cheapest place to buy any hunting gear, anywhere.</p>
              </div>
            </div>
            <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
              <PriceSearch T={T} P={P} wishlist={wishlist} setWishlist={setWishlist} deals={taggedDeals} family={family} onOpenDeal={setModalDeal}/>
            </div>
          </div>
        )}
        {tab==="coupons"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
              <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.05}}>Active Codes</h1>
                <p style={{color:T.panelSub,fontSize:14}}>Verified today. Click any card to visit the brand.</p>
              </div>
            </div>
            <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px",display:"grid",gap:14}}>
              {portalCoupons.map((c,i)=>(
                <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                  <div style={{background:T.bgCard,backdropFilter:"blur(12px)",borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,cursor:"pointer",boxShadow:`0 2px 12px ${T.shadow}`,border:`1px solid ${c.verified?T.border:T.redBorder}`}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:T.accent,letterSpacing:"0.1em",fontFamily:"'JetBrains Mono',monospace",marginBottom:5}}>{c.brand.toUpperCase()}</div>
                      <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:20,color:T.text,marginBottom:5}}>{c.discount}</div>
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
              <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:20,marginTop:60}}>👨‍👩‍👧‍👦</div>
                <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:28,color:T.text,marginBottom:12}}>Family Profiles</h2>
                <p style={{fontSize:15,color:T.textSub,maxWidth:440,lineHeight:1.7,marginBottom:32}}>Add everyone in your family with their sizes. Deals get automatically tagged to whoever they fit.</p>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"13px 32px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Create Free Account</button>
                  <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:T.bgCard,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 24px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Log In</button>
                </div>
              </div>
            ):(
              <>
                <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
                  <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                    <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.05}}>Family Profiles</h1>
                    <p style={{color:T.panelSub,fontSize:14}}>Deals auto-tagged by size · AI gear advisor per member</p>
                  </div>
                </div>
                <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
                  {family.map((m,idx)=>{
                    const col=MC[idx%MC.length];
                    const mDeals=taggedDeals.filter(d=>d.tags.includes(m.name));
                    const SIZE_FIELDS=[["🧥","JACKET",m.jacket],["👕","SHIRT",m.shirt],["👕","BASE",m.base],["👖","PANTS",m.pants],["🥾","BOOTS",m.boots]];
                    return (
                      <div key={idx} style={{background:T.bgCard,backdropFilter:"blur(12px)",border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:`0 2px 12px ${T.shadow}`,position:"relative",zIndex:1}}>
                        <div style={{height:4,background:col}}/>
                        <div style={{padding:"18px 18px 16px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:col}}>{m.name}</div>
                            <button onClick={()=>setEditIdx(editIdx===idx?null:idx)} style={{background:T.border,border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:11,color:T.textSub,fontWeight:600}}>{editIdx===idx?"Done":"Edit"}</button>
                          </div>
                          {editIdx===idx?(
                            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                              {["jacket","shirt","base","pants","boots"].map(field=>(
                                <div key={field} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                  <span style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>{field.toUpperCase()}</span>
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
                                  <div style={{fontSize:9,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em",marginBottom:3}}>{label}</div>
                                  <div style={{fontSize:16,fontWeight:800,color:T.text}}>{val}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${T.border}`}}>
                            <span style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>ACTIVE DEALS</span>
                            <span style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:col}}>{mDeals.length}</span>
                          </div>
                          <GearAdvisor member={m} memberIdx={idx} deals={taggedDeals} setFamily={setFamily} T={T}/>
                        </div>
                      </div>
                    );
                  })}
                  <AddMemberCard setFamily={setFamily} T={T}/>
                </div>
                </div>
              </>
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
                        base:r.base,pants:r.pants,boots:r.boots,lookingFor:r.looking_for||[],
                      })));
                    }
                  }).catch(()=>{});
                });
              }
            }} onClose={()=>setShowAuth(false)}/>}
      {showPrefs&&<PrefsModal T={T} prefs={prefs} setPrefs={setPrefs} stores={stores} setStores={setStores} brandList={liveBrands} onClose={()=>setShowPrefs(false)}/>}
      <DealModal deal={modalDeal} family={family} T={T} onClose={()=>setModalDeal(null)}/>
    </div>
  );
}
