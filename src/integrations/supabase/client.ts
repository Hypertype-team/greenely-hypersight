// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pzppkiwucwxdopggylmd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cHBraXd1Y3d4ZG9wZ2d5bG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NTIxNjAsImV4cCI6MjAyMTQyODE2MH0.0e46DXf8EqOK6Z_ThwYdvEi6HQe4E8_3UbYCFY0QH4E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);