import UniApi from './uni-api';
import {
    ACTION_UPDATE_STATE as TOPBAR_MENU_ACTION_UPDATE_STATE
} from '../flux/topbar-menu';

export function topbarMenuMiddleware() {
    return function (next) {
        return function (action) {
            let timer;
            switch (action.type) {
                case TOPBAR_MENU_ACTION_UPDATE_STATE: // notify main process to update menu
                    UniApi.Event.emit('topbar-menu:update-electron-menu', action);
                    break;
                default:
                    // update topbar-menu after current action processed
                    timer = setTimeout(() => {
                        clearTimeout(timer);
                        UniApi.Event.emit('topbar-menu:should-update');
                    }, 0);
                    break;
            }
            return next(action);
        };
    };
}
