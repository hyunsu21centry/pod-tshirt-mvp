import { apiGet } from '@/lib/api';

export default async function Home() {
  const designs = await apiGet('/designs');
  return <div><h1 className="text-2xl font-bold mb-4">POD T-Shirt MVP</h1><div className="grid grid-cols-3 gap-4">{designs.slice(0,3).map((d:any)=><div className="bg-white p-3 rounded border" key={d.id}><p>{d.name}</p><p className="text-xs">{d.imageUrl}</p></div>)}</div></div>;
}
