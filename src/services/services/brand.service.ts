import { endpoints } from '../api/endpoints';
import { createCrudService } from '../api/crud';

import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types/brand';

export const brandService = createCrudService<Brand, CreateBrandRequest, UpdateBrandRequest>({
  list: endpoints.brands.list,
  byId: endpoints.brands.byId,
  create: endpoints.brands.create,
  update: endpoints.brands.update,
  delete: endpoints.brands.delete,
});
