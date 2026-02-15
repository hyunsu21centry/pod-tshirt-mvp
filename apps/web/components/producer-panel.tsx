'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function ProducerPanel() {
  const [token, setToken] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'producer@example.com', password:'producer1234'})});
    const data = await res.json(); setToken(data.accessToken);
  };

  const load = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    setJobs(await (await fetch(`${API_BASE}/producer/jobs`, { headers })).json());
  };

  const markShipped = async (id: string) => {
    await fetch(`${API_BASE}/producer/jobs/${id}`, {method:'PATCH', headers:{'Content-Type':'application/json', Authorization: `Bearer ${token}`}, body: JSON.stringify({status:'SHIPPED', trackingCarrier:'UPS', trackingNumber:'1Z999'})});
    load();
  };

  return <div className="space-y-2"><button onClick={login}>Login as producer</button><button onClick={load}>Load jobs</button>{jobs.map((j:any)=><div key={j.id} className="bg-white border p-2 rounded"><p>{j.id} - {j.status}</p><button onClick={()=>markShipped(j.id)}>Mark shipped</button></div>)}</div>;
}
