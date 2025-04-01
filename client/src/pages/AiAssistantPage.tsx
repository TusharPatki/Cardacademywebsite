import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import { AIChat } from "@/components/home/AIChat";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Star, 
  Search,
  HelpCircle,
} from "lucide-react";

export default function AiAssistantPage() {
  const [activeChat, setActiveChat] = useState(true);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary to-primary-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Credit Card AI Assistant</h1>
            <p className="text-xl text-primary-50 max-w-3xl mx-auto">
              Get personalized credit card recommendations and answers to your financial questions in seconds.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-lg h-full">
                <CardHeader>
                  <CardTitle>Ask CardSavvy AI</CardTitle>
                  <CardDescription>
                    Our AI assistant can help you find the perfect credit card, understand credit card terms, and answer financial questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={activeChat ? "block" : "hidden"}>
                    <AIChat />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How Can Our AI Help You?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CreditCard className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Card Recommendations</h3>
                        <p className="text-sm text-gray-600">Get personalized credit card suggestions based on your spending habits and preferences.</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <DollarSign className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Fee Explanations</h3>
                        <p className="text-sm text-gray-600">Understand annual fees, APR, balance transfer fees, and other credit card charges.</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <TrendingUp className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Credit Score Advice</h3>
                        <p className="text-sm text-gray-600">Learn how to improve your credit score and understand what factors affect it.</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start">
                      <Shield className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Fraud Protection</h3>
                        <p className="text-sm text-gray-600">Get tips on how to protect yourself from credit card fraud and identity theft.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sample Questions to Ask</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <HelpCircle className="h-4 w-4 text-primary mr-2" />
                      <p>What's the best cashback card with no annual fee?</p>
                    </li>
                    <li className="flex items-center">
                      <HelpCircle className="h-4 w-4 text-primary mr-2" />
                      <p>How do balance transfers work?</p>
                    </li>
                    <li className="flex items-center">
                      <HelpCircle className="h-4 w-4 text-primary mr-2" />
                      <p>What's the difference between APR and interest rate?</p>
                    </li>
                    <li className="flex items-center">
                      <HelpCircle className="h-4 w-4 text-primary mr-2" />
                      <p>How can I raise my credit score quickly?</p>
                    </li>
                    <li className="flex items-center">
                      <HelpCircle className="h-4 w-4 text-primary mr-2" />
                      <p>What travel card has the best rewards for hotels?</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered by Gemini</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Our assistant uses the latest AI technology to provide accurate and personalized recommendations.</p>
                  </div>
                  <Star className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Browse Credit Card Categories
              </h2>
              <p className="text-gray-600 mt-2">
                Not sure what to ask? Browse our selection of credit cards by category.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Cashback Cards</h3>
                  <p className="text-sm text-gray-600">Get money back on your everyday purchases with cashback credit cards.</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Rewards Cards</h3>
                  <p className="text-sm text-gray-600">Earn points, miles, or other rewards on your credit card spending.</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Travel Cards</h3>
                  <p className="text-sm text-gray-600">Maximize your travel benefits with cards offering miles and travel perks.</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Business Cards</h3>
                  <p className="text-sm text-gray-600">Manage your business expenses with dedicated business credit cards.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Newsletter />
    </Layout>
  );
}
