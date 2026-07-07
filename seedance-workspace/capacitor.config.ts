import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seedanceworkspace.app',
  appName: 'Seedance Workspace',
  // "public" is a throwaway placeholder — it's required by Capacitor but
  // never actually shown. Because this app has real server-side API routes
  // (Kie.ai calls, file uploads, your API key), it can't be bundled as
  // static files inside the APK. Instead the app is a thin native shell
  // that loads your deployed site below, exactly like a browser would.
  webDir: 'public',
  server: {
    // TODO: replace with your real deployed URL (e.g. Vercel) before
    // building the APK. Must be HTTPS. Run `npx cap sync android` again
    // after changing this.
    url: 'https://REPLACE-WITH-YOUR-DEPLOYED-URL.vercel.app',
    androidScheme: 'https'
  }
};

export default config;
