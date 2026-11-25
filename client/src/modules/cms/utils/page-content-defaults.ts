export const pageContentDefaults: Record<string, string> = {
  'cms.home.hero.title': 'SPORTS\nMERCHANDISE',
  'cms.home.hero.tagline': 'WEAR YOUR PASSION.',
  'cms.home.hero.description': 'Football, basketball jerseys and\nsports merchandise for fans.',
  'cms.home.hero.primary_label': 'SHOP NOW',
  'cms.home.hero.secondary_label': 'EXPLORE COLLECTION',
  'cms.home.hero.secondary_link': '/shop',
  'cms.about.title': 'ABOUT MAILLOT STORE',
  'cms.about.subtitle': 'Your Ultimate Destination for Sports Merchandise',
  'cms.about.description': "Maillot Store was founded with a passion for football and a mission to bring authentic, high-quality sports merchandise closer to fans.\n\nWe offer a wide range of jerseys, training wear, footwear, and accessories from the world's biggest clubs and brands.\n\nOur goal is simple: provide fans with original products, excellent service, and a shopping experience they can trust.",
  'cms.about.tagline': 'Made for fans. Driven by passion.',
  'cms.about.image': '/about-maillot-store.png',
  'cms.about.feature1.title': '100% Original',
  'cms.about.feature1.description': 'We sell only authentic products.',
  'cms.about.feature2.title': 'Secure Shopping',
  'cms.about.feature2.description': 'Your data is safe with us.',
  'cms.about.feature3.title': 'Fast Delivery',
  'cms.about.feature3.description': 'Quick and reliable delivery to your door.',
  'cms.about.feature4.title': 'Customer Support',
  'cms.about.feature4.description': "We're here to help you anytime.",
  'cms.contact.title': 'CONTACT US',
  'cms.contact.subtitle': "We'd love to hear from you. Reach out to us!",
  'cms.contact.information_title': 'CONTACT INFORMATION',
  'cms.contact.information_intro': 'Reach out to us using any of the details below.',
  'cms.contact.address': 'Quarter 12, Molyko, Buea\nCameroon',
  'cms.contact.phone': '+237 670 12 34 56',
  'cms.contact.email': 'support@maillotstore.cm',
  'cms.contact.hours': 'Mon - Sat: 8:00 AM - 7:00 PM\nSunday: 10:00 AM - 4:00 PM',
  'cms.contact.form_title': 'SEND US A MESSAGE',
  'cms.contact.form_intro': 'Have a question? We would love to hear from you.',
  'cms.contact.map_title': 'Find Maillot Store',
};

export function pageContentValue(content: Record<string, string>, key: string): string {
  return content[key]?.trim() ? content[key] : pageContentDefaults[key] ?? '';
}

export function resolveContentImage(url: string): string {
  if (!url.startsWith('/uploads/')) return url;
  try { return `${new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin}${url}`; }
  catch { return url; }
}
