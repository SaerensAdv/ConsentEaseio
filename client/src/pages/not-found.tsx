import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, House, Newspaper, Shield, ArrowRight } from "@phosphor-icons/react";

const logoImage = "/consentease-logo.webp";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoImage} alt="ConsentEase" className="h-8 w-8" />
              <span className="font-heading text-xl font-bold">ConsentEase</span>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" data-testid="link-signup">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-8xl font-heading font-bold text-primary/20 mb-4">404</div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-3" data-testid="text-404-title">
            Page not found
          </h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved. Here are some helpful links instead:
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="link-home">
                <House size={18} />
                Homepage
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="link-scan">
                <MagnifyingGlass size={18} />
                Free Cookie Scanner
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="link-blog">
                <Newspaper size={18} />
                Blog & Guides
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full justify-start gap-2" data-testid="link-pricing">
                <Shield size={18} />
                View Pricing
              </Button>
            </Link>
          </div>

          <Link href="/onboarding">
            <Button className="gap-2" data-testid="link-trial">
              Start Free Trial <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
