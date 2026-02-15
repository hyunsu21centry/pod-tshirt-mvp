import CustomizeForm from '@/components/customize-form';
import { apiGet } from '@/lib/api';

export default async function CustomizePage() {
  const [designs, products] = await Promise.all([apiGet('/designs'), apiGet('/products/bases')]);
  return <div><h1 className="text-xl font-semibold mb-4">Customize</h1><CustomizeForm designs={designs} products={products} /></div>;
}
