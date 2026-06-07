// Isomorphic constants — pure data, no React, no browser APIs. Safe to import
// from Server Components and Client Components alike.

// Hub Supabase (anon key is public by design; RLS is the security boundary).
export const SB_URL = "https://jcmkoooivghwrgezxode.supabase.co";
export const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbWtvb29pdmdod3JnZXp4b2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk4NjUsImV4cCI6MjA5NDA4NTg2NX0.mQJjh11x9nGen8KLYYwLLuHcm8Oyc89Nat9kwBxe3kA";
export const SB_H = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY };

export const BRAND_DOMAINS = {
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
  "Schnees":"schnees.com","Benchmade":"benchmade.com","Phelps Game Calls":"phelpsgamecalls.com","Filson":"filson.com","Latitude Outdoors":"latitudeoutdoors.com","Sillosocks":"sillosocks.com","Smartwool":"smartwool.com","Leatherman":"leatherman.com","Spyderco":"spyderco.com","SKRE Gear":"skregear.com","Lone Wolf Custom Gear":"lonewolfcustomgear.com","Trophyline":"trophyline.com","Higdon Outdoors":"higdonoutdoors.com","Tanglefree":"tanglefree.com","Rig Em Right":"rigemright.com","MotionDucks":"motionducks.com","Buck Gardner":"buckgardner.com","Duck Creek Decoys":"duckcreekdecoys.com","Chenegear":"chenegear.com","Quickcoys":"quickcoys.com",
};

export const MC = ["#cc5500"];

export const HUNT_TYPES = [
  {id:"whitetail",label:"Whitetail",icon:"🌳"},
  {id:"elk",label:"Elk",icon:"🦌"},
  {id:"muledeer",label:"Mule Deer",icon:"🏔"},
  {id:"waterfowl",label:"Waterfowl",icon:"🦆"},
  {id:"turkey",label:"Turkey",icon:"🦃"},
  {id:"archery",label:"Archery",icon:"🏹"},
  {id:"predator",label:"Predator",icon:"🐺"},
  {id:"upland",label:"Upland",icon:"🐦"},
];

export const GEAR_CATS = [
  {id:"clothing",label:"Clothing",icon:"🧥"},
  {id:"optics",label:"Optics",icon:"🔭"},
  {id:"trailcams",label:"Trail Cams",icon:"📷"},
  {id:"boots",label:"Boots",icon:"🥾"},
  {id:"packs",label:"Packs",icon:"🎒"},
  {id:"electronics",label:"Electronics",icon:"📡"},
  {id:"knives",label:"Knives",icon:"🔪"},
];

export const ALL_BRANDS = [
  "Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock",
  "Kings Camo","Drake","Avery","Banded","Browning",
  "Vortex","Leupold","Bushnell",
  "Stealth Cam","Reconyx","Tactacam",
  "Hoyt","Mathews",
  "Danner","LaCrosse","Muck",
  "Kifaru","Mystery Ranch",
  "Garmin","onX","GoHunt",
];

