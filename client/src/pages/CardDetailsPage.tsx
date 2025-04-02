import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { CreditCardItem } from "@/components/cards/CreditCardItem";
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import { 
  Star, 
  ArrowLeft, 
  CreditCard as CreditCardIcon, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  Info, 
  ExternalLink
} from "lucide-react";
import { type Card as CreditCard, type Bank } from "@/lib/types";
import { Link } from "wouter";

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

    // For search query URLs, use a default video ID
    if (url.pathname.includes('/results')) {
      return 'ysJyxEmWaZQ'; // Default HDFC Infinia video ID
    }
  } catch (e) {
    // If it's not a valid URL, try to use it as is
    console.error('Error parsing YouTube URL:', e);
  }

  // For all other cases, return a default video ID
  return 'ysJyxEmWaZQ'; // Default HDFC Infinia video ID
};

export default function CardDetailsPage() {
  const [, params] = useRoute("/cards/:slug");
  const slug = params?.slug;

  const { data: card, isLoading: isLoadingCard } = useQuery<CreditCard>({
    queryKey: [`/api/cards/${slug}`],
    enabled: !!slug,
  });

  const { data: bank } = useQuery<Bank>({
    queryKey: [`/api/banks/${card?.bankId}`],
    enabled: !!card?.bankId,
  });

  const { data: similarCards } = useQuery<CreditCard[]>({
    queryKey: ['/api/cards', { categoryId: card?.categoryId }],
    enabled: !!card?.categoryId,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoadingCard) {
    return (
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!card) {
    return (
      <Layout>
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Card Not Found</h1>
            <p className="text-gray-600 mb-6">The credit card you're looking for doesn't exist or has been removed.</p>
            <Link href="/cards">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cards
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Filter out the current card from similar cards
  const filteredSimilarCards = similarCards?.filter(c => c.id !== card.id).slice(0, 3) || [];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary to-primary-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">{card?.name}</h1>
            <p className="text-xl text-primary-50 max-w-3xl mx-auto">
              {card?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <Link href="/cards">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cards
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Card Header with Image */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
                <div 
                  className="p-6 text-white flex justify-between items-center"
                  style={{
                    background: `linear-gradient(to right, ${card.cardColorFrom || '#0F4C81'}, ${card.cardColorTo || '#0F4C81'})`
                  }}
                >
                  <h1 className="text-3xl font-bold">{card.name}</h1>
                  {bank?.logoUrl && (
                    <img 
                      src={bank.logoUrl} 
                      alt={bank.name} 
                      className="h-10 w-auto rounded"
                    />
                  )}
                </div>

                <div className="px-6 py-4 bg-white">
                  {card.imageUrl ? (
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-auto object-contain max-h-[300px]"
                      onError={(e) => {
                        // If image fails to load, replace with card name
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite error loop
                        target.alt = card.name || "Credit Card";
                        // Add a card name as fallback text
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallbackText = document.createElement("div");
                          fallbackText.className = "py-4 text-center text-gray-700";
                          fallbackText.innerText = card.name || "Credit Card";
                          parent.appendChild(fallbackText);
                        }
                      }}
                    />
                  ) : (
                    <div className="py-4 text-center text-gray-700">
                      {card.name || "Credit Card"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {card.rating && (
                    <div className="flex items-center mr-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">{card.rating}</span>
                    </div>
                  )}
                </div>
                {card.contentHtml && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDialogOpen(true)}
                    title="View detailed information about this card"
                  >
                    <Info className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {bank && (
                <div className="flex items-center mb-6">
                  {bank.logoUrl ? (
                    <img
                      src={bank.logoUrl}
                      alt={bank.name}
                      className="h-10 w-auto mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-primary-100 flex items-center justify-center rounded-full mr-3">
                      <span className="text-primary font-bold">{bank.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-gray-700">{bank.name}</span>
                </div>
              )}

              <Tabs defaultValue="details" className="mt-4">
                <TabsList className="mb-6 bg-white w-full flex space-x-2 p-1 rounded-lg border border-gray-200">
                  <TabsTrigger value="details" className="flex-1 rounded-md py-2">Card Details</TabsTrigger>
                  <TabsTrigger value="benefits" className="flex-1 rounded-md py-2">Benefits & Features</TabsTrigger>
                  <TabsTrigger value="rates" className="flex-1 rounded-md py-2">Rates & Fees</TabsTrigger>
                  {card.contentHtml && <TabsTrigger value="full-content" className="flex-1 rounded-md py-2">Full Details</TabsTrigger>}
                </TabsList>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {card.rating && (
                        <div className="mb-4 flex items-center">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 opacity-50" />
                          </div>
                          <span className="ml-2 text-sm font-medium">{card.rating} out of 5</span>
                        </div>
                      )}

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Rewards</h3>
                          <p className="text-gray-700">{card.rewardsDescription || "Information not available"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-primary-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <DollarSign className="h-5 w-5 text-primary mr-1" />
                              <h4 className="font-medium">Annual Fee</h4>
                            </div>
                            <p className="text-gray-700">{card.annualFee}</p>
                          </div>

                          {card.introApr && (
                            <div className="bg-primary-50 p-4 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Percent className="h-5 w-5 text-primary mr-1" />
                                <h4 className="font-medium">Intro APR</h4>
                              </div>
                              <p className="text-gray-700">{card.introApr}</p>
                            </div>
                          )}

                          <div className="bg-primary-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <CreditCardIcon className="h-5 w-5 text-primary mr-1" />
                              <h4 className="font-medium">Regular APR</h4>
                            </div>
                            <p className="text-gray-700">{card.regularApr || "Variable"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="benefits">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Benefits & Features</CardTitle>
                      <CardDescription>
                        Detailed information about the benefits and features of this card.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          {card.rewardsDescription || "This card offers rewards and benefits for cardholders."}
                        </p>
                        <p className="text-gray-700">
                          This card also includes standard benefits like fraud protection, online account management, and mobile banking access.
                        </p>
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Who This Card Is Good For:</h4>
                          <p className="text-gray-700">
                            Based on the rewards structure, this card is recommended for individuals looking to maximize their cashback on everyday spending.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rates">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rates & Fees</CardTitle>
                      <CardDescription>
                        Detailed breakdown of the rates and fees associated with this card.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Annual Fee</h4>
                            <p className="text-gray-700">{card.annualFee}</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Regular APR</h4>
                            <p className="text-gray-700">{card.regularApr || "Variable"}</p>
                          </div>

                          {card.introApr && (
                            <div>
                              <h4 className="font-medium mb-1">Intro APR</h4>
                              <p className="text-gray-700">{card.introApr}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-1">Foreign Transaction Fee</h4>
                            <p className="text-gray-700">3% of each transaction</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Late Payment Fee</h4>
                            <p className="text-gray-700">Up to $40</p>
                          </div>

                          <div>
                            <h4 className="font-medium mb-1">Balance Transfer Fee</h4>
                            <p className="text-gray-700">Either $5 or 5% of the amount of each transfer, whichever is greater</p>
                          </div>
                        </div>

                        <div className="mt-6 text-sm text-gray-500">
                          <p>
                            Rates and fees are subject to change. Please refer to the issuer's website for the most current information.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {card.contentHtml && (
                  <TabsContent value="full-content">
                    <Card>
                      <CardHeader>
                        <CardTitle>Full Card Details</CardTitle>
                        <CardDescription>
                          Complete information about the {card.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-4">
                        <div 
                          className="prose prose-blue max-w-none overflow-x-visible break-words"
                          style={{ 
                            width: '150%', 
                            overflowWrap: 'break-word',
                            transform: 'scale(0.85)',
                            transformOrigin: 'top left',
                            marginBottom: '-10%'
                          }}
                          dangerouslySetInnerHTML={{ __html: card.contentHtml }}
                        />

                        {card.youtubeVideoId && (
                          <div className="mt-8">
                            <h3 className="text-lg font-medium mb-4">Video Review</h3>
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${extractYoutubeVideoId(card.youtubeVideoId)}`}
                                title={`${card.name} Video Review`}
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                allowFullScreen
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Ready to enjoy the benefits of the {card.name}? Apply now to get started.
                    </p>

                    <div className="flex justify-center">
                      <a 
                        href={card.applyLink || "#"}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full"
                      >
                        <Button className="w-full" size="lg" disabled={!card.applyLink}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apply Now
                        </Button>
                      </a>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>
                        By clicking "Apply Now", you will be redirected to the issuer's secure application page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {bank && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>About {bank.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bank.logoUrl && (
                        <div className="flex justify-center mb-4">
                          <img
                            src={bank.logoUrl}
                            alt={bank.name}
                            className="h-12 w-auto"
                          />
                        </div>
                      )}

                      <p className="text-gray-700">
                        {bank.description}
                      </p>

                      <Link href={`/banks/${bank.slug}`}>
                        <Button variant="outline" className="w-full">
                          View All {bank.name} Cards
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Similar Cards */}
          {filteredSimilarCards.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Cards You Might Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredSimilarCards.map(card => (
                  <CreditCardItem key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Newsletter />

      {/* Dialog for card info button */}
      {card.contentHtml && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{card.name} - Complete Details</DialogTitle>
              <DialogDescription>
                Detailed information about features, benefits, and terms.
              </DialogDescription>
            </DialogHeader>
            <div 
              className="prose prose-blue max-w-none mt-4 px-1 overflow-x-visible break-words"
              style={{ 
                width: '150%', 
                overflowWrap: 'break-word',
                transform: 'scale(0.85)',
                transformOrigin: 'top left',
                marginBottom: '-10%'
              }}
              dangerouslySetInnerHTML={{ __html: card.contentHtml }}
            />
            <DialogFooter className="mt-6">
              <Button onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}