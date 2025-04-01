import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="container px-4 mx-auto py-12 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="text-white font-bold text-2xl">
              Card<span className="text-accent">Savvy</span>
            </span>
            <p className="mt-4 text-base text-gray-400">
              Your trusted source for credit card comparisons, reviews, and financial advice.
            </p>
            <div className="mt-6 flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Credit Cards
            </h3>
            <ul role="list" className="mt-4 space-y-2">
              <li>
                <Link href="/cards?category=cashback">
                  <a className="text-base text-gray-400 hover:text-white">
                    Cashback Cards
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cards?category=rewards">
                  <a className="text-base text-gray-400 hover:text-white">
                    Rewards Cards
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cards?category=travel">
                  <a className="text-base text-gray-400 hover:text-white">
                    Travel Cards
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cards?category=business">
                  <a className="text-base text-gray-400 hover:text-white">
                    Business Cards
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/cards?category=balance">
                  <a className="text-base text-gray-400 hover:text-white">
                    Balance Transfer
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Resources
            </h3>
            <ul role="list" className="mt-4 space-y-2">
              <li>
                <Link href="/guides/credit-score">
                  <a className="text-base text-gray-400 hover:text-white">
                    Credit Score Guide
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/calculators">
                  <a className="text-base text-gray-400 hover:text-white">
                    Financial Calculators
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/assistant">
                  <a className="text-base text-gray-400 hover:text-white">
                    Smart Assistant
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/news">
                  <a className="text-base text-gray-400 hover:text-white">
                    Blog & Articles
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-base text-gray-400 hover:text-white">
                    FAQs
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
              Company
            </h3>
            <ul role="list" className="mt-4 space-y-2">
              <li>
                <Link href="/about">
                  <a className="text-base text-gray-400 hover:text-white">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-base text-gray-400 hover:text-white">
                    Contact
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-base text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-base text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/disclosure">
                  <a className="text-base text-gray-400 hover:text-white">
                    Advertiser Disclosure
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} CardSavvy. All rights reserved. CardSavvy is not a lender and does not make credit decisions.
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            The information provided is for educational purposes only. Contact the card issuer for complete and current rates, fees, and terms.
          </p>
        </div>
      </div>
    </footer>
  );
}
