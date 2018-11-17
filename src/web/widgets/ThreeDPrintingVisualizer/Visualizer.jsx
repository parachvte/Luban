import React, { PureComponent } from 'react';
import FileSaver from 'file-saver';
import path from 'path';
import pubsub from 'pubsub-js';
import * as THREE from 'three';
import jQuery from 'jquery';
import {
    WEB_CACHE_IMAGE,
    ACTION_REQ_GENERATE_GCODE_3DP,
    ACTION_REQ_LOAD_GCODE_3DP,
    ACTION_REQ_EXPORT_GCODE_3DP,
    ACTION_3DP_GCODE_OVERSTEP_CHANGE,
    ACTION_3DP_MODEL_OVERSTEP_CHANGE,
    ACTION_CHANGE_STAGE_3DP,
    ACTION_3DP_EXPORT_MODEL,
    ACTION_3DP_LOAD_MODEL,
    STAGES_3DP
} from '../../constants';
import i18n from '../../lib/i18n';
import modal from '../../lib/modal';
import controller from '../../lib/controller';
import api from '../../api';
import VisualizerProgressBar from './VisualizerProgressBar';
import VisualizerTopLeft from './VisualizerTopLeft';
import VisualizerModelTransformation from './VisualizerModelTransformation';
import VisualizerCameraOperations from './VisualizerCameraOperations';
import VisualizerPreviewControl from './VisualizerPreviewControl';
import VisualizerInfo from './VisualizerInfo';
import ControlAxis from './ControlAxis';
import Canvas from './Canvas';
import ModelLoader from './ModelLoader';
import ModelExporter from './ModelExporter';
import GCodeRenderer from './GCodeRenderer';
import Model from './Model';
import ModelGroup from './ModelGroup';
import ContextMenu from './ContextMenu';
import styles from './styles.styl';
import TargetPoint from '../Visualizer/TargetPoint';

const MATERIAL_NORMAL = new THREE.MeshPhongMaterial({ color: 0xe0e0e0, specular: 0xb0b0b0, shininess: 30 });
const MATERIAL_OVERSTEPPED = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 30,
    transparent: true,
    opacity: 0.6
});

