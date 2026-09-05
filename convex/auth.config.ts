import type {AuthConfig} from 'convex/server';

export default {
  providers: [{domain: (globalThis as {process?: {env?: {CLERK_FRONTEND_API_URL?: string}}}).process?.env?.CLERK_FRONTEND_API_URL!, applicationID: 'convex'}],
} satisfies AuthConfig;
