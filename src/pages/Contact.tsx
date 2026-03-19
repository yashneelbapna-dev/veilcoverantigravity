import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "veilcover@gmail.com",
    href: "mailto:veilcover@gmail.com"
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210"
  },
  {
    icon: MapPin,
    label: "Address",
    value: "123 Design District, Mumbai 400001",
    href: null
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon-Sat: 10am - 7pm IST",
    href: null
  }
];

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await (supabase as any)
        .from('contact_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        });

      if (dbError) throw dbError;

      // Send admin email notification
      try {
        await supabase.functions.invoke('send-contact-notification', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
          }
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
        // Don't block the user - submission was saved
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      toast({
        title: "Failed to send",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-secondary">
        <div className="container-veil text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20">
        <div className="container-veil">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                      className="bg-card border-border rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="bg-card border-border rounded-lg h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="bg-card border-border rounded-lg h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-foreground">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more..."
                    rows={6}
                    required
                    className="bg-card border-border resize-none rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold w-full py-3 rounded-full text-sm font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                Contact Information
              </h2>
              <div className="space-y-6 mb-10">
                {contactInfo.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-foreground hover:text-accent transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="aspect-video bg-card border border-border rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                  alt="Location map"
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
