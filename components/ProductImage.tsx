'use client';
import { useState } from 'react';
export default function ProductImage({ src, index = 0 }: { src: string; index?: number }) { const [failed, setFailed] = useState(false); return failed ? <div className="image-placeholder"><span className="placeholder-mark">O₂</span><strong>VisionAire 5</strong><span>Product photograph {index + 1}</span><small>Photo awaiting upload</small></div> : <img src={src} alt={`AirSep VisionAire 5 product view ${index + 1}`} onError={() => setFailed(true)} />; }
