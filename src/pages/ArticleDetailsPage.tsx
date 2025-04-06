import React, { useEffect, useState } from 'react';
import { useRoute } from 'next/router';
import { useQuery } from 'react-query';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from '@/components/ui/link';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { extractYoutubeVideoId } from '@/lib/utils';

export default function ArticleDetailsPage() {
  const [, params] = useRoute("/news/:slug");
  const slug = params?.slug;
  
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles', { limit: 3 }],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              {/* Loading state content */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
              <Link href="/news">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/news">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <article className="bg-white rounded-lg shadow-sm">
                {article.imageUrl && (
                  <div className="relative h-[400px] w-full overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8 max-w-[100%] overflow-x-hidden">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    <time dateTime={new Date(article.publishDate).toISOString()}>
                      {format(new Date(article.publishDate), "MMMM d, yyyy")}
                    </time>
                    <span className="mx-2">•</span>
                    <span>{article.category}</span>
                  </div>
                  
                  <h1 className="text-4xl font-bold text-gray-900 mb-6 break-words">
                    {article.title}
                  </h1>
                  
                  {article.contentHtml ? (
                    <div 
                      className="prose prose-lg prose-blue max-w-none overflow-hidden break-words"
                      style={{
                        width: '100%',
                        overflowWrap: 'break-word',
                        wordWrap: 'break-word',
                        hyphens: 'auto'
                      }}
                    >
                      <div 
                        className="notion-content"
                        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                        style={{
                          '--notion-max-width': '100%',
                          '--notion-header-height': 'auto',
                        }}
                      />
                      <style jsx global>{`
                        .notion-content {
                          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
                          line-height: 1.6;
                        }
                        .notion-content h1 {
                          font-size: 2em;
                          font-weight: 600;
                          margin: 1.4em 0 0.8em;
                          padding: 0.5em;
                          border-radius: 4px;
                        }
                        .notion-content h2 {
                          font-size: 1.5em;
                          font-weight: 600;
                          margin: 1.4em 0 0.8em;
                        }
                        .notion-content p {
                          margin: 1em 0;
                          color: rgb(55, 53, 47);
                        }
                        .notion-content img {
                          max-width: 100%;
                          height: auto;
                          border-radius: 4px;
                          margin: 1.5em 0;
                        }
                        .notion-content .callout {
                          padding: 1.2em;
                          border-radius: 4px;
                          margin: 1.5em 0;
                          display: flex;
                          gap: 1em;
                        }
                        .notion-content table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 1.5em 0;
                        }
                        .notion-content th,
                        .notion-content td {
                          border: 1px solid rgba(55, 53, 47, 0.2);
                          padding: 0.75em;
                          text-align: left;
                        }
                        .notion-content th {
                          background: rgba(55, 53, 47, 0.05);
                          font-weight: 600;
                        }
                        .notion-content ul,
                        .notion-content ol {
                          margin: 0.8em 0;
                          padding-left: 1.5em;
                        }
                        .notion-content li {
                          margin: 0.3em 0;
                        }
                        .notion-content .block-color-blue_background {
                          background: rgba(231, 243, 248, 1);
                        }
                        .notion-content .block-color-teal_background {
                          background: rgba(237, 243, 236, 1);
                        }
                        .notion-content .block-color-gray_background {
                          background: rgba(248, 248, 247, 1);
                        }
                        .notion-content .highlight-red {
                          color: rgba(212, 76, 71, 1);
                        }
                        .notion-content .icon {
                          font-size: 1.2em;
                          margin-right: 0.5em;
                        }
                      `}</style>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none overflow-hidden break-words">
                      {article.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {article.youtubeVideoId && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Video Content</h3>
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYoutubeVideoId(article.youtubeVideoId)}`}
                          title={article.title}
                          className="w-full rounded-lg"
                          style={{ height: '500px' }}
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>
            
            <div className="lg:col-span-3">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
                <div className="space-y-4">
                  {relatedArticles?.filter(a => a.id !== article.id).slice(0, 3).map(relatedArticle => (
                    <Card key={relatedArticle.id} className="overflow-hidden">
                      {relatedArticle.imageUrl && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={relatedArticle.imageUrl}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">
                          {format(new Date(relatedArticle.publishDate), "MMMM d, yyyy")}
                        </div>
                        <h4 className="font-medium mb-2 line-clamp-2">
                          <Link href={`/news/${relatedArticle.slug}`}>
                            <a className="hover:text-primary">{relatedArticle.title}</a>
                          </Link>
                        </h4>
                        <Link href={`/news/${relatedArticle.slug}`}>
                          <a className="text-sm text-primary font-medium hover:underline">
                            Read More
                          </a>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 