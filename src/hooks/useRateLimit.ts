import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
}

export const useRateLimit = () => {
  const [checking, setChecking] = useState(false);

  const checkRateLimit = async (email: string): Promise<RateLimitResult> => {
    setChecking(true);
    try {
      // Check if rate limit allows login
      const { data, error } = await supabase.rpc('check_login_rate_limit', {
        check_email: email
      });

      if (error) {
        console.error("Rate limit check error:", error);
        // SECURITY: Fail-closed - block attempts if rate limit check fails
        // This prevents bypass if the RPC function errors
        return { allowed: false, remainingAttempts: 0 };
      }

      return { 
        allowed: data === true, 
        remainingAttempts: data ? 10 : 0 
      };
    } catch (err) {
      console.error("Rate limit exception:", err);
      // SECURITY: Fail-closed - block attempts on any exception
      return { allowed: false, remainingAttempts: 0 };
    } finally {
      setChecking(false);
    }
  };

  const recordLoginAttempt = async (email: string, success: boolean) => {
    try {
      // Use secure RPC function instead of direct table insert
      const { error } = await supabase.rpc('record_login_attempt', {
        attempt_email: email,
        attempt_success: success,
        attempt_ip_address: null // We don't collect IP for privacy
      });
      
      if (error) {
        console.error("Failed to record login attempt:", error);
      }
    } catch (err) {
      console.error("Failed to record login attempt:", err);
    }
  };

  return {
    checkRateLimit,
    recordLoginAttempt,
    checking
  };
};
