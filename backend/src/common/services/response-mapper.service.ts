import { Injectable } from '@nestjs/common';

interface FeZone {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FeDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  maxHierarchyLevels: number;
  createdBy: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface FeRole {
  id: string;
  name: string;
  code?: string;
  description?: string;
  level: string;
  departmentId: string;
  departmentName?: string;
  createdBy: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface FeProject {
  id: string;
  name: string;
  code: string;
  brand: string;
  zoneId: string;
  zoneName?: string;
  cityId: string;
  cityName?: string;
  phase: string;
  billingEntity: string;
  billingAddress: string;
  gstin: string;
  paymentGateway: string;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface BeEntity {
  id: number;
  name?: string;
  isActive?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | string | null;
  maxHierarchyLevels?: number;
  hierarchyLevelRank?: number;
  billingEntityName?: string;
  billingGstin?: string;
  extendedMetadata?: Record<string, any>;
  [key: string]: any;
}

@Injectable()
export class ResponseMapperService {
  toZone(be: BeEntity): FeZone {
    return {
      id: String(be.id),
      name: be.name || '',
      code: be.name ? be.name.substring(0, 3).toUpperCase() : '',
      description: '',
      status: be.isActive !== false ? 'active' : 'inactive',
      createdBy: be.createdBy || '',
      createdAt: this.toDateStr(be.createdAt),
      updatedAt: this.toDateStr(be.updatedAt),
    };
  }

  toZoneList(entities: BeEntity[]): FeZone[] {
    return entities.map((e) => this.toZone(e));
  }

  toDepartment(be: BeEntity): FeDepartment {
    return {
      id: String(be.id),
      name: be.name || '',
      code: be.name ? be.name.substring(0, 3).toUpperCase() : '',
      description: '',
      maxHierarchyLevels: be.maxHierarchyLevels ?? 4,
      status: be.isActive !== false ? 'active' : 'inactive',
      createdBy: be.createdBy || '',
      createdAt: this.toDateStr(be.createdAt),
      updatedAt: this.toDateStr(be.updatedAt),
    };
  }

  toDepartmentList(Be: BeEntity[]): FeDepartment[] {
    return Be.map((e) => this.toDepartment(e));
  }

  toRole(be: BeEntity, departmentId?: number, departmentName?: string): FeRole {
    const levelNum = be.hierarchyLevelRank || 1;
    return {
      id: String(be.id),
      name: be.name || '',
      code: be.name ? be.name.substring(0, 3).toUpperCase() : '',
      description: '',
      level: `L${levelNum}`,
      departmentId: departmentId ? String(departmentId) : '',
      departmentName: departmentName || '',
      status: be.isActive !== false ? 'active' : 'inactive',
      createdBy: be.createdBy || '',
      createdAt: this.toDateStr(be.createdAt),
      updatedAt: this.toDateStr(be.updatedAt),
    };
  }

  toRoleList(roles: any[]): FeRole[] {
    return roles.map((r) => {
      const dept = r.department || r.departmentRole?.department || {};
      const beRole = r.role || r;
      return this.toRole(beRole, dept.id, dept.name);
    });
  }

  toProject(be: BeEntity): FeProject {
    const meta = be.extendedMetadata || {};
    return {
      id: String(be.id),
      name: be.name || '',
      code: be.name ? be.name.substring(0, 3).toUpperCase() : '',
      brand: meta.brand || '',
      zoneId: meta.zoneId ? String(meta.zoneId) : '',
      zoneName: meta.zoneName || '',
      cityId: meta.cityId ? String(meta.cityId) : '',
      cityName: meta.cityName || '',
      phase: meta.phase || '',
      billingEntity: be.billingEntityName || '',
      billingAddress: meta.billingAddress || '',
      gstin: be.billingGstin || '',
      paymentGateway: meta.paymentGateway || '',
      status: be.isActive !== false ? 'active' : 'inactive',
      createdBy: be.createdBy || '',
      createdAt: this.toDateStr(be.createdAt),
      updatedAt: this.toDateStr(be.updatedAt),
    };
  }

  toProjectList(Be: BeEntity[]): FeProject[] {
    return Be.map((e) => this.toProject(e));
  }

  private toDateStr(d: Date | string | undefined): string {
    if (!d) return new Date().toISOString();
    return typeof d === 'string' ? d : d.toISOString();
  }
}