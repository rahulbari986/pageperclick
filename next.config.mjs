/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://ovlemcggrwpyaydsxzqx.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bGVtY2dncndweWF5ZHN4enF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODMyNzYsImV4cCI6MjA3NjM1OTI3Nn0.IbrzOknQmYUqORFn8MMnxouo5jtdDQbUkLaWzGm3oQM",
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: "6Lcui-8rAAAAAPm3F2SJplSNjVY9jvX5dDl64Ipp",
  },
};

export default nextConfig;
