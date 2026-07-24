// src/api/admn-setting/content-types/admn-setting/lifecycles.ts

import { invalidateSettingsCache } from '../../../../services/settingsService';

export default {
    async afterUpdate() {
        invalidateSettingsCache();
    },
    async afterCreate() {
        invalidateSettingsCache();
    },
};