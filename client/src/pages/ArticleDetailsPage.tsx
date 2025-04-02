import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { 
  Button,
  Card,
  CardContent,
} from "@/components/ui";
import { ArrowLeft, Calendar, Share2, AlertCircle } from "lucide-react";
import { type Article } from "@/lib/types";
import { Link } from "wouter";
import { format } from "date-fns";

// Helper function to extract YouTube video ID from various URL formats or return the ID itself
const extractYoutubeVideoId = (urlOrId: string): string => {
  if (!urlOrId) return '';
  
  // If it's already just an ID (no slashes or protocol)
  if (!urlOrId.includes('/') && !urlOrId.includes('http')) {
    return urlOrId;
  }
  
  try {
    // Handle YouTube URLs (various formats)
    const url = new URL(urlOrId);
    
    // Format: youtube.com/watch?v=VIDEO_ID
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v') || '';
    }
    
    // Format: youtube.com/embed/VIDEO_ID
    if (url.pathname.includes('/embed/')) {
      return url.pathname.split('/embed/')[1];
    }
    
    // Format: youtu.be/VIDEO_ID
    if (url.hostname === 'youtu.be') {
      return url.pathname.substring(1);
    }
    
    // For search query URLs, return empty string
    if (url.pathname.includes('/results')) {
      return '';
    }
  } catch (e) {
    // If it's not a valid URL, return the input as is
    console.error('Error parsing YouTube URL:', e);
  }
  
  // Return the original value if we couldn't extract an ID
  return urlOrId;
};

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
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!article) {
    return (
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
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
      </Layout>
    );
  }

  // Filter out the current article from related articles
  const filteredRelatedArticles = relatedArticles?.filter(a => a.id !== article.id).slice(0, 3) || [];

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/news">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <article className="bg-white rounded-lg shadow overflow-hidden">
                {article.imageUrl && (
                  <div className="h-72 overflow-hidden">
                    <img
                      src={article.imageUrl.startsWith('/') ? article.imageUrl : `/${article.imageUrl.replace(/^\//, '')}`}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    <time dateTime={new Date(article.publishDate).toISOString()}>
                      {format(new Date(article.publishDate), "MMMM d, yyyy")}
                    </time>
                    <span className="mx-2">•</span>
                    <span>{article.category}</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {article.title}
                  </h1>
                  
                  {article.contentHtml ? (
                    <div 
                      className="prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                    />
                  ) : (
                    <div className="prose max-w-none">
                      {article.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {article.youtubeVideoId && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">Video Content</h3>
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYoutubeVideoId(article.youtubeVideoId)}`}
                          title={article.title}
                          className="w-full rounded-lg"
                          style={{ height: '400px' }}
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Category: <span className="font-medium">{article.category}</span>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
                
                {filteredRelatedArticles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRelatedArticles.map(relatedArticle => (
                      <Card key={relatedArticle.id} className="overflow-hidden">
                        {relatedArticle.imageUrl && (
                          <div className="h-32 overflow-hidden">
                            <img
                              src={relatedArticle.imageUrl.startsWith('/') ? relatedArticle.imageUrl : `/${relatedArticle.imageUrl.replace(/^\//, '')}`}
                              alt={relatedArticle.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="text-xs text-gray-500 mb-1">
                            {format(new Date(relatedArticle.publishDate), "MMMM d, yyyy")}
                          </div>
                          <h4 className="text-sm font-medium mb-2 line-clamp-2">
                            <Link href={`/news/${relatedArticle.slug}`}>
                              <a className="hover:text-primary">{relatedArticle.title}</a>
                            </Link>
                          </h4>
                          <Link href={`/news/${relatedArticle.slug}`}>
                            <a className="text-xs text-primary font-medium hover:underline">
                              Read More
                            </a>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-gray-500">
                      No related articles found.
                    </CardContent>
                  </Card>
                )}
                
                <div className="mt-6">
                  <Link href="/news">
                    <Button variant="outline" className="w-full">
                      View All Articles
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