class Visualizer extends PureComponent {
    gcodeRenderer = new GCodeRenderer();
    state = this.getInitialState();
    contextMenuDomElement = null;
    visualizerDomElement = null;
    getInitialState() {
        const DOUBLE_HEAD = true;
        const HEAD_TABLE = false;
        // Double Head
        let previwObject = new THREE.Object3D();
        let L1 = new THREE.Object3D();
        let L2 = new THREE.Object3D();
        let L3 = new THREE.Object3D();
        let L4 = new THREE.Object3D();
        let L5 = new THREE.Object3D();
        let toolhead = new TargetPoint();
        let pathGeometry = new THREE.BufferGeometry();
        let positions = new Float32Array(1000000 * 3);
        pathGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        let drawCount = 1000000;
        pathGeometry.setDrawRange(0, drawCount);

        let pathLine = new THREE.Line(pathGeometry, new THREE.LineBasicMaterial({ color: 0xffff00 }));

        positions = pathLine.geometry.attributes.position.array;
        positions[0] = 0;
        positions[1] = 0;
        positions[2] = 0;
        positions[3] = 250;
        positions[4] = 250;
        positions[5] = 250;
        pathLine.geometry.attributes.position.needsUpdate = true;

        let xWidth = 250;
        let yWidth = 250;
        let zWidth = 250;
        let pivotDistance = 27.5;
        let cAxisOffset = 63.75;
        let toolBodyLength = 30;

        if (DOUBLE_HEAD) {
            previwObject.add(L1);
            L1.position.set(xWidth, 0, 0);
            L1.add(L2);
            L2.position.set(0, yWidth, 0);
            L2.add(L3);
            L3.position.set(0, 0, zWidth);
            L3.add(L4);
            L4.position.set(0, 0, 0);
            L4.add(L5);
            L5.position.set(cAxisOffset, 0, 0);

            let l1M = new THREE.LineBasicMaterial({ color: 0xff0000 });
            let l1A = new THREE.Vector3(0, 0, 0);
            let l1B = new THREE.Vector3(xWidth, 0, 0);
            let l1G = new THREE.Geometry();
            l1G.vertices.push(l1A);
            l1G.vertices.push(l1B);
            let l1 = new THREE.Line(l1G, l1M);
            previwObject.add(l1);

            let l2M = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            let l2A = new THREE.Vector3(0, 0, 0);
            let l2B = new THREE.Vector3(0, yWidth, 0);
            let l2G = new THREE.Geometry();
            l2G.vertices.push(l2A);
            l2G.vertices.push(l2B);
            let l2 = new THREE.Line(l2G, l2M);
            L1.add(l2);

            let l3M = new THREE.LineBasicMaterial({ color: 0x0000ff });
            let l3A = new THREE.Vector3(0, 0, 0);
            let l3B = new THREE.Vector3(0, 0, zWidth);
            let l3G = new THREE.Geometry();
            l3G.vertices.push(l3A);
            l3G.vertices.push(l3B);
            let l3 = new THREE.Line(l3G, l3M);
            L2.add(l3);

            let l4M = new THREE.LineBasicMaterial({ color: 0x0000ff });
            let l4A = new THREE.Vector3(0, 0, 0);
            let l4B = new THREE.Vector3(0, 0, 0);
            let l4G = new THREE.Geometry();
            l4G.vertices.push(l4A);
            l4G.vertices.push(l4B);
            let l4 = new THREE.Line(l4G, l4M);
            L3.add(l4);

            let l5M = new THREE.LineBasicMaterial({ color: 0x0000ff });
            let l5A = new THREE.Vector3(0, 0, 0);
            let l5B = new THREE.Vector3(cAxisOffset, 0, 0);
            let l5G = new THREE.Geometry();
            l5G.vertices.push(l5A);
            l5G.vertices.push(l5B);
            let l5 = new THREE.Line(l5G, l5M);
            L4.add(l5);

            let l6M = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            let l6A = new THREE.Vector3(0, 0, 0);
            let l6B = new THREE.Vector3(0, 0, toolBodyLength + pivotDistance);
            let l6G = new THREE.Geometry();
            l6G.vertices.push(l6A);
            l6G.vertices.push(l6B);
            let l6 = new THREE.Line(l6G, l6M);
            L5.add(l6);
            L5.add(toolhead);
            toolhead.position.set(0, 0, toolBodyLength + pivotDistance);
        }
        // Head & Table
        if (HEAD_TABLE) {
            previwObject.add(L1);
            L1.position.set(125, 0, 0);
            L1.add(L2);
            L2.position.set(0, 125, 0);
            L2.add(L3);
            L3.position.set(0, 0, 125);
            L3.add(L4);
            L4.position.set(0, -20, 0);
            previwObject.add(L5);
            let l1M = new THREE.LineBasicMaterial({ color: 0xff0000 });
            let l1A = new THREE.Vector3(0, 0, 0);
            let l1B = new THREE.Vector3(125, 0, 0);
            let l1G = new THREE.Geometry();
            l1G.vertices.push(l1A);
            l1G.vertices.push(l1B);
            let l1 = new THREE.Line(l1G, l1M);
            L5.add(l1);
            L5.add(L1);

            let l2M = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            let l2A = new THREE.Vector3(0, 0, 0);
            let l2B = new THREE.Vector3(0, 125, 0);
            let l2G = new THREE.Geometry();
            l2G.vertices.push(l2A);
            l2G.vertices.push(l2B);
            let l2 = new THREE.Line(l2G, l2M);
            L1.add(l2);

            let l3M = new THREE.LineBasicMaterial({ color: 0x0000ff });
            let l3A = new THREE.Vector3(0, 0, 0);
            let l3B = new THREE.Vector3(0, 0, 125);
            let l3G = new THREE.Geometry();
            l3G.vertices.push(l3A);
            l3G.vertices.push(l3B);
            let l3 = new THREE.Line(l3G, l3M);
            L2.add(l3);

            let l4M = new THREE.LineBasicMaterial({ color: 0x0000ff });
            let l4A = new THREE.Vector3(0, 0, 0);
            let l4B = new THREE.Vector3(0, -20, 0);
            let l4G = new THREE.Geometry();
            l4G.vertices.push(l4A);
            l4G.vertices.push(l4B);
            let l4 = new THREE.Line(l4G, l4M);
            L3.add(l4);

            let l5M = new THREE.LineBasicMaterial({ color: 0xff0000 });
            let l5A = new THREE.Vector3(0, 0, 0);
            let l5B = new THREE.Vector3(0, -10, 0);
            let l5G = new THREE.Geometry();
            l5G.vertices.push(l5A);
            l5G.vertices.push(l5B);
            let l5 = new THREE.Line(l5G, l5M);

            toolhead.position.set(0, -10, 0);
            L4.add(toolhead);
            L4.add(l5);
        }
        return {
            stage: STAGES_3DP.noModel,
            world: null,
            csL1: L1,
            csL2: L2,
            csL3: L3,
            csL4: L4,
            csL5: L5,
            previewObject: previwObject,
            toolhead: toolhead,
            pathGeometry: pathGeometry,
            pathLine: pathLine,

            modelGroup: new ModelGroup(new THREE.Box3(
                // use -0.1 to handle accuracy
                new THREE.Vector3(-125 / 2, -0.1, -125 / 2),
                new THREE.Vector3(125 / 2, 125, 125 / 2)
            )),
            selectedModel: null,
            selectedModelBoundingBox: null,
            selectedModelPath: '',

            allModelBoundingBoxUnion: null,

            // translate/scale/rotate
            transformMode: 'translate',

            // undo/redo
            canUndo: false,
            canRedo: false,

            // selected model transform info
            moveX: 0,
            moveY: 0,
            moveZ: 0,
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,

            // slice info
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,

            // G-code
            gcodeLineGroup: new THREE.Group(),
            gcodeLine: null,

            layerCount: 0,
            layerCountDisplayed: 0,

            // progress bar
            progressTitle: '',
            progress: 0,

            gcodeTypeInitialVisibility: {},

            contextMenuVisible: false,
            contextMenuTop: '0px',
            contextMenuLeft: '0px',

            _: 0 // placeholder
        };
    }

