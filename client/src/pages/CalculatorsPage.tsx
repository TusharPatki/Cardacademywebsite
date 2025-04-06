import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Newsletter } from "@/components/home/Newsletter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
  Button,
  Slider,
} from "@/components/ui";
import { Calculator, CreditCard, Percent, ArrowLeftRight } from "lucide-react";
import { type Calculator as CalculatorType } from "@/lib/types";

export default function CalculatorsPage() {
  const [activeCalculator, setActiveCalculator] = useState("credit-card-payoff");
  const [balance, setBalance] = useState(3000);
  const [interestRate, setInterestRate] = useState(18);
  const [payment, setPayment] = useState(100);
  
  const { data: calculators } = useQuery<CalculatorType[]>({
    queryKey: ['/api/calculators'],
  });
  
  // Simple calculation functions
  const calculatePayoffMonths = () => {
    if (payment <= 0 || balance <= 0 || interestRate <= 0) return 0;
    
    const monthlyRate = interestRate / 100 / 12;
    let remainingBalance = balance;
    let months = 0;
    
    while (remainingBalance > 0 && months < 1000) { // Cap at 1000 months to prevent infinite loops
      months++;
      remainingBalance = remainingBalance * (1 + monthlyRate) - payment;
      if (remainingBalance < payment) {
        months += remainingBalance / payment;
        break;
      }
    }
    
    return Math.ceil(months);
  };
  
  const calculateTotalInterest = () => {
    const months = calculatePayoffMonths();
    const totalPaid = months * payment;
    return totalPaid - balance;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };
  
  const payoffMonths = calculatePayoffMonths();
  const totalInterest = calculateTotalInterest();
  const years = Math.floor(payoffMonths / 12);
  const months = payoffMonths % 12;
  const timeString = years > 0 
    ? `${years} ${years === 1 ? 'year' : 'years'}${months > 0 ? ` and ${months} ${months === 1 ? 'month' : 'months'}` : ''}`
    : `${months} ${months === 1 ? 'month' : 'months'}`;

  // Map of icon names to Lucide components
  const iconMap: Record<string, React.ReactNode> = {
    "credit-card": <CreditCard className="h-8 w-8 text-primary" />,
    "percentage": <Percent className="h-8 w-8 text-primary" />,
    "coins": <Calculator className="h-8 w-8 text-primary" />,
    "exchange-alt": <ArrowLeftRight className="h-8 w-8 text-primary" />,
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary to-primary-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Financial Calculators</h1>
            <p className="text-xl text-primary-50 max-w-3xl mx-auto">
              Make informed financial decisions with our suite of calculators designed to help you manage your credit and finances.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Calculator</CardTitle>
                  <CardDescription>
                    Choose a calculator from our selection to help with your financial planning.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {calculators?.map((calc) => (
                      <button
                        key={calc.id}
                        className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center ${
                          activeCalculator === calc.slug
                            ? "bg-primary-50 text-primary"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setActiveCalculator(calc.slug)}
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          {iconMap[calc.iconName] || <Calculator className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{calc.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{calc.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {calculators?.find(c => c.slug === activeCalculator)?.name || "Credit Card Payoff Calculator"}
                  </CardTitle>
                  <CardDescription>
                    {calculators?.find(c => c.slug === activeCalculator)?.description || 
                      "Calculate how long it will take to pay off your credit card balance."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Credit Card Payoff Calculator */}
                  {activeCalculator === "credit-card-payoff" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Current Balance</label>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">₹</span>
                            <Input
                              type="number"
                              value={balance}
                              onChange={(e) => setBalance(Number(e.target.value))}
                              min={0}
                              step={100}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Interest Rate (%)</label>
                          <Input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            min={0}
                            max={100}
                            step={0.1}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Monthly Payment</label>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-2">₹</span>
                            <Input
                              type="number"
                              value={payment}
                              onChange={(e) => setPayment(Number(e.target.value))}
                              min={0}
                              step={10}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t">
                        <h3 className="text-lg font-medium mb-4">Results</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="bg-primary-50">
                            <CardContent className="p-6">
                              <h4 className="text-sm font-medium text-gray-600 mb-1">Time to Pay Off</h4>
                              <p className="text-2xl font-bold text-primary mb-1">{timeString}</p>
                              <p className="text-xs text-gray-500">{payoffMonths} total months</p>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-primary-50">
                            <CardContent className="p-6">
                              <h4 className="text-sm font-medium text-gray-600 mb-1">Total Interest Paid</h4>
                              <p className="text-2xl font-bold text-primary mb-1">{formatCurrency(totalInterest)}</p>
                              <p className="text-xs text-gray-500">Total Paid: {formatCurrency(totalInterest + balance)}</p>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="mt-6">
                          <p className="text-sm text-gray-500">
                            Increase your monthly payment to pay off your debt faster and save on interest.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Other calculators - placeholders */}
                  {activeCalculator === "apr-calculator" && (
                    <div className="p-8 text-center">
                      <Calculator className="h-16 w-16 text-primary-200 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">APR Calculator</h3>
                      <p className="text-gray-500 mb-4">
                        This calculator is coming soon. Check back later!
                      </p>
                      <Button onClick={() => setActiveCalculator("credit-card-payoff")}>
                        Try Credit Card Payoff Calculator
                      </Button>
                    </div>
                  )}
                  
                  {activeCalculator === "rewards-value" && (
                    <div className="p-8 text-center">
                      <Calculator className="h-16 w-16 text-primary-200 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Rewards Value Calculator</h3>
                      <p className="text-gray-500 mb-4">
                        This calculator is coming soon. Check back later!
                      </p>
                      <Button onClick={() => setActiveCalculator("credit-card-payoff")}>
                        Try Credit Card Payoff Calculator
                      </Button>
                    </div>
                  )}
                  
                  {activeCalculator === "balance-transfer" && (
                    <div className="p-8 text-center">
                      <Calculator className="h-16 w-16 text-primary-200 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Balance Transfer Calculator</h3>
                      <p className="text-gray-500 mb-4">
                        This calculator is coming soon. Check back later!
                      </p>
                      <Button onClick={() => setActiveCalculator("credit-card-payoff")}>
                        Try Credit Card Payoff Calculator
                      </Button>
                    </div>
                  )}
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
