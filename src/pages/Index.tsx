import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { StatCard } from "@/components/StatCard";
// After (in index.tsx)
import Facebook from "lucide-react/dist/esm/icons/facebook";
import Youtube from "lucide-react/dist/esm/icons/youtube";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Share2 from "lucide-react/dist/esm/icons/share-2";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Palette from "lucide-react/dist/esm/icons/palette";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Target from "lucide-react/dist/esm/icons/target";
import Zap from "lucide-react/dist/esm/icons/zap";
import Rocket from "lucide-react/dist/esm/icons/rocket";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import heroImage from "@/assets/hero-modern.webp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Add this lazy import instead
const ContactForm = lazy(() =>
  import("@/components/ContactForm").then((module) => ({
    default: module.ContactForm,
  })),
);

// CLIENT DATA ARRAY
const clients = [
  {
    name: "Sai Techno Works",
    location: "Pune",
    services: "Social Media Management",
    impact:
      "Built a consistent local presence that turned social engagement into footfall.",
  },
  {
    name: "Bhoomi Homez",
    location: "Bengaluru",
    services: "PPC Advertising & Graphic Design",
    impact:
      "High-performing ads and striking creatives that increased qualified leads.",
  },
  {
    name: "Ace Careers",
    location: "Bengaluru",
    services: "Local SEO & Google My Business Optimization",
    impact:
      "Improved local visibility and steady organic searches from prospective students.",
  },
  {
    name: "Divya Drusti Spiritual Products",
    location: "Bidar",
    services: "Meta Advertising",
    impact:
      "Targeted Meta campaigns that grew online orders and repeat customers.",
  },
];

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Helmet>
        <title>Digital Marketing That Drives Real Results | Page Per Click</title>
        <link rel="canonical" href="https://www.pageperclick.com/" />
        <meta
          name="description"
          content="We help businesses attract quality leads, boost engagement, and grow with high-performing campaigns."
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Helmet>

      {/* Animated Background Elements */}
      <div className=" inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative px-2 py-5 md:2 md:py-10 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-10 items-start">
            <div className="space-y-5 md:space-y-12 animate-fade-in">
              <div className="relative w-fit  ">
                <a href="/">
                  <img
                    src="/header.png"
                    alt="Page Per Click Logo"
                    className="inline-block mt-0 md:mt-4 w-28 h-20 md:w-40 md:h-20 object-contain"
                  />
                </a>
              </div>
              <h1 className=" text-4xl md:text-6xl lg:text-6xl font-heading leading-tight ">
                Digital Marketing That Drives
                <span className="ml-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                  Authentic Results
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Attract quality leads, boost your engagement, and scale with
                result-oriented campaigns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button variant="cta" size="xl" className="group" asChild>
                  <a href="#contact">
                    <Phone className="mr-2 group-hover:rotate-12 transition-transform" />
                    Get a Free Quote Today
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <a href="#services" className="mr-2">
                    View Services
                  </a>
                </Button>
              </div>
            </div>
            <div
              className="relative animate-fade-in mb-4 md:mb-8 mt-1 lg:mt-24 py-12"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <img
                src={heroImage}
                alt="Digital marketing dashboard with analytics and growth charts"
                className="rounded-2xl shadow-2xl relative z-10 border border-primary/20"
              />
              <div className="absolute -top-0 -right-2 bg-card border-2 border-primary rounded-2xl p-4 shadow-2xl backdrop-blur-sm animate-float z-20">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-xs text-muted-foreground">
                      Campaigns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem + Solution Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <h2 className="text-4xl md:text-5xl font-heading">
              Struggling with Leads or{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Online Sales?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Is your growth being hindered by factors like: low ad ROI, low
              volume of traffic or irrelevant leads
            </p>
            <div className="relative mt-8 hover:-translate-y-1 hover:scale-[1.02] duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl" />
              <div className="relative bg-card/50 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-primary/20">
                <Rocket className="w-12 h-12 text-accent mx-auto mb-4" />
                <p className="text-lg md:text-xl leading-relaxed">
                  <span className="font-bold text-primary">Our Solution:</span>{" "}
                  Campaigns with high yields, targeting based on data and
                  analytical ad strategies that deliver fruitful results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Holistic package of comprehensive digital marketing solutions
              customized to your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {/* ✅ WRAPPED EACH ServiceCard WITH A DIV TO ADD HOVER EFFECTS */}
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl">
              <ServiceCard
                icon={TrendingUp}
                title="PPC Advertising"
                description="Google Ads and Meta Ads are managed by us and we provide timely and desirable results to businesses by maximizing reach and driving quality leads through data backed campaigns."
              />
            </div>
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl">
              <ServiceCard
                icon={FileText}
                title="Content Writing"
                description="We create content that converts! From web copy to SEO blogs and social media posts, we engage leads and help maximize your campaign's success."
              />
            </div>
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl">
              <ServiceCard
                icon={Palette}
                title="Graphic Design"
                description="We strengthen your brand with powerful graphics and a visual interface. From creative ads to landing pages, everything we create enhances the user experience."
              />
            </div>
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl">
              <ServiceCard
                icon={MapPin}
                title="Local SEO (GMB)"
                description="We optimize your Google My Business profile to help you appear in local searches and on Google Maps. Gain visibility, attract nearby customers, and grow your business with strong local SEO strategies."
              />
            </div>
            <div className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl">
              <ServiceCard
                icon={Share2}
                title="Social Media Management"
                description="Consistent, creative, and data-driven social media. Strengthen your online presence and connect authentically with your audience."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      {/* <section id="clients" className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-heading">
              Our{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Clients
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're proud to work with local businesses and entrepreneurs who
              trust us to grow their digital presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {clients.map((client, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 
               hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 
               transition-all duration-300"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-lg shadow-primary/20">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {client.name}
                </h3>

                <div className="text-sm text-muted-foreground mb-1">
                  {client.location}
                </div>

                <div className="text-sm text-muted-foreground mb-3 font-medium">
                  {client.services}
                </div>

                <p className="text-sm text-muted-foreground/90 leading-relaxed">
                  {client.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Proven Results Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              Proven{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Results
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Data that speaks for us
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16 justify-center items-center mx-auto">
            {/* You can apply the same wrapper DIV trick to your StatCards as I did for the ServiceCards */}
            <StatCard value="4+" label="Years of Industry Experience" />
            <StatCard value="100+" label="Successful Campaigns" />
            <StatCard value="3.5x" label="Average ROAS" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Our proven process to drive your success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                step: "1",
                title: "Planning & Strategy",
                description:
                  "Research, audience targeting, and campaign architecture tailored to your business goals.",
                color: "primary",
              },
              {
                icon: Zap,
                step: "2",
                title: "Campaign Launch",
                description:
                  "Ad creatives, compelling copywriting, and precise conversion tracking for maximum impact.",
                color: "primary",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: "Optimize & Scale",
                description:
                  "A/B testing, bid modifications, and ongoing enhancements to optimize your return on investment.",
                color: "primary",
              },
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className="relative bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary transition-all p-8 rounded-3xl space-y-4
                                 hover:-translate-y-1 hover:scale-[1.02] duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${item.color} to-${item.color}/50 flex items-center justify-center text-2xl font-bold text-white shadow-lg`}
                    >
                      {item.step}
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-${item.color}/10 border border-${item.color}/20`}
                    >
                      <item.icon className={`w-6 h-6 text-${item.color}`} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-heading">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-heading mb-8">
              Why{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Choose Us
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              "Google Ads & Meta Certified",
              "Turning clicks into customers",
              "Transparent & Reliable Collaboration",
              "Strategies focused on ROI and Data",
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className="relative flex flex-col items-center text-center space-y-6 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-border hover:border-primary transition-all
                                 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{item}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              Get In{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
            {/* Left Side - Contact Info */}
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-heading">
                  Ready to Grow Your{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Business?
                  </span>
                </h3>
                <p className="text-xl">
                  <strong>
                    Your next big campaign starts with a simple chat.
                  </strong>
                  <br />
                  Reach out and we’ll help you make it happen.
                </p>
              </div>

              {/* Contact Info Links */}
              <div className="space-y-0">
                <div>
                  <a
                    href="tel:+918123459543"
                    className="inline-flex items-center gap-4 py-4 hover:border-primary transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center
                                   group-hover:scale-110 transition-transform flex-shrink-0"
                    >
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                      +91 8123459543
                    </span>
                  </a>
                </div>
                <div>
                  <a
                    href="mailto:pageperclick@gmail.com"
                    className="inline-flex items-center gap-4 py-4 hover:border-primary transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center
                                   group-hover:scale-110 transition-transform flex-shrink-0"
                    >
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                      pageperclick@gmail.com
                    </span>
                  </a>
                </div>
                <div>
                  <a
                    // href="https://www.google.com/maps/search/?api=1&query=Bangalore"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 py-4 hover:border-primary transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0
                                   group-hover:scale-110 transition-transform"
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-lg group-hover:text-primary transition-colors">
                      Bangalore, India (Serving clients globally)
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    Loading form...
                  </div>
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-heading mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>
          <Accordion
            type="single"
            collapsible
            className="max-w-3xl mx-auto space-y-4"
          >
            {[
              {
                question: "Do you handle complete digital marketing or individual services?",
                answer:
                  "We do both. You can choose a full digital marketing package or specific services based on your needs.",
              },
              {
                question: "How long does it take to see results?",
                answer:
                  "It depends on the service. Some results, like paid ads, show quickly, while SEO and content take a bit longer for lasting growth.",
              },
              {
                question: " Do you provide reports and insights?",
                answer:
                  "Yes, we share clear and detailed reports for every project.",
              },
              {
                question: "Do you work with startups and small businesses?",
                answer:
                  "Yes, we enjoy helping small businesses grow and succeed online.",
              },
            ].map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border-2 border-border rounded-2xl px-6 hover:border-primary transition-all
                            hover:scale-[1.02] duration-300"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 md:py-12 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Page Per Click
            </h3>
            <p className="text-muted-foreground">Your Partner in Digital Growth</p>
          </div>
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="https://www.facebook.com/pageperclicks"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-transform
                         hover:scale-125 hover:-translate-y-1 duration-200"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="http://instagram.com/pageperclick/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-transform
                         hover:scale-125 hover:-translate-y-1 duration-200"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="http://www.youtube.com/@pageperclick"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-transform
                         hover:scale-125 hover:-translate-y-1 duration-200"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/pageperclick/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-transform
                         hover:scale-125 hover:-translate-y-1 duration-200"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 Page Per Click. All rights reserved.
            </p>
            <div className="flex gap-6 justify-center md:justify-end">
              <Link
                to="/privacy-policy"
                className="text-muted-foreground hover:text-primary transition-all
                           ✅ ADDED: inline-block hover:scale-105 hover:-translate-y-0.5"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="text-muted-foreground hover:text-primary transition-all
                           ✅ ADDED: inline-block hover:scale-105 hover:-translate-y-0.5"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;