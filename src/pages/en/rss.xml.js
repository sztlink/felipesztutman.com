import { rss } from '../../lib/feeds.js';

export const GET = () => new Response(rss('en'), { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
