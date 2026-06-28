import { useEffect } from "react";

export function useCanonical(path: string) {
  useEffect(() => {
    const baseUrl = "https://consentease.io";
    const canonicalUrl = `${baseUrl}${path}`;
    
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    
    const originalHref = link.href;
    link.href = canonicalUrl;
    
    return () => {
      if (originalHref) {
        link!.href = originalHref;
      } else {
        link?.remove();
      }
    };
  }, [path]);
}
