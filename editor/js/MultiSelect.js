import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const DefaultConfig = Object.freeze({
    recursive: false,
    useTransformControls: true,
    transformControls: null,
    cameraControls: null,
    deselectOnRaycastMiss: false,
    updateLocalMatrices: false,
    updateWorldMatrices: false,
    rotateAsGroup: false,
});

const MOUSE_BUTTON = Object.freeze({
    LEFT: 1,
    RIGHT: 2,
    MIDDLE: 4,
});

const ACTION = Object.freeze({
    NONE: 0,
    SELECT: 1,
    MULTI_SELECT: 2,
    DESELECT: 4,
    TOGGLE: 8,
});

// Helper variables
const _pointer = new THREE.Vector2();
let _intersects = [];
const _raycaster = new THREE.Raycaster();
_raycaster.firstHitOnly = true;

const _position = new THREE.Vector3();
const _rotation = new THREE.Euler();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _sum = new THREE.Vector3();
const _averagePoint = new THREE.Vector3();
const _proxy = new THREE.Object3D();
const _translateToPivot = new THREE.Matrix4();
const _translateBack = new THREE.Matrix4();
const _rotationMatrix = new THREE.Matrix4();
const _finalMatrix = new THREE.Matrix4();

let _oldPositions = [];
let _oldScales = [];
let _oldRotations = [];

class MultiSelect extends THREE.EventDispatcher {
    static install() {
        THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
        THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
        THREE.Mesh.prototype.raycast = acceleratedRaycast;
    }

    constructor(camera, domElement, objects, config = {}) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.object = objects;
        this.proxy = new THREE.Object3D();
        this.selectedObjects = [];
        this.scene = new THREE.Scene();
        //this.scene.add(this.proxy);
        this.config = { ...DefaultConfig, ...config };
        this.enabled = true;
        this.ignorePointerEvent = false;
        this.activePointers = [];

        // configs
        this.mouseButtons = {
            left: ACTION.SELECT,
            middle: ACTION.NONE,
            right: ACTION.DESELECT,
            wheel: ACTION.NONE,
        };

        this.touches = {
            one: ACTION.TOGGLE,
            two: ACTION.NONE,
            three: ACTION.NONE,
        };

        this.state = 0;

        // Transform Controls setup
        this._setupTransformControls();

