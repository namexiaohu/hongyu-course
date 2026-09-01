export const SITE_URL = resolveSiteUrl();

function resolveSiteUrl() {
  const siteUrl = process.env.SITE_URL?.trim().replace(/\/$/, '');
  if (!siteUrl) {
    throw new Error('SITE_URL is not configured');
  }
  return siteUrl;
}
