const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    bucket: process.env.SUPABASE_BUCKET || 'cybervault-uploads',
  };
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key);
}

const supabase = isSupabaseConfigured() 
  ? createClient(getSupabaseConfig().url, getSupabaseConfig().key)
  : null;

async function uploadToSupabase(localPath, filename) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Ensure SUPABASE_URL and SUPABASE_KEY are set.');
  }

  const fileContent = fs.readFileSync(localPath);
  const { bucket } = getSupabaseConfig();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, fileContent, {
      contentType: 'auto',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

async function getDownloadUrl(filename) {
  if (!supabase) return null;
  const { bucket } = getSupabaseConfig();
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 3600); // 1 hour link

  if (error) throw error;
  return data.signedUrl;
}

module.exports = {
  uploadToSupabase,
  getDownloadUrl,
  isSupabaseConfigured,
};
