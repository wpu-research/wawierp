"""Basit, bagimliliksiz HTML temizleyici (betik, iframe, olay ozellikleri, js: baglantilari atilir)."""
from html import escape
from html.parser import HTMLParser

ALLOWED = {
    "a", "abbr", "b", "blockquote", "br", "code", "div", "em", "h1", "h2", "h3", "h4",
    "h5", "h6", "hr", "i", "img", "li", "ol", "p", "pre", "span", "strong", "sub",
    "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "center", "font",
}
VOID = {"br", "hr", "img"}
DROP_CONTENT = {"script", "style", "iframe", "object", "embed", "head", "title", "form", "svg", "math"}
ATTRS = {
    "a": {"href", "title"},
    "img": {"src", "alt", "width", "height"},
    "td": {"colspan", "rowspan", "align"},
    "th": {"colspan", "rowspan", "align"},
    "table": {"width", "border", "cellpadding", "cellspacing"},
    "font": {"color", "size"},
}
SAFE_SCHEMES = ("http://", "https://", "mailto:", "cid:", "data:image/")


def _safe_url(v: str) -> bool:
    return v.strip().lower().startswith(SAFE_SCHEMES)


class _S(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in DROP_CONTENT:
            self.skip += 1
            return
        if self.skip or tag not in ALLOWED:
            return
        parts = []
        for k, v in attrs:
            if k not in ATTRS.get(tag, set()) or v is None:
                continue
            if k in ("href", "src") and not _safe_url(v):
                continue
            parts.append(f' {k}="{escape(v, quote=True)}"')
        if tag == "a":
            parts.append(' rel="noopener noreferrer" target="_blank"')
        self.out.append(f"<{tag}{''.join(parts)}>")

    def handle_startendtag(self, tag, attrs):
        if tag in DROP_CONTENT:
            return
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in DROP_CONTENT:
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or tag not in ALLOWED or tag in VOID:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        if not self.skip:
            self.out.append(escape(data))


def sanitize_html(html: str) -> str:
    p = _S()
    p.feed(html)
    p.close()
    return "".join(p.out)
