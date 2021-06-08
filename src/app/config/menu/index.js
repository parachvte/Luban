import isElectron from 'is-electron';
import fileMenu from './fileMenu';
import editMenu from './editMenu';
import settingsMenu from './settingsMenu';
import windowMenu from './windowMenu';
import helpMenu from './helpMenu';
import UniApi from '../../lib/uni-api';

const menuItems = [
    fileMenu,
    editMenu,
    windowMenu,
    settingsMenu,
    {
        id: 'connection',
        label: 'Connection',
        submenu: [
            {
                label: 'Connection',
                enabled: true,
                click: (menuItem, browserWindow) => {
                    if (isElectron()) {
                        browserWindow.webContents.send('navigate-to-workspace');
                    } else {
                        UniApi.Event.emit('navigate-to-workspace');
                    }
                }
            }
        ]
    },
    helpMenu
];

function onClickPreferences(menuItem, browserWindow) {
    browserWindow.send('preferences.show', { activeTab: 'general' });
}

function getMenuItems() {
    if (process && process.platform === 'darwin') {
        // About
        menuItems.unshift({
            label: window.require('electron').remote.app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'Preferences...',
                    accelerator: 'CommandOrControl+,',
                    click: onClickPreferences
                },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                {
                    role: 'hide',
                    label: 'Hide'
                },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                {
                    role: 'quit',
                    label: 'Quit'
                }
            ]
        });
    }
    console.log('menu-items', menuItems);
    return menuItems;
}

export {
    getMenuItems
};
