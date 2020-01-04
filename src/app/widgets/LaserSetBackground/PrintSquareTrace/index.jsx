import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Slider from 'rc-slider';
import PropTypes from 'prop-types';
import i18n from '../../../lib/i18n';
import { NumberInput as Input } from '../../../components/Input';
import { controller } from '../../../lib/controller';
import styles from '../styles.styl';
import { actions as workspaceActions } from '../../../flux/workspace';
import PrintPreview from './PrintPreview';


function generateSquareGcode(size, sideLength, power) {
    // M3: laser on
    // M5: laser off
    const gcodeArray = [];
    const p0 = {
        x: (size.x - sideLength) / 2,
        y: (size.y - sideLength) / 2
    };
    const p1 = {
        x: p0.x + sideLength,
        y: p0.y
    };
    const p2 = {
        x: p0.x + sideLength,
        y: p0.y + sideLength
    };
    const p3 = {
        x: p0.x,
        y: p0.y + sideLength
    };
    // power in percentage
    // priority: P > S, for compatibility, use both P and S args.
    const powerStrength = Math.floor(power * 255 / 100);
    const workSpeed = 1500;

    gcodeArray.push(';Laser Square G-code Generated by Snapmaker Artisan.');
    gcodeArray.push(`;powerPercent: ${power}`);
    gcodeArray.push(`;workSpeed: ${workSpeed}`);

    gcodeArray.push('M5'); // Turn off laser if it's turned on

    // move x&y to zero
    gcodeArray.push('G91'); // relative position
    gcodeArray.push(`G0 X${-size.x - 10} F400`);
    gcodeArray.push('G0 X8');
    gcodeArray.push(`G0 Y${-size.y - 10} F400`);
    gcodeArray.push('G0 Y2');

    gcodeArray.push(`G0 F${workSpeed}`);
    gcodeArray.push(`G1 F${workSpeed}`);

    gcodeArray.push('G90'); // absolute position
    gcodeArray.push('G21'); // set units to mm
    gcodeArray.push('G92 X0 Y0'); // set work origin

    gcodeArray.push(`G0 X${p0.x} Y${p0.y}`);
    // set M3 power
    gcodeArray.push(`M3 P${power} S${powerStrength}`);
    gcodeArray.push(`G1 X${p0.x} Y${p0.y}`);
    gcodeArray.push(`G1 X${p1.x} Y${p1.y}`);
    gcodeArray.push(`G1 X${p2.x} Y${p2.y}`);
    gcodeArray.push(`G1 X${p3.x} Y${p3.y}`);
    gcodeArray.push(`G1 X${p0.x} Y${p0.y}`);
    gcodeArray.push('M5');
    // Push plate out & move laser head to left for taking photo
    gcodeArray.push(`G0 X0 Y${size.y}`);
    gcodeArray.push('\n');
    return gcodeArray.join('\n');
}


class PrintSquareTrace extends PureComponent {
    static propTypes = {
        size: PropTypes.object.isRequired,
        addGcode: PropTypes.func.isRequired,
        clearGcode: PropTypes.func.isRequired,
        state: PropTypes.shape({
            sideLength: PropTypes.number.isRequired
        }),
        actions: PropTypes.shape({
            changeSideLength: PropTypes.func.isRequired,
            checkConnectionStatus: PropTypes.func.isRequired
        })
    };

    state = {
        power: 68
    };

    actions = {
        setSideLength: (sideLength) => {
            this.props.actions.changeSideLength(sideLength);
        },
        setPower: (power) => {
            this.setState({ power });
        },
        printSquareTrace: () => {
            if (!this.props.actions.checkConnectionStatus()) {
                return;
            }
            const { size } = this.props;
            const { power } = this.state;
            const { sideLength } = this.props.state;

            const gcodeStr = generateSquareGcode(size, sideLength, power);
            this.props.clearGcode();
            this.props.addGcode('Laser Coordinating G-code.nc', gcodeStr);

            setTimeout(() => {
                controller.command('gcode:start');
            }, 1000);
        }
    };

    render() {
        const { size } = this.props;
        const actions = { ...this.props.actions, ...this.actions };
        const state = { ...this.props.state, ...this.state };

        const maxSideLength = Math.min(size.x, size.y);
        const minSideLength = Math.min(maxSideLength / 2, maxSideLength);

        return (
            <div>
                <div className="clearfix" />
                <div className={styles['laser-set-background-modal-title']}>
                    {i18n._('Print Square Trace')}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <PrintPreview
                        size={size}
                        sideLength={this.props.state.sideLength}
                        width={400}
                        height={400}
                    />
                </div>
                <div style={{ height: '74px', margin: '20px 60px' }}>
                    <table className={styles['parameter-table']}>
                        <tbody>
                            <tr>
                                <td>
                                    {i18n._('Side Length')}
                                </td>
                                <td style={{ width: '50%', paddingRight: '15px' }}>
                                    <Slider
                                        value={this.props.state.sideLength}
                                        min={minSideLength}
                                        max={maxSideLength}
                                        onChange={actions.setSideLength}
                                    />
                                </td>
                                <td style={{ width: '48px' }}>
                                    <Input
                                        value={this.props.state.sideLength}
                                        min={minSideLength}
                                        max={maxSideLength}
                                        onChange={actions.setSideLength}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {i18n._('Power (%)')}
                                </td>
                                <td style={{ width: '50%', paddingRight: '15px' }}>
                                    <Slider
                                        value={state.power}
                                        min={0.1}
                                        max={100}
                                        onChange={actions.setPower}
                                    />
                                </td>
                                <td style={{ width: '48px' }}>
                                    <Input
                                        min={0.1}
                                        max={100}
                                        value={state.power}
                                        onChange={actions.setPower}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ margin: '20px 60px' }}>
                    <button
                        type="button"
                        className="sm-btn-large sm-btn-primary"
                        onClick={actions.printSquareTrace}
                        style={{ width: '40%', float: 'left' }}
                    >
                        {i18n._('Print Square Trace')}
                    </button>
                    <button
                        type="button"
                        className="sm-btn-large sm-btn-primary"
                        onClick={actions.displayExtractTrace}
                        style={{ width: '40%', float: 'right' }}
                    >
                        {i18n._('Next')}
                    </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const machine = state.machine;
    return {
        size: machine.size
    };
};

const mapDispatchToProps = (dispatch) => ({
    addGcode: (name, gcode, renderMethod) => dispatch(workspaceActions.addGcode(name, gcode, renderMethod)),
    clearGcode: () => dispatch(workspaceActions.clearGcode())
});


export default connect(mapStateToProps, mapDispatchToProps)(PrintSquareTrace);
