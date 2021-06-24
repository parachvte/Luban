import isElectron from 'is-electron';
import { cloneDeep, reverse } from 'lodash';
import { getMenuItems } from '../../config/menu';
import { MACHINE_SERIES } from '../../constants';
import {
    CaseConfigOriginal, CaseConfig150,
    CaseConfig250, CaseConfig350,
    CaseConfigA350FourAxis, CaseConfigA250FourAxis
} from '../../ui/Pages/HomePage/CaseConfig';
import UniApi from '../../lib/uni-api';
import i18n from '../../lib/i18n';

export const ACTION_UPDATE_STATE = 'topbar-menu/ACTION_UPDATE_STATE';

const INITIAL_STATE = [
    ...getMenuItems()
];

const hashStateMap = {
    '#/3dp': 'printing',
    '#/laser': 'laser',
    '#/cnc': 'cnc'
};

let menuDisabledCount = 0;

function caseConfigToMenuItems(caseConfig) {
    return caseConfig.map(item => {
        item.label = item.title;
        item.enabled = true;
        item.click = function () {
            UniApi.Event.emit('topbar-menu:get-started', item);
        };
        return item;
    });
}

function traverseMenu(menu, callback) {
    for (const item of menu) {
        if ('label' in item || 'role' in item) {
            callback && callback(item);
            if (item.submenu) {
                traverseMenu(item.submenu, callback);
            }
        }
    }
}

