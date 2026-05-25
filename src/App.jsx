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

const BRAND_DOMAINS = {
  "Sitka":"sitkagear.com","First Lite":"firstlite.com","Kuiu":"kuiu.com",
  "Stone Glacier":"stoneglacier.com","Eberlestock":"eberlestock.com",
  "Exo Mtn Gear":"exomtngear.com","Kings Camo":"kingscamo.com",
  "Kifaru":"kifaru.net","Mystery Ranch":"mysteryranch.com",
  "Vortex":"vortexoptics.com","Leupold":"leupold.com","Swarovski":"swarovskioptik.com",
  "Garmin":"garmin.com","onX":"onxmaps.com","GoHunt":"gohunt.com",
  "Bridger Watch":"bridgerwatch.com","Aziak":"aziak.com",
  "Wiser Precision":"wiserprecision.com","Kapture":"kapturegear.com",
  "Grakksaw":"grakksaw.com","OBI":"obigear.com","Bridger Boiler":"bridgerboiler.com",
  "Javelin Bipod":"javelinbipod.com","Sneek Tec":"sneektec.com",
  "Keen":"keenfootwear.com","Katabatic Gear":"katabaticgear.com",
  "Zpacks":"zpacks.com","Flextail":"flextail.com","Ollin":"ollin.co",
  "Magview":"magview.com","Mtn Tough":"mtntough.com","Mtn Ops":"mtnops.com",
  "Sig Sauer":"sigsauer.com","Crispi":"crispiusa.com","Yeti":"yeti.com",
  "Drake Waterfowl":"drakewaterfowl.com","Outdoor Research":"outdoorresearch.com",
  "Marsupial Gear":"marsupialgear.com","Outdoorsmans":"outdoorsmans.com",
  "GSI Outdoors":"gsioutdoors.com","Blue Coolers":"bluecoolers.com",
  "Hoyt":"hoyt.com","Mathews":"mathewsinc.com","Maven":"mavenbuilt.com",
  "Forloh":"forloh.com","Kryptek":"kryptek.com",
  "Montana Knife Company":"montanaknifecompany.com","Kenetrek":"kenetrek.com",
  "Primos":"primos.com","Canvas Cutter":"canvascutter.com",
  "Outdoor Edge":"outdooredge.com","Nemo Equipment":"nemoequipment.com",
  "Badlands":"badlandspacks.com","Wilderness Athlete":"wildernessathlete.com",
  "Mountain House":"mountainhouse.com","Beyond Clothing":"beyondclothing.com",
  "Outdoor Vitals":"outdoorvitals.com","Tricer":"tricer.com",
  "Initial Ascent":"initialascent.com","Peak Refuel":"peakrefuel.com",
  "Sheep Feet":"sheepfeetoutdoors.com","Pnuma Outdoors":"pnumaoutdoors.com",
  "Wildtech Gear":"wildtechgear.com","Thermarest":"thermarest.com",
  "Helinox":"helinox.com","Duckworth":"duckworthco.com",
  "Chota Outdoor":"chotaoutdoorgear.com","Goat Knives":"goatknives.com",
  "Darn Tough":"darntough.com","FHF Gear":"fhfgear.com",
  "Peax Equipment":"peaxequipment.com","On Glass":"onglassadapter.com",
  "Schnees":"schnees.com","Benchmade":"benchmade.com","Phelps Game Calls":"phelpsgamecalls.com","Lone Wolf Custom Gear":"lonewolfcustomgear.com","Trophyline":"trophyline.com","Higdon Outdoors":"higdonoutdoors.com","Tanglefree":"tanglefree.com","Rig Em Right":"rigemright.com","MotionDucks":"motionducks.com","Buck Gardner":"buckgardner.com","Duck Creek Decoys":"duckcreekdecoys.com","Chenegear":"chenegear.com","Quickcoys":"quickcoys.com",
};

function BrandLogo({brand, T, size=14}) {
  const dom = BRAND_DOMAINS[brand];
  const [fail, setFail] = useState(false);
  if (!dom || fail) {
    return <span style={{fontSize:10,fontWeight:700,color:T.accent,letterSpacing:"0.16em",fontFamily:"'JetBrains Mono',monospace"}}>{(brand||"").toUpperCase()}</span>;
  }
  return <img src={`https://logo.clearbit.com/${dom}`} alt={brand} style={{height:size,width:"auto",maxWidth:90,objectFit:"contain",verticalAlign:"middle"}} onError={()=>setFail(true)}/>;
}



function sbGet(table,params){
  const url=new URL(SB_URL+"/rest/v1/"+table);
  if(params)Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  return fetch(url,{headers:SB_H}).then(r=>r.json());
}

function getSessionId() {
  try {
    let s = localStorage.getItem("timberline-sid");
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("timberline-sid", s); }
    return s;
  } catch { return null; }
}

