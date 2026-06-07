import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waraba-academy.com';

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

async function compileMDX(source: string) {
  const code = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  });
  const { default: Content } = await run(String(code), {
    ...runtime,
    baseUrl: import.meta.url,
  } as any);
  return Content;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url   = `${siteUrl}/blog/${slug}`;
  const image = post.image || post.ogImage;

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image],
      creator: '@warabaacademy',
    },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Content = await compileMDX(post.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover */}
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <Image
          src={post.image || post.ogImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
          unoptimized={!post.image}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Retour */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500 pb-6 border-b border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime}
            </span>
            <span className="font-medium text-gray-600 dark:text-gray-300">
              Par {post.author}
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* MDX Content */}
        <div className="prose prose-gray dark:prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:rounded-xl prose-pre:p-5
          prose-ul:text-gray-600 dark:prose-ul:text-gray-300
          prose-ol:text-gray-600 dark:prose-ol:text-gray-300
          prose-li:my-1
          prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:rounded-r-lg prose-blockquote:py-2
          prose-hr:border-gray-200 dark:prose-hr:border-gray-700
        ">
          <Content />
        </div>

        {/* CTA */}
        <div className="mt-14 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Prêt à passer à l'action ?</h3>
          <p className="text-blue-100 mb-6">
            Découvrez nos formations certifiantes conçues pour les professionnels africains.
          </p>
          <Link
            href="/courses"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Voir les formations →
          </Link>
        </div>
      </div>
    </div>
  );
}
