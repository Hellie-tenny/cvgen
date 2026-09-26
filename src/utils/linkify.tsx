// Splits plain text on URLs (with or without a protocol, e.g. "www.example.com/apply"
// or "https://example.com") and renders them as real clickable links, leaving
// everything else as plain text. Trailing punctuation (a period ending a
// sentence, a closing bracket, etc.) is kept out of the link itself.

const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s]+)/gi;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

interface LinkifyProps {
  text: string;
  className?: string;
}

export function Linkify({ text, className }: LinkifyProps) {
  if (!text) return null;

  const parts = text.split(URL_PATTERN);

  return (
    <>
      {parts.map((part, i) => {
        if (!URL_PATTERN.test(part)) {
          // test() advances lastIndex on the shared regex when it matches,
          // so reset it before reusing — otherwise alternating parts can be
          // skipped incorrectly.
          URL_PATTERN.lastIndex = 0;
          return <span key={i}>{part}</span>;
        }
        URL_PATTERN.lastIndex = 0;

        const trailingMatch = part.match(TRAILING_PUNCTUATION);
        const trailing = trailingMatch ? trailingMatch[0] : "";
        const cleanUrl = trailing ? part.slice(0, -trailing.length) : part;
        const href = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;

        return (
          <span key={i}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className || "text-red-500 hover:underline break-all"}
            >
              {cleanUrl}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}
