import { z } from 'zod';

// Checkout shipping address validation schema
export const checkoutShippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
  state: z
    .string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must be less than 50 characters'),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit postal code'),
  country: z.string().default('India'),
});

export type CheckoutShippingData = z.infer<typeof checkoutShippingSchema>;

// Auth validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be less than 128 characters');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[A-Za-z\s\-']+$/, 'Name must contain only letters, spaces, and hyphens');

// Newsletter email validation
export const newsletterEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

// Validate newsletter email
export const validateNewsletterEmail = (email: string) => {
  const result = newsletterEmailSchema.safeParse(email);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || 'Invalid email' };
  }
  return { success: true, error: null };
};

// Validate full name (letters only)
export const validateFullName = (name: string) => {
  const result = fullNameSchema.safeParse(name);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || 'Invalid name' };
  }
  return { success: true, error: null };
};

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[0-9]{10,15}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

// Helper to validate and get field errors
export const validateCheckoutShipping = (data: unknown) => {
  const result = checkoutShippingSchema.safeParse(data);
  
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = err.message;
      }
    });
    return { success: false, errors: fieldErrors, data: null };
  }
  
  return { success: true, errors: {}, data: result.data };
};
