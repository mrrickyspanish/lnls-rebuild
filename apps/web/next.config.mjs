import { createRequire } from "module";

const require = createRequire(import.meta.url);

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/
});

const nextConfig = {
  experimental: {
    mdxRs: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "i.ytimg.com" }
    ]
  }
};

export default withMDX(nextConfig);