export const STORES = [
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

export const PORTALS = {
  timberline: {
    id:"timberline",name:"Timberline Deal Tracker",shortName:"Timberline",tagline:"Western · Elk · Backcountry",
    accent:"#2d6a4f",accentLight:"#eef3ee",accentBorder:"#b8cdbc",panelAccent:"#a8d4b0",heroTitle:"Active Deals",heroBg:"#1f2a1f",heroTagline:"Real Western hunting sales — tracked fresh every morning from 70+ backcountry brands. No fake markdowns, no inflated MSRPs, no padded discounts. Just the actual cheapest price online, right now.",domain:"timberlinedeals.com",ogImage:"https://timberlinedeals.com/og-timberline.png",description:"Real Western hunting deals updated every morning. Sitka, Kuiu, Stone Glacier, First Lite, Mystery Ranch, and 60+ backcountry brands — no fake markdowns, just the actual cheapest price online.",huntTypes:["elk","muledeer","archery","predator","upland"],gearCats:["clothing","optics","boots","packs","electronics","knives"],favicon:`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="12" fill="%232d5a3d"/><path d="M6 52 L22 22 L32 36 L44 16 L58 52 Z" fill="%23fffdf7"/></svg>`,
    brands:["Sitka","First Lite","Kuiu","Stone Glacier","Eberlestock","Exo Mtn Gear","Kings Camo","Kifaru","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","GoHunt","Outdoorsmans","Bridger Watch","Aziak","Wiser Precision","Kapture","Grakksaw","OBI","Bridger Boiler","Javelin Bipod","Sneek Tec","Keen","Katabatic Gear","Zpacks","Flextail","Ollin","Magview","Mtn Tough","Mtn Ops","Sig Sauer","Crispi","Schnees","Kenetrek","Outdoor Research","Initial Ascent","Forloh","Kryptek","Montana Knife Company","Wilderness Athlete","Hoyt","Marsupial Gear","Maven","FHF Gear","Tricer","Pnuma Outdoors","Yeti","Thermarest","Helinox","Nemo Equipment","Sheep Feet","Goat Knives","Darn Tough","Duckworth","Mountain House","Peak Refuel","Wildtech Gear","Blue Coolers","GSI Outdoors","Peax Equipment","Filson","SKRE Gear","Mathews","Badlands","Outdoor Edge","Outdoor Vitals","Beyond Clothing","Canvas Cutter","Smartwool","Leatherman","Spyderco"],
    searchHint:'Try "Sitka Kelvin Down" or "Kuiu Attack pant"...',
    searchContext:"western hunting, elk, mule deer, backcountry, high country, pack-in, high altitude",
  },
  whitetail: {
    id:"whitetail",name:"Treestand Saver",shortName:"Treestand Saver",domain:"treestandsaver.com",ogImage:"https://treestandsaver.com/og-treestand-saver.png",description:"Real whitetail hunting deals — treestand, saddle, scent control, and rut gear from every brand we trust. Updated every morning. No fake markdowns.",tagline:"Whitetail · Treestand · Rut",
    accent:"#7a4a2a",accentLight:"#f5ede4",accentBorder:"#d4b89a",panelAccent:"#c9a578",heroTitle:"Active Deals",heroBg:"#262420",heroTagline:"Real whitetail gear sales — tracked fresh every morning across treestand, saddle, scent control, and rut hunting brands. No fake markdowns. No inflated MSRPs. Just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="12" fill="%237a4a2a"/><g stroke="%23fffdf7" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M32 54 L32 34"/><path d="M32 34 L20 22 L18 12"/><path d="M32 34 L44 22 L46 12"/><path d="M22 24 L14 18"/><path d="M22 28 L13 28"/><path d="M26 20 L22 12"/><path d="M42 24 L50 18"/><path d="M42 28 L51 28"/><path d="M38 20 L42 12"/></g></svg>`,
    brands:["Sitka","First Lite","Keen","Katabatic Gear","Zpacks","Mtn Ops","Crispi","Yeti","Outdoor Research","Kings Camo","Marsupial Gear","Blue Coolers","Hoyt","Maven","Mathews","Forloh","Kryptek","Montana Knife Company","Kenetrek","Primos","Canvas Cutter","Outdoor Edge","Badlands","Wilderness Athlete","Pnuma Outdoors","Thermarest","Helinox","Duckworth","Chota Outdoor","Goat Knives","Darn Tough","FHF Gear","On Glass","GoHunt","Mystery Ranch","Vortex","Leupold","Swarovski","Garmin","onX","Sig Sauer","Schnees","SKRE Gear","TideWe","Mossy Oak","Bone Collector","Nomad Outdoor","XOP Outdoors","Novix Outdoors","Hunting Beast Gear","Lone Wolf Custom Gear","Trophyline","Filson","Drake Waterfowl","Buck Gardner","Latitude Outdoors","Smartwool","Leatherman","Spyderco"],
    searchHint:'Try "Sitka Stratus" or "Hoyt Carbon"...',
    searchContext:"whitetail deer, treestand, rut, eastern woods, midwest, climbing stand, scent control",
  },
  turkey: {
    id:"turkey",name:"Gobbler Deals",shortName:"Gobbler Deals",ogImage:"/og-gobbler-deals.png",description:"Real spring turkey gear deals — calls, decoys, vests, and gobbler gear. Updated every morning. No fake markdowns.",tagline:"Calls · Decoys · Spring Gobbler",
    accent:"#8a6a2e",accentLight:"#f7f0e0",accentBorder:"#d8c28a",panelAccent:"#cbb275",heroTitle:"Active Deals",heroBg:"#211a10",heroTagline:"Real turkey hunting sales — tracked fresh every morning across calls, decoys, and spring gobbler gear. No fake markdowns, no inflated MSRPs, just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="12" fill="%238a6a2e"/><g fill="%23fffdf7"><circle cx="32" cy="22" r="6"/><path d="M32 28 Q22 32 22 42 Q22 52 32 52 Q42 52 42 42 Q42 32 32 28 Z"/><path d="M14 38 Q8 40 10 46" stroke="%23fffdf7" stroke-width="2" fill="none"/><path d="M50 38 Q56 40 54 46" stroke="%23fffdf7" stroke-width="2" fill="none"/></g></svg>`,
    brands:["Sitka","First Lite","Kings Camo","Hoyt","Mathews","Phelps Game Calls","Primos","Mountain House","Peak Refuel","Vortex","Leupold","Maven","Sig Sauer","Garmin","onX","Crispi","Schnees","Benchmade","Outdoor Edge","Montana Knife Company","Kryptek","Forloh","Marsupial Gear","Wildtech Gear","Darn Tough","Duckworth","Yeti","Mtn Ops"],
    searchHint:'Try "Phelps mouth call" or "Primos jake decoy"...',
    searchContext:"turkey hunting, spring gobbler, calls, decoys, run and gun, vest",
  },
  waterfowl: {
    id:"waterfowl",name:"Duck Blind Deals",shortName:"Duck Blind Deals",domain:"duckblinddeals.com",ogImage:"https://duckblinddeals.com/og-duck-blind-deals.png",description:"Real waterfowl gear deals — waders, blinds, decoys, and layout gear from Drake, Sitka Waterfowl, Banded and more. Updated every morning. No fake markdowns.",tagline:"Waterfowl · Waders · Blinds",
    accent:"#3a5a78",accentLight:"#e8eef4",accentBorder:"#a8bccd",panelAccent:"#8aa8bf",heroTitle:"Active Deals",heroBg:"#241a10",heroTagline:"Real waterfowl gear sales — tracked fresh every morning from every blind, wader, and decoy brand we trust. No fake markdowns, no inflated MSRPs, just the actual cheapest price online, right now.",favicon:`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="12" fill="%233a5a78"/><g fill="%23fffdf7"><path d="M18 36 Q18 26 28 26 Q34 26 36 30 L46 30 Q44 36 36 38 L36 44 Q30 44 28 40 L20 40 Q18 38 18 36 Z"/><circle cx="30" cy="30" r="1.5" fill="%233a5a78"/></g></svg>`,
    brands:["Drake Waterfowl","Sitka","Yeti","Garmin","onX","Vortex","Leupold","Sig Sauer","Chota Outdoor","Helinox","Mtn Ops","Benchmade","Outdoor Edge","Wilderness Athlete","Darn Tough","Higdon Outdoors","Tanglefree","Rig Em Right","MotionDucks","Buck Gardner","Duck Creek Decoys","Chenegear","Quickcoys","Mossy Oak","Filson","Sillosocks","Smartwool","Leatherman","Spyderco"],
    searchHint:'Try "Drake LST" or "Chota waders"...',
    searchContext:"waterfowl, duck hunting, goose hunting, blinds, decoys, waders, layout",
  },
};

// ── Portal resolution (SSR-safe) ──
// Portal is selected at BUILD time per Vercel project via NEXT_PUBLIC_PORTAL.
// NEXT_PUBLIC_* is inlined into both server and client bundles, so this constant
// is identical on the server and the client — no hydration mismatch, no window read.
export const ACTIVE_PORTAL_ID =
  (process.env.NEXT_PUBLIC_PORTAL && PORTALS[process.env.NEXT_PUBLIC_PORTAL])
    ? process.env.NEXT_PUBLIC_PORTAL
    : "timberline";
export const PORTAL = PORTALS[ACTIVE_PORTAL_ID];

// Each portal reports as its own product for the Command Center analytics beacon.
export const PORTAL_TO_PRODUCT = { timberline:"timberline", whitetail:"treesaddle", turkey:"gobbler", waterfowl:"duckblind" };

// Single brand palette — Sitka cinematic black panels + First Lite cream content + Kuiu orange CTA.
export const PALETTE = {
  bg:"#fbfaf6",bgCard:"#ffffff",bgSolid:"#ffffff",
  bgHeader:"#15140f",border:"#e6e1d4",borderHov:"#1a1815",
  text:"#1a1815",textSub:"#57544c",textMuted:"#9a968c",
  accent:"#2d5a3d",accentLight:"#eef3ee",accentBorder:"#b8cdbc",
  orange:"#c4501e",orangeLight:"#fdf3e8",orangeBorder:"#e8b890",
  red:"#a83a2a",redLight:"#fdf0ee",redBorder:"#e8b0a0",
  navActive:"#eef3ee",
  shadow:"rgba(20,18,12,0.05)",shadowHov:"rgba(20,18,12,0.14)",
  panelBg:"#15140f",panelText:"#f5f1e9",panelSub:"#b8b3a8",panelMuted:"#6a665c",panelBorder:"#2a2823",panelAccent:"#a8d4b0",
};

export const INIT_FAMILY = [];

export const SIZE_OPTIONS = {
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
