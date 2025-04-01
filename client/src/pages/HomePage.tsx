import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { CreditCardCategories } from "@/components/home/CreditCardCategories";
import { PartnerBanks } from "@/components/home/PartnerBanks";
import { NewsAndOffers } from "@/components/home/NewsAndOffers";
import { FinancialCalculators } from "@/components/home/FinancialCalculators";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <Layout>
      <Hero />
      <CreditCardCategories />
      <PartnerBanks />
      <NewsAndOffers />
      <FinancialCalculators />
      <Newsletter />
    </Layout>
  );
}
