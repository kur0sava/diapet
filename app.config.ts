import 'dotenv/config';

const appJson = require('./app.json');

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      // WARNING: API keys must NOT be shipped in client builds.
      // AI calls should go through Supabase Edge Function with server-side key.
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      prodamusShopUrl: process.env.PRODAMUS_SHOP_URL || '',
    },
  },
};
