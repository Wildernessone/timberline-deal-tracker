// Minimal, safe Markdown -> HTML for editorial articles. Escapes ALL HTML first,
// then applies a fixed whitelist of block + inline formatting (headings, lists,
// blockquotes, paragraphs, bold/italic/code, and http(s)/relative links). No raw
// HTML passthrough, so article bodies can't inject markup even though they're our
// own service-key-written, admin-approved content. Pure + isomorphic.

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, h) =>
      /^(https?:\/\/|\/)/.test(h) ? `<a href="${h}" rel="noopener">${t}</a>` : t)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function mdToHtml(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  let list = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  while (i < lines.length) {
    const ln = lines[i];
    if (/^\s*$/.test(ln)) { closeList(); i++; continue; }
    let m;
    if ((m = ln.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const lvl = Math.min(m[1].length + 1, 4); // never emit <h1> (page owns it)
      out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`); i++; continue;
    }
    if ((m = ln.match(/^>\s?(.*)$/))) { closeList(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); i++; continue; }
    if ((m = ln.match(/^[-*]\s+(.*)$/))) {
      if (list !== "ul") { closeList(); list = "ul"; out.push("<ul>"); }
      out.push(`<li>${inline(m[1])}</li>`); i++; continue;
    }
    if ((m = ln.match(/^\d+\.\s+(.*)$/))) {
      if (list !== "ol") { closeList(); list = "ol"; out.push("<ol>"); }
      out.push(`<li>${inline(m[1])}</li>`); i++; continue;
    }
    closeList();
    const buf = [ln]; i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|>|[-*]\s|\d+\.\s)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  closeList();
  return out.join("\n");
}
