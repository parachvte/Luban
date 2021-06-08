import isElectron from 'is-electron';
import UniApi from '../../lib/uni-api';

export default {
    id: 'edit',
    label: 'Edit',
    // active: true,
    submenu: [
        {
            id: 'undo',
            label: 'Undo',
            accelerator: 'CommandOrControl+Z',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+z', 'undo');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+z', 'undo');
                    }
                }
            }
        },
        {
            id: 'redo',
            label: 'Redo',
            accelerator: 'CommandOrControl+Shift+Z',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+shift+z', 'redo');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+shift+z', 'redo');
                    }
                }
            }
        },
        { id: 'line-1', type: 'separator' },
        {
            id: 'cut',
            label: 'Cut',
            accelerator: 'CommandOrControl+X',
            enabled: true,
            click: () => {}
        },
        {
            id: 'copy',
            label: 'Copy',
            accelerator: 'CommandOrControl+C',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+c');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+c');
                    }
                }
            }
        },
        {
            id: 'duplicate',
            label: 'Duplicate',
            accelerator: 'CommandOrControl+D',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+d');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+d');
                    }
                }
            }
        },
        {
            id: 'paste',
            label: 'Paste',
            accelerator: 'CommandOrControl+V',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+v');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+v');
                    }
                }
            }
        },
        { id: 'line-2', type: 'separator' },
        {
            id: 'select-all',
            label: 'Select All',
            accelerator: 'CommandOrControl+A',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'mod+a');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'mod+a');
                    }
                }
            }
        },
        {
            id: 'unselect',
            label: 'Unselect',
            // accelerator: 'CommandOrControl',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'esc');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'esc');
                    }
                }
            }
        },
        { id: 'line-3', type: 'separator' },
        {
            id: 'delete',
            label: 'Delete',
            accelerator: 'Delete',
            enabled: true,
            click(menuItem, browserWindow) {
                if (isElectron()) {
                    browserWindow.webContents.send('shortcut', 'del');
                } else {
                    if (this.enabled) {
                        UniApi.Event.emit('topbar-menu:shortcut', 'del');
                    }
                }
            }
        }
    ]
};
