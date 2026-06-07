import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  ogImage: string;
  readingTime: string;
  content: string;
}

function buildOgImageUrl(title: string, category: string, date: string): string {
  const params = new URLSearchParams({ title, category, date });
  return `${SITE_URL}/api/og/blog?${params.toString()}`;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

function parseFrontmatter(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  const title    = data.title    ?? 'Sans titre';
  const category = data.category ?? 'Général';
  const date     = data.date     ?? new Date().toISOString().split('T')[0];

  return {
    slug,
    title,
    description: data.description ?? '',
    date,
    author:      data.author ?? 'Waraba Academy',
    category,
    tags:        data.tags   ?? [],
    image:       data.image  ?? undefined,
    ogImage:     buildOgImageUrl(title, category, date),
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
    .map((slug) => parseFrontmatter(slug))
    .filter((p): p is BlogPost => p !== null)
    .map(({ content: _, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  return parseFrontmatter(slug);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}
