'use client';

import { useState } from 'react';

export default function CustomizeForm({ designs, products }: { designs: any[]; products: any[] }) {
  const [designId, setDesignId] = useState(designs[0]?.id || '');
  const [variantId, setVariantId] = useState(products[0]?.variants[0]?.id || '');
  const [email, setEmail] = useState('customer@example.com');
  const [qty, setQty] = useState(1);

  const addToCart = () => {
    const payload = { email, designId, variantId, qty, printPlacement: 'FRONT', printWidthMm: 250, printHeightMm: 300 };
    localStorage.setItem('cart', JSON.stringify(payload));
    alert('Added to cart');
  };

  return <div className="space-y-2">
    <div><label>Email </label><input value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
    <div><label>Design </label><select value={designId} onChange={(e)=>setDesignId(e.target.value)}>{designs.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
    <div><label>Variant </label><select value={variantId} onChange={(e)=>setVariantId(e.target.value)}>{products.flatMap(p=>p.variants.map((v:any)=><option key={v.id} value={v.id}>{p.name} / {v.color} / {v.size}</option>))}</select></div>
    <div><label>Qty </label><input type="number" min={1} value={qty} onChange={(e)=>setQty(Number(e.target.value))} /></div>
    <button onClick={addToCart}>Add to cart</button>
  </div>;
}
