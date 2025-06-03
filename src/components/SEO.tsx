import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'PokéTrader.app - Share your wishlist of tradeable Pokémon cards',
  description = 'Connect with fellow Pokemon TCG trainers, share your collection, and find the cards you need to complete your deck. Create your public trading profile and start trading today!',
  image = '/og-preview.png',
  url = 'https://poketrader.app',
  type = 'website',
}: SEOProps): null {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const metaTags = {
      description: description,
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': type,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    };

    // Update or create each meta tag
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"]`
      );
      if (!meta) {
        meta = document.createElement('meta');
        if (name.startsWith('og:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Cleanup function
    return () => {
      // Optionally remove meta tags when component unmounts
      // This is optional and depends on your needs
    };
  }, [title, description, image, url, type]);

  return null;
}
