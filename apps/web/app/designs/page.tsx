import { apiGet } from '@/lib/api';

export default async function DesignsPage() {
  const designs = await apiGet('/designs');
  return <div><h1 className="text-xl font-semibold mb-4">Designs</h1><div className="space-y-2">{designs.map((d:any)=><div key={d.id} className="p-3 bg-white border rounded">{d.name} - {d.imageUrl}</div>)}</div></div>;
}