export const actions = {
    initMenuLanguage: () => (dispatch, getState) => {
        const topbarMenu = getState().topbarMenu;
        traverseMenu(topbarMenu, (item) => {
            item.label = i18n._(item.label);
        });
        dispatch({
            type: ACTION_UPDATE_STATE,
            state: topbarMenu
        });
    },
    disableMenu: () => (dispatch, getState) => {
        const topbarMenu = getState().topbarMenu;
        menuDisabledCount++;
        traverseMenu(topbarMenu, (item) => {
            item.enabled = false;
        });
        dispatch({
            type: ACTION_UPDATE_STATE,
            state: topbarMenu
        });
    },
    enableMenu: () => (dispatch, getState) => {
        const topbarMenu = getState().topbarMenu;
        menuDisabledCount--;
        traverseMenu(topbarMenu, (item) => {
            item.enabled = true;
        });
        actions.updateMenu()(dispatch);
    },
    updateMenu: () => (dispatch) => {
        dispatch(actions.activeMenu(-1));
    },
    activeMenu: (index) => (dispatch, getState) => {
        if (menuDisabledCount > 0) return;

        const topbarMenu = getState().topbarMenu;
        const series = getState()?.machine?.series;
        const recentFiles = getState().project.general.recentFiles;

        // menu clicked
        topbarMenu.forEach((item, i) => {
            item.active = !!item.active; // undefined to bool
            if (i === index) {
                item.active = !item.active;
            } else {
                item.active = false;
            }
        });
        const fileMenu = topbarMenu.find(item => item.id === 'file');
        const editMenu = topbarMenu.find(item => item.id === 'edit');
        const windowMenu = topbarMenu.find(item => item.id === 'window');
        const getStartedSubmenu = fileMenu.submenu.find(item => item.id === 'get-started');
        const recentFilesSubmenu = fileMenu.submenu.find(item => item.id === 'recent-files');
        const toggleDeveloperToolsSubmenu = windowMenu.submenu.find(item => item.id === 'toggle-developer-tools');

        if (toggleDeveloperToolsSubmenu) {
            toggleDeveloperToolsSubmenu.enabled = isElectron();
        }

        if (recentFilesSubmenu) {
            recentFilesSubmenu.submenu = [
                ...(reverse(cloneDeep(recentFiles)).map(item => {
                    item.label = item.name;
                    item.enabled = true;
                    item.click = function () {
                        UniApi.Event.emit('topbar-menu:open-file', { path: item.path, name: item.name }, []);
                    };
                    return item;
                })),
                ...recentFilesSubmenu.submenu.slice(-2)
            ];
        }

        if (getStartedSubmenu) {
            switch (series) {
                case MACHINE_SERIES.ORIGINAL.value:
                case MACHINE_SERIES.CUSTOM.value:
                    getStartedSubmenu.submenu = caseConfigToMenuItems(CaseConfigOriginal);
                    break;
                case MACHINE_SERIES.A150.value:
                    getStartedSubmenu.submenu = caseConfigToMenuItems(CaseConfig150);
                    break;
                case MACHINE_SERIES.A250.value:
                    getStartedSubmenu.submenu = [
                        ...caseConfigToMenuItems(CaseConfig250),
                        ...caseConfigToMenuItems(CaseConfigA250FourAxis)
                    ];
                    break;
                case MACHINE_SERIES.A350.value:
                    getStartedSubmenu.submenu = [
                        ...caseConfigToMenuItems(CaseConfig350),
                        ...caseConfigToMenuItems(CaseConfigA350FourAxis)
                    ];
                    break;
                default:
                    getStartedSubmenu.submenu = caseConfigToMenuItems(CaseConfig150);
                    break;
            }
        }

        const stateName = hashStateMap[window.location.hash]; // acquire corresponding state according to location hash
        if (stateName) {
            const {
                canUndo,
                canRedo,
                gcodeFile,
                hasModel,
                modelGroup: {
                    selectedModelArray,
                    clipboard
                }
            } = getState()[stateName];

            fileMenu.submenu.forEach(item => {
                switch (item.id) {
                    case 'export-models':
                        if (window.location.hash === '#/3dp' && hasModel) {
                            item.enabled = true;
                        } else {
                            item.enabled = false;
                        }
                        break;
                    case 'export-gcode':
                        item.enabled = !!gcodeFile;
                        break;
                    default: item.enabled = true; break;
                }
            });

            // update Edit menu status
            for (const item of editMenu.submenu) {
                switch (item.id) {
                    case 'select-all': item.enabled = true; break;
                    case 'undo': item.enabled = canUndo; break;
                    case 'redo': item.enabled = canRedo; break;
                    case 'paste':
                        if (clipboard.length > 0) {
                            item.enabled = true;
                        } else {
                            item.enabled = false;
                        }
                        break;
                    case 'cut':
                    case 'copy':
                    case 'duplicate':
                    case 'unselect':
                    case 'delete':
                        if (selectedModelArray.length > 0) {
                            item.enabled = true;
                        } else {
                            item.enabled = false;
                        }
                        break;
                    default: break;
                }
            }
        }
        if (window.location.hash === '#/') {
            fileMenu.submenu.forEach(item => {
                switch (item.id) {
                    case 'save':
                    case 'save-as':
                    case 'import':
                    case 'export-models':
                    case 'export-gcode': item.enabled = false; break;
                    default: item.enabled = true; break;
                }
            });
            editMenu.submenu.forEach(item => { item.enabled = false; });
        }
        if (window.location.hash === '#/workspace') {
            const { gcodeFile } = getState().workspace;
            fileMenu.submenu.forEach(item => {
                switch (item.id) {
                    case 'export-gcode': item.enabled = !!gcodeFile; break;
                    case 'save':
                    case 'save-as':
                    case 'export-models': item.enabled = false; break;
                    default: item.enabled = true; break;
                }
            });
            editMenu.submenu.forEach(item => {
                item.enabled = false;
            });
        }

        dispatch({
            type: ACTION_UPDATE_STATE,
            state: topbarMenu
        });
    },
    hideMenu: () => (dispatch, getState) => {
        const topbarMenu = getState().topbarMenu;
        topbarMenu.forEach((item) => {
            item.active = false;
        });
        dispatch({
            type: ACTION_UPDATE_STATE,
            state: topbarMenu
        });
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign([], state, action.state);
        }
        default: return state;
    }
}
