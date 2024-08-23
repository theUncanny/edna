// -------------- toc generation
function getAllHeaders() {
  return Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
}

function removeHash(str) {
  return str.replace(/#$/, "");
}

class TocItem {
  id = "";
  text = "";
  hLevel = 0;
  nesting = 0;
  el;
}

function collectHeaders() {
  let allHdrs = getAllHeaders();
  let res = [];
  let el = document.getElementsByClassName("breadcrumbs")[0];
  if (el) {
    let h = new TocItem();
    h.text = "Home";
    h.el = el;
    res.push(h);
  }
  for (let el of allHdrs) {
    let id = el.getAttribute("id");
    /** @type {string} */
    let text = el.innerText;
    text = text.trim();
    text = removeHash(text);
    text = text.trim();
    let hLevel = parseInt(el.tagName[1]);
    let h = new TocItem();
    h.id = id;
    h.text = text;
    h.hLevel = hLevel;
    h.nesting = 0;
    h.el = el;
    res.push(h);
    // console.log(h);
  }
  return res;
}

function fixNesting(hdrs) {
  let n = hdrs.length;
  for (let i = 0; i < n; i++) {
    let h = hdrs[i];
    if (i == 0) {
      h.nesting = 0;
    } else {
      h.nesting = h.hLevel - 1;
    }
    // console.log(`${h.hLevel} => ${h.nesting}`);
  }
}

function genTocMini(hdrs) {
  let tmp = "";
  let t = `<div class="toc-item-mini">▃</div>`;
  for (let h of hdrs) {
    tmp += t;
  }
  return `<div class="toc-mini">` + tmp + `</div>`;
}

function genTocList(hdrs) {
  let tmp = "";
  let t = `<div title="{title}" class="toc-item toc-trunc {ind}" onclick=tocGoTo({n})>{text}</div>`;
  let n = 0;
  for (let h of hdrs) {
    let s = t;
    s = s.replace("{n}", n);
    let ind = "toc-ind-" + h.nesting;
    s = s.replace("{ind}", ind);
    s = s.replace("{text}", h.text);
    s = s.replace("{title}", h.text);
    tmp += s;
    n++;
  }
  return `<div class="toc-list">` + tmp + `</div>`;
}

let hdrs = [];
function tocGoTo(n) {
  console.log("tocGoTo:", n);
  let el = hdrs[n].el;
  let y = el.getBoundingClientRect().top + window.scrollY;
  let offY = 57;
  let navEl = document.getElementsByClassName("nav")[0];
  if (navEl) {
    offY = navEl.getBoundingClientRect().height;
  }
  y -= offY;
  window.scrollTo({
    top: y,
  });
}

function genToc() {
  hdrs = collectHeaders();
  fixNesting(hdrs);
  const container = document.createElement("div");
  container.className = "toc-wrapper";
  let s = genTocMini(hdrs);
  let s2 = genTocList(hdrs);
  container.innerHTML = s + s2;
  document.body.appendChild(container);
}

genToc();
