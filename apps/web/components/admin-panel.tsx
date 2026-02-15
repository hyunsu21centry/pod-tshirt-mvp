'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function AdminPanel() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@example.com', password:'admin1234'})});
    const data = await res.json(); setToken(data.accessToken);
  };

  const load = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    setOrders(await (await fetch(`${API_BASE}/admin/orders`, { headers })).json());
    setJobs(await (await fetch(`${API_BASE}/admin/jobs`, { headers })).json());
  };

  return <div className="space-y-2"><button onClick={login}>Login as admin</button><button onClick={load}>Load dashboard</button><p className="text-xs">token: {token.slice(0,20)}...</p><h2 className="font-semibold">Orders</h2><pre className="bg-white border p-2 rounded max-h-60 overflow-auto">{JSON.stringify(orders,null,2)}</pre><h2 className="font-semibold">Jobs</h2><pre className="bg-white border p-2 rounded max-h-60 overflow-auto">{JSON.stringify(jobs,null,2)}</pre></div>;
}
