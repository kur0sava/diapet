import 'dotenv/config';

const appJson = require('./app.json');
const packageJson = require('./package.json');

const version = appJson.expo.version || packageJson.version;
const androidVersionCode =
  Number(process.env.ANDROID_VERSION_CODE || appJson.expo.android?.versionCode || 1) || 1;
const iosBuildNumber = process.env.IOS_BUILD_NUMBER || appJson.expo.ios?.buildNumber || '1';

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    version,
    ios: {
      ...appJson.expo.ios,
      buildNumber: iosBuildNumber,
    },
    android: {
      ...appJson.expo.android,
      versionCode: androidVersionCode,
    },
    extra: {
      ...appJson.expo.extra,
      aiProxyUrl: process.env.AI_PROXY_URL || '',
      premiumMode: process.env.PREMIUM_MODE || 'hidden',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      paymentProviderUrl: process.env.PAYMENT_PROVIDER_URL || '',
    },
  },
};
