import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import { type Article } from "@/lib/types";
import { format } from "date-fns";

export function NewsAndOffers() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles', { limit: 3 }],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Latest News & Offers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest credit card offers, insights, and financial news.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden h-[400px] animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            articles?.map((article) => (
              <Card key={article.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
                {article.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="mr-2 h-4 w-4" />
                    <time dateTime={new Date(article.publishDate).toISOString()}>
                      {format(new Date(article.publishDate), "MMMM d, yyyy")}
                    </time>
                    <span className="mx-2">•</span>
                    <span>{article.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    <Link href={`/news/${article.slug}`}>
                      <a className="hover:text-primary">{article.title}</a>
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {article.excerpt || article.content.substring(0, 120) + "..."}
                  </p>
                  <Link href={`/news/${article.slug}`}>
                    <a className="text-primary font-medium hover:text-primary-700 inline-flex items-center">
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/news">
            <Button variant="outline" className="px-6 py-3">
              View All Articles <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
