import { NextRequest, NextResponse } from 'next/server';
import { listings } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const status = searchParams.get('status');
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const agent = searchParams.get('agent');
  const beds = searchParams.get('beds');
  const sort = searchParams.get('sort') || 'price';
  const dir = searchParams.get('dir') || 'asc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = [...listings];

  if (status) {
    const statuses = status.split(',');
    filtered = filtered.filter((l) => statuses.includes(l.status));
  }
  if (priceMin) {
    filtered = filtered.filter((l) => l.price >= parseInt(priceMin, 10));
  }
  if (priceMax) {
    filtered = filtered.filter((l) => l.price <= parseInt(priceMax, 10));
  }
  if (agent) {
    filtered = filtered.filter((l) => l.agentId === agent);
  }
  if (beds) {
    filtered = filtered.filter((l) => l.beds >= parseInt(beds, 10));
  }
  if (search) {
    filtered = filtered.filter((l) => l.address.toLowerCase().includes(search));
  }

  filtered.sort((a, b) => {
    // @ts-ignore
    const valA = a[sort];
    // @ts-ignore
    const valB = b[sort];
    
    if (valA < valB) return dir === 'asc' ? -1 : 1;
    if (valA > valB) return dir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({
    data: paginated,
    total,
    page,
    pageSize,
  });
}
