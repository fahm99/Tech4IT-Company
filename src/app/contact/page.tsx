'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MessageCircle,
  Send,
  Loader2,
  User,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { saveMessage } from '@/lib/data';
import { translations } from '@/i18n/translations';
import { ContactMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormErrors {
  name?: string;
  email?: string;
  projectType?: string;
  message?: string;
}

interface FormState {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export default function ContactPage() {
  const { language } = useAppStore();
  const t = translations[language];
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    projectType: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: keyof FormState, value: string): string | undefined => {
      switch (name) {
        case 'name':
          if (!value.trim()) return t.contact.validation.nameRequired;
          break;
        case 'email':
          if (!value.trim()) return t.contact.validation.emailRequired;
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return t.contact.validation.emailInvalid;
          break;
        case 'projectType':
          if (!value.trim()) return t.contact.validation.projectTypeRequired;
          break;
        case 'message':
          if (!value.trim()) return t.contact.validation.messageRequired;
          break;
      }
      return undefined;
    },
    [t]
  );

  const validateAll = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  }, [form, validateField]);

  const handleChange = (
    name: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, form[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = validateAll();
    setErrors(newErrors);
    setTouched({ name: true, email: true, projectType: true, message: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

    // Simulate a small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const message: ContactMessage = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        email: form.email.trim(),
        projectType: form.projectType,
        message: form.message.trim(),
        createdAt: new Date().toISOString(),
      };

      await saveMessage(message);
      toast.success(t.contact.success, {
        icon: <CheckCircle2 className="size-5 text-emerald-500" />,
      });
      setForm({ name: '', email: '', projectType: '', message: '' });
      setTouched({});
      setErrors({});
    } catch {
      toast.error(t.contact.error, {
        icon: <AlertCircle className="size-5 text-destructive" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t.contact.heading}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t.contact.subheading}
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="glass border-border/40">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      <User className="size-3.5 mr-1.5 inline" />
                      {t.contact.nameLabel}
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder={t.contact.namePlaceholder}
                      className={`h-11 ${
                        errors.name && touched.name
                          ? 'border-destructive focus-visible:ring-destructive/50'
                          : ''
                      }`}
                      aria-invalid={!!(errors.name && touched.name)}
                    />
                    {errors.name && touched.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      <Mail className="size-3.5 mr-1.5 inline" />
                      {t.contact.emailLabel}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder={t.contact.emailPlaceholder}
                      className={`h-11 ${
                        errors.email && touched.email
                          ? 'border-destructive focus-visible:ring-destructive/50'
                          : ''
                      }`}
                      aria-invalid={!!(errors.email && touched.email)}
                    />
                    {errors.email && touched.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Project Type Field */}
                  <div className="space-y-2">
                    <Label htmlFor="projectType" className="text-sm font-medium">
                      <Briefcase className="size-3.5 mr-1.5 inline" />
                      {t.contact.projectTypeLabel}
                    </Label>
                    <Select
                      value={form.projectType}
                      onValueChange={(value) => handleChange('projectType', value)}
                    >
                      <SelectTrigger
                        className={`w-full h-11 ${
                          errors.projectType && touched.projectType
                            ? 'border-destructive focus:ring-destructive/50'
                            : ''
                        }`}
                        aria-invalid={!!(errors.projectType && touched.projectType)}
                      >
                        <SelectValue placeholder={t.contact.projectTypePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {t.contact.projectTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.projectType && touched.projectType && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.projectType}
                      </motion.p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      <Send className="size-3.5 mr-1.5 inline" />
                      {t.contact.messageLabel}
                    </Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder={t.contact.messagePlaceholder}
                      rows={5}
                      className={`min-h-[120px] resize-y ${
                        errors.message && touched.message
                          ? 'border-destructive focus-visible:ring-destructive/50'
                          : ''
                      }`}
                      aria-invalid={!!(errors.message && touched.message)}
                    />
                    {errors.message && touched.message && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="size-3" />
                        {errors.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-base font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t.contact.sending}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {t.contact.submit}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Contact Info + Social Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-lg font-semibold text-foreground/80">
              {t.contact.socialHeading}
            </h3>

            {/* Email Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <a href="mailto:fahmifuadalamere@gmail.com">
                <Card className="glass border-border/40 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {t.contact.emailCard}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        fahmifuadalamere@gmail.com
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* WhatsApp Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <a
                href="https://wa.me/966576701295"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="glass border-border/40 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <MessageCircle className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-emerald-500 transition-colors">
                        {t.contact.whatsapp}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        0576701295
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* Telegram Card */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <a
                href="https://t.me/tech4it"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="glass border-border/40 hover:border-sky-500/30 hover:shadow-md hover:shadow-sky-500/5 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                      <Send className="size-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-sky-500 transition-colors">
                        {t.contact.telegram}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        @tech4it
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>

            {/* Quick note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-dashed border-border/60">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    💬 We typically respond within 24 hours.
                    <br />
                    For urgent inquiries, WhatsApp is the fastest way to reach us.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
