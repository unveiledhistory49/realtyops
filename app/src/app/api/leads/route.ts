import { NextRequest, NextResponse } from 'next/server';
import { leadsDb } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const status = searchParams.get('status');
  const agent = searchParams.get('agent');
  const sort = searchParams.get('sort') || 'createdAt';
  const dir = searchParams.get('dir') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search')?.toLowerCase();

  let filtered = [...leadsDb];

  if (status) {
    const statuses = status.split(',');
    filtered = filtered.filter((l) => statuses.includes(l.status));
  }
  if (agent) {
    filtered = filtered.filter((l) => l.assignedAgentId === agent);
  }
  if (search) {
    filtered = filtered.filter((l) => 
      l.name.toLowerCase().includes(search) || 
      l.email.toLowerCase().includes(search) ||
      l.phone.includes(search)
    );
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
