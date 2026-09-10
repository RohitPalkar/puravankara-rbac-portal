import type {
  MasterCity,
  LandConsultant,
  BDLandTeamMember,
  MasterDepartment,
  CityGenericApproval,
} from 'src/services/types/master';

/**
 * In-memory mock store for the 4 standalone reference masters.
 *
 * Replace the service layer (src/services/services/master.service.ts) with real
 * API calls when a backend becomes available — the hook/component contracts stay
 * identical.
 */

let nextId = 1;
const nextNumber = (): number => {
  const current = nextId;
  nextId += 1;
  return current;
};

const now = (): string => new Date().toISOString();

interface SeedRow {
  id: number;
  createdAt: string;
  updatedAt: string;
}

function base<T>(seed: SeedRow & Partial<T>): T & SeedRow {
  return {
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    ...seed,
  } as unknown as T & SeedRow;
}

const seedCities = [
  ['BLR', 'Bengaluru', 'Karnataka'],
  ['MUM', 'Mumbai', 'Maharashtra'],
  ['PUN', 'Pune', 'Maharashtra'],
  ['HYD', 'Hyderabad', 'Telangana'],
  ['CHN', 'Chennai', 'Tamil Nadu'],
  ['NCR', 'NCR-Gurugram', 'Haryana'],
  ['KOL', 'Kolkata', 'West Bengal'],
  ['KOC', 'Kochi', 'Kerala'],
  ['CBE', 'Coimbatore', 'Tamil Nadu'],
  ['GOA', 'Goa', 'Goa'],
] as const;

const seedConsultants = [
  ['LC001', 'ABC Land Advisors', 'Rajesh Kumar', '9876543210', 'rajesh@abcland.in', [2], 'Land Acquisition / Due Diligence'],
  ['LC002', 'Skyline Consultants', 'Anita Sharma', '9876543211', 'anita@skyline.in', [2], 'Urban Planning'],
  ['LC003', 'UrbanEdge Consulting', 'Rohan Mehta', '9876543212', 'rohan@urbanedge.in', [0], 'Legal / Compliance'],
] as const;

const seedTeam = [
  ['E0001', 'Arjun Rao', 'BD Manager', 'Business Development', 'arjun.rao@puravankara.com', '9876500001', [2, 3]],
  ['E0002', 'Priya Nair', 'Land Manager', 'Land', 'priya.nair@puravankara.com', '9876500002', [0, 4]],
  ['E0003', 'Karan Singh', 'Executive', 'Business Development', 'karan.singh@puravankara.com', '9876500003', [1]],
] as const;

const seedDepartments = [
  ['BD', 'Business Development', 'Handles business growth and channel partnerships'],
  ['LAND', 'Land', 'Handles land acquisition and related activities'],
  ['FIN', 'Finance', 'Financial operations and budgeting'],
  ['LEGAL', 'Legal & Compliance', 'Legal and compliance matters'],
  ['OPS', 'Operations', 'Project operations and delivery'],
] as const;

const cities: MasterCity[] = seedCities.map(([code, name, state]) =>
  base<MasterCity>({
    id: nextNumber(),
    code,
    name,
    state,
    country: 'India',
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
    genericApprovals: [] as CityGenericApproval[],
  })
);

const citiesById = new Map<number, MasterCity>(cities.map((c) => [c.id, c]));

const consultants: LandConsultant[] = seedConsultants.map(([code, name, contactPerson, mobile, email, cityIds, specialisation]) =>
  base<LandConsultant>({ id: nextNumber(), code, name, contactPerson, mobile, email, cityIds: cityIds as unknown as number[], specialisation, isActive: true, createdAt: now(), updatedAt: now() })
);

const team: BDLandTeamMember[] = seedTeam.map(([empId, name, designation, department, email, mobile, cityIds]) =>
  base<BDLandTeamMember>({ id: nextNumber(), empId, name, designation, department, email, mobile, cityIds: cityIds as unknown as number[], isActive: true, createdAt: now(), updatedAt: now() })
);

const departments: MasterDepartment[] = seedDepartments.map(([code, name, description]) =>
  base<MasterDepartment>({ id: nextNumber(), code, name, description, isActive: true, createdAt: now(), updatedAt: now() })
);

function filterBySearch<T>(
  rows: T[],
  search?: string,
  fields: (keyof T)[] = []
): T[] {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter((row) =>
    fields.some((f) => {
      const rec = row as Record<string, unknown>;
      const val = rec[f as string];
      if (val == null) return false;
      return String(val).toLowerCase().includes(q);
    })
  );
}

