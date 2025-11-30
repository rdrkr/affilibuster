// Copyright (c) 2025 Affilibuster by Ronen Druker.

'use client'

import Link from 'next/link'
import { useState } from 'react'

import { CMSImage, CMSText } from '@/components/elements'
import type { ApiBlogBlogDocument, ApiBlogPostBlogPostDocument, CodeEnum } from '@/lib/generated/types.gen'

interface BlogClientProps {
  blogPageData: ApiBlogBlogDocument | null
  posts: ApiBlogPostBlogPostDocument[]
  lang: CodeEnum
}

/**
 * Client component for blog listing page.
 *
 * Renders blog posts with filtering by category/tag.
 * Uses CMS data for all content with graceful degradation.
 * @param props - Component properties
 * @param props.blogPageData - Blog page metadata from CMS
 * @param props.posts - List of blog posts from CMS
 * @param props.lang - Current language code
 * @returns Blog listing UI
 */
export default function BlogClient({ blogPageData, posts, lang }: BlogClientProps) {
  const [activeTag, setActiveTag] = useState<string>('All')

  // Extract unique tags from posts
  const allTags: string[] = ['All']
  posts.forEach(post => {
    const tagName = post.tags?.[0]?.tag?.text
    if (tagName && !allTags.includes(tagName)) {
      allTags.push(tagName)
    }
  })

  // Filter posts by selected tag
  const filteredPosts = activeTag === 'All' ? posts : posts.filter(post => post.tags?.[0]?.tag?.text === activeTag)

  // Get featured post (first post)
  const featuredPost = filteredPosts[0]
  const gridPosts = filteredPosts.slice(1)

  return (
    <div className="py-8">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <h1
          className={`
          mb-4 text-4xl font-bold text-white
          md:text-6xl
        `}
        >
          {blogPageData?.header?.header?.text ?? (
            <>
              Sustainable Living, <span className="text-primary-500">Simplified.</span>
            </>
          )}
        </h1>
        {blogPageData?.header?.subheader?.text && (
          <p className="text-lg text-tertiary-300">{blogPageData.header.subheader.text}</p>
        )}

        {allTags.length > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setActiveTag(tag)
                }}
                className={`
                  rounded-full px-6 py-2 font-medium transition-all
                  ${
                    tag === activeTag
                      ? 'bg-primary-600 font-bold text-white'
                      : `
                      border border-tertiary-700 bg-tertiary-800 text-tertiary-400
                      hover:border-primary-500 hover:text-white
                    `
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
          {/* Featured Post */}
          {featuredPost && (
            <div
              className={`
                group overflow-hidden rounded-xl border border-tertiary-700
                bg-tertiary-800 transition-all
                hover:border-primary-500/30
              `}
            >
              <div className="md:flex">
                <div
                  className={`
                  relative h-64 overflow-hidden bg-tertiary-900
                  md:h-auto md:w-1/2
                `}
                >
                  <CMSImage
                    image={featuredPost.featuredImage}
                    fallbackAlt={featuredPost.content?.header?.header?.text ?? ''}
                    className={`
                      object-cover transition-transform duration-700
                      group-hover:scale-105
                    `}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    preload
                  />
                </div>
                <div
                  className={`
                  flex flex-col justify-center p-8
                  md:w-1/2 md:p-12
                `}
                >
                  {featuredPost.tags?.[0] && (
                    <span
                      className={`
                      mb-2 text-sm font-bold tracking-wider text-primary-500
                      uppercase
                    `}
                    >
                      <CMSText text={featuredPost.tags[0].tag?.text ?? ''} />
                    </span>
                  )}
                  <h2
                    className={`
                    mb-4 text-3xl font-bold text-white transition-colors
                    group-hover:text-primary-500
                  `}
                  >
                    <CMSText text={featuredPost.content?.header?.header?.text ?? ''} />
                  </h2>
                  {featuredPost.content?.header?.subheader?.text && (
                    <p className="mb-6 text-lg text-tertiary-300">
                      <CMSText text={featuredPost.content.header.subheader.text} />
                    </p>
                  )}
                  <div
                    className={`
                    mb-8 flex items-center text-sm text-tertiary-400
                  `}
                  >
                    {featuredPost.author?.name && <span>By {featuredPost.author.name}</span>}
                    {featuredPost.readTime && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{featuredPost.readTime} min read</span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/${lang}/blog/${featuredPost.documentId}`}
                    className={`
                      inline-block w-max rounded-full bg-tertiary-700 px-8 py-3
                      text-center font-bold text-white transition-all
                      hover:bg-primary-600 hover:text-white
                    `}
                  >
                    Read Article
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Grid Posts */}
          {gridPosts.length > 0 && (
            <div
              className={`
              grid grid-cols-1 gap-8
              md:grid-cols-2
              lg:grid-cols-3
            `}
            >
              {gridPosts.map(post => (
                <Link
                  href={`/${lang}/blog/${post.documentId}`}
                  key={post.documentId}
                  className={`
                    group flex flex-col overflow-hidden rounded-xl border
                    border-tertiary-700 bg-tertiary-800 transition-all
                    hover:border-primary-500/30
                  `}
                >
                  <div className="relative h-56 overflow-hidden bg-tertiary-900">
                    <CMSImage
                      image={post.featuredImage}
                      fallbackAlt={post.content?.header?.header?.text ?? ''}
                      className={`
                        object-cover transition-transform duration-500
                        group-hover:scale-110
                      `}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex grow flex-col p-6">
                    {post.tags?.[0] && (
                      <span
                        className={`
                        mb-2 text-xs font-bold tracking-wider text-primary-500
                        uppercase
                      `}
                      >
                        <CMSText text={post.tags[0].tag?.text ?? ''} />
                      </span>
                    )}
                    <h3
                      className={`
                      mb-3 text-xl font-bold text-white transition-colors
                      group-hover:text-primary-500
                    `}
                    >
                      <CMSText text={post.content?.header?.header?.text ?? ''} />
                    </h3>
                    {post.content?.header?.subheader?.text && (
                      <p
                        className={`
                        mb-4 line-clamp-3 grow text-sm text-tertiary-400
                      `}
                      >
                        <CMSText text={post.content.header.subheader.text} />
                      </p>
                    )}
                    <div
                      className={`
                        mt-auto flex items-center justify-between border-t
                        border-tertiary-700 pt-4 text-xs text-tertiary-400
                      `}
                    >
                      {post.author?.name && <span>{post.author.name}</span>}
                      {post.readTime && <span>{post.readTime} min read</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center">
          <span
            className={`
            material-symbols-outlined mb-4 block text-6xl text-tertiary-600
          `}
          >
            article
          </span>
          <p className="text-lg text-tertiary-400">No blog posts found</p>
        </div>
      )}
    </div>
  )
}
