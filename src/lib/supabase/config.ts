export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const vitGoogleSignInEnabled = process.env.NEXT_PUBLIC_VIT_GOOGLE_SIGN_IN === 'true';
