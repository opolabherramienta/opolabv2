// "teaser": the public site only shows the coming-soon page and nobody new
// can register. People who already have an account can still sign in.
// Set NEXT_PUBLIC_SITE_MODE=teaser in the deployment to turn it on.
export const isTeaserMode = process.env.NEXT_PUBLIC_SITE_MODE === "teaser";
