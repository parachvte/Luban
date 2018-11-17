import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
// import Anchor from '../../components/Anchor';
// import i18n from '../../lib/i18n';
// import styles from './styles.styl';
import * as THREE from 'three';
import {
    WEB_CACHE_IMAGE,
} from '../../constants';
import { NumberInput as Input } from '../../components/Input';
import TargetPoint from '../Visualizer/TargetPoint';

class VisualizerTopLeft extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            onChangeFile: PropTypes.func
        }),
        state: PropTypes.object
    };

    fileInputEl = null;

    actions = {
        onClickToUpload: () => {
            this.fileInputEl.value = null;
            this.fileInputEl.click();
        }
    };

    render() {
        const actions = { ...this.props.actions, ...this.actions };
        const state = this.props.state;
        return (
            <React.Fragment>
                <div> Double Head </div>
                X: <Input
                    style={{ width: '93px' }}
                    value={state.csL1.position.x}
                    onChange={value => {
                        actions.goRun('X', value);
                        state.csL1.position.x = value;
                    }}
                /> <br/>
                Y: <Input
                    style={{ width: '93px' }}
                    value={state.csL2.position.y}
                    onChange={value => {
                        actions.goRun('Y', value);
                        state.csL2.position.y = value;
                    }}
                /> <br/>
                Z: <Input
                    style={{ width: '93px' }}
                    value={state.csL3.position.z}
                    onChange={value => {
                        actions.goRun('Z', value);
                        state.csL3.position.z = value;
                    }}
                /> <br/>
                B: <Input
                    style={{ width: '93px' }}
                    value={-state.csL5.rotation.y / Math.PI * 180}
                    onChange={value => {
                        actions.goRun('A', value);
                        state.csL5.rotation.y = -value / 180 * Math.PI;
                    }}
                /> <br/>
                C: <Input
                    style={{ width: '93px' }}
                    value={-state.csL4.rotation.z / Math.PI * 180}
                    onChange={value => {
                        actions.goRun('C', value);
                        state.csL4.rotation.z = -value / 180 * Math.PI;
                    }}
                />
                <br/>

                <button
                    type="button"
                    onClick={() => {
                        let filePath = `${WEB_CACHE_IMAGE}/1001.json`;
                        const loader = new THREE.FileLoader();
                        loader.load(filePath, (data) => {
                            const dataObj = JSON.parse(data);
                            console.log(dataObj.length);

                            let minX = Number.MAX_VALUE;
                            let minY = Number.MAX_VALUE;
                            let minZ = Number.MAX_VALUE;
                            for (let obj of dataObj) {
                                if (obj.X) {
                                    minX = Math.min(minX, obj.X);
                                }
                                if (obj.Y) {
                                    minY = Math.min(minY, obj.Y);
                                }
                                if (obj.Z) {
                                    minZ = Math.min(minZ, obj.Z);
                                }
                            }

                            for (let obj of dataObj) {
                                obj.X = 40 + obj.X - minX;
                                obj.Y = 40 + obj.Y - minY;
                                obj.Z = 40 + obj.Z - minZ;
                            }

                            const TIME_INTERVAL = 100;
                            const STEP = 10;
                            let flag = true;
                            function animateGen(i) {
                                function animate() {
                                    let obj = dataObj[i];
                                    if (!obj) {
                                        return;
                                    }
                                    console.log(`i: ${i} : ${JSON.stringify(dataObj[i])}`);
                                    if (obj.X) {
                                        state.csL1.position.x = obj.X;
                                    }
                                    if (obj.Y) {
                                        state.csL2.position.y = obj.Y;
                                    }
                                    if (obj.Z) {
                                        state.csL3.position.z = 250 - obj.Z;
                                    }
                                    if (obj.C) {
                                        state.csL4.rotation.z = -obj.C / 180 * Math.PI;
                                    }
                                    if (obj.B) {
                                        state.csL5.rotation.x = obj.B / 180 * Math.PI;
                                    }

                                    state.toolhead.updateMatrixWorld();
                                    // let t = new THREE.Matrix4();
                                    // let cur = state.toolhead;
                                    // new THREE.Matrix4().multiplyMatrices(t, cur.matrix);
                                    // while (cur !== state.world) {
                                    //     cur = cur.parent;
                                    //     new THREE.Matrix4().multiplyMatrices(t, cur.matrix);
                                    // }

                                    // let matrixWorld = state.toolhead.matrixWorld;
                                    // let toolHeadMarker = new TargetPoint();
                                    // state.world.add(toolHeadMarker);
                                    // toolHeadMarker.applyMatrix(matrixWorld);
                                    // let vMarker = toolHeadMarker.getWorldPosition(new THREE.Vector3(0, 0, 0));
                                    // console.log(vMarker);
                                    // let vMarker = state.toolhead.position;
                                    // vMarker.applyMatrix4(matrixWorld);

                                    // function getGroupPosition(toolhead, v) {
                                    //     while (toolhead !== state.world) {
                                    //         // let inverse = new THREE.Matrix4();
                                    //         // toolhead.matrix.getInverse(inverse);
                                    //         v.applyMatrix4(new THREE.Matrix4().getInverse(toolhead.matrix));
                                    //         toolhead = toolhead.parent;
                                    //     }
                                    //     return v;
                                    // }
                                    let vMarker = state.toolhead.getWorldPosition(new THREE.Vector3(0, 0, 0));
                                    // let vMarker = getGroupPosition(state.toolhead, new THREE.Vector3(0, 0, 0));
                                    // // console.log(vMarker);
                                    // // vMarker = new THREE.Vector3(i / 100, i / 100, i / 100);
                                    let positions = state.pathLine.geometry.attributes.position.array;

                                    let idx = Math.trunc(i / STEP + 2) * 3;
                                    // console.log(idx);
                                    positions[idx] = vMarker.x;
                                    positions[idx + 1] = vMarker.y;
                                    positions[idx + 2] = vMarker.z;
                                    // state.pathGeometry.vertices.push(vMarker);
                                    // state.pathGeometry.vertices.verticesNeedUpdate = true;
                                    state.pathLine.geometry.attributes.position.needsUpdate = true;

                                    if (!flag && i > dataObj.length / 2) {
                                        flag = true;
                                        setTimeout(animateGen(i + STEP), 10000);
                                    } else {
                                        setTimeout(animateGen(i + STEP), TIME_INTERVAL);
                                    }
                                }
                                return animate;
                            }

                            animateGen(0)();
                        });
                    }}
                >
                    Preview GCode
                </button>

                <div> Head & Table </div>
                X: <Input
                    style={{ width: '93px' }}
                    // value='0'
                    onChange={value => {
                        actions.goRun('X', value);
                        state.csL1.position.x = value;
                    }}
                /> <br/>
                Y: <Input
                    style={{ width: '93px' }}
                    // value='0'
                    onChange={value => {
                        actions.goRun('Y', value);
                        state.csL2.position.y = value;
                    }}
                /> <br/>
                Z: <Input
                    style={{ width: '93px' }}
                    // value='0'
                    onChange={value => {
                        actions.goRun('Z', value);
                        state.csL3.position.z = value;
                    }}
                /> <br/>
                A: <Input
                    style={{ width: '93px' }}
                    // value='0'
                    onChange={value => {
                        actions.goRun('A', value);
                        state.csL4.rotation.x = value / 180 * Math.PI;
                    }}
                /> <br/>
                B: <Input
                    style={{ width: '93px' }}
                    // value='0'
                    onChange={value => {
                        actions.goRun('B', value);
                        state.csL5.rotation.y = value / 180 * Math.PI;
                    }}
                />
                <br/>
                <button
                    type="button"
                    onClick={() => {
                        // Head & Table animation
                        for (let iX = 100; iX <= 125; iX += 10) {
                            for (let iY = 100; iY <= 125; iY += 10) {
                                for (let iZ = 100; iZ <= 125; iZ += 10) {
                                    for (let iB = 0; iB <= 360; iB += 10) {
                                        for (let iA = 0; iA <= 90; iA += 10) {
                                            state.csL5.rotation.y = iB / 180 * Math.PI;
                                            state.csL4.rotation.x = iA / 180 * Math.PI;
                                            state.csL1.position.x = iX;
                                            state.csL2.position.y = iY;
                                            state.csL3.position.z = iZ;

                                            state.toolhead.updateMatrixWorld();
                                            let matrixWorld = state.toolhead.matrixWorld;
                                            let toolHeadMarker = new TargetPoint();
                                            state.world.add(toolHeadMarker);
                                            toolHeadMarker.applyMatrix(matrixWorld);
                                        }
                                    }
                                }
                            }
                        }
                    }}
                >
                    Calcuate WorkSpace
                </button>
                <br/>
                <button
                    type="button"
                    onClick={() => {
                        // Head & Table animation
                        const TIME_INTERVAL = 10;
                        function animateFuncGen(iX, iY, iZ, iA, iB) {
                            function animate() {
                                console.log(iX, iY, iZ, iA, iB);
                                state.csL5.rotation.y = iB / 180 * Math.PI;
                                state.csL4.rotation.x = iA / 180 * Math.PI;
                                state.csL1.position.x = iX;
                                state.csL2.position.y = iY;
                                state.csL3.position.z = iZ;

                                state.toolhead.updateMatrixWorld();
                                let matrixWorld = state.toolhead.matrixWorld;
                                let toolHeadMarker = new TargetPoint();
                                state.world.add(toolHeadMarker);
                                toolHeadMarker.applyMatrix(matrixWorld);
                                if (iA < 90) {
                                    setTimeout(animateFuncGen(iX, iY, iZ, iA + 10, iB), TIME_INTERVAL);
                                } else {
                                    iA = 0;
                                    if (iB < 360) {
                                        setTimeout(animateFuncGen(iX, iY, iZ, iA, iB + 10), TIME_INTERVAL);
                                    } else {
                                        iB = 0;
                                        if (iZ < 125) {
                                            setTimeout(animateFuncGen(iX, iY, iZ + 1, iA, iB), TIME_INTERVAL);
                                        } else {
                                            iZ = 100;
                                            if (iY < 125) {
                                                setTimeout(animateFuncGen(iX, iY + 1, iZ, iA, iB), TIME_INTERVAL);
                                            } else {
                                                iY = 0;
                                                if (iX < 125) {
                                                    setTimeout(animateFuncGen(iX + 1, iY, iZ, iA, iB), TIME_INTERVAL);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return animate;
                        }

                        animateFuncGen(100, 100, 100, 0, 0)();
                    }}
                >
                    Animate
                </button>
            </React.Fragment>
        );
    }
}

export default VisualizerTopLeft;
