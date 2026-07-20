import { createCrudHooks } from './use-crud';
import { queryKeys } from '../api/query-keys';
import { channelPartnerTypeService, channelPartnerService } from '../services/channel-partner.service';
import type {
  ChannelPartnerType,
  CreateChannelPartnerTypeRequest,
  UpdateChannelPartnerTypeRequest,
  ChannelPartner,
  CreateChannelPartnerRequest,
  UpdateChannelPartnerRequest,
} from '../types/channel-partner';

export const {
  useList: useChannelPartnerTypeList,
  useById: useChannelPartnerTypeById,
  useCreate: useCreateChannelPartnerType,
  useUpdate: useUpdateChannelPartnerType,
  useDelete: useDeleteChannelPartnerType,
} = createCrudHooks<
  ChannelPartnerType,
  CreateChannelPartnerTypeRequest,
  UpdateChannelPartnerTypeRequest
>({
  allKey: queryKeys.channelPartnerTypes.all,
  listKey: queryKeys.channelPartnerTypes.list,
  byIdKey: queryKeys.channelPartnerTypes.byId,
  listFn: channelPartnerTypeService.list,
  byIdFn: channelPartnerTypeService.byId,
  createFn: channelPartnerTypeService.create,
  updateFn: channelPartnerTypeService.update,
  deleteFn: channelPartnerTypeService.delete,
});

export const {
  useList: useChannelPartnerList,
  useById: useChannelPartnerById,
  useCreate: useCreateChannelPartner,
  useUpdate: useUpdateChannelPartner,
  useDelete: useDeleteChannelPartner,
} = createCrudHooks<ChannelPartner, CreateChannelPartnerRequest, UpdateChannelPartnerRequest>({
  allKey: queryKeys.channelPartners.all,
  listKey: queryKeys.channelPartners.list,
  byIdKey: queryKeys.channelPartners.byId,
  listFn: channelPartnerService.list,
  byIdFn: channelPartnerService.byId,
  createFn: channelPartnerService.create,
  updateFn: channelPartnerService.update,
  deleteFn: channelPartnerService.delete,
});
