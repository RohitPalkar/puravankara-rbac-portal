import { createCrudService } from '../api/crud';
import { endpoints } from '../api/endpoints';
import type {
  ChannelPartnerType,
  CreateChannelPartnerTypeRequest,
  UpdateChannelPartnerTypeRequest,
  ChannelPartner,
  CreateChannelPartnerRequest,
  UpdateChannelPartnerRequest,
} from '../types/channel-partner';

export const channelPartnerTypeService = createCrudService<
  ChannelPartnerType,
  CreateChannelPartnerTypeRequest,
  UpdateChannelPartnerTypeRequest
>({
  list: endpoints.channelPartnerTypes.list,
  byId: endpoints.channelPartnerTypes.byId,
  create: endpoints.channelPartnerTypes.create,
  update: endpoints.channelPartnerTypes.update,
  delete: endpoints.channelPartnerTypes.delete,
});

export const channelPartnerService = createCrudService<
  ChannelPartner,
  CreateChannelPartnerRequest,
  UpdateChannelPartnerRequest
>({
  list: endpoints.channelPartners.list,
  byId: endpoints.channelPartners.byId,
  create: endpoints.channelPartners.create,
  update: endpoints.channelPartners.update,
  delete: endpoints.channelPartners.delete,
});
