// api/og.js
export default async function handler(req, res) {
  // einfache CORS-Header (schaden nicht)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(400).json({ success: false, error: "Missing 'url' parameter" });
    return;
  }

  try {
    // Seite laden (Node 18 auf Vercel hat global fetch)
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TierlistBot/1.0; +https://example.com)"
      }
    });

    const html = await response.text();
    const finalUrl = response.url || targetUrl;

    function getMetaByAttr(attrName, attrValue) {
      const regex = new RegExp(
        `<meta[^>]+${attrName}=["']${attrValue}["'][^>]*>`,
        "i"
      );
      const match = html.match(regex);
      if (!match) return null;
      const contentMatch = match[0].match(/content=["']([^"']*)["']/i);
      return contentMatch ? contentMatch[1] : null;
    }

    function getTitleTag() {
      const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      return match ? match[1].trim() : null;
    }

    const ogTitle =
      getMetaByAttr("property", "og:title") ||
      getMetaByAttr("name", "twitter:title");
    const ogImage =
      getMetaByAttr("property", "og:image") ||
      getMetaByAttr("name", "twitter:image");
    const ogUrl =
      getMetaByAttr("property", "og:url") ||
      getMetaByAttr("name", "twitter:url");

    const pageTitle = getTitleTag();

    res.status(200).json({
      success: true,
      title: ogTitle || pageTitle || "",
      image: ogImage || "",
      url: ogUrl || finalUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Fetch failed: " + err.message
    });
  }
}
