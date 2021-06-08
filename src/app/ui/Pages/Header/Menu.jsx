import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { actions as menuActions } from '../../../flux/navbar-menu';
import Submenu from './Submenu';
import styles from './styles.styl';


class Menu extends PureComponent {
    static propTypes = {
        items: PropTypes.array,
        className: PropTypes.string,
        activeMenu: PropTypes.func,
        hideMenu: PropTypes.func
    }

    actions = {
        activeMenu: (index) => {
            if (typeof this.props.items[index].click === 'function') {
                this.props.items[index].click();
            }
            this.props.activeMenu(index);
        },
        hideMenu: () => {
            // todo hide
            this.props.hideMenu();
        }
    }

    componentDidMount() {
        // window.document.body.addEventListener('click', this.actions.hideMenu);
    }

    componentWillUnmount() {
        // window.document.body.removeEventListener('click', this.actions.hideMenu);
    }

    render() {
        return (
            <ul className={classNames(styles['lu-navbar-menu'], this.props.className)}>
                {
                    this.props.items.map((item, index) => {
                        if (item.type === 'separator') {
                            return (<li key={item.id} className={styles.separator} />);
                        } else {
                            return (
                                <li key={item.label ? item.label : item.id} className={classNames(styles['menu-item'])}>
                                    <span role="button" tabIndex="0" onKeyPress={() => {}} className={styles.label} onClick={(e) => { e.stopPropagation(); this.actions.activeMenu(index); }}>{item.label}{item.active}</span>
                                    { item.accelerator ? <span className={styles.accelerator}>{item.accelerator.replace(/CommandOrControl|CmdOrCtrl/ig, 'Ctrl')}</span> : ''}
                                    { item.active ? <Submenu className={classNames(styles['menu-submenu'], styles['sub-2'])} items={item.submenu} /> : '' }
                                </li>
                            );
                        }
                    })
                }
            </ul>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        items: state.navbarMenu
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        activeMenu: (index) => dispatch(menuActions.activeMenu(index)),
        hideMenu: () => dispatch(menuActions.hideMenu())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