    actions = {
        goRun: () => {

        },
        // topLeft
        onChangeFile: (event) => {
            const file = event.target.files[0];
            this.uploadAndParseFile(file);
        },
        // preview
        showGcodeType: (type) => {
            this.gcodeRenderer.showType(type);
        },
        hideGcodeType: (type) => {
            this.gcodeRenderer.hideType(type);
        },
        showGcodeLayers: (count) => {
            count = (count > this.state.layerCount) ? this.state.layerCount : count;
            count = (count < 0) ? 0 : count;
            this.setState({
                layerCountDisplayed: count
            });
            this.gcodeRenderer.showLayers(count);
        },
        undo: () => {
            this.state.modelGroup.undo();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        redo: () => {
            this.state.modelGroup.redo();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        // transform mode
        setTransformMode: (value) => {
            this.setState({
                transformMode: value
            });
        },
        onModelTransform: () => {
            // position/rotate/scale changing
            const selectedModel = this.state.modelGroup.getSelectedModel();
            this.setState({
                moveX: selectedModel.position.x,
                moveY: selectedModel.position.y,
                moveZ: selectedModel.position.z,
                scale: selectedModel.scale.x,
                rotateX: selectedModel.rotation.x,
                rotateY: selectedModel.rotation.y,
                rotateZ: selectedModel.rotation.z
            });
        },
        onModelAfterTransform: () => {
            this.state.selectedModel.alignWithParent();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        selectModel: (model) => {
            this.state.modelGroup.selectModel(model);
            this.setStateForModelChanged();
        },
        unselectAllModels: () => {
            this.state.modelGroup.unselectAllModels();
            this.setStateForModelChanged();
        },
        // change stage
        setStageToNoModel: () => {
            this.state.modelGroup.visible = false;
            this.state.gcodeLineGroup.visible = false;
            this.setState({
                stage: STAGES_3DP.noModel
            });
            this.state.modelGroup.unselectAllModels();
            pubsub.publish(ACTION_CHANGE_STAGE_3DP, { stage: STAGES_3DP.noModel });
        },
        setStageToModelLoaded: () => {
            this.state.modelGroup.visible = true;
            this.state.gcodeLineGroup.visible = false;
            this.setState({
                stage: STAGES_3DP.modelLoaded,
                progress: 100,
                progressTitle: i18n._('Loaded model successfully.')
            });
            pubsub.publish(ACTION_CHANGE_STAGE_3DP, { stage: STAGES_3DP.modelLoaded });
        },
        setStageToGcodeRendered: () => {
            this.state.modelGroup.visible = false;
            this.state.gcodeLineGroup.visible = true;
            this.setState({
                stage: STAGES_3DP.gcodeRendered
            });
            this.state.modelGroup.unselectAllModels();
            pubsub.publish(ACTION_CHANGE_STAGE_3DP, { stage: STAGES_3DP.gcodeRendered });
        },
        // context menu functions
        centerSelectedModel: () => {
            this.state.selectedModel.position.x = 0;
            this.state.selectedModel.position.z = 0;
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        deleteSelectedModel: () => {
            this.state.modelGroup.removeSelectedModel();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        multiplySelectedModel: (count) => {
            this.state.modelGroup.multiplySelectedModel(count);
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        clearBuildPlate: () => {
            this.state.modelGroup.removeAllModels();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        arrangeAllModels: () => {
            this.state.modelGroup.arrangeAllModels();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        resetSelectedModelTransformation: () => {
            this.state.modelGroup.resetSelectedModelTransformation();
            this.state.selectedModel.alignWithParent();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        layFlatSelectedModel: () => {
            this.state.selectedModel.layFlat();
            this.state.modelGroup.recordModelsState();
            this.checkModelsOverstepped();
            this.setStateForModelChanged();
            this.destroyGcodeLine();
        },
        hideContextMenu: () => {
            this.setState({ contextMenuVisible: false });
        }
    };

    uploadAndParseFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        api.uploadFile(formData).then((res) => {
            const file = res.body;
            const modelPath = `${WEB_CACHE_IMAGE}/${file.filename}`;
            this.parseModel(modelPath);
        }).catch(() => {
            modal({
                title: i18n._('Parse File Error'),
                body: i18n._('Failed to parse image file {{filename}}', { filename: file.filename })
            });
        });
    }

    checkModelsOverstepped() {
        const overstepped = this.state.modelGroup.checkModelsOverstepped();
        pubsub.publish(ACTION_3DP_MODEL_OVERSTEP_CHANGE, { overstepped: overstepped });
    }
    setStateForModelChanged() {
        const selectedModel = this.state.modelGroup.getSelectedModel();
        if (selectedModel) {
            selectedModel.computeBoundingBox();
        }
        this.state.modelGroup.hasModel() ? this.actions.setStageToModelLoaded() : this.actions.setStageToNoModel();
        this.setState({
            selectedModel: selectedModel,
            selectedModelBoundingBox: selectedModel ? selectedModel.boundingBox : null,
            selectedModelPath: selectedModel ? selectedModel.modelPath : null,
            canUndo: this.state.modelGroup.canUndo(),
            canRedo: this.state.modelGroup.canRedo(),
            moveX: selectedModel ? selectedModel.position.x : 0,
            moveY: selectedModel ? selectedModel.position.y : 0,
            moveZ: selectedModel ? selectedModel.position.z : 0,
            scale: selectedModel ? selectedModel.scale.x : 0,
            rotateX: selectedModel ? selectedModel.rotation.x : 0,
            rotateY: selectedModel ? selectedModel.rotation.y : 0,
            rotateZ: selectedModel ? selectedModel.rotation.z : 0,
            allModelBoundingBoxUnion: this.state.modelGroup.computeAllModelBoundingBoxUnion()
        });
    }
    subscriptions = [];

    controllerEvents = {
        'print3D:gcode-generated': (args) => {
            this.setState({
                gcodeFileName: args.gcodeFileName,
                gcodePath: `${WEB_CACHE_IMAGE}/${args.gcodeFileName}`,
                printTime: args.printTime,
                filamentLength: args.filamentLength,
                filamentWeight: args.filamentWeight,
                progress: 100,
                progressTitle: i18n._('Slicing completed.')
            });
            controller.print3DParseGcode({ fileName: args.gcodeFileName });
        },
        'print3D:gcode-slice-progress': (sliceProgress) => {
            this.setState({
                progress: 100.0 * sliceProgress,
                progressTitle: i18n._('Slicing {{progress}}%', { progress: (100.0 * sliceProgress).toFixed(1) })
            });
        },
        'print3D:gcode-slice-err': (err) => {
            this.setState({
                progress: 0,
                progressTitle: i18n._('Slice error: ') + JSON.stringify(err)
            });
        },
        // parse gcode
        'print3D:gcode-parsed': (jsonFileName) => {
            this.setState({
                progress: 100.0,
                progressTitle: i18n._('Parsed G-code successfully.')
            });
            this.renderGcode(jsonFileName);
        },
        'print3D:gcode-parse-progress': (progress) => {
            this.setState({
                progress: 100.0 * progress,
                progressTitle: i18n._('Parsing G-code...')
            });
        },
        'print3D:gcode-parse-err': (err) => {
            this.setState({
                progress: 0,
                progressTitle: i18n._('Failed to parse G-code: ') + JSON.stringify(err)
            });
        }
    };

    addControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.on(eventName, callback);
        });
    }

    removeControllerEvents() {
        Object.keys(this.controllerEvents).forEach(eventName => {
            const callback = this.controllerEvents[eventName];
            controller.off(eventName, callback);
        });
    }

    showContextMenu = (event) => {
        // this.contextMenuDomElement.parentNode.offsetHeight will return 0 if no css associated with parentNode
        // https://stackoverflow.com/questions/32438642/clientwidth-and-clientheight-report-zero-while-getboundingclientrect-is-correct
        const offsetX = event.offsetX;
        const offsetY = event.offsetY;
        let top = null;
        let left = null;
        if (offsetX + this.contextMenuDomElement.offsetWidth + 5 < this.contextMenuDomElement.parentNode.offsetWidth) {
            left = (offsetX + 5) + 'px';
        } else {
            left = (offsetX - this.contextMenuDomElement.offsetWidth - 5) + 'px';
        }
        if (offsetY + this.contextMenuDomElement.offsetHeight + 5 < this.contextMenuDomElement.parentNode.offsetHeight) {
            top = (offsetY + 5) + 'px';
        } else {
            top = (offsetY - this.contextMenuDomElement.offsetHeight - 5) + 'px';
        }
        this.setState({
            contextMenuVisible: true,
            contextMenuTop: top,
            contextMenuLeft: left
        });
    }

    onMouseUp = (event) => {
        if (event.button === THREE.MOUSE.RIGHT) {
            this.showContextMenu(event);
        } else {
            this.actions.hideContextMenu();
        }
    }

    onHashChange = () => {
        this.actions.hideContextMenu();
    }

    componentDidMount() {
        this.visualizerDomElement.addEventListener('mouseup', this.onMouseUp, false);
        this.visualizerDomElement.addEventListener('wheel', this.actions.hideContextMenu, false);
        window.addEventListener('hashchange', this.onHashChange, false);
        this.gcodeRenderer.loadShaderMaterial();
        this.subscriptions = [
            pubsub.subscribe(ACTION_REQ_GENERATE_GCODE_3DP, (msg, configFilePath) => {
                this.slice(configFilePath);
            }),
            pubsub.subscribe(ACTION_REQ_LOAD_GCODE_3DP, () => {
                const gcodePath = this.state.gcodePath;
                document.location.href = '/#/workspace';
                window.scrollTo(0, 0);
                jQuery.get(gcodePath, (result) => {
                    pubsub.publish('gcode:upload', { gcode: result, meta: { name: gcodePath } });
                });
            }),
            pubsub.subscribe(ACTION_REQ_EXPORT_GCODE_3DP, () => {
                const gcodePath = this.state.gcodePath;
                const filename = path.basename(gcodePath);
                document.location.href = '/api/gcode/download_cache?filename=' + filename;
            }),
            pubsub.subscribe(ACTION_3DP_EXPORT_MODEL, (msg, params) => {
                const format = params.format;
                const isBinary = params.isBinary;

                const output = new ModelExporter().parse(
                    this.state.modelGroup,
                    format,
                    isBinary
                );
                if (!output) {
                    // export error
                    return;
                }
                const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
                let fileName = 'export';
                if (format === 'stl') {
                    if (isBinary === true) {
                        fileName += '_binary';
                    } else {
                        fileName += '_ascii';
                    }
                }
                fileName += ('.' + format);
                FileSaver.saveAs(blob, fileName, true);
            }),
            pubsub.subscribe(ACTION_3DP_LOAD_MODEL, (msg, file) => {
                this.uploadAndParseFile(file);
            })
        ];
        this.addControllerEvents();
        this.actions.setStageToNoModel();
    }

    componentWillUnmount() {
        this.subscriptions.forEach((token) => {
            pubsub.unsubscribe(token);
        });
        this.subscriptions = [];
        this.removeControllerEvents();
        this.visualizerDomElement.removeEventListener('mouseup', this.onMouseUp, false);
        this.visualizerDomElement.removeEventListener('wheel', this.actions.hideContextMenu, false);
        window.removeEventListener('hashchange', this.onHashChange, false);
    }

    parseModel(modelPath) {
        new ModelLoader().load(
            modelPath,
            (bufferGemotry) => {
                // step-1: rotate x 90 degree
                bufferGemotry.rotateX(-Math.PI / 2);

                // step-2: make to x:[-a, a]  z:[-b, b]  y:[-c, c]
                bufferGemotry.computeBoundingBox();
                const box3 = bufferGemotry.boundingBox;
                let x = -(box3.max.x + box3.min.x) / 2;
                let y = -(box3.max.y + box3.min.y) / 2;
                let z = -(box3.max.z + box3.min.z) / 2;
                bufferGemotry.translate(x, y, z);

                // step-3: new model and add to Canvas
                const model = new Model(bufferGemotry, MATERIAL_NORMAL, MATERIAL_OVERSTEPPED, modelPath);
                model.castShadow = false;
                model.receiveShadow = false;

                this.state.modelGroup.addModel(model);
                model.alignWithParent();
                this.state.modelGroup.recordModelsState();
                this.checkModelsOverstepped();
                this.setStateForModelChanged();
                this.destroyGcodeLine();
            },
            (progress) => {
                this.setState({
                    progress: progress * 100,
                    progressTitle: i18n._('Loading model...')
                });
            },
            (err) => {
                this.setState({
                    progress: 0,
                    progressTitle: i18n._('Failed to load model.')
                });
            }
        );
    }

    slice = (configFilePath) => {
        // 1.export model to string(stl format) and upload it
        this.setState({
            progress: 0,
            progressTitle: i18n._('Pre-processing model...')
        });
        const output = new ModelExporter().parseToBinaryStl(this.state.modelGroup);
        const blob = new Blob([output], { type: 'text/plain' });
        // gcode name is: stlFileName(without ext) + '_' + timeStamp + '.gcode'
        let stlFileName = 'combined.stl';
        if (this.state.modelGroup.getModels().length === 1) {
            const modelPath = this.state.modelGroup.getModels()[0].modelPath;
            const basenameWithoutExt = path.basename(modelPath, path.extname(modelPath));
            stlFileName = basenameWithoutExt + '.stl';
        }
        const fileOfBlob = new File([blob], stlFileName);
        const formData = new FormData();
        formData.append('file', fileOfBlob);
        api.uploadFile(formData).then((res) => {
            const file = res.body;
            this.setState({
                modelUploadResult: 'ok'
            });
            this.setState({
                progress: 0,
                progressTitle: i18n._('Preparing for slicing...')
            });
            // 2.slice
            const params = {
                modelFileName: `${file.filename}`,
                configFilePath: configFilePath
            };
            controller.print3DSlice(params);
        });
    };

    renderGcode(jsonFileName) {
        const filePath = `${WEB_CACHE_IMAGE}/${jsonFileName}`;
        const loader = new THREE.FileLoader();
        loader.load(
            filePath,
            (data) => {
                const dataObj = JSON.parse(data);
                const result = this.gcodeRenderer.render(dataObj);

                // destroyrenderGcode last line
                this.destroyGcodeLine();
                const { line, layerCount, visibleLayerCount, bounds, gcodeTypeVisibility } = { ...result };
                this.state.gcodeLineGroup.add(line);

                this.setState({
                    layerCount: layerCount,
                    layerCountDisplayed: visibleLayerCount - 1,
                    gcodeTypeInitialVisibility: gcodeTypeVisibility,
                    progress: 100,
                    gcodeLine: line,
                    progressTitle: i18n._('Rendered G-code successfully.')
                }, () => {
                    this.gcodeRenderer.showLayers(this.state.layerCountDisplayed);
                });
                const { minX, minY, minZ, maxX, maxY, maxZ } = { ...bounds };
                this.checkGcodeBoundary(minX, minY, minZ, maxX, maxY, maxZ);

                this.actions.setStageToGcodeRendered();
            }
        );
    }

    destroyGcodeLine() {
        if (this.state.gcodeLine) {
            this.state.gcodeLineGroup.remove(this.state.gcodeLine);
            this.state.gcodeLine.geometry.dispose();
            this.state.gcodeLine = null;
        }
    }

    checkGcodeBoundary(minX, minY, minZ, maxX, maxY, maxZ) {
        const boundaryMax = 125;
        const widthOverstepped = (minX < 0 || maxX > boundaryMax);
        const heightOverstepped = (minZ < 0 || maxZ > boundaryMax);
        const depthOverstepped = (minY < 0 || maxY > boundaryMax);
        const overstepped = widthOverstepped || heightOverstepped || depthOverstepped;
        pubsub.publish(ACTION_3DP_GCODE_OVERSTEP_CHANGE, { overstepped: overstepped });
    }

    render() {
        const state = this.state;
        const actions = this.actions;

        return (
            <div
                className={styles.visualizer}
                ref={(node) => {
                    this.visualizerDomElement = node;
                }}
            >
                <div className={styles['visualizer-top-left']}>
                    <VisualizerTopLeft actions={actions} state={state} />
                </div>
                <div className={styles['visualizer-control-axis']}>
                    <ControlAxis actions={actions} state={state} />
                </div>

                <div className={styles['visualizer-model-transformation']}>
                    <VisualizerModelTransformation actions={actions} state={state} />
                </div>

                <div className={styles['visualizer-camera-operations']}>
                    <VisualizerCameraOperations />
                </div>

                <div className={styles['visualizer-preview-control']}>
                    <VisualizerPreviewControl actions={actions} state={state} />
                </div>

                <div className={styles['visualizer-info']}>
                    <VisualizerInfo state={state} />
                </div>

                <div className={styles['visualizer-progress-bar']}>
                    <VisualizerProgressBar title={state.progressTitle} progress={state.progress} />
                </div>
                <div className={styles.canvas}>
                    <Canvas actions={actions} state={state} />
                </div>
                <div
                    ref={(node) => {
                        this.contextMenuDomElement = node;
                    }}
                    className={styles.contextMenu}
                    style={{
                        visibility: state.contextMenuVisible ? 'visible' : 'hidden',
                        top: this.state.contextMenuTop,
                        left: this.state.contextMenuLeft
                    }}
                >
                    <ContextMenu actions={actions} state={state} />
                </div>
            </div>
        );
    }
}

export default Visualizer;