function paginate<T>(rows: T[], page = 1, limit = 20) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const data = rows.slice(start, start + limit);
  return { data, meta: { page: safePage, limit, total, totalPages } };
}

export function listCities(params?: { search?: string; page?: number; limit?: number }) {
  const matches = filterBySearch<MasterCity>(cities, params?.search, ['name', 'state', 'code']);
  return paginate(matches, params?.page, params?.limit);
}

export function getCity(id: number): MasterCity | undefined {
  return citiesById.get(id);
}

export function createCity(data: Omit<MasterCity, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>) {
  const record = base<MasterCity>({
    id: nextNumber(),
    ...data,
    isActive: data.isActive ?? true,
    genericApprovals: (data as any).genericApprovals ?? [],
    createdAt: now(),
    updatedAt: now(),
  });
  cities.push(record);
  citiesById.set(record.id, record);
  return record;
}

export function updateCity(id: number, data: Partial<MasterCity>) {
  const existing = citiesById.get(id);
  if (!existing) return undefined;
  Object.assign(existing, data, { updatedAt: now() });
  // ensure genericApprovals persisted correctly
  if ((data as any).genericApprovals !== undefined) {
    (existing as any).genericApprovals = (data as any).genericApprovals;
  }
  return existing;
}

export function deleteCity(id: number): boolean {
  const idx = cities.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  cities.splice(idx, 1);
  citiesById.delete(id);
  return true;
}

export function listConsultants(params?: { search?: string; page?: number; limit?: number }) {
  const matches = filterBySearch<LandConsultant>(consultants, params?.search, ['name', 'code', 'contactPerson', 'specialisation']);
  return paginate(matches, params?.page, params?.limit);
}

export function getConsultant(id: number): LandConsultant | undefined {
  return consultants.find((c) => c.id === id);
}

export function createConsultant(data: Omit<LandConsultant, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>) {
  const record = base<LandConsultant>({ id: nextNumber(), ...data, isActive: data.isActive ?? true, createdAt: now(), updatedAt: now() });
  consultants.push(record);
  return record;
}

export function updateConsultant(id: number, data: Partial<LandConsultant>) {
  const existing = consultants.find((c) => c.id === id);
  if (!existing) return undefined;
  Object.assign(existing, data, { updatedAt: now() });
  return existing;
}

export function deleteConsultant(id: number): boolean {
  const idx = consultants.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  consultants.splice(idx, 1);
  return true;
}

export function listTeam(params?: { search?: string; page?: number; limit?: number }) {
  const matches = filterBySearch<BDLandTeamMember>(team, params?.search, ['name', 'empId', 'designation', 'department']);
  return paginate(matches, params?.page, params?.limit);
}

export function getTeamMember(id: number): BDLandTeamMember | undefined {
  return team.find((t) => t.id === id);
}

export function createTeamMember(data: Omit<BDLandTeamMember, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>) {
  const record = base<BDLandTeamMember>({ id: nextNumber(), ...data, isActive: data.isActive ?? true, createdAt: now(), updatedAt: now() });
  team.push(record);
  return record;
}

export function updateTeamMember(id: number, data: Partial<BDLandTeamMember>) {
  const existing = team.find((t) => t.id === id);
  if (!existing) return undefined;
  Object.assign(existing, data, { updatedAt: now() });
  return existing;
}

export function deleteTeamMember(id: number): boolean {
  const idx = team.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  team.splice(idx, 1);
  return true;
}

export function listDepartments(params?: { search?: string; page?: number; limit?: number }) {
  const matches = filterBySearch<MasterDepartment>(departments, params?.search, ['name', 'code', 'description']);
  return paginate(matches, params?.page, params?.limit);
}

export function getDepartment(id: number): MasterDepartment | undefined {
  return departments.find((d) => d.id === id);
}

export function createDepartment(data: Omit<MasterDepartment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'createdBy' | 'updatedBy'>) {
  const record = base<MasterDepartment>({ id: nextNumber(), ...data, isActive: data.isActive ?? true, createdAt: now(), updatedAt: now() });
  departments.push(record);
  return record;
}

export function updateDepartment(id: number, data: Partial<MasterDepartment>) {
  const existing = departments.find((d) => d.id === id);
  if (!existing) return undefined;
  Object.assign(existing, data, { updatedAt: now() });
  return existing;
}

export function deleteDepartment(id: number): boolean {
  const idx = departments.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  departments.splice(idx, 1);
  return true;
}

export function allCitiesFlat(): MasterCity[] {
  return cities.map((c) => ({ ...c }));
}

export { citiesById };
