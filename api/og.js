// api/og.js – Vercel Serverless Function for reading OpenGraph / Epic data

export default async function handler(req, res) {
  try {
    const urlObj = new URL(req.url, "http://localhost");
    const targetUrl = urlObj.searchParams.get("url");

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing ?url parameter",
      });
    }

    const pageUrl = new URL(targetUrl);

    // Seite mit "echtem" Browser-User-Agent abrufen
    const response = await fetch(pageUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: "Remote HTTP error " + response.status,
      });
    }

    const html = await response.text();

    // ---------- generisches OpenGraph / Twitter ----------

    const findMetaContent = (attr, value) => {
      // Variante: ... attr="value" ... content="..." ...
      let re = new RegExp(
        `<meta[^>]*${attr}\\s*=\\s*["']${value}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`,
        "i"
      );
      let m = html.match(re);
      if (m) return m[1];

      // Variante: ... content="..." ... attr="value" ...
      re = new RegExp(
        `<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*${attr}\\s*=\\s*["']${value}["'][^>]*>`,
        "i"
      );
      m = html.match(re);
      return m ? m[1] : null;
    };

    const getMeta = (key) => {
      return (
        findMetaContent("property", key) ||
        findMetaContent("name", key)
      );
    };

    let title =
      getMeta("og:title") ||
      getMeta("twitter:title");

    let image =
      getMeta("og:image") ||
      getMeta("og:image:url") ||
      getMeta("og:image:secure_url") ||
      getMeta("twitter:image");

    let ogUrl =
      getMeta("og:url") ||
      getMeta("twitter:url") ||
      pageUrl.toString();

    // Fallback: normaler <title>-Tag
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    // ---------- SPEZIALFÄLLE: Epic Games Store ----------

    if (pageUrl.hostname.includes("store.epicgames.com")) {
      // 1) Titel aus URL-Slug bauen, wenn wir noch keinen sinnvollen Titel haben
      // Beispiel: /en-US/p/where-winds-meet-58a176
      if (!title || /epic games store/i.test(title)) {
        const segments = pageUrl.pathname.split("/").filter(Boolean);
        // meistens: [ 'en-US', 'p', 'where-winds-meet-58a176' ]
        let slug = segments[segments.length - 1] || "";

        // falls letzter Teil nur eine Hex-ID ist, vorherigen Teil nehmen
        // (zur Sicherheit splitten wir den ganzen Slug)
        const slugParts = slug.split("-");
        if (
          slugParts.length > 1 &&
          /^[0-9a-f]{5,}$/i.test(slugParts[slugParts.length - 1])
        ) {
          slugParts.pop();
        }

        const words = slugParts
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1));

        if (words.length) {
          title = words.join(" ");
        }
      }

      // 2) Bild aus eingebettetem JSON "keyImages"
      if (!image) {
        const imgMatch = html.match(
          /"keyImages"\s*:\s*\[[^\]]*?"url"\s*:\s*"([^"]+)"/i
        );
        if (imgMatch) {
          image = imgMatch[1]
            .replace(/\\u002F/g, "/")
            .replace(/\\\//g, "/");
        }
      }
    }

    // Access-Denied / Fehlseiten erkennen
    if (title && /access denied|forbidden|error/i.test(title)) {
      return res.status(200).json({
        success: false,
        error: "Page returned an error instead of game information",
      });
    }

    // Wenn wirklich gar nichts da ist → Fehler
    if (!title && !image) {
      return res.status(200).json({
        success: false,
        error: "No usable metadata found on page",
      });
    }

    return res.status(200).json({
      success: true,
      title: title || "Untitled",
      image: image || "",
      url: ogUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch metadata: " + err.message,
    });
  }
}
