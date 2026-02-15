'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function CartView() {
  const [cart, setCart] = useState<any>();

  useEffect(()=>{
    const raw = localStorage.getItem('cart');
    if (raw) setCart(JSON.parse(raw));
  },[]);

  const checkout = async () => {
    const res = await fetch(`${API_BASE}/orders/checkout-session`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(cart)});
    const data = await res.json();
    localStorage.setItem('lastOrderId', data.orderId);
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
  };

  if (!cart) return <p>No cart item.</p>;
  return <div className="space-y-2"><pre className="bg-white p-3 border rounded">{JSON.stringify(cart, null, 2)}</pre><button onClick={checkout}>Checkout</button></div>;
}
