import { llms } from '../lib/feeds.js';

export const GET = () => new Response(llms(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