function logClick(d) {
  try {
    fetch(SB_URL+"/rest/v1/clicks", {
      method: "POST",
      headers: { ...SB_H, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({
        deal_id: d.id, brand: d.brand, product: d.product, url: d.url,
        session_id: getSessionId(),
      }),
      keepalive: true,
    }).catch(()=>{});
  } catch { /* never block the click */ }
}

async function loadFamily(userId, token) {
  const r = await fetch(SB_URL+"/rest/v1/family_members?user_id=eq."+userId+"&order=sort_order.asc", {
    headers:{apikey:SB_KEY, Authorization:"Bearer "+token}
  });
  return r.json();
}


async function loadWishlist(token) {
  try {
    const r = await fetch(SB_URL+"/rest/v1/wishlist_searches?select=id,query,created_at&muted=eq.false&order=created_at.desc", {
      headers:{apikey:SB_KEY, Authorization:"Bearer "+token}
    });
    if (!r.ok) return [];
    const rows = await r.json();
    return rows.map(r => ({ id:r.id, query:r.query, addedAt:r.created_at }));
  } catch { return []; }
}

async function saveWishlistItem(query, token, portal) {
  try {
    const r = await fetch(SB_URL+"/rest/v1/wishlist_searches", {
      method:"POST",
      headers:{apikey:SB_KEY, Authorization:"Bearer "+token, "Content-Type":"application/json", Prefer:"return=representation"},
      body: JSON.stringify({ query, portal: portal || "timberline" }),
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return rows[0]?.id || null;
  } catch { return null; }
}

async function deleteWishlistItem(id, token) {
  try {
    await fetch(SB_URL+"/rest/v1/wishlist_searches?id=eq."+id, {
      method:"DELETE",
      headers:{apikey:SB_KEY, Authorization:"Bearer "+token},
    });
  } catch { /* ignore */ }
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
    createdAt:row.created_at,
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

const MC = ["#cc5500"];

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
  {id:"sitka",name:"Sitka",brand:"Sitka",loyalty:null,cat:"boutique"},
  {id:"firstlite",name:"First Lite",brand:"First Lite",loyalty:null,cat:"boutique"},
  {id:"kuiu",name:"Kuiu",brand:"Kuiu",loyalty:null,cat:"boutique"},
  {id:"stoneglacier",name:"Stone Glacier",brand:"Stone Glacier",cat:"boutique",loyalty:null},
  {id:"eberlestock",name:"Eberlestock",brand:"Eberlestock",loyalty:null,cat:"boutique"},
  {id:"exomtn",name:"Exo Mtn Gear",brand:"Exo Mtn Gear",loyalty:null,cat:"boutique"},
  {id:"bridgerwatch",name:"Bridger Watch",brand:"Bridger Watch",loyalty:null,cat:"boutique"},
  {id:"aziak",name:"Aziak Equipment",brand:"Aziak",loyalty:null,cat:"boutique"},
  {id:"wiserprecision",name:"Wiser Precision",brand:"Wiser Precision",loyalty:null,cat:"boutique"},
  {id:"kapturegear",name:"Kapture Gear",brand:"Kapture",loyalty:null,cat:"boutique"},
  {id:"grakksaw",name:"Grakksaw",brand:"Grakksaw",loyalty:null,cat:"boutique"},
  {id:"obigear",name:"OBI Gear",brand:"OBI",loyalty:null,cat:"boutique"},
  {id:"bridgerboiler",name:"Bridger Boiler",brand:"Bridger Boiler",loyalty:null,cat:"boutique"},
  {id:"javelinbipod",name:"Javelin Bipod",brand:"Javelin Bipod",loyalty:null,cat:"boutique"},
  {id:"sneektec",name:"Sneek Tec",brand:"Sneek Tec",loyalty:null,cat:"boutique"},
  {id:"keen",name:"Keen",brand:"Keen",loyalty:null,cat:"boutique"},
  {id:"katabatic",name:"Katabatic Gear",brand:"Katabatic Gear",loyalty:null,cat:"boutique"},
  {id:"zpacks",name:"Zpacks",brand:"Zpacks",loyalty:null,cat:"boutique"},
  {id:"flextail",name:"Flextail",brand:"Flextail",loyalty:null,cat:"boutique"},
  {id:"ollin",name:"Ollin",brand:"Ollin",loyalty:null,cat:"boutique"},
  {id:"magview",name:"Magview",brand:"Magview",loyalty:null,cat:"boutique"},
  {id:"mtntough",name:"Mtn Tough",brand:"Mtn Tough",loyalty:null,cat:"boutique"},
  {id:"mtnops",name:"Mtn Ops",brand:"Mtn Ops",loyalty:null,cat:"boutique"},
  {id:"crispi",name:"Crispi",brand:"Crispi",loyalty:null,cat:"boutique"},
  {id:"yeti",name:"Yeti",brand:"Yeti",loyalty:null,cat:"boutique"},
  {id:"drake",name:"Drake Waterfowl",brand:"Drake Waterfowl",loyalty:null,cat:"boutique"},
  {id:"outdoorresearch",name:"Outdoor Research",brand:"Outdoor Research",loyalty:null,cat:"boutique"},
  {id:"kingscamo",name:"Kings Camo",brand:"Kings Camo",loyalty:null,cat:"boutique"},
  {id:"marsupialgear",name:"Marsupial Gear",brand:"Marsupial Gear",loyalty:null,cat:"boutique"},
  {id:"outdoorsmans",name:"Outdoorsmans",brand:"Outdoorsmans",loyalty:null,cat:"specialty"},
  {id:"gsioutdoors",name:"GSI Outdoors",brand:"GSI Outdoors",loyalty:null,cat:"boutique"},
  {id:"bluecoolers",name:"Blue Coolers",brand:"Blue Coolers",loyalty:null,cat:"boutique"},
  {id:"hoyt",name:"Hoyt",brand:"Hoyt",loyalty:null,cat:"boutique"},
  {id:"maven",name:"Maven",brand:"Maven",loyalty:null,cat:"boutique"},
  {id:"mathews",name:"Mathews",brand:"Mathews",loyalty:null,cat:"boutique"},
  {id:"forloh",name:"Forloh",brand:"Forloh",loyalty:null,cat:"boutique"},
  {id:"kryptek",name:"Kryptek",brand:"Kryptek",loyalty:null,cat:"boutique"},
  {id:"mkc",name:"Montana Knife Company",brand:"Montana Knife Company",loyalty:null,cat:"boutique"},
  {id:"kenetrek",name:"Kenetrek",brand:"Kenetrek",loyalty:null,cat:"boutique"},
  {id:"primos",name:"Primos",brand:"Primos",loyalty:null,cat:"boutique"},
  {id:"canvascutter",name:"Canvas Cutter",brand:"Canvas Cutter",loyalty:null,cat:"boutique"},
  {id:"outdooredge",name:"Outdoor Edge",brand:"Outdoor Edge",loyalty:null,cat:"boutique"},
  {id:"nemo",name:"Nemo Equipment",brand:"Nemo Equipment",loyalty:null,cat:"boutique"},
  {id:"kifaru",name:"Kifaru",brand:"Kifaru",loyalty:null,cat:"boutique"},
  {id:"badlands",name:"Badlands",brand:"Badlands",loyalty:null,cat:"boutique"},
  {id:"wildernessathlete",name:"Wilderness Athlete",brand:"Wilderness Athlete",loyalty:null,cat:"boutique"},
  {id:"mountainhouse",name:"Mountain House",brand:"Mountain House",loyalty:null,cat:"boutique"},
  {id:"beyondclothing",name:"Beyond Clothing",brand:"Beyond Clothing",loyalty:null,cat:"boutique"},
  {id:"outdoorvitals",name:"Outdoor Vitals",brand:"Outdoor Vitals",loyalty:null,cat:"boutique"},
  {id:"tricer",name:"Tricer",brand:"Tricer",loyalty:null,cat:"boutique"},
  {id:"initialascent",name:"Initial Ascent",brand:"Initial Ascent",loyalty:null,cat:"boutique"},
  {id:"peakrefuel",name:"Peak Refuel",brand:"Peak Refuel",loyalty:null,cat:"boutique"},
  {id:"sheepfeet",name:"Sheep Feet",brand:"Sheep Feet",loyalty:null,cat:"boutique"},
  {id:"pnuma",name:"Pnuma Outdoors",brand:"Pnuma Outdoors",loyalty:null,cat:"boutique"},
  {id:"wildtech",name:"Wildtech Gear",brand:"Wildtech Gear",loyalty:null,cat:"boutique"},
  {id:"thermarest",name:"Thermarest",brand:"Thermarest",loyalty:null,cat:"boutique"},
  {id:"helinox",name:"Helinox",brand:"Helinox",loyalty:null,cat:"boutique"},
  {id:"duckworth",name:"Duckworth",brand:"Duckworth",loyalty:null,cat:"boutique"},
  {id:"chota",name:"Chota Outdoor",brand:"Chota Outdoor",loyalty:null,cat:"boutique"},
  {id:"goatknives",name:"Goat Knives",brand:"Goat Knives",loyalty:null,cat:"boutique"},
  {id:"darntough",name:"Darn Tough",brand:"Darn Tough",loyalty:null,cat:"boutique"},
  {id:"fhfgear",name:"FHF Gear",brand:"FHF Gear",loyalty:null,cat:"boutique"},
  {id:"peax",name:"Peax Equipment",brand:"Peax Equipment",loyalty:null,cat:"boutique"},
  {id:"onglass",name:"On Glass Adapter",brand:"On Glass",loyalty:null,cat:"boutique"},
  {id:"lonewolfcustomgear",name:"Lone Wolf Custom Gear",brand:"Lone Wolf Custom Gear",loyalty:null,cat:"boutique"},
  {id:"trophyline",name:"Trophyline",brand:"Trophyline",loyalty:null,cat:"boutique"},
  {id:"higdon",name:"Higdon Outdoors",brand:"Higdon Outdoors",loyalty:null,cat:"boutique"},
  {id:"tanglefree",name:"Tanglefree",brand:"Tanglefree",loyalty:null,cat:"boutique"},
  {id:"rigemright",name:"Rig Em Right",brand:"Rig Em Right",loyalty:null,cat:"boutique"},
  {id:"motionducks",name:"MotionDucks",brand:"MotionDucks",loyalty:null,cat:"boutique"},
  {id:"buckgardner",name:"Buck Gardner",brand:"Buck Gardner",loyalty:null,cat:"boutique"},
  {id:"duckcreekdecoys",name:"Duck Creek Decoys",brand:"Duck Creek Decoys",loyalty:null,cat:"boutique"},
  {id:"chenegear",name:"Chenegear",brand:"Chenegear",loyalty:null,cat:"boutique"},
  {id:"quickcoys",name:"Quickcoys",brand:"Quickcoys",loyalty:null,cat:"boutique"},
  {
    id:"gohunt",name:"GoHunt Gear",brand:"GoHunt",cat:"specialty",
    loyalty:{name:"GoHunt Points",desc:"5% back in GoHunt points"},
  },
];

function formatShipping(s, shippingMap){
  const row = s.brand && shippingMap ? shippingMap[s.brand] : null;
  if (!row) return "Shipping: not verified yet";
  const { free_at, flat_rate } = row;
  if (free_at === 0 && flat_rate === 0) return "Free shipping on all orders";
  if (free_at != null && flat_rate != null) return "Free over $" + free_at + " · $" + flat_rate + " flat";
  if (free_at != null) return "Free shipping over $" + free_at;
  if (flat_rate != null) return "$" + flat_rate + " flat shipping";
  return "Shipping varies — see policy";
}

const brandSlug = b => (b||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const PORTALS = {
  timberline: {
    id:"timberline",name:"Timberline Deal Tracker",shortName:"Timberline",tagline:"Western · Elk · Backcountry",
    accent:"#2d6a4f",accentLight:"#eef3ee",accentBorder:"#b8cdbc",panelAccent:"#a8d4b0",heroTitle:"Active Deals",heroBg:"#1f2a1f",heroTagline:"Real Western hunting sales — scraped fresh every morning from 70+ backcountry brands. No fake markdowns, no inflated MSRPs, no padded discounts. Just the actual cheapest price online, right now.",domain:"timberlinedeals.com",ogImage:"https://timberlinedeals.com/og-timberline.png",description:"Real Western hunting deals updated every morning. Sitka, Kuiu, Stone Glacier, First Lite, Mystery Ranch, and 60+ backcountry brands — no fake markdowns, just the actual cheapest price online.",huntTypes:["elk","muledeer","archery","predator","upland"],gearCats:["clothing","optics","boots","packs","electronics","knives"],favicon:`data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect width=\"64\" height=\"64\" rx=\"12\" fill=\"%232d5a3d\"/><path d=\"M6 52 L22 22 L32 36 L44 16 L58 52 Z\" fill=\"%23fffdf7\"/></svg>`,
    brands:["Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock","Exo Mtn Gear","Kings Camo","Kifaru","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","GoHunt","Outdoorsmans","Bridger Watch","Aziak","Wiser Precision","Kapture","Grakksaw","OBI","Bridger Boiler","Javelin Bipod","Sneek Tec","Keen","Katabatic Gear","Zpacks","Flextail","Ollin","Magview","Mtn Tough","Mtn Ops","Sig Sauer","Crispi","Schnees","Kenetrek","Outdoor Research","Initial Ascent","Forloh","Kryptek","Montana Knife Company","Wilderness Athlete","Hoyt","Marsupial Gear","Maven","FHF Gear","Tricer","Pnuma Outdoors","Yeti","Thermarest","Helinox","Nemo Equipment","Sheep Feet","Goat Knives","Darn Tough","Duckworth","Mountain House","Peak Refuel","Wildtech Gear","Blue Coolers","GSI Outdoors","Peax Equipment"],
    searchHint:'Try "Sitka Kelvin Down" or "Kuiu Attack pant"...',
    searchContext:"western hunting, elk, mule deer, backcountry, high country, pack-in, high altitude",
  },
  whitetail: {
    id:"whitetail",name:"Treestand Saver",shortName:"Treestand Saver",domain:"treestandsaver.com",ogImage:"https://treestandsaver.com/og-treestand-saver.png",description:"Real whitetail hunting deals — treestand, saddle, scent control, and rut gear from every brand we trust. Updated every morning. No fake markdowns.",tagline:"Whitetail · Treestand · Rut",
    accent:"#7a4a2a",accentLight:"#f5ede4",accentBorder:"#d4b89a",panelAccent:"#c9a578",heroTitle:"Active Deals",heroBg:"#262420",heroTagline:"Real whitetail gear sales — scraped fresh every morning across treestand, saddle, scent control, and rut hunting brands. No fake markdowns. No inflated MSRPs. Just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect width=\"64\" height=\"64\" rx=\"12\" fill=\"%237a4a2a\"/><g stroke=\"%23fffdf7\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"><path d=\"M32 54 L32 34\"/><path d=\"M32 34 L20 22 L18 12\"/><path d=\"M32 34 L44 22 L46 12\"/><path d=\"M22 24 L14 18\"/><path d=\"M22 28 L13 28\"/><path d=\"M26 20 L22 12\"/><path d=\"M42 24 L50 18\"/><path d=\"M42 28 L51 28\"/><path d=\"M38 20 L42 12\"/></g></svg>`,
    brands:["Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock","Bridger Watch","Aziak","Kapture","Bridger Boiler","Keen","Katabatic Gear","Zpacks","Magview","Mtn Tough","Mtn Ops","Crispi","Yeti","Outdoor Research","Kings Camo","Marsupial Gear","Blue Coolers","Hoyt","Maven","Mathews","Forloh","Kryptek","Montana Knife Company","Kenetrek","Primos","Canvas Cutter","Outdoor Edge","Badlands","Wilderness Athlete","Outdoor Vitals","Pnuma Outdoors","Thermarest","Helinox","Duckworth","Chota Outdoor","Goat Knives","Darn Tough","FHF Gear","Peax Equipment","On Glass","GoHunt","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","Sig Sauer","Schnees","SKRE Gear","TideWe","Mossy Oak","Bone Collector","Nomad Outdoor","XOP Outdoors","Novix Outdoors","Hunting Beast Gear","Lone Wolf Custom Gear","Trophyline"],
    searchHint:'Try "Sitka Stratus" or "Hoyt Carbon"...',
    searchContext:"whitetail deer, treestand, rut, eastern woods, midwest, climbing stand, scent control",
  },
  turkey: {
    id:"turkey",name:"Gobbler Deals",shortName:"Gobbler Deals",ogImage:"/og-gobbler-deals.png",description:"Real spring turkey gear deals — calls, decoys, vests, and gobbler gear. Updated every morning. No fake markdowns.",tagline:"Calls · Decoys · Spring Gobbler",
    accent:"#8a6a2e",accentLight:"#f7f0e0",accentBorder:"#d8c28a",panelAccent:"#cbb275",heroTitle:"Active Deals",heroBg:"#211a10",heroTagline:"Real turkey hunting sales — scraped fresh every morning across calls, decoys, and spring gobbler gear. No fake markdowns, no inflated MSRPs, just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect width=\"64\" height=\"64\" rx=\"12\" fill=\"%238a6a2e\"/><g fill=\"%23fffdf7\"><circle cx=\"32\" cy=\"22\" r=\"6\"/><path d=\"M32 28 Q22 32 22 42 Q22 52 32 52 Q42 52 42 42 Q42 32 32 28 Z\"/><path d=\"M14 38 Q8 40 10 46\" stroke=\"%23fffdf7\" stroke-width=\"2\" fill=\"none\"/><path d=\"M50 38 Q56 40 54 46\" stroke=\"%23fffdf7\" stroke-width=\"2\" fill=\"none\"/></g></svg>`,
    brands:["Sitka","First Lite","Kings Camo","Hoyt","Mathews","Phelps Game Calls","Primos","Mountain House","Peak Refuel","Vortex","Leupold","Maven","Sig Sauer","Garmin","onX","Crispi","Schnees","Benchmade","Outdoor Edge","Montana Knife Company","Kryptek","Forloh","Marsupial Gear","Wildtech Gear","Darn Tough","Duckworth","Yeti","Mtn Ops"],
    searchHint:'Try "Phelps mouth call" or "Primos jake decoy"...',
    searchContext:"turkey hunting, spring gobbler, calls, decoys, run and gun, vest",
  },
  waterfowl: {
    id:"waterfowl",name:"Duck Blind Deals",shortName:"Duck Blind Deals",domain:"duckblinddeals.com",ogImage:"https://duckblinddeals.com/og-duck-blind-deals.png",description:"Real waterfowl gear deals — waders, blinds, decoys, and layout gear from Drake, Sitka Waterfowl, Banded and more. Updated every morning. No fake markdowns.",tagline:"Waterfowl · Waders · Blinds",
    accent:"#3a5a78",accentLight:"#e8eef4",accentBorder:"#a8bccd",panelAccent:"#8aa8bf",heroTitle:"Active Deals",heroBg:"#241a10",heroTagline:"Real waterfowl gear sales — scraped fresh every morning from every blind, wader, and decoy brand we trust. No fake markdowns, no inflated MSRPs, just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\"><rect width=\"64\" height=\"64\" rx=\"12\" fill=\"%233a5a78\"/><g fill=\"%23fffdf7\"><path d=\"M18 36 Q18 26 28 26 Q34 26 36 30 L46 30 Q44 36 36 38 L36 44 Q30 44 28 40 L20 40 Q18 38 18 36 Z\"/><circle cx=\"30\" cy=\"30\" r=\"1.5\" fill=\"%233a5a78\"/></g></svg>`,
    brands:["Drake Waterfowl","Sitka","Yeti","Garmin","onX","Vortex","Leupold","Sig Sauer","Chota Outdoor","Helinox","Mtn Ops","Benchmade","Outdoor Edge","Wilderness Athlete","Darn Tough","Forloh","Higdon Outdoors","Tanglefree","Rig Em Right","MotionDucks","Buck Gardner","Duck Creek Decoys","Chenegear","Quickcoys"],
    searchHint:'Try "Drake LST" or "Chota waders"...',
    searchContext:"waterfowl, duck hunting, goose hunting, blinds, decoys, waders, layout",
  },
};

function detectPortalId() {
  try {
    const env = import.meta.env?.VITE_PORTAL;
    if (env && PORTALS[env]) return env;
    const host = (typeof window !== "undefined" ? window.location.hostname : "").toLowerCase();
    if (host.includes("whitetail") || host.includes("treestandsaver")) return "whitetail";
    if (host.includes("turkey")) return "turkey";
    if (host.includes("waterfowl") || host.includes("duckblind")) return "waterfowl";
  } catch { /* ignore */ }
  return "timberline";
}

const ACTIVE_PORTAL_ID = detectPortalId();
const PORTAL = PORTALS[ACTIVE_PORTAL_ID];

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


function DealCard({d,family,memberFilter,onOpen,T,onWatch,isWatched}) {
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
          <img src={d.image} alt={d.product} loading="lazy" decoding="async" fetchpriority="low"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s",transform:hov?"scale(1.04)":"none"}}
            onError={e=>{const p=e.currentTarget.parentElement; if(p)p.style.display="none";}}
          />
        </div>
      )}
      <div style={{padding:"22px 22px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <BrandLogo brand={d.brand} T={T} size={16}/>
            <span style={{width:3,height:3,borderRadius:"50%",background:T.borderHov}}/>
            <span style={{fontSize:10,color:T.textMuted,letterSpacing:"0.12em",fontFamily:"'JetBrains Mono',monospace"}}>{d.cat.toUpperCase()}</span>
          </div>
          {d.fake?(
            <span style={{background:T.redLight,color:T.red,border:`1px solid ${T.redBorder}`,borderRadius:6,fontSize:9,fontWeight:800,padding:"4px 9px",letterSpacing:"0.08em",fontFamily:"'JetBrains Mono',monospace"}}>FAKE SALE</span>
          ):disc>0?(
            <span style={{background:T.orange,color:"white",borderRadius:6,fontSize:11,fontWeight:800,padding:"4px 10px",letterSpacing:"0.04em"}}>−{disc}%</span>
          ):(
            <span style={{background:T.accentLight,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:6,fontSize:9,fontWeight:800,padding:"4px 9px",letterSpacing:"0.08em",fontFamily:"'JetBrains Mono',monospace"}}>OUTLET</span>
          )}
        </div>
        <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:600,fontSize:21,color:T.text,lineHeight:1.2,marginBottom:14,letterSpacing:"-0.01em"}}>{d.product}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:14}}>
          <span style={{fontWeight:800,fontSize:30,color:d.fake?T.red:T.text,letterSpacing:"-0.02em"}}>${d.sale}</span>
          {d.orig>d.sale&&<span style={{fontSize:15,color:T.textMuted,textDecoration:"line-through"}}>${d.orig}</span>}
          {save>0&&<span style={{fontSize:12,fontWeight:700,color:d.fake?T.red:T.accent,marginLeft:"auto"}}>Save ${save}</span>}
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
        {onWatch && (
          <button
            onClick={e=>{e.stopPropagation();onWatch(d);}}
            title={isWatched?"Watching - email when on sale":"Watch - email me when on sale"}
            aria-label="Watch product"
            style={{background:isWatched?T.accentLight:T.bgSolid,border:`1px solid ${isWatched?T.accent:T.border}`,borderRadius:9,padding:"8px 10px",fontSize:14,cursor:"pointer",color:isWatched?T.accent:T.textMuted,fontWeight:700,lineHeight:1}}
          >{isWatched?"★":"☆"}</button>
        )}
        <a
          href={d.url} target="_blank" rel="noopener noreferrer"
          onClick={e=>{e.stopPropagation();logClick(d);}}
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

function DealModal({deal,family,T,onClose,onWatch,isWatched}) {
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
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <BrandLogo brand={deal.brand} T={T} size={20}/>
                <span style={{fontSize:10,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.1em"}}>| {deal.cat.toUpperCase()}</span>
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
            {deal.orig>deal.sale&&<span style={{fontSize:22,color:T.textMuted,textDecoration:"line-through"}}>${deal.orig}</span>}
            {!deal.fake&&save>0&&<span style={{fontSize:14,color:T.accent,fontWeight:700}}>Save ${save} ({disc}% off)</span>}
            {!deal.fake&&save===0&&<span style={{fontSize:14,color:T.accent,fontWeight:700}}>Outlet price</span>}
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
          <button
            onClick={async()=>{
              const url = window.location.origin + "/?deal=" + deal.id;
              const shareData = { title: deal.brand + " " + deal.product, text: deal.brand + " " + deal.product + " - $" + deal.sale, url };
              try {
                if (navigator.share) await navigator.share(shareData);
                else { await navigator.clipboard.writeText(url); window.alert("Link copied to clipboard"); }
              } catch (e) { /* user cancelled or unsupported */ }
            }}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:T.bgSolid,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",color:T.textSub,marginBottom:10,fontFamily:"inherit"}}
          >
            <span style={{fontSize:16,lineHeight:1}}>↗</span> Share this deal
          </button>
          {onWatch && (
            <button
              onClick={()=>onWatch(deal)}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",background:isWatched?T.accentLight:T.bgSolid,border:`1px solid ${isWatched?T.accent:T.border}`,borderRadius:12,padding:"12px",fontSize:14,fontWeight:700,cursor:"pointer",color:isWatched?T.accent:T.textSub,marginBottom:10,fontFamily:"inherit"}}
            >
              <span style={{fontSize:18,lineHeight:1}}>{isWatched?"★":"☆"}</span>
              {isWatched?"Watching - we'll email when it drops":"Watch this product - email me when on sale"}
            </button>
          )}
          <a
            href={deal.url} target="_blank" rel="noopener noreferrer"
            onClick={()=>logClick(deal)}
            style={{display:"block",width:"100%",textAlign:"center",color:"white",borderRadius:12,padding:"15px",fontSize:16,fontWeight:700,textDecoration:"none",background:deal.fake?T.red:T.accent}}
          >
            {deal.fake?"View on "+deal.brand+" (proceed with caution)":"Shop "+deal.brand+" -- $"+deal.sale}
          </a>
          <p style={{textAlign:"center",color:T.textMuted,fontSize:10,marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>
            {PORTAL.shortName} earns a small commission -- never affects your price
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
                        <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer" onClick={()=>logClick(d)} style={{textDecoration:"none"}}>
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

function Newsletter({T}) {
  const [email,setEmail]=useState("");
  const [state,setState]=useState("idle");
  const submit=async()=>{
    const e=email.trim().toLowerCase();
    if(!e.includes("@")||e.length<5){setState("invalid");return;}
    setState("loading");
    try {
      const r=await fetch(SB_URL+"/rest/v1/newsletter_subscribers",{
        method:"POST",
        headers:{...SB_H,"Content-Type":"application/json","Prefer":"return=minimal"},
        body:JSON.stringify({email:e,source:"site_footer",user_agent:navigator.userAgent.slice(0,200)}),
      });
      if(r.ok||r.status===409){setState("done");setEmail("");}
      else setState("error");
    } catch { setState("error"); }
  };
  return (
    <div style={{maxWidth:340}}>
      <div style={{fontSize:12,fontWeight:700,color:T.panelText,marginBottom:6,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>NEW SALES TO YOUR INBOX</div>
      <div style={{fontSize:11,color:T.panelMuted,lineHeight:1.5,marginBottom:10}}>Occasional roundup when something good drops. No spam, unsubscribe anytime.</div>
      {state==="done"?(
        <div style={{fontSize:12,color:T.panelAccent,fontWeight:600}}>✓ You're on the list.</div>
      ):(
        <div style={{display:"flex",gap:6}}>
          <input
            value={email}
            onChange={e=>{setEmail(e.target.value);setState("idle");}}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="you@email.com"
            type="email"
            style={{flex:1,minWidth:0,padding:"8px 12px",borderRadius:7,border:`1px solid ${T.panelBorder}`,background:T.panelBg,color:T.panelText,fontSize:12,outline:"none",fontFamily:"inherit"}}
          />
          <button onClick={submit} disabled={state==="loading"} style={{background:T.panelAccent,color:T.panelBg,border:"none",borderRadius:7,padding:"8px 14px",fontWeight:700,fontSize:12,cursor:state==="loading"?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
            {state==="loading"?"...":"Join"}
          </button>
        </div>
      )}
      {state==="invalid"&&<div style={{fontSize:11,color:T.red,marginTop:6}}>Enter a valid email.</div>}
      {state==="error"&&<div style={{fontSize:11,color:T.red,marginTop:6}}>Something went wrong — try again.</div>}
    </div>
  );
}

function VerifyBanner({user,T}) {
  const [sent,setSent]=useState(false);
  const [dismissed,setDismissed]=useState(false);
  if (!user || user.verified || dismissed) return null;
  const resend=async()=>{
    try {
      await supabase.auth.resend({type:"signup",email:user.email});
      setSent(true);
    } catch { setSent(true); }
  };
  return (
    <div style={{background:T.orangeLight,borderBottom:`1px solid ${T.orangeBorder}`,padding:"10px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
      <div style={{fontSize:12,color:T.orange,fontWeight:600}}>
        {sent?"Verification email sent — check your inbox.":"Please verify your email to lock in your account. "}
        {!sent&&<button onClick={resend} style={{background:"none",border:"none",color:T.orange,textDecoration:"underline",cursor:"pointer",fontWeight:700,fontSize:12,padding:0,fontFamily:"inherit"}}>Resend</button>}
      </div>
      <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:T.orange,fontSize:18,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
    </div>
  );
}

function BackToTop({T}) {
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setShow(window.scrollY>400);
    window.addEventListener("scroll",onScroll,{passive:true});
    return ()=>window.removeEventListener("scroll",onScroll);
  },[]);
  if (!show) return null;
  return (
    <button
      onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
      aria-label="Back to top"
      style={{position:"fixed",top:84,left:"50%",transform:"translateX(-50%)",zIndex:899,padding:"8px 16px",borderRadius:999,background:T.text,color:T.bgSolid,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,boxShadow:`0 6px 20px ${T.shadowHov}`,display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",letterSpacing:"0.04em",opacity:0.92}}
    >
      <span style={{fontSize:16,lineHeight:1}}>↑</span> Top
    </button>
  );
}

function Footer({T,onOpenLegal}) {
  return (
    <footer style={{background:T.panelBg,borderTop:`1px solid ${T.panelBorder}`,padding:"32px 24px 24px",marginTop:48}}>
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"flex-start",gap:32}}>
        <div style={{maxWidth:340}}>
          <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:18,color:T.panelText,marginBottom:6}}>{PORTAL.name}</div>
          <div style={{fontSize:12,color:T.panelSub,lineHeight:1.6}}>Verified hunting gear sales from 30+ Western backcountry brands, refreshed daily. No fake prices, no fake savings.</div>
        </div>
        <Newsletter T={T}/>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <button onClick={()=>onOpenLegal("about")} style={{background:"none",border:"none",color:T.panelSub,fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit"}}>About</button>
          <button onClick={()=>onOpenLegal("affiliate")} style={{background:"none",border:"none",color:T.panelSub,fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Affiliate Disclosure</button>
          <button onClick={()=>onOpenLegal("terms")} style={{background:"none",border:"none",color:T.panelSub,fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Terms</button>
          <button onClick={()=>onOpenLegal("privacy")} style={{background:"none",border:"none",color:T.panelSub,fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Privacy</button>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"24px auto 0",paddingTop:16,borderTop:`1px solid ${T.panelBorder}`,fontSize:11,color:T.panelMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em"}}>
        © {new Date().getFullYear()} {PORTAL.name} · We may earn a commission when you buy through links on this site — your price never changes.
      </div>
    </footer>
  );
}

const LEGAL_TEXT = {
  about: {
    title: "About Timberline",
    body: "Timberline Deal Tracker is a family-built site that surfaces real, verified sales from the Western hunting gear brands we actually use. We don't make up sale prices, fabricate discount percentages, or list invented coupon codes. If a brand doesn't publish a shipping policy, we say so. If a deal isn't actually on sale, it doesn't appear. We refresh deals daily and verify shipping policies weekly. Built by hunters, for hunters.",
  },
  affiliate: {
    title: "Affiliate Disclosure",
    body: "Some links on this site are affiliate links — when you click through and make a purchase, the brand may pay us a small commission. This never affects the price you pay. We don't accept payment to feature, promote, or rank any product, and we don't hide products that don't pay commission. Every deal you see here is one we'd link to anyway. Commissions cover the cost of running the scrapers and database. Federal Trade Commission regulations (16 CFR Part 255) require this disclosure.",
  },
  terms: {
    title: "Terms of Use",
    body: "Timberline Deal Tracker is provided as-is, for personal informational use. Prices, availability, and shipping policies are scraped from brand sites multiple times per day; we cannot guarantee accuracy at the moment of purchase — always verify on the brand's checkout page before buying. We are not the seller of any product listed. We are not responsible for orders, returns, sizing, fit, or quality of any item purchased through links on this site. You agree not to scrape, mirror, or commercially redistribute our data without permission. Account holders agree to provide accurate signup info and not abuse the family profile feature. We may suspend accounts that violate these terms.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "We store the minimum data needed to run the site: your email and password hash (handled by Supabase Auth), your family member names and sizes (so deals match), and an anonymous session ID per browser to deduplicate click counts. We do not sell, share, or rent your data. We do not run ad-tracking pixels. Click tracking records which deal you clicked and your session ID — no personal identifiers. Analytics are aggregate only. You can delete your account at any time by emailing the address on the About page; this removes your auth record and family profiles. Cookies: a single auth session cookie for login, plus localStorage for your preferences. No third-party tracking cookies.",
  },
};

function LegalModal({which,T,onClose}) {
  if (!which) return null;
  const content = LEGAL_TEXT[which];
  if (!content) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:2500,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div style={{background:T.bgSolid,borderRadius:16,maxWidth:560,width:"100%",maxHeight:"86vh",overflowY:"auto",border:`1px solid ${T.border}`,boxShadow:`0 32px 80px ${T.shadowHov}`}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"22px 26px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>{content.title}</div>
          <button onClick={onClose} style={{background:T.border,border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:14,color:T.textSub}}>x</button>
        </div>
        <div style={{padding:"22px 26px",fontSize:14,color:T.textSub,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{content.body}</div>
        <div style={{padding:"0 26px 22px",fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace"}}>Last updated: {new Date().toISOString().slice(0,10)}</div>
      </div>
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
        onSuccess({email,name:firstName,avatar:email[0].toUpperCase(),token:data.session?.access_token,id:u?.id,verified:!!u?.email_confirmed_at});
      } else {
        const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error){setErr(error.message);setLoading(false);return;}
        const u=data.user;
        const firstName=(u.user_metadata?.full_name||email.split("@")[0]).split(" ")[0];
        onSuccess({email,name:firstName,avatar:email[0].toUpperCase(),token:data.session?.access_token,id:u?.id,verified:!!u?.email_confirmed_at});
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
            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>{P.name}</div>
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

function PrefsInline({T,prefs,setPrefs,stores,setStores,shippingMap}) {
  const [sec,setSec]=useState("hunts");
  const toggle=(key,id)=>setPrefs(p=>{const a=p[key]||[];return {...p,[key]:a.includes(id)?a.filter(x=>x!==id):[...a,id]};});
  const toggleStore=id=>setStores(p=>p.includes(id)?p.filter(s=>s!==id):[...p,id]);
  const SECS=[{id:"hunts",label:"Hunt Types"},{id:"cats",label:"Gear Types"},{id:"stores",label:"Stores"}];
  const portalBrandSet=new Set(PORTAL.brands||[]);
  const portalStores=STORES.filter(s=>!portalBrandSet.size||portalBrandSet.has(s.brand));
  const bycat={boutique:portalStores.filter(s=>s.cat==="boutique"),specialty:portalStores.filter(s=>s.cat==="specialty"),bigbox:portalStores.filter(s=>s.cat==="bigbox")};
  const SGRPS=[{label:"Boutique and Brand Direct",key:"boutique"},{label:"Specialty Hunting Retailers",key:"specialty"},{label:"Big Box Retailers",key:"bigbox"}];
  return (
    <div style={{marginTop:48,background:T.bgCard,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:T.text}}>Preferences</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Filter your feed to match how you hunt</div>
        </div>
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
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
                {HUNT_TYPES.filter(h=>!PORTAL.huntTypes||PORTAL.huntTypes.includes(h.id)).map(h=>{
                  const on=(prefs.hunts||[]).includes(h.id);
                  return (
                    <button key={h.id} onClick={()=>toggle("hunts",h.id)} style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",border:`1.5px solid ${on?T.accent:T.border}`,background:on?T.accentLight:T.bgCard}}>
                      <div style={{fontSize:12,fontWeight:700,color:on?T.accent:T.text}}>{h.label}</div>
                      {on&&<span style={{marginLeft:"auto",color:T.accent,fontSize:14}}>✓</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{marginTop:16,display:"flex",gap:8}}>
                <button onClick={()=>setPrefs(p=>({...p,hunts:HUNT_TYPES.filter(h=>!PORTAL.huntTypes||PORTAL.huntTypes.includes(h.id)).map(h=>h.id)}))} style={{fontSize:11,color:T.accent,background:"none",border:`1px solid ${T.accentBorder}`,borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>Select All</button>
                <button onClick={()=>setPrefs(p=>({...p,hunts:[]}))} style={{fontSize:11,color:T.textMuted,background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>Clear All</button>
              </div>
            </div>
          )}
          {sec==="cats"&&(
            <div>
              <p style={{fontSize:12,color:T.textMuted,marginBottom:16,lineHeight:1.6}}>Only see deals for gear you buy.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                {GEAR_CATS.filter(c=>!PORTAL.gearCats||PORTAL.gearCats.includes(c.id)).map(c=>{
                  const on=(prefs.cats||[]).includes(c.id);
                  return (
                    <button key={c.id} onClick={()=>toggle("cats",c.id)} style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all 0.15s",border:`1.5px solid ${on?T.accent:T.border}`,background:on?T.accentLight:T.bgCard}}>
                      <div style={{fontSize:12,fontWeight:700,color:on?T.accent:T.text}}>{c.label}</div>
                      {on&&<span style={{marginLeft:"auto",color:T.accent,fontSize:14}}>✓</span>}
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
                            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{formatShipping(s, shippingMap)}{s.loyalty?" | "+s.loyalty.desc:""}</div>
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
    </div>
  );
}

function PriceSearch({T,P,wishlist,setWishlist,deals,family,onOpenDeal,user,onWatch,isWatched}) {
  const [query,setQuery]=useState("");
  const trimmed = query.trim().toLowerCase();
  const [historyMap, setHistoryMap] = useState({});
  
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

  useEffect(() => {
    if (!results.length) { setHistoryMap({}); return; }
    const urls = results.map(r => r.url).filter(Boolean).slice(0, 60);
    if (!urls.length) return;
    const list = urls.map(u => `"${encodeURIComponent(u).replace(/"/g, "")}"`).join(",");
    fetch(SB_URL + `/rest/v1/price_history?select=deal_url,sale_price,observed_at&deal_url=in.(${list})&order=observed_at.asc&limit=2000`, { headers: SB_H })
      .then(r => r.ok ? r.json() : [])
      .then(rows => {
        const m = {};
        rows.forEach(row => {
          if (!m[row.deal_url]) m[row.deal_url] = [];
          m[row.deal_url].push(parseFloat(row.sale_price));
        });
        setHistoryMap(m);
      })
      .catch(()=>{});
  }, [results]);

  const inWishlist = (q) => wishlist.some(w => (w.query||w.productName||"") === q);
  const toggleWishlist = async () => {
    if (!trimmed) return;
    if (inWishlist(trimmed)) {
      const existing = wishlist.find(x => (x.query||x.productName) === trimmed);
      setWishlist(w => w.filter(x => (x.query||x.productName) !== trimmed));
      if (user?.token && existing?.id) deleteWishlistItem(existing.id, user.token);
    } else {
      const localItem = { query: trimmed, addedAt: new Date().toISOString() };
      setWishlist(p => [...p, localItem]);
      if (user?.token) {
        const id = await saveWishlistItem(trimmed, user.token, PORTAL.id);
        if (id) setWishlist(p => p.map(x => x.query === trimmed && !x.id ? { ...x, id } : x));
      }
    }
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
                <DealCard key={d.id} d={historyMap[d.url]?.length>1 ? {...d, history: historyMap[d.url]} : d} family={family} memberFilter="All" onOpen={onOpenDeal} T={T} onWatch={onWatch} isWatched={isWatched(d)}/>
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
          {[{v:"mens",label:"Men"},{v:"womens",label:"Women"},{v:"youth",label:"Youth"}].map(g => (
            <button
              key={g.v}
              onClick={() => setGender(g.v)}
              style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${gender===g.v?T.accent:T.border}`,background:gender===g.v?T.accentLight:"transparent",color:gender===g.v?T.accent:T.textMuted,fontSize:12,fontWeight:600,cursor:"pointer"}}
            >
              {g.label}
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
  const [brandFilter,setBrandFilter]=useState(()=>{
    try {
      const m = window.location.pathname.match(/^\/brand\/([^/]+)/);
      return m ? "PENDING:" + decodeURIComponent(m[1]) : "All";
    } catch { return "All"; }
  });
  const [sortBy,setSortBy]=useState("discount");
  const [modalDeal,setModalDeal]=useState(null);
  const [editIdx,setEditIdx]=useState(null);
  const [wishlist,setWishlist]=useState([]);
  const [stores,setStores]=useState(STORES.map(s=>s.id));
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [prefs,setPrefs]=useState({hunts:HUNT_TYPES.map(h=>h.id),cats:GEAR_CATS.map(c=>c.id),brands:[...ALL_BRANDS]});
  const [user,setUser]=useState(null);
  const [deals,setDeals]=useState([]);
  const [dealsLoading,setDealsLoading]=useState(true);
  const [dealsError,setDealsError]=useState(false);
  const [dbCoupons,setDbCoupons]=useState([]);
  const [showLegal,setShowLegal]=useState(null);
  const [shippingMap,setShippingMap]=useState({});

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
        const userObj={email:u.email,name:firstName,avatar:u.email[0].toUpperCase(),token:session.access_token,id:u.id,verified:!!u.email_confirmed_at};
        setUser(userObj);
        loadFamily(u.id,session.access_token).then(rows=>{
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,lookingFor:r.looking_for||[]})));
        }).catch(()=>{});
        loadWishlist(session.access_token).then(items=>{ if(items.length) setWishlist(items); }).catch(()=>{});
      }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_OUT"){
        setUser(null);setFamily([]);
      } else if((event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="INITIAL_SESSION")&&session){
        const u=session.user;
        const firstName=(u.user_metadata?.full_name||u.email.split("@")[0]).split(" ")[0];
        const userObj={email:u.email,name:firstName,avatar:u.email[0].toUpperCase(),token:session.access_token,id:u.id,verified:!!u.email_confirmed_at};
        setUser(userObj);
        loadFamily(u.id,session.access_token).then(rows=>{
          if(rows&&rows.length)setFamily(rows.map(r=>({name:r.name,gender:r.gender||"mens",jacket:r.jacket,shirt:r.shirt,base:r.base,pants:r.pants,boots:r.boots,lookingFor:r.looking_for||[]})));
        }).catch(()=>{});
        loadWishlist(session.access_token).then(items=>{ if(items.length) setWishlist(items); }).catch(()=>{});
      }
    });
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    // Initial fast fetch (100 for snappy first paint), then page through the rest in 1000-row chunks
    const PAGE = 1000;
    sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc,id.asc",limit:"100",offset:"0"})
      .then(rows=>{
        if(rows&&rows.length) {
          const mapped = rows.map(parseDeal);
          setDeals(mapped);
          try {
            const params = new URLSearchParams(window.location.search);
            const sharedId = params.get("deal");
            if (sharedId) {
              const m = mapped.find(x => String(x.id) === sharedId);
              if (m) setModalDeal(m);
            }
          } catch { /* ignore */ }
        }
        setDealsLoading(false);
        const loadMore = async (offset) => {
          const more = await sbGet("deals",{select:"*",active:"eq.true",order:"fake_sale.asc,id.asc",limit:String(PAGE),offset:String(offset)});
          if (more && more.length) {
            setDeals(prev => {
              const seen = new Set(prev.map(d => d.id));
              const fresh = more.map(parseDeal).filter(d => !seen.has(d.id));
              return [...prev, ...fresh];
            });
            if (more.length === PAGE) await loadMore(offset + PAGE);
          }
        };
        return loadMore(100);
      })
      .catch(()=>{setDealsError(true);setDealsLoading(false);});
    sbGet("coupons",{select:"*",active:"eq.true",order:"verified.desc",limit:"50"})
      .then(rows=>{
        if(!rows||!rows.length)return;
        const now=Date.now();
        const valid=rows.filter(r=>!r.expires_at||new Date(r.expires_at).getTime()>now);
        setDbCoupons(valid.map(parseCoupon));
      })
      .catch(()=>{});
    sbGet("brand_shipping",{select:"brand,free_at,flat_rate,scraped_at,policy_url"})
      .then(rows=>{
        if(!rows||!rows.length)return;
        const m={};
        rows.forEach(r=>{m[r.brand]={free_at:r.free_at,flat_rate:r.flat_rate,scraped_at:r.scraped_at,policy_url:r.policy_url};});
        setShippingMap(m);
      })
      .catch(()=>{});
  },[]);
  const T = useMemo(() => ({
    ...PALETTE,
    accent: PORTAL.accent || PALETTE.accent,
    accentLight: PORTAL.accentLight || PALETTE.accentLight,
    accentBorder: PORTAL.accentBorder || PALETTE.accentBorder,
    panelAccent: PORTAL.panelAccent || PALETTE.panelAccent,
  }), []);
  const P=PORTAL;
  useEffect(() => {
    try {
      document.title = PORTAL.name;
      if (PORTAL.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.type = "image/svg+xml";
        link.href = PORTAL.favicon;
      }
      const setMeta = (sel, attr, val) => {
        if (!val) return;
        let el = document.querySelector(sel);
        if (!el) {
          el = document.createElement("meta");
          const [type, name] = sel.replace(/[\[\]"=]/g, " ").trim().split(/\s+/);
          el.setAttribute(type, name);
          document.head.appendChild(el);
        }
        el.setAttribute(attr, val);
      };
      const desc = PORTAL.description || PORTAL.heroTagline || PORTAL.tagline;
      const url = "https://" + (PORTAL.domain || "timberlinedeals.com");
      setMeta('meta[name="description"]', "content", desc);
      setMeta('meta[property="og:title"]', "content", PORTAL.name);
      setMeta('meta[property="og:description"]', "content", desc);
      setMeta('meta[property="og:url"]', "content", url);
      setMeta('meta[property="og:type"]', "content", "website");
      setMeta('meta[property="og:image"]', "content", PORTAL.ogImage || "");
      setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
      setMeta('meta[name="twitter:title"]', "content", PORTAL.name);
      setMeta('meta[name="twitter:description"]', "content", desc);
      setMeta('meta[name="twitter:image"]', "content", PORTAL.ogImage || "");
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
      canonical.href = url;
      const gsc = import.meta.env.VITE_GSC_TOKEN;
      if (gsc) {
        let v = document.querySelector('meta[name="google-site-verification"]');
        if (!v) { v = document.createElement("meta"); v.setAttribute("name","google-site-verification"); document.head.appendChild(v); }
        v.setAttribute("content", gsc);
      }
      const gaId = import.meta.env.VITE_GA_ID;
      if (gaId && !window.__gaLoaded) {
        window.__gaLoaded = true;
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + gaId;
        document.head.appendChild(s);
        const inline = document.createElement("script");
        inline.text = "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','" + gaId + "');";
        document.head.appendChild(inline);
      }
    } catch { /* ignore */ }
  }, []);
  const isGuest=!user;
  const liveBrands=useMemo(
    () => {
      const portalSet = new Set(PORTAL.brands || []);
      return [...new Set(deals.map(d=>d.brand))]
        .filter(b => !portalSet.size || portalSet.has(b))
        .sort();
    },
    [deals]
  );

  
  useEffect(() => {
    if (!brandFilter.startsWith("PENDING:")) return;
    const targetSlug = brandFilter.slice(8);
    if (!liveBrands.length) return;
    const hit = liveBrands.find(b => brandSlug(b) === targetSlug);
    setBrandFilter(hit || "All");
  }, [brandFilter, liveBrands]);

  useEffect(() => {
    if (brandFilter.startsWith("PENDING:")) return;
    try {
      const desired = brandFilter === "All" ? "/" : "/brand/" + brandSlug(brandFilter);
      if (window.location.pathname !== desired) {
        window.history.replaceState(null, "", desired);
      }
    } catch { /* ignore */ }
  }, [brandFilter]);

  const taggedDeals=useMemo(
    ()=>deals.map(d=>({...d,tags:computeTags(d,family)})),
    [deals,family]
  );
  const sortedDeals=useMemo(()=>{
    const arr=[...taggedDeals];
    if(sortBy==="discount") arr.sort((a,b)=>{
      const da=a.orig>a.sale?(a.orig-a.sale)/a.orig:0;
      const db=b.orig>b.sale?(b.orig-b.sale)/b.orig:0;
      return (a.fake?1:0)-(b.fake?1:0) || db-da;
    });
    else if(sortBy==="newest") arr.sort((a,b)=>(a.fake?1:0)-(b.fake?1:0) || (b.createdAt||"").localeCompare(a.createdAt||""));
    else if(sortBy==="lowest") arr.sort((a,b)=>(a.fake?1:0)-(b.fake?1:0) || a.sale-b.sale);
    else if(sortBy==="highest") arr.sort((a,b)=>(a.fake?1:0)-(b.fake?1:0) || b.sale-a.sale);
    else if(sortBy==="brand") arr.sort((a,b)=>(a.brand||"").localeCompare(b.brand||""));
    return arr;
  },[taggedDeals,sortBy]);
  const portalBrandSet = useMemo(() => new Set(PORTAL.brands || []), []);
  const filtered=sortedDeals.filter(d=>{
    if (portalBrandSet.size && !portalBrandSet.has(d.brand)) return false;
    if(brandFilter!=="All"&&d.brand!==brandFilter)return false;
    if(memberFilter!=="All"&&!d.tags.includes(memberFilter))return false;
    return true;
  });
  const portalCoupons=dbCoupons;
  const BRANDS_LIST=liveBrands;
  const watchQueryFor = d => ((d.brand||"")+" "+(d.product||"")).trim().toLowerCase();
  const isWatched = d => wishlist.some(w => (w.query||"") === watchQueryFor(d));
  const handleWatch = async (d) => {
    if (!user) { setAuthMode("signup"); setShowAuth(true); return; }
    const q = watchQueryFor(d);
    if (isWatched(d)) {
      const existing = wishlist.find(x => (x.query||"") === q);
      setWishlist(w => w.filter(x => (x.query||"") !== q));
      if (user?.token && existing?.id) deleteWishlistItem(existing.id, user.token);
    } else {
      setWishlist(p => [...p, { query: q, addedAt: new Date().toISOString() }]);
      if (user?.token) {
        const id = await saveWishlistItem(q, user.token, PORTAL.id);
        if (id) setWishlist(p => p.map(x => x.query === q && !x.id ? { ...x, id } : x));
      }
    }
  };

  const TABS=[{id:"deals",label:"Deals"},{id:"search",label:"Price Search"},{id:"coupons",label:"Coupon Codes"},...(user?[{id:"family",label:"Profile"}]:[])];
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
          .tl-sister-sites{display:none !important;}
          .tl-header-nav{order:3 !important;width:100% !important;justify-content:center !important;overflow-x:auto !important;flex-wrap:wrap !important;}
          .tl-header-pref{display:none !important;}
          .tl-sister-sites{display:none !important;}
          .tl-page-hero{padding:28px 16px 24px !important;}
          .tl-page-hero h1{font-size:32px !important;line-height:1.1 !important;}
          .tl-page-hero p{font-size:14px !important;line-height:1.5 !important;}
          .tl-page-body{padding:18px 14px 32px !important;}
          .tl-deal-grid{grid-template-columns:1fr !important;gap:14px !important;}
          .tl-deal-grid > *{content-visibility:auto;contain-intrinsic-size:auto 380px;}
        }
        @media (max-width:480px){
          .tl-page-hero h1{font-size:28px !important;}
        }
      `}</style>
      <svg style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.025,mixBlendMode:"multiply"}} aria-hidden="true">
        <filter id="paperNoise"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#paperNoise)"/>
      </svg>
      <div style={{background:T.panelBg,borderBottom:`1px solid ${T.panelBorder}`,position:"sticky",top:0,zIndex:100}}>
        <div className="tl-header-inner" style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72}}>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <div onClick={()=>{setTab("deals");setBrandFilter("All");setMemberFilter("All");window.scrollTo(0,0);}} style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:24,color:T.panelText,letterSpacing:"-0.02em",cursor:"pointer"}}>{PORTAL.shortName || "Timberline"}</div>
            <div className="tl-header-brand-sub" style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,fontSize:10,color:T.panelAccent,letterSpacing:"0.28em",textTransform:"uppercase"}}>Deal Tracker</div>
            <div className="tl-sister-sites" style={{display:"flex",gap:8,marginLeft:14,paddingLeft:14,borderLeft:`1px solid ${T.panelBorder}`,alignItems:"center"}}>
              {Object.values(PORTALS).filter(x=>x.id!==PORTAL.id&&x.domain).map(x=>(
                <a key={x.id} href={"https://"+x.domain} title={x.name} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.panelSub,letterSpacing:"0.1em",textTransform:"uppercase",textDecoration:"none",fontWeight:600,padding:"4px 8px",borderRadius:6,border:`1px solid ${T.panelBorder}`,transition:"all 0.15s"}} onMouseOver={e=>{e.currentTarget.style.borderColor=T.panelAccent;e.currentTarget.style.color=T.panelText;}} onMouseOut={e=>{e.currentTarget.style.borderColor=T.panelBorder;e.currentTarget.style.color=T.panelSub;}}>{x.shortName}</a>
              ))}
            </div>
          </div>
          <nav className="tl-header-nav" style={{display:"flex",gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 14px",border:"none",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:500,transition:"color 0.18s",background:"transparent",color:tab===t.id?T.panelText:T.panelMuted}}>
                {t.label}
              </button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            
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
      <VerifyBanner user={user} T={T}/>
      <div style={{position:"relative",zIndex:1}}>
        {tab==="deals"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:PORTAL.heroBg||T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
              <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:14,letterSpacing:"-0.02em",lineHeight:1.05}}>{PORTAL.heroTitle || "Active Deals"}</h1>
                {PORTAL.heroTagline && <p style={{color:T.panelText,opacity:0.85,fontSize:16,lineHeight:1.55,marginBottom:14,maxWidth:780,fontFamily:"'Fraunces',Georgia,serif",fontWeight:400}}>{PORTAL.heroTagline}</p>}
                <p style={{color:T.panelSub,fontSize:14,letterSpacing:"0.01em"}}><strong style={{color:T.panelText}}>{filtered.filter(d=>!d.fake).length}</strong> verified deals · <span style={{color:T.red}}>{filtered.filter(d=>d.fake).length}</span> fake sales flagged</p>
              </div>
            </div>
            <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:18,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em"}}>
                We may earn a commission when you buy through these links — your price never changes. <button onClick={()=>setShowLegal("affiliate")} style={{background:"none",border:"none",color:T.accent,cursor:"pointer",padding:0,fontFamily:"inherit",fontSize:11,textDecoration:"underline"}}>Disclosure</button>
              </div>
              <div style={{display:"flex",gap:20,marginBottom:32,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.08em"}}>SORT</span>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"5px 10px",borderRadius:999,fontSize:12,fontWeight:600,border:`1px solid ${T.border}`,background:T.bgCard,color:T.text,cursor:"pointer",fontFamily:"inherit"}}>
                    <option value="discount">Biggest % off</option>
                    <option value="newest">Newest</option>
                    <option value="lowest">Lowest price</option>
                    <option value="highest">Highest price</option>
                    <option value="brand">Brand A-Z</option>
                  </select>
                </div>
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
              <div className="tl-deal-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
              {dealsError?(
                <div style={{color:T.red,padding:40,fontSize:14,textAlign:"center",gridColumn:"1 / -1"}}>
                  <div style={{fontWeight:700,marginBottom:6}}>Couldn't load deals</div>
                  <div style={{fontSize:12,color:T.textMuted,marginBottom:14}}>Network or server hiccup. Try refreshing.</div>
                  <button onClick={()=>window.location.reload()} style={{background:T.accent,color:"white",border:"none",borderRadius:8,padding:"8px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Reload</button>
                </div>
              ):dealsLoading&&deals.length===0?(
                <div style={{color:T.textMuted,padding:40,fontFamily:"'JetBrains Mono',monospace",fontSize:12,textAlign:"center",gridColumn:"1 / -1"}}>Loading deals...</div>
              ):filtered.length===0?(
                <div style={{padding:48,textAlign:"center",gridColumn:"1 / -1"}}>
                  <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:600,fontSize:20,color:T.text,marginBottom:6}}>No deals match these filters</div>
                  <div style={{fontSize:12,color:T.textMuted,marginBottom:18,fontFamily:"'JetBrains Mono',monospace"}}>Try clearing the brand or member filter to see more.</div>
                  {(brandFilter!=="All"||memberFilter!=="All")&&(
                    <button onClick={()=>{setBrandFilter("All");setMemberFilter("All");}} style={{background:T.accent,color:"white",border:"none",borderRadius:9,padding:"9px 22px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Clear filters</button>
                  )}
                </div>
              ):filtered.map(d=>(
                <DealCard key={d.id} d={d} family={family} memberFilter={memberFilter} onOpen={setModalDeal} T={T} onWatch={handleWatch} isWatched={isWatched(d)}/>
              ))}
              </div>
            </div>
          </div>
        )}
        {tab==="search"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:PORTAL.heroBg||T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
              <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.05}}>Price Search</h1>
                <p style={{color:T.panelSub,fontSize:14}}>Find the cheapest place to buy any hunting gear, anywhere.</p>
              </div>
            </div>
            <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
              <PriceSearch T={T} P={P} wishlist={wishlist} setWishlist={setWishlist} deals={taggedDeals} family={family} onOpenDeal={setModalDeal} user={user} onWatch={handleWatch} isWatched={isWatched}/>
            </div>
          </div>
        )}
        {tab==="coupons"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{background:PORTAL.heroBg||T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
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
                <div style={{marginTop:80}}/>
                <h2 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:28,color:T.text,marginBottom:12}}>Profile</h2>
                <p style={{fontSize:15,color:T.textSub,maxWidth:440,lineHeight:1.7,marginBottom:32}}>Add everyone in your family with their sizes. Deals get automatically tagged to whoever they fit.</p>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setAuthMode("signup");setShowAuth(true);}} style={{background:T.accent,color:"white",border:"none",borderRadius:10,padding:"13px 32px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Create Free Account</button>
                  <button onClick={()=>{setAuthMode("login");setShowAuth(true);}} style={{background:T.bgCard,color:T.textSub,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 24px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Log In</button>
                </div>
              </div>
            ):(
              <>
                <div style={{background:PORTAL.heroBg||T.panelBg,borderBottom:`1px solid ${T.panelBorder}`}}>
                  <div className="tl-page-hero" style={{maxWidth:1200,margin:"0 auto",padding:"56px 32px 48px"}}>
                    <h1 style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:700,fontSize:52,color:T.panelText,marginBottom:8,letterSpacing:"-0.02em",lineHeight:1.05}}>Profile</h1>
                    <p style={{color:T.panelSub,fontSize:14}}>Deals auto-tagged by size · AI gear advisor per member</p>
                  </div>
                </div>
                <div className="tl-page-body" style={{maxWidth:1200,margin:"0 auto",padding:"36px 32px 64px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
                  {family.map((m,idx)=>{
                    const col=MC[idx%MC.length];
                    const mDeals=taggedDeals.filter(d=>d.tags.includes(m.name));
                    const SIZE_FIELDS=[["JACKET",m.jacket],["SHIRT",m.shirt],["BASE",m.base],["PANTS",m.pants],["BOOTS",m.boots]];
                    return (
                      <div key={idx} style={{background:T.bgCard,backdropFilter:"blur(12px)",border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:`0 2px 12px ${T.shadow}`,position:"relative",zIndex:1}}>
                        <div style={{height:4,background:col}}/>
                        <div style={{padding:"18px 18px 16px"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                            <div style={{fontFamily:"'Fraunces',Georgia,serif",fontWeight:800,fontSize:22,color:col}}>{m.name}</div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>setEditIdx(editIdx===idx?null:idx)} style={{background:T.border,border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:11,color:T.textSub,fontWeight:600}}>{editIdx===idx?"Done":"Edit"}</button>
                              <button onClick={async()=>{ if(!window.confirm("Remove "+m.name+" from family?"))return; const nm=m.name; setFamily(prev=>prev.filter((_,i)=>i!==idx)); if(user){ try{ await supabase.from("family_members").delete().eq("user_id",user.id).eq("name",nm); }catch{} } if(editIdx===idx)setEditIdx(null); }} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,color:T.red||"#cc4444",fontWeight:600}} title={"Remove "+m.name}>Remove</button>
                            </div>
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
                              {SIZE_FIELDS.map(([label,val])=>(
                                <div key={label} style={{background:T.bgSolid,border:`1px solid ${T.border}`,borderRadius:9,padding:"14px 8px",textAlign:"center"}}>
                                  <div style={{fontSize:10,color:T.textMuted,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",marginBottom:6}}>{label}</div>
                                  <div style={{fontSize:22,fontWeight:800,color:T.text,letterSpacing:"-0.01em"}}>{val}</div>
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
                <PrefsInline T={T} prefs={prefs} setPrefs={setPrefs} stores={stores} setStores={setStores} shippingMap={shippingMap}/>
                <div style={{marginTop:48,padding:"24px",border:`1px solid ${T.border}`,borderRadius:12,background:T.bgCard}}>
                  <div style={{fontSize:11,color:T.textMuted,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",marginBottom:12}}>WATCHING & SAVED SEARCHES</div>
                  <div style={{fontSize:12,color:T.textSub,marginBottom:14,lineHeight:1.6}}>We email you when matching deals appear. Click the X to stop watching.</div>
                  {wishlist.length === 0 ? (
                    <div style={{fontSize:13,color:T.textMuted,fontStyle:"italic"}}>Nothing watched yet. Click the ☆ on any deal to start.</div>
                  ) : (
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {wishlist.map((w, i) => (
                        <span key={w.id || i} style={{background:T.accentLight,color:T.accent,border:`1px solid ${T.accentBorder}`,borderRadius:999,padding:"6px 8px 6px 14px",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:8}}>
                          {w.query || w.productName}
                          <button onClick={() => {
                            const q = w.query || w.productName;
                            setWishlist(prev => prev.filter(x => (x.query||x.productName) !== q));
                            if (user?.token && w.id) deleteWishlistItem(w.id, user.token);
                          }} style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontSize:16,lineHeight:1,padding:"0 4px",opacity:0.7}}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{marginTop:32,padding:"24px",border:`1px solid ${T.redBorder}`,borderRadius:12,background:T.redLight}}>
                  <div style={{fontSize:11,color:T.red,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.12em",marginBottom:8}}>DANGER ZONE</div>
                  <div style={{fontSize:14,color:T.text,fontWeight:600,marginBottom:6}}>Delete your account</div>
                  <div style={{fontSize:12,color:T.textSub,marginBottom:14,lineHeight:1.6}}>Removes your login, family profiles, saved searches, and wishlist alerts. Cannot be undone.</div>
                  <button onClick={async()=>{
                    if(!window.confirm("Permanently delete your account and all data? This cannot be undone."))return;
                    try {
                      const { error } = await supabase.rpc("delete_my_account");
                      if (error) { window.alert("Error: "+error.message); return; }
                      await supabase.auth.signOut();
                      setUser(null); setFamily([]);
                      window.alert("Account deleted.");
                    } catch (e) { window.alert("Error: "+e.message); }
                  }} style={{background:T.red,color:"white",border:"none",borderRadius:9,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Delete my account</button>
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
      
      <DealModal deal={modalDeal} family={family} T={T} onClose={()=>setModalDeal(null)} onWatch={handleWatch} isWatched={modalDeal?isWatched(modalDeal):false}/>
      <LegalModal which={showLegal} T={T} onClose={()=>setShowLegal(null)}/>
      <BackToTop T={T}/>
      <Footer T={T} onOpenLegal={setShowLegal}/>
    </div>
  );
}
