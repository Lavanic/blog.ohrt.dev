// Copies each GFM footnote next to its reference as a margin note.
// CSS picks which copy shows: margin notes on wide screens, the
// standard footnote list at the bottom on narrow ones.
export default function rehypeSidenotes() {
  return (tree) => {
    const section = find(tree, (n) => has(n, "dataFootnotes"));
    if (!section) return;

    const notes = new Map();
    walk(section, (n) => {
      if (n.tagName === "li" && n.properties?.id) {
        notes.set(`#${n.properties.id}`, n);
      }
    });

    walk(tree, (n, parent, i) => {
      if (n.tagName !== "sup" || !parent) return;
      const ref = n.children.find((c) => has(c, "dataFootnoteRef"));
      const note = ref && notes.get(ref.properties.href);
      if (!note) return;
      parent.children.splice(i + 1, 0, sidenote(ref, note));
    });
  };
}

function sidenote(ref, note) {
  const body = structuredClone(note.children);
  // the ↩ links only make sense in the bottom list
  walk({ children: body }, (n, parent, i) => {
    if (has(n, "dataFootnoteBackref")) parent.children.splice(i, 1);
  });
  // notes sit inside a <p>, so block children become block-styled spans
  walk({ children: body }, (n) => {
    if (n.tagName === "p") {
      n.tagName = "span";
      n.properties = { className: ["sidenote-p"] };
    }
  });
  return el("span", { className: ["sidenote"] }, [
    el("span", { className: ["sidenote-num"] }, [
      { type: "text", value: textOf(ref) },
    ]),
    { type: "text", value: " " },
    ...body,
  ]);
}

function el(tagName, properties, children) {
  return { type: "element", tagName, properties, children };
}

function textOf(n) {
  if (n.type === "text") return n.value;
  return (n.children ?? []).map(textOf).join("");
}

function find(n, test) {
  if (test(n)) return n;
  for (const c of n.children ?? []) {
    const hit = find(c, test);
    if (hit) return hit;
  }
}

// walks backwards so callbacks can splice around the current index
function walk(n, fn) {
  const kids = n.children ?? [];
  for (let i = kids.length - 1; i >= 0; i--) {
    walk(kids[i], fn);
    fn(kids[i], n, i);
  }
}

// data-* flags arrive as "" or true, so test presence, not truthiness
function has(n, prop) {
  return n.properties?.[prop] != null;
}
