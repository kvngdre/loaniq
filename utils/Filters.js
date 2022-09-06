class Filters {
    constructor() {}
    /**
     *
     * @param {Object} params
     * @param {?number} params.min - Minimum tenor
     * @param {?number} params.max - Maximum tenor
     */
    tenor(params) {
        const tenorFilter = {};
        if (params.min) {
            tenorFilter['recommendedTenor'] = { $gte: params.min };
        }
        if (params.max && tenorFilter['recommendedTenor']) {
            tenorFilter['recommendedTenor'] = Object.assign(tenorFilter, {
                $lte: params.max,
            });
        } else {
            tenorFilter['recommendedTenor'] = { $lte: params.max };
        }

        return tenorFilter;
    }
}
