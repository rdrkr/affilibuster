// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'

import { CMSImage, CMSText } from '@/components/elements'
import type { ApiBlogPostBlogPostDocument, CodeEnum } from '@/lib/generated/types.gen'

interface BlogPostClientProps {
  post: ApiBlogPostBlogPostDocument
  lang: CodeEnum
}

/**
 * Client component for blog post detail page.
 *
 * Renders full blog post with featured image, author info, and rich content.
 * Uses CMS data with graceful degradation.
 * @param props - Component properties
 * @param props.post - Blog post data from CMS
 * @param props.lang - Current language code
 * @returns Blog post detail UI
 */
export default function BlogPostClient({ post, lang }: BlogPostClientProps) {
  // Format published date
  const publishedDate = post.publishedDate
    ? new Date(post.publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  // Get author initials for avatar
  const authorInitials =
    post.author?.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() ?? 'A'

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center text-sm text-neutral-500 dark:text-tertiary-400">
        <Link
          href={`/${lang}`}
          className={`
          transition-colors
          hover:text-primary-500
        `}
        >
          Home
        </Link>
        <span className="material-symbols-outlined mx-2 text-sm">chevron_right</span>
        <Link
          href={`/${lang}/blog`}
          className={`
          transition-colors
          hover:text-primary-500
        `}
        >
          Blog
        </Link>
        <span className="material-symbols-outlined mx-2 text-sm">chevron_right</span>
        <span className="truncate font-medium text-neutral-800 dark:text-white">
          <CMSText text={post.content?.header?.header?.text ?? ''} />
        </span>
      </nav>

      {/* Header */}
      <header className="mb-10 text-center">
        <div className="mb-8 text-center">
          {post.tags?.[0] && (
            <span
              className={`
              mb-4 block text-sm font-bold tracking-wider text-primary-500
              uppercase
            `}
            >
              <CMSText text={post.tags[0].tag?.text ?? ''} />
            </span>
          )}
          <h1
            className={`
            mb-6 text-4xl/tight font-bold text-neutral-900 md:text-5xl
            lg:text-6xl
            dark:text-white
          `}
          >
            <CMSText text={post.content?.header?.header?.text ?? ''} />
          </h1>
          {post.content?.header?.subheader?.text && (
            <p
              className={`
              mx-auto max-w-2xl text-xl/relaxed text-neutral-600 dark:text-tertiary-300
            `}
            >
              <CMSText text={post.content.header.subheader.text} />
            </p>
          )}
        </div>
        <div
          className={`
          flex flex-wrap items-center justify-center gap-4 text-sm
          text-neutral-500 dark:text-tertiary-400
        `}
        >
          {post.author?.name && (
            <div className="flex items-center gap-2">
              <div
                className={`
                  flex size-8 items-center justify-center rounded-full
                  bg-neutral-200 text-xs font-bold text-neutral-700
                  dark:bg-tertiary-700 dark:text-white
                `}
              >
                {authorInitials}
              </div>
              <span>{post.author.name}</span>
            </div>
          )}
          {publishedDate && (
            <>
              <span>•</span>
              <span>{publishedDate}</span>
            </>
          )}
          {post.readTime && (
            <>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </>
          )}
        </div>
      </header>

      {/* Featured Image */}
      <div
        className={`
        relative mb-16 h-[400px] overflow-hidden rounded-xl shadow-2xl
        md:h-[500px]
      `}
      >
        <CMSImage image={post.featuredImage} className="object-cover" fill preload />
      </div>

      {/* Excerpt */}
      {post.content?.header?.subheader?.text && (
        <p className="mb-8 text-xl/relaxed font-medium text-neutral-800 dark:text-white">
          <CMSText text={post.content.header.subheader.text} />
        </p>
      )}

      {/* Article Content */}
      {post.content?.content && (
        <div
          className={`
            prose prose-lg max-w-none
            text-neutral-600 dark:text-tertiary-300
            dark:prose-invert
            prose-headings:text-neutral-900 dark:prose-headings:text-white
            prose-a:text-primary-600 hover:prose-a:text-primary-700
            dark:prose-a:text-primary-400 dark:hover:prose-a:text-primary-300
            prose-strong:text-neutral-900 dark:prose-strong:text-white
            prose-code:text-primary-600 dark:prose-code:text-primary-300
          `}
          dangerouslySetInnerHTML={{ __html: post.content.content }}
        />
      )}

      {/* Author Bio (if available) */}
      {post.author?.bio && (
        <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-tertiary-700">
          <h3 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">About the Author</h3>
          <div className="flex items-start gap-4">
            <div
              className={`
                flex size-16 shrink-0 items-center justify-center rounded-full
                bg-neutral-200 text-xl font-bold text-neutral-700
                dark:bg-tertiary-700 dark:text-white
              `}
            >
              {authorInitials}
            </div>
            <div>
              <h4 className="mb-2 font-bold text-neutral-900 dark:text-white">{post.author.name}</h4>
              <p className="text-sm text-neutral-600 dark:text-tertiary-400">{post.author.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
