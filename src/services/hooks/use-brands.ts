import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { brandService } from '../services/brand.service';

import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types/brand';

export const {
  useList: useBrandList,
  useById: useBrandById,
  useCreate: useCreateBrand,
  useUpdate: useUpdateBrand,
  useDelete: useDeleteBrand,
} = createCrudHooks<Brand, CreateBrandRequest, UpdateBrandRequest>({
  allKey: queryKeys.brands.all,
  listKey: queryKeys.brands.list,
  byIdKey: queryKeys.brands.byId,
  listFn: brandService.list,
  byIdFn: brandService.byId,
  createFn: brandService.create,
  updateFn: brandService.update,
  deleteFn: brandService.delete,
});
