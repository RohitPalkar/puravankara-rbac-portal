"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMapper = void 0;
class BaseMapper {
    toResponseList(entities) {
        return entities.map((e) => this.toResponse(e));
    }
}
exports.BaseMapper = BaseMapper;
//# sourceMappingURL=base.mapper.js.map