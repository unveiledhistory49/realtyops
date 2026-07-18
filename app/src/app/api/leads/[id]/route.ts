import { NextRequest, NextResponse } from "next/server";
import { leadsDb, agents } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await new Promise((resolve) => setTimeout(resolve, 300));

  const lead = leadsDb.find((l) => l.id === id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const agent = agents.find((a) => a.id === lead.assignedAgentId);

  const activities = [
    {
      id: "act1",
      timestamp: lead.createdAt,
      actor: "System",
      action: "Lead created",
    },
    {
      id: "act2",
      timestamp: lead.lastActivityAt,
      actor: agent?.name || "System",
      action: `Status changed to ${lead.status}`,
    },
  ];

  return NextResponse.json({ ...lead, activities });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await new Promise((resolve) => setTimeout(resolve, 300));

  const simulateConflict =
    request.headers.get("X-Simulate-Conflict") === "true";
  const simulateError = request.headers.get("X-Simulate-Error") === "true";

  if (simulateError) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  const leadIndex = leadsDb.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const currentRecord = leadsDb[leadIndex];

  if (simulateConflict) {
    return NextResponse.json(
      {
        conflict: true,
        updatedBy: "Sarah Jenkins",
        currentRecord: { ...currentRecord, status: "closed" as const },
      },
      { status: 409 }
    );
  }

  const body = await request.json();
  const updatedLead = {
    ...currentRecord,
    ...body,
    lastActivityAt: new Date().toISOString(),
  };
  leadsDb[leadIndex] = updatedLead;

  return NextResponse.json(updatedLead);
}
