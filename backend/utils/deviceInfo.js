
export const parseUserAgent = (userAgent) => {
  if (!userAgent || typeof userAgent !== "string") {
    return { device: "Unknown", browser: "Unknown", os: "Unknown" };
  }

  const ua = userAgent;
  const lower = ua.toLowerCase();

  // Device type (order matters: tablets before generic mobile)
  let device = "Desktop";
  if (/ipad|tablet|kindle|silk|playbook|nexus 7|gt-p/i.test(lower)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|windows phone|opera mini|iemobile|nokia/i.test(lower)) {
    device = "Mobile";
  }

  // Browser (check Edge/Opera before Chrome, they include "Chrome" in their UA)
  let browser = "Unknown";
  if (/edg/i.test(lower)) {
    browser = "Microsoft Edge";
  } else if (/opr\/|opera\//i.test(lower)) {
    browser = "Opera";
  } else if (/chrome|crios|headlesschrome/i.test(lower)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(lower)) {
    browser = "Firefox";
  } else if (/safari/i.test(lower)) {
    browser = "Safari";
  } else if (/msie|trident/i.test(lower)) {
    browser = "Internet Explorer";
  } else if (/postman/i.test(lower)) {
    browser = "Postman";
  }

  // OS (iOS/Android before macOS/Linux: mobile UAs contain those tokens)
  let os = "Unknown";
  if (/iphone|ipad|ipod/i.test(lower)) {
    os = "iOS";
  } else if (/windows phone/i.test(lower)) {
    os = "Windows Phone";
  } else if (/windows nt/i.test(lower)) {
    os = "Windows";
  } else if (/android/i.test(lower)) {
    os = "Android";
  } else if (/mac os x|macintosh/i.test(lower)) {
    os = "macOS";
  } else if (/crkey/i.test(lower)) {
    os = "Chrome OS";
  } else if (/linux/i.test(lower)) {
    os = "Linux";
  }

  return { device, browser, os };
};

// In-memory cache so repeated lookups for the same IP are instant
const locationCache = new Map();

const isPrivateIp = (ip) => {
  if (!ip) return true;
  const normalized = ip.replace(/^::ffff:/, "");
  if (normalized === "::1" || normalized === "127.0.0.1") return true;
  if (/^10\./.test(normalized)) return true;
  if (/^192\.168\./.test(normalized)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(normalized)) return true;
  if (/^169\.254\./.test(normalized)) return true;
  return false;
};

/**
 * Resolve a readable location for an IP address.
 * - Private/local addresses -> "Local Network"
 * - Public addresses -> free ip-api.com lookup (cached, short timeout)
 * - Any failure -> "Unknown"
 */
export const resolveLocation = async (ip) => {
  const key = ip || "unknown";
  if (locationCache.has(key)) return locationCache.get(key);

  let location = "Unknown";

  if (isPrivateIp(ip)) {
    location = "Local Network";
  } else {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country,query`,
        { signal: controller.signal }
      );
      clearTimeout(timer);
      const data = await res.json();
      if (data && data.status === "success") {
        location = [data.city, data.regionName, data.country]
          .filter((part) => part && typeof part === "string")
          .join(", ");
      }
    } catch {
      location = "Unknown";
    }
  }

  locationCache.set(key, location);
  return location;
};
