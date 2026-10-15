"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { StatCard } from "@/components/StatCard";
import { Facebook, Youtube, Linkedin, Instagram } from "@/components/icons/SocialIcons";
import {
  Share2,
  TrendingUp,
  FileText,
  Palette,
  Phone,
  Mail,
  CheckCircle2,
  Target,
  Zap,
  Rocket,
  MapPin,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import ContactFormSkeleton from "@/components/ContactFormSkeleton";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";

// Dynamic client import for ContactForm with UX 3.2 Skeleton Screen
const ContactForm = dynamic(
  () => import("@/components/ContactForm").then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => <ContactFormSkeleton />,
  }
);

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Smooth Reading Scroll Progress Bar at the Top */}
      <ScrollProgress />
      {/* Animated Background Elements */}
      <div className="inset-0 pointer-events-none overflow-hidden">
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
      <section className="relative py-5 md:py-10 overflow-hidden">
        <div className="container mx-auto px-6 md:px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5 md:space-y-12 animate-fade-in"
            >
              <div className="relative w-fit">
                <Link href="/">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    src="/header.png"
                    alt="Page Per Click Logo"
                    className="inline-block mt-0 md:mt-4 w-28 h-20 md:w-40 md:h-20 object-contain cursor-pointer"
                  />
                </Link>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading leading-tight">
                Digital Marketing That Drives
                <span className="block sm:inline sm:ml-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                  Authentic Results
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                Attract quality leads, boost your engagement, and scale with
                result-oriented campaigns.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button variant="cta" size="xl" className="group w-full sm:w-auto justify-center" asChild>
                  <a href="#contact">
                    <Phone className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Get a Free Quote Today
                  </a>
                </Button>
                <Button variant="outline" size="xl" className="w-full sm:w-auto justify-center" asChild>
                  <a href="#services" className="mr-2">
                    View Services
                  </a>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative animate-fade-in mb-4 md:mb-8 mt-1 lg:mt-24 py-6 sm:py-12"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl animate-pulse-glow" />
              <img
                src="/hero-modern.webp"
                alt="Digital marketing dashboard with analytics and growth charts"
                className="rounded-2xl shadow-2xl relative z-10 border border-primary/20 transition-transform duration-500 hover:scale-[1.01]"
              />
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-2 right-2 sm:-top-0 sm:-right-2 bg-card border-2 border-primary rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl backdrop-blur-sm animate-float z-20 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 sm:gap-5">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/30">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-heading">
                      <AnimatedCounter value="100+" duration={2} />
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      Campaigns
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem + Solution Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
            <ScrollReveal direction="up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading">
                Struggling with Leads or{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Online Sales?
                </span>
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                Is your growth being hindered by factors like: low ad ROI, low
                volume of traffic or irrelevant leads
              </p>
            </ScrollReveal>
            <ScrollReveal direction="zoom" delay={0.2}>
              <div className="relative mt-6 sm:mt-8 hover:-translate-y-1 hover:scale-[1.02] duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-xl" />
                <div className="relative bg-card/50 backdrop-blur-xl p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-primary/20">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 350 }}
                    className="inline-block cursor-pointer"
                  >
                    <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-3 sm:mb-4" />
                  </motion.div>
                  <p className="text-base sm:text-lg md:text-xl leading-relaxed">
                    <span className="font-bold text-primary">Our Solution:</span>{" "}
                    Campaigns with high yields, targeting based on data and
                    analytical ad strategies that deliver fruitful results.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Holistic package of comprehensive digital marketing solutions
              customized to your goals.
            </p>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            {[
              {
                icon: TrendingUp,
                title: "PPC Advertising",
                description:
                  "Google Ads and Meta Ads are managed by us and we provide timely and desirable results to businesses by maximizing reach and driving quality leads through data backed campaigns.",
              },
              {
                icon: FileText,
                title: "Content Writing",
                description:
                  "We create content that converts! From web copy to SEO blogs and social media posts, we engage leads and help maximize your campaign's success.",
              },
              {
                icon: Palette,
                title: "Graphic Design",
                description:
                  "We strengthen your brand with powerful graphics and a visual interface. From creative ads to landing pages, everything we create enhances the user experience.",
              },
              {
                icon: MapPin,
                title: "Local SEO (GMB)",
                description:
                  "We optimize your Google My Business profile to help you appear in local searches and on Google Maps. Gain visibility, attract nearby customers, and grow your business with strong local SEO strategies.",
              },
              {
                icon: Share2,
                title: "Social Media Management",
                description:
                  "Consistent, creative, and data-driven social media. Strengthen your online presence and connect authentically with your audience.",
              },
            ].map((svc, idx) => (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 0.08}
                className="transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 rounded-2xl"
              >
                <ServiceCard
                  icon={svc.icon}
                  title={svc.title}
                  description={svc.description}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Proven Results Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4">
              Proven{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Results
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Data that speaks for us
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 md:mb-16 justify-center items-center mx-auto">
            <ScrollReveal direction="up" delay={0.05}>
              <StatCard value="4+" label="Years of Industry Experience" />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.15}>
              <StatCard value="100+" label="Successful Campaigns" />
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.25}>
              <StatCard value="3.5x" label="Average ROAS" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4">
              How It{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Our proven process to drive your success
            </p>
          </ScrollReveal>
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
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 0.12}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="relative bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary transition-all p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4
                                 hover:-translate-y-1 hover:scale-[1.02] duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/15"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 350, damping: 15 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-2xl font-bold text-white shadow-lg cursor-pointer"
                    >
                      {item.step}
                    </motion.div>
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6 sm:mb-8">
              Why{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Choose Us
              </span>
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              "Google Ads & Meta Certified",
              "Turning clicks into customers",
              "Transparent & Reliable Collaboration",
              "Strategies focused on ROI and Data",
            ].map((item, index) => (
              <ScrollReveal
                key={index}
                direction="up"
                delay={index * 0.1}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className="relative flex flex-col items-center text-center space-y-5 sm:space-y-6 p-5 sm:p-6 bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-border hover:border-primary transition-all
                                 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/25 cursor-pointer"
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-base sm:text-lg">{item}</h3>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4">
              Get In{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
            {/* Left Side - Contact Info */}
            <ScrollReveal direction="left" delay={0.1} className="space-y-6 md:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading">
                  Ready to Grow Your{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Business?
                  </span>
                </h3>
                <p className="text-base sm:text-lg md:text-xl">
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
                  <motion.a
                    href="tel:+916364738587"
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="inline-flex items-center gap-3 sm:gap-4 py-3 sm:py-4 hover:border-primary transition-all group"
                  >
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center
                                   group-hover:scale-110 transition-transform flex-shrink-0 shadow-md shadow-primary/20"
                    >
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                      +91 6364738587
                    </span>
                  </motion.a>
                </div>
                <div>
                  <motion.a
                    href="mailto:pageperclick@gmail.com"
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="inline-flex items-center gap-3 sm:gap-4 py-3 sm:py-4 hover:border-primary transition-all group"
                  >
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center
                                   group-hover:scale-110 transition-transform flex-shrink-0 shadow-md shadow-secondary/20"
                    >
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors break-all sm:break-normal">
                      pageperclick@gmail.com
                    </span>
                  </motion.a>
                </div>
                <div>
                  <motion.div
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    className="inline-flex items-center gap-3 sm:gap-4 py-3 sm:py-4 hover:border-primary transition-all group cursor-default"
                  >
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0
                                   group-hover:scale-110 transition-transform shadow-md shadow-accent/20"
                    >
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                      Bangalore, India (Serving clients globally)
                    </span>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Side - Form */}
            <ScrollReveal direction="right" delay={0.15}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 sm:mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </ScrollReveal>
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
              <ScrollReveal key={index} direction="up" delay={index * 0.08}>
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card/50 backdrop-blur-sm border-2 border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 hover:border-primary transition-all
                              hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/10 duration-300"
                >
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 md:py-12 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal direction="up" className="text-center mb-8">
            <h3 className="text-2xl font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Page Per Click
            </h3>
            <p className="text-muted-foreground">Your Partner in Digital Growth</p>
          </ScrollReveal>
          <div className="flex justify-center gap-6 mb-8">
            {[
              {
                Icon: Facebook,
                href: "https://www.facebook.com/pageperclicks",
                label: "Facebook",
              },
              {
                Icon: Instagram,
                href: "http://instagram.com/pageperclick/",
                label: "Instagram",
              },
              {
                Icon: Youtube,
                href: "http://www.youtube.com/@pageperclick",
                label: "YouTube",
              },
              {
                Icon: Linkedin,
                href: "https://www.linkedin.com/company/pageperclick/",
                label: "LinkedIn",
              },
            ].map((social, idx) => (
              <motion.a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                whileHover={{ scale: 1.25, y: -4 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                <social.Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 Page Per Click. All rights reserved.
            </p>
            <div className="flex gap-6 justify-center md:justify-end">
              <Link
                href="/privacy-policy"
                prefetch={true}
                className="text-muted-foreground hover:text-primary transition-all inline-block hover:scale-105 hover:-translate-y-0.5"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                prefetch={true}
                className="text-muted-foreground hover:text-primary transition-all inline-block hover:scale-105 hover:-translate-y-0.5"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}