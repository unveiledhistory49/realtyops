import type { Agent, Lead, Listing, Showing } from "./schemas";

export const agents: Agent[] = [
  { id: "a1", name: "Sarah Jenkins", activeLeadCount: 12 },
  { id: "a2", name: "Marcus Chen", activeLeadCount: 8 },
  { id: "a3", name: "Emily Rodriguez", activeLeadCount: 15 },
  { id: "a4", name: "David Kim", activeLeadCount: 5 },
  { id: "a5", name: "James Wilson", activeLeadCount: 20 },
];

export const listings: Listing[] = [
  { id: "lst1", address: "123 Maple St, Seattle, WA", price: 850000, status: "active", beds: 3, sqft: 2100, agentId: "a1", photos: [] },
  { id: "lst2", address: "456 Oak Ave, Portland, OR", price: 620000, status: "pending", beds: 4, sqft: 2500, agentId: "a2", photos: [] },
  { id: "lst3", address: "789 Pine Ln, Austin, TX", price: 450000, status: "active", beds: 2, sqft: 1200, agentId: "a3", photos: [] },
  { id: "lst4", address: "321 Elm St, Denver, CO", price: 950000, status: "closed", beds: 5, sqft: 3200, agentId: "a4", photos: [] },
  { id: "lst5", address: "654 Cedar Rd, Miami, FL", price: 1200000, status: "active", beds: 4, sqft: 2800, agentId: "a5", photos: [] },
  { id: "lst6", address: "987 Birch Blvd, Chicago, IL", price: 550000, status: "active", beds: 3, sqft: 1800, agentId: "a1", photos: [] },
  { id: "lst7", address: "147 Walnut Ct, Boston, MA", price: 1100000, status: "pending", beds: 4, sqft: 2600, agentId: "a2", photos: [] },
  { id: "lst8", address: "258 Spruce Way, Atlanta, GA", price: 350000, status: "active", beds: 2, sqft: 1100, agentId: "a3", photos: [] },
  { id: "lst9", address: "369 Ash Dr, Phoenix, AZ", price: 420000, status: "closed", beds: 3, sqft: 1600, agentId: "a4", photos: [] },
  { id: "lst10", address: "741 Redwood Pl, San Francisco, CA", price: 2100000, status: "active", beds: 3, sqft: 2000, agentId: "a5", photos: [] },
  { id: "lst11", address: "852 Willow Trl, Seattle, WA", price: 920000, status: "active", beds: 4, sqft: 2400, agentId: "a1", photos: [] },
  { id: "lst12", address: "963 Chestnut Pkwy, Portland, OR", price: 580000, status: "pending", beds: 3, sqft: 1900, agentId: "a2", photos: [] },
  { id: "lst13", address: "159 Poplar St, Austin, TX", price: 680000, status: "active", beds: 4, sqft: 2200, agentId: "a3", photos: [] },
  { id: "lst14", address: "753 Sycamore Ave, Denver, CO", price: 890000, status: "closed", beds: 3, sqft: 2100, agentId: "a4", photos: [] },
  { id: "lst15", address: "951 Cypress Ln, Miami, FL", price: 1450000, status: "active", beds: 5, sqft: 3500, agentId: "a5", photos: [] },
  { id: "lst16", address: "357 Magnolia Rd, Chicago, IL", price: 620000, status: "active", beds: 3, sqft: 1750, agentId: "a1", photos: [] },
  { id: "lst17", address: "246 Juniper Ct, Boston, MA", price: 1250000, status: "pending", beds: 4, sqft: 2800, agentId: "a2", photos: [] },
  { id: "lst18", address: "135 Hickory Blvd, Atlanta, GA", price: 390000, status: "active", beds: 2, sqft: 1300, agentId: "a3", photos: [] },
  { id: "lst19", address: "864 Pecan Dr, Phoenix, AZ", price: 480000, status: "closed", beds: 3, sqft: 1700, agentId: "a4", photos: [] },
  { id: "lst20", address: "975 Acacia Pl, San Francisco, CA", price: 1850000, status: "active", beds: 2, sqft: 1500, agentId: "a5", photos: [] },
];

/* ── Realistic lead names ── */
const leadNames = [
  "Michael Torres", "Amanda Fischer", "Robert Patel", "Jessica Huang",
  "Christopher Novak", "Lauren Mitchell", "Daniel Okafor", "Rachel Bergman",
  "Kevin Nakamura", "Megan Sullivan", "Brandon Reyes", "Natalie Cho",
  "Tyler Morrison", "Samantha Drake", "Ryan Kowalski", "Emily Thornton",
  "Jason Delgado", "Olivia Kessler", "Nathan Price", "Hannah Volkov",
  "Andrew Castillo", "Victoria Lam", "Eric Johansson", "Michelle Ruiz",
  "Brian Whitfield", "Courtney Zhang", "Steven Morales", "Laura Svenson",
  "Gregory Park", "Ashley Dumont", "Jordan Blackwell", "Danielle Ivanova",
  "Derek Fontaine", "Chloe Ramos", "Patrick O'Brien", "Stephanie Tanaka",
  "Cameron Shields", "Allison Hartley", "Marcus Everett", "Jenna Cross",
];

const pastDates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toISOString();
});

const statuses = ["new", "contacted", "showing", "offer", "closed", "lost"] as const;

export const leads: Lead[] = Array.from({ length: 40 }, (_, i) => {
  const status = statuses[i % statuses.length];
  const agent = agents[i % agents.length];
  const listing = listings[i % listings.length];
  const name = leadNames[i];
  const first = name.split(" ")[0].toLowerCase();
  const last = name.split(" ")[1].toLowerCase();

  return {
    id: `ld${i + 1}`,
    name,
    email: `${first}.${last}@email.com`,
    phone: `(${555 + (i % 3)}) ${200 + i}-${1000 + i * 7}`,
    listingId: i % 3 !== 0 ? listing.id : undefined,
    status,
    assignedAgentId: agent.id,
    createdAt: pastDates[Math.min(i, pastDates.length - 1)],
    lastActivityAt: pastDates[Math.max(0, Math.floor(i / 3))],
    lostReason: status === "lost" ? "Price too high" : undefined,
  };
});

/** Mutable copy for mock PATCH updates */
export let leadsDb = [...leads];

export const showings: Showing[] = Array.from({ length: 10 }, (_, i) => {
  const showStatuses = ["confirmed", "completed", "cancelled"] as const;
  return {
    id: `shw${i + 1}`,
    leadId: `ld${i + 1}`,
    listingId: `lst${(i % 20) + 1}`,
    scheduledTime: pastDates[i],
    status: showStatuses[i % showStatuses.length],
  };
});
