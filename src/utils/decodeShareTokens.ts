export function base64UrlToBase64(base64url:string) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return base64;
}

export function decodeShareToken(q:string) {
  if (!q) return null;
  try {
    // Q likely was encodeURIComponent(base64url) on creation
    const base64url = decodeURIComponent(q);
    const base64 = base64UrlToBase64(base64url);
    // atob -> binary string (latin1). Convert safely to UTF-8:
    const bin = atob(base64);
    // safe UTF-8 decode:
    const json = decodeURIComponent(
      Array.prototype.map
        .call(bin, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    console.error("Failed to decode share token", err);
    return null;
  }
}

export function createEncodedString (payload:any)  {
    

    // Create UTF-8 safe base64:
    const json = JSON.stringify(payload);
    const base64 = btoa(unescape(encodeURIComponent(json))); // safe for unicode
    // Optionally make base64 URL-safe (replace +, /, =)
    const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    // URL-encode the string to be extra safe in query param:
    return encodeURIComponent(base64url);
  };