interface StructuredDataProps {
  type: 'Profile' | 'Collection' | 'WantList';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Profile':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.username,
          description: data.bio,
          url: `https://poketrader.app/trade/${data.username}`,
          sameAs: [
            data.socialLinks?.twitter
              ? `https://twitter.com/${data.socialLinks.twitter}`
              : null,
            data.socialLinks?.instagram
              ? `https://instagram.com/${data.socialLinks.instagram}`
              : null,
          ].filter(Boolean),
        };
      // Add more cases for other types
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  if (!structuredData) return null;

  return (
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  );
}
