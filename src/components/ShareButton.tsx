import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const canUseNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // User cancelled the share sheet — nothing to do.
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `${text} ${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  if (canUseNativeShare) {
    return (
      <button
        type="button"
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background text-sm font-medium rounded-md transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-background text-sm font-medium rounded-md transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 left-0 w-56 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/5 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              WhatsApp
            </a>
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/5 transition-colors"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              Facebook
            </a>
            <a
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/5 transition-colors"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              X / Twitter
            </a>
            <a
              href={linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/5 transition-colors"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              LinkedIn
            </a>
            <button
              type="button"
              onClick={() => {
                handleCopy();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-500/5 transition-colors border-t border-border"
            >
              {copied ? <Check className="h-4 w-4 text-red-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
