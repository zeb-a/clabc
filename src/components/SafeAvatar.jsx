import React from 'react';
import { fallbackInitialsDataUrl } from '../utils/avatar';

export default function SafeAvatar({ src, name, alt, style, ...rest }) {
  const [avatar, setAvatar] = React.useState(() => src || fallbackInitialsDataUrl(name));

  React.useEffect(() => {
    let mounted = true;
    if (!src) {
      setAvatar(fallbackInitialsDataUrl(name));
      return;
    }
    
    // If src is a data URL, set directly (no network request).
    if (typeof src === 'string' && src.startsWith('data:')) {
      setAvatar(src);
      return;
    }

    // If src is already a full URL, use it
    if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
      fetch(src, { method: 'GET', mode: 'cors' })
        .then(res => {
          if (!mounted) return;
          if (res.ok) setAvatar(src);
          else setAvatar(fallbackInitialsDataUrl(name));
        })
        .catch(() => {
          if (!mounted) return;
          setAvatar(fallbackInitialsDataUrl(name));
        });
      return;
    }

    // If it's just a filename (from PocketBase file field), construct the URL
    // Format: /api/files/[collection]/[recordId]/[filename]
    // But we don't have recordId here, so fall back to initials
    if (typeof src === 'string' && src.length > 0 && !src.includes('/')) {
      // This is likely a PocketBase filename without the full URL path
      // We can't construct the proper URL without the recordId, so use fallback
      setAvatar(fallbackInitialsDataUrl(name));
      return;
    }

    // Try fetching as-is
    fetch(src, { method: 'GET', mode: 'cors' })
      .then(res => {
        if (!mounted) return;
        if (res.ok) setAvatar(src);
        else setAvatar(fallbackInitialsDataUrl(name));
      })
      .catch(() => {
        if (!mounted) return;
        setAvatar(fallbackInitialsDataUrl(name));
      });

    return () => { mounted = false; };
  }, [src, name]);

  return (
    <img src={avatar} alt={alt || name} style={style} {...rest} />
  );
}
