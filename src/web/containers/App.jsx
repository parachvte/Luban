import React, { Component } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import { Redirect, withRouter } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Workspace from './Workspace';
import Laser from './Laser';
import Cnc from './Cnc';
import Settings from './Settings';
import styles from './App.styl';

class App extends Component {
    static propTypes = {
        ...withRouter.propTypes
    };

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    render() {
        const { location } = this.props;
        const accepted = ([
            '/workspace',
            '/laser',
            '/cnc',
            '/settings',
            '/settings/general',
            '/settings/workspace',
            '/settings/account',
            '/settings/commands',
            '/settings/events',
            '/settings/about'
        ].indexOf(location.pathname) >= 0);

        if (!accepted) {
            return (
                <Redirect
                    to={{
                        pathname: '/workspace',
                        state: {
                            from: location
                        }
                    }}
                />
            );
        }

        return (
            <div>
                <Header {...this.props} />
                <aside className={styles.sidebar} id="sidebar">
                    <Sidebar {...this.props} />
                </aside>
                <div className={styles.main}>
                    <div className={styles.content}>
                        <Workspace
                            {...this.props}
                            style={{
                                display: (location.pathname !== '/workspace') ? 'none' : 'block'
                            }}
                        />

                        <Laser
                            {...this.props}
                            style={{
                                display: (location.pathname !== '/laser') ? 'none' : 'block'
                            }}
                        />

                        <Cnc
                            {...this.props}
                            style={{
                                display: (location.pathname !== '/cnc') ? 'none' : 'block'
                            }}
                        />

                        {location.pathname.indexOf('/settings') === 0 &&
                            <Settings {...this.props} />
                        }

                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(App);
