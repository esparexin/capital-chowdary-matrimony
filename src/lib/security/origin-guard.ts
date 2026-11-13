export function verifySameOrigin(request: Request): boolean {
  // Safe read-only HTTP methods do not require origin check
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true;
  }

  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  let requestHost: string;
  try {
    const reqUrl = new URL(request.url);
    requestHost = reqUrl.host;
  } catch {
    return false;
  }

  if (originHeader) {
    try {
      const originUrl = new URL(originHeader);
      return originUrl.host === requestHost;
    } catch {
      return false;
    }
  }

  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      return refererUrl.host === requestHost;
    } catch {
      return false;
    }
  }

  // If Sec-Fetch-Site is present, allow 'same-origin' or 'none' (direct navigation)
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || secFetchSite === "none") {
    return true;
  }

  // Allow server-to-server or test requests if origin is missing in non-production
  return process.env.NODE_ENV !== "production";
}
