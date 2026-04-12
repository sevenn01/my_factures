export function getDirectImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Transform standard Google Drive file links into direct 'uc?id=' links
  // Matches: https://drive.google.com/file/d/YOUR_ID/view...
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  // Matches: https://drive.google.com/open?id=YOUR_ID
  const driveOpenRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
  const openMatch = url.match(driveOpenRegex);
  if (openMatch && openMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }
  
  // Returns original URL if it's not a Google Drive link
  return url;
}
