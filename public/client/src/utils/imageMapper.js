// Image Mapping Utility for SENTARA Storefront
// Ensures 100% product relevance with high-res, clean backgrounds

const imageMapping = {
  'samsung-galaxy-s23-ultra-5g.jpg': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
  'sony-wh-1000xm5-wireless-headphones.jpg': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'apple-macbook-air-m2.jpg': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'oneplus-11r-5g-smartphone.jpg': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
  'boat-airdopes-141-tws-earbuds.jpg': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  'mi-55-inch-4k-ultra-hd-smart-tv.jpg': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80',
  'levis-511-slim-fit-jeans.jpg': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
  'allen-solly-formal-shirt.jpg': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  'fabindia-kurta-pyjama-set.jpg': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  'nike-air-max-270-running-shoes.jpg': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  'zara-floral-maxi-dress.jpg': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
  'atomic-habits-by-james-clear.jpg': '/atomic-habits-by-james-clear.jpg',
  'rich-dad-poor-dad-by-robert-kiyosaki.jpg': '/rich-dad-poor-dad-by-robert-kiyosaki.jpg',
  'the-alchemist-by-paulo-coelho.jpg': '/the-alchemist-by-paulo-coelho.jpg',
  'think-and-grow-rich-by-napoleon-hill.jpg': '/think-and-grow-rich-by-napoleon-hill.jpg',
  'deep-work-by-cal-newport.jpg': '/deep-work-by-cal-newport.jpg',
  'prestige-iris-750w-mixer-grinder.jpg': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&auto=format&fit=crop&q=80',
  'philips-hl7756-juicer-mixer-grinder.jpg': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
  'amazon-basics-non-stick-cookware-set.jpg': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
  'dyson-v8-absolute-cordless-vacuum.jpg': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
  'godrej-refrigerator-236l-frost-free.jpg': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'cosco-challenger-football-size-5.jpg': 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
  'yonex-arcsaber-11-badminton-racket.jpg': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  'decathlon-essential-yoga-mat.jpg': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
  'protoner-20kg-adjustable-dumbbell-set.jpg': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80',
  'nivia-storm-football-shoes.jpg': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop&q=80',
  'lakme-eyeconic-kajal.jpg': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  'the-body-shop-vitamin-e-moisturizer.jpg': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80',
  'loreal-paris-revitalift-serum.jpg': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
  'mamaearth-ubtan-face-wash.jpg': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80'
};

const keywordsMap = {
  // Electronics
  'iphone': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
  'samsung galaxy': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
  'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'airpods': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
  'smart watch': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
  'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',

  // Fashion
  't-shirt': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
  'kurta': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
  'saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
  'dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
  'shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  'jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',

  // Books
  'book': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',

  // Home & Kitchen
  'mixer': 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&auto=format&fit=crop&q=80',
  'microwave': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
  'refrigerator': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'dining table': 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
  'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',

  // Beauty
  'lipstick': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
  'face wash': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
  'perfume': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',

  // Sports
  'cricket bat': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80',
  'football': 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80',
  'gym equipment': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80',
  'dumbbell': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&auto=format&fit=crop&q=80',
  'badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
  'yoga mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
};

const categoryFallbacks = {
  'electronics': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
  'clothing': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
  'books': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
  'home & kitchen': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
  'sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop&q=80',
  'beauty': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop&q=80',
  'mobiles': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
  'appliances': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80',
  'toys': 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=800&auto=format&fit=crop&q=80',
  'food & health': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&auto=format&fit=crop&q=80',
  'auto': 'https://images.unsplash.com/photo-1615900119312-2acd3a71f3aa?w=800&auto=format&fit=crop&q=80',
  '2 wheeler': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'furniture': 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80'
};

