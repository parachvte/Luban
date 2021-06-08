import React, { PureComponent } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Anchor from '../../components/Anchor';
import styles from './styles.styl';

class VisualizerBottomLeft extends PureComponent {
    static propTypes = {
        zoomIn: PropTypes.func.isRequired,
        zoomOut: PropTypes.func.isRequired,
        toFront: PropTypes.func.isRequired
    };

    render() {
        return (
            <div className={classNames(styles['camera-operation'])}>
                <Anchor
                    className={classNames(styles['zoom-button'], styles['to-front'])}
                    onClick={this.props.toFront}
                />
                <Anchor
                    className={classNames(styles['zoom-button'], styles['zoom-in'])}
                    onClick={this.props.zoomIn}
                />
                <Anchor
                    className={classNames(styles['zoom-button'], styles['zoom-out'])}
                    onClick={this.props.zoomOut}
                />
            </div>
        );
    }
}

export default VisualizerBottomLeft;
