import 'dotenv/config';

const appJson = require('./app.json');

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'YOUR_ANTHROPIC_API_KEY',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      prodamusShopUrl: process.env.PRODAMUS_SHOP_URL || '',
    },
  },
};
