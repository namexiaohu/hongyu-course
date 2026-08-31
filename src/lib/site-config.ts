export const SITE_URL = resolveSiteUrl();
export const DEFAULT_SEO_TITLE = '竑宇医疗学院 · HONGYU Medical Academy';
export const DEFAULT_SEO_DESCRIPTION = '面向兽医行业的在线学习平台，证书、课程、考试与认证一站式完成。';

function resolveSiteUrl() {
  const siteUrl = process.env.SITE_URL?.trim().replace(/\/$/, '');
  if (!siteUrl) {
    throw new Error('SITE_URL is not configured');
  }
  return siteUrl;
}
