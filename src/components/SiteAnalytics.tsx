import { Analytics, type BeforeSend } from "@vercel/analytics/react";

const withoutUrlParameters: BeforeSend = (event) => {
  // Remove only the collector's identity key before its payload is assembled.
  try {
    window.localStorage.removeItem("__va_attribution");
  } catch {
    return null;
  }
  const url = new URL(event.url);
  url.search = "";
  url.hash = "";
  return { ...event, url: url.href };
};

export default function SiteAnalytics() {
  return (
    <Analytics
      mode="production"
      configString={import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG}
      beforeSend={withoutUrlParameters}
    />
  );
}
