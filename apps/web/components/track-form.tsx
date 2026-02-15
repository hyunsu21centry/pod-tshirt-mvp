'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function TrackForm() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('customer@example.com');
  const [result, setResult] = useState<any>();

  const track = async () => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/track?email=${encodeURIComponent(email)}`);
    setResult(await res.json());
  };

  return <div className="space-y-2"><input placeholder="order id" value={orderId} onChange={e=>setOrderId(e.target.value)} /><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /><button onClick={track}>Track</button>{result && <pre className="bg-white border p-2 rounded">{JSON.stringify(result, null, 2)}</pre>}</div>;
}
