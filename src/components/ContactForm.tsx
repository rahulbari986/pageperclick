"use client";

import { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FormStatus = 'FORM' | 'SUCCESS' | 'DUPLICATE';

const services = [
  { value: "ppc", label: "PPC Advertising" },
  { value: "content", label: "Content Writing (Blogs & Social Media Posts)" },
  { value: "design", label: "Graphic Design" },
  { value: "local", label: "Local SEO (GMB)" },
  { value: "social", label: "Social Media Management" },
  { value: "all", label: "All Services" },
  
];

export const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>('FORM');
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  });

  // ✅ UTM parameters state
  const [utmParams, setUtmParams] = useState({
    source: "",
    medium: "",
    campaign: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // ✅ Capture UTMs on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
    });
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prevData => ({ ...prevData, phone: numericValue.slice(0, 10) }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: false }));
    }
  };

  // Handle service dropdown change
  const handleServiceChange = (value: string) => {
    setFormData(prevData => ({ ...prevData, service: value }));
    if (errors.service) {
      setErrors(prevErrors => ({ ...prevErrors, service: false }));
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = ["fullName", "email", "phone", "service", "message"];
    const newErrors: Record<string, boolean> = {};
    let hasError = false;

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
        hasError = true;
      }
    });

    if (formData.phone.length !== 10) {
      newErrors.phone = true;
      hasError = true;
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a 10-digit phone number.",
        variant: "destructive",
      });
    }

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      hasError = true;
      toast({
        title: "Verification Required",
        description: "Please complete the 'I'm not a robot' check.",
        variant: "destructive",
      });
    }

    if (hasError) {
      setErrors(newErrors);
      if (!newErrors.phone && requiredFields.some(field => newErrors[field])) {
        toast({
          title: "Incomplete Form",
          description: "Please fill out all required fields.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSubmitting(true);

    const previousFormData = { ...formData };
    const selectedServiceLabel = services.find(s => s.value === formData.service)?.label || formData.service;

    // 3.1 Optimistic UI update: Immediate positive feedback
    setFormStatus('SUCCESS');

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service: selectedServiceLabel,
          message: formData.message,
          recaptchaToken,
          utm_source: utmParams.source || null,
          utm_medium: utmParams.medium || null,
          utm_campaign: utmParams.campaign || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 || result.status === "DUPLICATE") {
          setFormStatus('DUPLICATE');
        } else {
          // Revert optimistic UI update on failure (Section 3.1)
          setFormStatus('FORM');
          setFormData(previousFormData);
          throw new Error(result.error || "An unknown error occurred.");
        }
      } else {
        toast({
          title: "Inquiry Received",
          description: "We have received your message and will get back to you shortly.",
        });
      }

      recaptchaRef.current?.reset();
    } catch (error: unknown) {
      console.error("Submission error:", error);
      // Revert to form state on failure (Section 3.1)
      setFormStatus('FORM');
      setFormData(previousFormData);
      const message =
        error instanceof Error ? error.message : typeof error === "string" ? error : "An unexpected error occurred. Please try again.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({ fullName: "", email: "", phone: "", company: "", service: "", message: "" });
    setErrors({});
    setFormStatus('FORM');
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />

      {formStatus === 'FORM' && (
        <form
          onSubmit={handleSubmit}
          className="relative space-y-6 bg-card/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl border-2 border-primary/20"
          noValidate
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" required placeholder="Your Name"
                value={formData.fullName} onChange={handleChange}
                className={cn(errors.fullName && 'border-red-500')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required placeholder="youremail@example.com"
                value={formData.email} onChange={handleChange}
                className={cn(errors.email && 'border-red-500')} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
                <Input id="phone" name="phone" type="tel" required placeholder=""
                  value={formData.phone} onChange={handleChange}
                  className={cn('pl-10', errors.phone && 'border-red-500')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" placeholder=""
                value={formData.company} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Services Interested *</Label>
            <Select name="service" required value={formData.service} onValueChange={handleServiceChange}>
              <SelectTrigger className={cn(errors.service && 'border-red-500')}>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.value} value={service.value}>{service.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message" name="message" required placeholder="Enter Here"
              className={cn("min-h-[120px]", errors.message && 'border-red-500')}
              value={formData.message} onChange={handleChange}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
            <Button type="submit" variant="cta" size="xl" disabled={isSubmitting} className="w-full md:w-[200px] xl:h-[45px]">
              {isSubmitting ? "Sending..." : "Submit"}
            </Button>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY || ""}
              theme="dark"
            />
          </div>
        </form>
      )}

      {formStatus === 'SUCCESS' && (
        <div className="relative text-center bg-card/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl border-2 border-primary/20 min-h-[400px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="text-muted-foreground mb-6">Your form has been submitted successfully. We'll be in touch soon!</p>
          <Button onClick={handleResetForm} variant="outline">Submit Another Response</Button>
        </div>
      )}

      {formStatus === 'DUPLICATE' && (
        <div className="relative text-center bg-card/50 backdrop-blur-xl p-8 md:p-10 rounded-3xl border-2 border-yellow-500/50 min-h-[400px] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">You've Already Submitted!</h2>
          <p className="text-muted-foreground mb-6">Our records show we've already received your details. We'll be in touch soon!</p>
          <Button onClick={handleResetForm} variant="outline">Use Different Details</Button>
        </div>
      )}
    </div>
  );
};
export default ContactForm