const getSvgPlaceholder = (name, category) => {
  const title = name || category || 'Product';
  const firstLetter = title.charAt(0).toUpperCase();
  const colors = [
    ['#2b6cb0', '#3182ce'], // Blue
    ['#b83280', '#d53f8c'], // Pink
    ['#319795', '#38b2ac'], // Teal
    ['#d69e2e', '#ecc94b'], // Yellow
    ['#4a5568', '#718096'], // Gray
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  const [c1, c2] = colors[sum % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="g_${sum}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g_${sum})" />
    <circle cx="150" cy="120" r="45" fill="white" fill-opacity="0.15" />
    <text x="150" y="138" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="900" fill="white" text-anchor="middle">${firstLetter}</text>
    <text x="150" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="white" fill-opacity="0.9" text-anchor="middle">${title.substring(0, 24)}</text>
    <text x="150" y="230" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="500" fill="white" fill-opacity="0.6" text-anchor="middle" letter-spacing="1">SENTARA PREMIUM</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getProductImage = (productName, categoryName, dbImage, isFallback = false) => {
  if (isFallback) {
    return getSvgPlaceholder(productName, categoryName);
  }

  // If we call with productName=null, force category/SVG fallback
  if (!productName) {
    const normalizedCategory = categoryName?.toLowerCase() || 'electronics';
    // If no dbImage, return category fallback, else SVG fallback
    return categoryFallbacks[normalizedCategory] || getSvgPlaceholder(null, categoryName);
  }

  // 1. Direct filename check in imageMapping
  const filename = productName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .concat('.jpg');

  if (imageMapping[filename]) {
    return imageMapping[filename];
  }

  // 2. Keyword fallback matching
  const lowerName = productName.toLowerCase();
  const sortedKeywords = Object.keys(keywordsMap).sort((a, b) => b.length - a.length);
  for (const keyword of sortedKeywords) {
    if (lowerName.includes(keyword)) {
      return keywordsMap[keyword];
    }
  }

  // 3. Use dbImage if present
  if (dbImage) {
    return dbImage;
  }

  // 4. Default to SVG placeholder
  return getSvgPlaceholder(productName, categoryName);
};

// Color-variant product images for product detail gallery
const laptopVariantImages = {
  'Teal': [
    '/macbook_teal.png',
    'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569762824961-0af7d0e419a6?w=800&auto=format&fit=crop&q=80'
  ],
  'Pink': [
    '/macbook_pink.png',
    'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'
  ],
  'Grey': [
    '/macbook_grey.png',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80'
  ],
  'Yellow': [
    '/macbook_yellow.png',
    'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80'
  ],
  'Rose': [
    '/macbook_rose.png',
    'https://images.unsplash.com/photo-1537498424440-3fb629dbe75a?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
  ]
};

const phoneVariantImages = {
  'Teal': [
    '/phone_teal.png',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  ],
  'Pink': [
    '/phone_pink.png',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&auto=format&fit=crop&q=80'
  ],
  'Grey': [
    '/phone_grey.png',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
  ],
  'Yellow': [
    '/phone_yellow.png',
    'https://images.unsplash.com/photo-1557180295-76eee20ae8aa?w=800&auto=format&fit=crop&q=80'
  ],
  'Rose': [
    '/phone_rose.png',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
  ]
};

const audioVariantImages = {
  'Teal': [
    '/headphone_teal.png',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
  ],
  'Pink': [
    '/headphone_pink.png',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
  ],
  'Grey': [
    '/headphone_grey.png',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  ],
  'Yellow': [
    '/headphone_yellow.png',
    'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&auto=format&fit=crop&q=80'
  ],
  'Rose': [
    '/headphone_rose.png',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
  ]
};

const fashionVariantImages = {
  'Teal': [
    '/apparel_teal.png',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'
  ],
  'Pink': [
    '/apparel_pink.png',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
  ],
  'Grey': [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80'
  ],
  'Yellow': [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80'
  ],
  'Rose': [
    'https://images.unsplash.com/photo-1620012253295-c05518e99309?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
  ]
};

const defaultVariantImages = {
  'Teal': [
    'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581235707960-35f13de9e8e5?w=800&auto=format&fit=crop&q=80'
  ],
  'Pink': [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
  ],
  'Grey': [
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  ],
  'Yellow': [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80'
  ],
  'Rose': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
  ]
};

export const getColorVariantImages = (color, productName = '') => {
  const name = productName.toLowerCase();
  
  if (name.includes('macbook') || name.includes('laptop') || name.includes('air m2')) {
    return laptopVariantImages[color] || laptopVariantImages['Teal'];
  }
  
  if (name.includes('phone') || name.includes('galaxy') || name.includes('iphone') || name.includes('oneplus')) {
    return phoneVariantImages[color] || phoneVariantImages['Teal'];
  }
  
  if (name.includes('headphone') || name.includes('earbud') || name.includes('airdopes')) {
    return audioVariantImages[color] || audioVariantImages['Teal'];
  }
  
  if (name.includes('jeans') || name.includes('shirt') || name.includes('kurta') || name.includes('dress') || name.includes('clothing')) {
    return fashionVariantImages[color] || fashionVariantImages['Teal'];
  }
  
  return defaultVariantImages[color] || defaultVariantImages['Teal'];
};
