// Shared helpers for blog content: the hand-written articles in data/blogPosts.ts and the
// articles you post from the admin screen (Firestore "articles" collection).
import type { Timestamp } from "firebase/firestore";
import { blogPosts, type BlogPost } from "../data/blogPosts";

export const ARTICLE_CATEGORIES = ["Interview prep", "CV tips", "Cover letters", "Career advice"];

export interface ArticleDoc {
  title: string;
  description: string;
  category?: string;
  body: string;
  status: "draft" | "published";
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  publishedAt?: Timestamp | null;
}

// One shape for both kinds of article, so the blog pages don't care where a post came from.
export interface BlogEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  body: string;
  date: Date;
  updated: Date | null;
  readTime: string;
}

export function readTimeFor(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

// Addresses already used by the built-in posts can't be reused.
export const isReservedSlug = (slug: string) => blogPosts.some((p) => p.slug === slug);

export function staticToEntry(post: BlogPost): BlogEntry {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: "CV tips",
    body: post.content.join("\n\n"),
    date: new Date(post.date),
    updated: null,
    readTime: post.readTime,
  };
}

export function docToEntry(slug: string, data: ArticleDoc): BlogEntry {
  return {
    slug,
    title: data.title,
    description: data.description,
    category: data.category || "Career advice",
    body: data.body,
    date: data.publishedAt?.toDate() ?? data.createdAt?.toDate() ?? new Date(),
    updated: data.updatedAt?.toDate() ?? null,
    readTime: readTimeFor(data.body),
  };
}
