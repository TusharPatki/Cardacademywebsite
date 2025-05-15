import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  Button,
} from "@/components/ui";
import { Calendar, ArrowRight } from "lucide-react";
import { type Article } from "@/lib/types";
import { format } from "date-fns";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  // Get unique categories
  const categories = articles 
    ? Array.from(new Set(articles.map(article => article.category)))
    : [];
  
  // Filter articles by selected category
  const filteredArticles = selectedCategory
    ? articles?.filter(article => article.category === selectedCategory)
    : articles;
  
  // Control how many articles to display
  const displayedArticles = showMore 
    ? filteredArticles 
    : filteredArticles?.slice(0, 9);

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Credit Card News & Insights
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest credit card offers, industry news, and financial advice.
            </p>
          </div>
          
          {/* Category Tabs */}
          <div className="mb-10">
            <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
              <TabsList className="mx-auto flex flex-wrap justify-center">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
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
              ))}
            </div>
          ) : displayedArticles && displayedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedArticles.map((article) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No articles found in this category.</p>
              <Button onClick={() => setSelectedCategory(null)}>View All Articles</Button>
            </div>
          )}
          
          {/* Load More Button - only show if there are more to load */}
          {!isLoading && filteredArticles && filteredArticles.length > 9 && !showMore && (
            <div className="mt-10 text-center">
              <Button variant="outline" onClick={() => setShowMore(true)}>
                Load More Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
