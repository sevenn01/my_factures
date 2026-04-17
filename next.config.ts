import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mzvzwxbpvllwrxigmatz.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnp3eGJwdmxsd3J4aWdtYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzc5NTgsImV4cCI6MjA5MDY1Mzk1OH0._1jf0MC5UkbrZpg1l0oEj-8gHdrsMXrHZ9U3qUK6pnE',
  },
};

export default nextConfig;
