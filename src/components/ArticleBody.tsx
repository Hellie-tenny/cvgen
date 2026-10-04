import { Linkify } from "@/utils/linkify";

// Renders an article's text. The formatting is deliberately tiny so articles are easy to write by hand:
//   blank line = new paragraph      ## Heading      ### Subheading
//   - bullet                        1. numbered     > sample answer / callout
//   **bold**                        links (https://… or www.…) become clickable
// Everything is rendered as plain React elements (never raw HTML), so pasted text can't inject markup.

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <Linkify key={i} text={part} />
        )
      )}
    </>
  );
}

type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let prevBlank = true;

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", text: para.join("\n") });
    para = [];
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushPara();
      prevBlank = true;
      continue;
    }

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.*)$/))) {
      flushPara();
      blocks.push({ type: "h3", text: m[1] });
    } else if ((m = line.match(/^##\s+(.*)$/))) {
      flushPara();
      blocks.push({ type: "h2", text: m[1] });
    } else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ul") last.items.push(m[1]);
      else blocks.push({ type: "ul", items: [m[1]] });
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "ol") last.items.push(m[1]);
      else blocks.push({ type: "ol", items: [m[1]] });
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "quote" && !prevBlank) last.text += `\n${m[1]}`;
      else blocks.push({ type: "quote", text: m[1] });
    } else {
      para.push(line);
    }
    prevBlank = false;
  }
  flushPara();
  return blocks;
}

export function ArticleBody({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-5">
      {parse(text).map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="text-2xl font-semibold mt-4">
                <Inline text={block.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-xl font-semibold mt-2">
                <Inline text={block.text} />
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc pl-6 space-y-1.5 text-base leading-relaxed text-foreground/90">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal pl-6 space-y-1.5 text-base leading-relaxed text-foreground/90">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-red-500/60 pl-4 text-base leading-relaxed text-foreground/80 whitespace-pre-line"
              >
                <Inline text={block.text} />
              </blockquote>
            );
          default:
            return (
              <p key={i} className="text-base leading-relaxed text-foreground/90 whitespace-pre-line">
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
