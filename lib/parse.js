// Pure, isomorphic parsing/matching helpers. No React, no browser APIs.
// Importable from Server Components and Client Components.

export function parseDeal(row){
  const orig=Math.round(parseFloat(row.orig_price)*100)/100;
  const sale=Math.round(parseFloat(row.sale_price)*100)/100;
  return {
    id:row.id,brand:row.brand,product:row.product,portal:row.portal,
    cat:row.cat,active:row.active,orig:orig,sale:sale,
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
export function fieldsForCat(cat){
  const c=(cat||"").toLowerCase().replace(/[^a-z]/g,"");
  for(const k in CAT_TO_FIELDS){if(c===k||c.includes(k))return CAT_TO_FIELDS[k];}
  return null;
}

export function productGender(deal){
  const n=(deal.product||"").toLowerCase();
  if(/\b(kids?|kid'?s|youth|toddler|junior|jr|infant|baby|boys?|girls?)\b/.test(n)) return "youth";
  if(/\bwomen|woman'?s|womens|ladies|female|wmn/.test(n)) return "womens";
  if(/\bmen'?s\b|\bmens\b|\bmale\b/.test(n)) return "mens";
  return null;
}

export function computeTags(deal, family){
  // A product whose name explicitly states a gender/age (women's, youth, men's) is only
  // ever relevant to family members of that gender -- regardless of whether size data parsed.
  const pg=productGender(deal);
  const elig=pg?family.filter(m=>m.gender===pg):family;
  if(!elig.length) return [];
  const fields=fieldsForCat(deal.cat);
  if(!fields) return elig.map(m=>m.name);
  const noSizeData = !deal.sizes.mens.length && !deal.sizes.womens.length && !deal.sizes.youth.length;
  if(noSizeData) return elig.map(m=>m.name);
  return elig.filter(m=>{
    const ds=deal.sizes[m.gender]||[];
    if(!ds.length) return false;
    return fields.some(f=>m[f]&&ds.includes(m[f]));
  }).map(m=>m.name);
}

export function parseCoupon(row){
  return {
    id:row.id,brand:row.brand,code:row.code,discount:row.discount,
    portal:row.portal,url:row.url,verified:row.verified,
    expires:row.expires_at?new Date(row.expires_at).toLocaleDateString("en-US",{month:"short",day:"numeric"}):"Soon",
  };
}

export function formatShipping(s, shippingMap){
  const row = s.brand && shippingMap ? shippingMap[s.brand] : null;
  if (!row) return "Shipping: unknown";
  const { free_at, flat_rate } = row;
  if (free_at === 0 && flat_rate === 0) return "Free shipping on all orders";
  if (free_at != null && flat_rate != null) return "Free over $" + free_at + " · $" + flat_rate + " flat";
  if (free_at != null) return "Free shipping over $" + free_at;
  if (flat_rate != null) return "$" + flat_rate + " flat shipping";
  return "Shipping varies — see policy";
}

export const brandSlug = b => (b||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

// Display-only price formatter: keeps two decimals ("$22.5" -> "22.50"). The
// underlying numbers stay numeric (used in discount math, sorts, comparisons) —
// only apply this at price *display* interpolations, never in parseDeal.
export const fmtPrice = n => Number(n).toFixed(2);

const APPAREL_RX=/\b(t-?shirt|tee|hoodie|sweatshirt|long\s*sleeve|crew|pullover|hat|cap|beanie|trucker|sticker|decal|patch|koozie|mug|tumbler|lanyard|keychain|flag|poster|logo)\b/i;
export const isApparel=(...parts)=>APPAREL_RX.test(parts.filter(Boolean).join(" "));

export function matchDealsForItem(item, deals, member) {
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
