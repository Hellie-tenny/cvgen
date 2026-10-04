// One place for the site's public address. When you get a custom domain, change it here
// and every canonical link, share link and structured-data URL follows.
export const SITE_URL = "https://ettiquette-cv.web.app";

// Turns an object into JSON for a <script type="application/ld+json"> tag.
// "<" is escaped so user-submitted text (e.g. a job title containing "</script>") can't break out of the tag.
export const toJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, "\\u003c");
