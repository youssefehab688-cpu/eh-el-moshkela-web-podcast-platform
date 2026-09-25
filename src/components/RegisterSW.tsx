'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW Registered:', reg.scope))
        .catch((err) => console.error('SW Error:', err));
    } else if ('serviceWorker' in navigator) {
      // للتجربة المحلية أيضاً
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
}
