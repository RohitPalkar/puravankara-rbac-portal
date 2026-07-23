import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RoleActionPermission } from '../entities/role-action-permission.entity';
import { Module as ModuleEntity } from '../../product-catalog/entities/module.entity';
import { SubModule } from '../../product-catalog/entities/sub-module.entity';
import { ActionGroup } from '../../product-catalog/entities/action-group.entity';
import { Action } from '../../product-catalog/entities/action.entity';

@Injectable()
export class RoleActionPermissionService {
  constructor(
    @InjectRepository(RoleActionPermission)
    private readonly repository: Repository<RoleActionPermission>,
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(SubModule)
    private readonly subModuleRepo: Repository<SubModule>,
    @InjectRepository(ActionGroup)
    private readonly actionGroupRepo: Repository<ActionGroup>,
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
    private readonly dataSource: DataSource,
  ) {}

  async findByRole(roleId: number): Promise<number[]> {
    const rows = await this.repository.find({
      where: { roleId },
    });
    return rows.map((r) => r.actionId);
  }

  async getTreeWithPermissions(roleId: number): Promise<any> {
    const modules = await this.moduleRepo.find({
      where: { isActive: true, isPermissionConfigurable: true },
      order: { name: 'ASC' },
    });

    const subModules = await this.subModuleRepo.find({
      where: { isActive: true, isPermissionConfigurable: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    const actionGroups = await this.actionGroupRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    const actions = await this.actionRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    const selectedActionIds = await this.findByRole(roleId);
    const selectedSet = new Set(selectedActionIds);

    let totalPermissions = 0;

    const result = modules.map((mod) => {
      let modCount = 0;
      const modSubModules = subModules.filter((sm) => sm.moduleId === mod.id);

      const mappedSubModules = modSubModules.map((sm) => {
        let smCount = 0;
        const smActionGroups = actionGroups.filter((ag) => ag.subModuleId === sm.id);
        const hasActions = smActionGroups.length > 0;

        const mappedActionGroups = smActionGroups.map((ag) => {
          let agCount = 0;
          const agActions = actions.filter((a) => a.actionGroupId === ag.id);

          const mappedActions = agActions.map((a) => {
            const selected = selectedSet.has(a.id);
            if (selected) agCount++;
            return {
              id: a.id,
              code: a.code,
              name: a.name,
              label: a.label,
              displayOrder: a.displayOrder,
              selected,
            };
          });

          smCount += agCount;
          return {
            id: ag.id,
            name: ag.name,
            code: ag.code,
            displayOrder: ag.displayOrder,
            actions: mappedActions,
            selectedCount: agCount,
            totalCount: agActions.length,
          };
        });

        modCount += smCount;
        return {
          id: sm.id,
          name: sm.name,
          displayOrder: sm.displayOrder,
          hasActions,
          permissionType: hasActions ? 'ACTION' : 'MODULE',
          actionGroups: mappedActionGroups,
          selectedCount: smCount,
          totalCount: smActionGroups.length > 0
            ? smActionGroups.reduce(
                (sum, ag) => sum + actions.filter((a) => a.actionGroupId === ag.id).length,
                0,
              )
            : 1,
        };
      });

      totalPermissions += modCount;
      return {
        id: mod.id,
        name: mod.name,
        code: mod.code,
        subModules: mappedSubModules,
        selectedCount: modCount,
        totalCount: modSubModules.reduce(
          (sum, sm) =>
            sum +
            actionGroups
              .filter((ag) => ag.subModuleId === sm.id)
              .reduce((s, ag) => s + actions.filter((a) => a.actionGroupId === ag.id).length, 0),
          0,
        ),
      };
    });

    return { totalPermissions, modules: result };
  }

  async setByRole(roleId: number, actionIds: number[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(RoleActionPermission, { roleId });

      if (actionIds.length > 0) {
        const actionIdParams = actionIds.join(',');
        const rows = await queryRunner.manager.query(
          `SELECT a.id as action_id, a.action_group_id, sm.id as sub_module_id, sm.module_id
           FROM actions a
           JOIN action_groups ag ON ag.id = a.action_group_id
           JOIN sub_modules sm ON sm.id = ag.sub_module_id
           WHERE a.id IN (${actionIdParams})`,
        );

        if (rows.length > 0) {
          const values = rows
            .map(
              (r: any) =>
                `(${roleId}, ${r.module_id}, ${r.sub_module_id}, ${r.action_group_id}, ${r.action_id})`,
            )
            .join(', ');

          await queryRunner.manager.query(
            `INSERT INTO role_action_permissions (role_id, module_id, sub_module_id, action_group_id, action_id) VALUES ${values}`,
          );
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
