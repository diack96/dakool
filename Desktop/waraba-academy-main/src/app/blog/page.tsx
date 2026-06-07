import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/blog';
import { generatePageMetadata } from '@/lib/seo';
import { Calendar, Clock, Tag } from 'lucide-react';

export const revalidate = 3600;

export const metadata = generatePageMetadata(
  'Blog',
  'Conseils, guides et ressources pour apprendre le digital, l\'IA et les soft skills depuis l\'Afrique.',
  '/blog',
);

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      {/* Hero */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Blog
          </span>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Ressources pour apprendre et progresser
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Guides pratiques, conseils carrière et tendances tech — pensés pour les professionnels africains.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20">
            Aucun article pour l'instant. Revenez bientôt !
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post, i) => (
              <article
                key={post.slug}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className={`flex flex-col ${i === 0 ? 'md:flex-row' : 'sm:flex-row'}`}>
                    {/* Image */}
                    <div className={`relative flex-shrink-0 ${i === 0 ? 'md:w-80 h-52 md:h-auto' : 'sm:w-48 h-40 sm:h-auto'}`}>
                      <Image
                        src={post.image || post.ogImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        unoptimized={!post.image}
                        sizes={i === 0 ? '320px' : '192px'}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between p-6 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        <h2 className={`font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 ${i === 0 ? 'text-2xl' : 'text-lg'}`}>
                          {post.title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                          {post.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readingTime}
                        </span>
                        {post.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {post.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