        // events
        this.onContextMenuEvent = this._onContextMenu.bind(this);
        this.onPointerDownEvent = this._onPointerDown.bind(this);
        this.onPointerUpEvent = this._onPointerUp.bind(this);
        this.onPointerMoveEvent = this._onPointerMove.bind(this);
        this.activate();
    }

    _setupTransformControls() {
        this.transformControls = this.config.useTransformControls
            ? new TransformControls(this.camera, this.domElement)
            : null;
        if (this.transformControls) {
            //this.scene.add(this.transformControls);

            this.transformControls.addEventListener('objectChange', () => {
                if (!this.transformControls) return;
                switch (this.transformControls.getMode()) {
                    case 'translate':
                        _position.copy(this.proxy.position).sub(_proxy.position);
                        for (let i = 0; i < this.selectedObjects.length; i++) {
                            const element = this.selectedObjects[i];
                            element.position.copy(element._position).add(_position);
                        }
                        break;
                    case 'rotate':
                        if (this.config.rotateAsGroup) {
                            const { rotationAxis, rotationAngle } = this.transformControls;
                            if (rotationAxis == null || rotationAngle == null) return;
                            _quaternion.setFromAxisAngle(rotationAxis, rotationAngle);
                            const pivotPoint = this.proxy.position;
                            _translateToPivot.makeTranslation(pivotPoint.x, pivotPoint.y, pivotPoint.z);
                            _translateBack.makeTranslation(-pivotPoint.x, -pivotPoint.y, -pivotPoint.z);
                            _rotationMatrix.makeRotationFromQuaternion(_quaternion);
                            _finalMatrix.multiplyMatrices(_translateToPivot, _rotationMatrix).multiply(_translateBack);
                            for (let i = 0; i < this.selectedObjects.length; i++) {
                                const element = this.selectedObjects[i];
                                element.applyMatrix4(_finalMatrix);
                            }
                        } else {
                            _rotation.copy(this.proxy.rotation);
                            for (let i = 0; i < this.selectedObjects.length; i++) {
                                const element = this.selectedObjects[i];
                                element.rotation.copy(_rotation);
                            }
                        }
                        break;
                    case 'scale':
                        _scale.copy(this.proxy.scale);
                        for (let i = 0; i < this.selectedObjects.length; i++) {
                            const element = this.selectedObjects[i];
                            element.scale.copy(_scale);
                        }
                        break;
                    default:
                        break;
                }
                if (this.config.updateLocalMatrices || this.config.updateWorldMatrices) {
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        const element = this.selectedObjects[i];
                        if (this.config.updateLocalMatrices) {
                            element.updateMatrix();
                        }
                        if (this.config.updateWorldMatrices) {
                            element.updateMatrixWorld();
                        }
                    }
                }
            });
            if (this.config.cameraControls) {
                this.transformControls.addEventListener('dragging-changed', (event) => {
                    this.config.cameraControls.enabled = !event.value;
                    this._onDraggingChanged(event.value);
                });
            }
        }
    }

    _onDraggingChanged(storeInitialState) {
        if (storeInitialState) {
            _oldPositions = [];
            _oldScales = [];
            _oldRotations = [];
            this.selectedObjects.forEach((object) => {
                switch (this.transformControls.getMode()) {
                    case 'translate':
                        _oldPositions.push(object.position.clone());
                        break;
                    case 'rotate':
                        _oldRotations.push(object.rotation.clone());
                        break;
                    case 'scale':
                        _oldScales.push(object.scale.clone());
                        break;
                    default:
                        break;
                }
            });
        } else {
            const newPositions = [];
            const newRotations = [];
            const newScales = [];
            switch (this.transformControls.getMode()) {
                case 'translate':
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        const object = this.selectedObjects[i];
                        newPositions.push({
                            object,
                            oldPosition: _oldPositions[i].clone(),
                            newPosition: object.position.clone(),
                        });
                    }
                    this.dispatchEvent({ type: 'new-position', newPositions });
                    break;
                case 'rotate':
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        const object = this.selectedObjects[i];
                        newRotations.push({
                            object,
                            oldRotation: _oldRotations[i].clone(),
                            newRotation: object.rotation.clone(),
                        });
                    }
                    this.dispatchEvent({ type: 'new-rotation', newRotations });
                    break;
                case 'scale':
                    for (let i = 0; i < this.selectedObjects.length; i++) {
                        const object = this.selectedObjects[i];
                        newScales.push({
                            object,
                            oldScale: _oldScales[i].clone(),
                            newScale: object.scale.clone(),
                        });
                    }
                    this.dispatchEvent({ type: 'new-scale', newScales });
                    break;
                default:
                    break;
            }
        }
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    updateObjectsList(newObjects) {
        this.object = newObjects;
    }

    addObjectToList(newObject) {
        this.object.push(newObject);
    }


    getRaycaster() {
        return _raycaster;
    }

    getTransformControls() {
        return this.transformControls;
    }

    _onContextMenu(event) {
        if (this.mouseButtons.right === ACTION.NONE) return;
        event.preventDefault();
    }

    findPointerById(pointerId) {
        return this.activePointers.find((activePointer) => activePointer.pointerId === pointerId);
    }

    findPointerByMouseButton(mouseButton) {
        return this.activePointers.find((activePointer) => activePointer.mouseButton === mouseButton);
    }

    _onPointerDown(event) {
        if (this.enabled === false) return;
        if (this.transformControls && this.transformControls.axis) {
            this.ignorePointerEvent = true;
            return;
        }
        const mouseButton =
            event.pointerType !== 'mouse'
                ? null
                : (event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT
                ? MOUSE_BUTTON.LEFT
                : (event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE
                ? MOUSE_BUTTON.MIDDLE
                : (event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT
                ? MOUSE_BUTTON.RIGHT
                : null;

        if (mouseButton !== null) {
            const zombiePointer = this.findPointerByMouseButton(mouseButton);
            zombiePointer && this.activePointers.splice(this.activePointers.indexOf(zombiePointer), 1);
        }

        const pointer = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            deltaX: 0,
            deltaY: 0,
            mouseButton,
        };

        this.activePointers.push(pointer);

        if (event.pointerType === 'touch') {
            switch (this.activePointers.length) {
                case 1:
                    this.state = this.touches.one;
                    break;
                case 2:
                    this.state = this.touches.two;
                    break;
                case 3:
                    this.state = this.touches.three;
                    break;
            }
        } else {
            this.state = 0;
            if ((event.buttons & MOUSE_BUTTON.LEFT) === MOUSE_BUTTON.LEFT) {
                this.state = this.state | this.mouseButtons.left;
            }
            if ((event.buttons & MOUSE_BUTTON.MIDDLE) === MOUSE_BUTTON.MIDDLE) {
                this.state = this.state | this.mouseButtons.middle;
            }
            if ((event.buttons & MOUSE_BUTTON.RIGHT) === MOUSE_BUTTON.RIGHT) {
                this.state = this.state | this.mouseButtons.right;
            }
        }
    }

    _onPointerUp(event) {
        if (this.enabled === false) return;
        if (this.ignorePointerEvent) {
            this.ignorePointerEvent = false;
            return;
        }

        const pointerId = event.pointerId;
        const pointer = this.findPointerById(pointerId);
        pointer && this.activePointers.splice(this.activePointers.indexOf(pointer), 1);
        if (!this.state) return;

        this.updatePointer(event);
        _raycaster.setFromCamera(_pointer, this.camera);
        _intersects = [];
        _raycaster.intersectObjects([...this.object, ...this.proxy.children], this.config.recursive, _intersects);

        if (_intersects[0] == null) {
            if (this.config.deselectOnRaycastMiss) {
                this.deselectAllObjects();
            }
            return;
        }

        const { object: intersectedObject } = _intersects[0];
        let alreadySelected = false;
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const element = this.selectedObjects[i];
            if (element.uuid !== intersectedObject.uuid) continue;
            alreadySelected = true;
            break;
        }

        if (alreadySelected) {
            if (this.state === ACTION.TOGGLE || this.state === ACTION.DESELECT) {
                this.deselectObject(intersectedObject);
            }
            return;
        }
        if (this.state === ACTION.DESELECT) return;
        this.selectObject(intersectedObject);
    }

    selectObject(object) {
        if (this.selectedObjects.length === 0) {
            _proxy.position.copy(this.proxy.position);
            _proxy.rotation.copy(this.proxy.rotation);
            _proxy.scale.copy(this.proxy.scale);
        }
        object._position = object.position.clone();
        this.selectedObjects.push(object);
        this.attachObjectToTransformControl();
        this.dispatchEvent({ type: 'select', object });
    }

    deselectObject(object) {
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const element = this.selectedObjects[i];
            if (element.uuid !== object.uuid) continue;
            element._position = undefined;
            this.selectedObjects[i] = this.selectedObjects[this.selectedObjects.length - 1];
            this.selectedObjects.pop();
            break;
        }

        this.detachObjectToTransformControl();
        this.dispatchEvent({ type: 'deselect', object });
    }

    deselectAllObjects() {
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const object = this.selectedObjects[i];
            this.dispatchEvent({ type: 'deselect', object });
        }

        this.selectedObjects = [];
        this.detachObjectToTransformControl();
    }

    attachObjectToTransformControl() {
        console.log("MULTISELECT - config.useTransformControls", this.config.useTransformControls);
        if (this.config.useTransformControls === false) return;
        console.log("MULTISELECT - transformControls", this.transformControls);
        if (this.transformControls === null) return;
        console.log("MULTISELECT - selectedObjects.length", this.selectedObjects.length);
        if (this.selectedObjects.length === 0) return;
        this.transformControls.detach();
        this.handleTransformControlsCenter();
        this.transformControls.attach(this.proxy);
    }

    detachObjectToTransformControl() {
        console.log("MULTISELECT - config.useTransformControls", this.config.useTransformControls);
        if (this.config.useTransformControls === false) return;
        console.log("MULTISELECT - transformControls", this.transformControls);
        if (this.transformControls === null) return;
        this.transformControls.detach();
        console.log("MULTISELECT - selectedObjects", this.selectedObjects.length);
        if (this.selectedObjects.length === 0) return;
        this.handleTransformControlsCenter();
        this.transformControls.attach(this.proxy);
    }

    handleTransformControlsCenter() {
        _sum.set(0, 0, 0);
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const object = this.selectedObjects[i];
            object.getWorldPosition(_position);
            _sum.add(_position);
        }
        _averagePoint.copy(_sum.divideScalar(this.selectedObjects.length));
        for (let i = 0; i < this.selectedObjects.length; i++) {
            const object = this.selectedObjects[i];
            object._position = object.position.clone().sub(_averagePoint);
        }
        this.proxy.position.copy(_averagePoint);
    }

    _onPointerMove(event) {
        if (this.enabled === false) return;
        this.updateRaycaster(event);
    }

    updateRaycaster(event) {
        this.updatePointer(event);
    }

    updatePointer(event) {
        const rect = this.domElement.getBoundingClientRect();
        _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    activate() {
        this.domElement.addEventListener('contextmenu', this.onContextMenuEvent);
        this.domElement.addEventListener('pointerdown', this.onPointerDownEvent);
        this.domElement.addEventListener('pointerup', this.onPointerUpEvent);
        this.domElement.addEventListener('pointermove', this.onPointerMoveEvent);
    }

    deactivate() {
        this.domElement.removeEventListener('contextmenu', this.onContextMenuEvent);
        this.domElement.removeEventListener('pointerdown', this.onPointerDownEvent);
        this.domElement.removeEventListener('pointerup', this.onPointerUpEvent);
        this.domElement.removeEventListener('pointermove', this.onPointerMoveEvent);
        this.proxy.clear();
    }

    dispose() {
        this.deactivate();
    }
}

export { MultiSelect };