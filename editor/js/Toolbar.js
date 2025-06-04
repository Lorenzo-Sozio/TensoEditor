import { UIPanel, UIButton, UICheckbox } from './libs/ui.js';
//Aggiungi per funzione Clone()
import { clone } from '../../examples/jsm/utils/SkeletonUtils.js';
import { AddObjectCommand } from './commands/AddObjectCommand.js';

function Toolbar(editor) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId('toolbar');

	// translate / rotate / scale

	const translateIcon = document.createElement('img');
	translateIcon.title = strings.getKey('toolbar/translate');
	translateIcon.src = 'images/translate.svg';

	const translate = new UIButton();
	translate.dom.className = 'Button selected';
	translate.dom.appendChild(translateIcon);
	translate.onClick(function () {

		signals.transformModeChanged.dispatch('translate');

	});
	container.add(translate);

	const rotateIcon = document.createElement('img');
	rotateIcon.title = strings.getKey('toolbar/rotate');
	rotateIcon.src = 'images/rotate.svg';

	const rotate = new UIButton();
	rotate.dom.appendChild(rotateIcon);
	rotate.onClick(function () {

		signals.transformModeChanged.dispatch('rotate');

	});
	container.add(rotate);

	const scaleIcon = document.createElement('img');
	scaleIcon.title = strings.getKey('toolbar/scale');
	scaleIcon.src = 'images/scale.svg';

	const scale = new UIButton();
	scale.dom.appendChild(scaleIcon);
	scale.onClick(function () {

		signals.transformModeChanged.dispatch('scale');

	});
	container.add(scale);

	// Clone
	const cloneIcon = document.createElement('img');
	cloneIcon.title = strings.getKey('toolbar/clone');
	cloneIcon.src = 'images/clone.svg';

	const cloneBtn = new UIButton();
	cloneBtn.dom.appendChild(cloneIcon);
	cloneBtn.onClick(function () {
		//signals.transformModeChanged.dispatch( 'clone' );

		let object = editor.selected;

		if (object === null || object.parent === null) return; // avoid cloning the camera or scene

		object = clone(object);

		editor.execute(new AddObjectCommand(editor, object));

	});

	container.add(cloneBtn);

	// Raggruppa (inseriti oggetto selezionato in un gruppo)

	const groupIcon = document.createElement('img');
	groupIcon.title = strings.getKey('toolbar/group');
	groupIcon.src = 'images/group.svg';

	const groupBtn = new UIButton();
	groupBtn.dom.appendChild(groupIcon);
	groupBtn.onClick(function () {
		let selectedObject = editor.selected;

		if (selectedObject === null || selectedObject.parent === null) return;

		const parentObject = selectedObject.parent;

		// Crea un nuovo gruppo
		const group = new THREE.Group();
		group.name = "Gruppo_" + selectedObject.name;

		// Calcola la trasformazione RELATIVA al parent (non globale)
		//const parentWorldMatrix = parentObject.matrixWorld;
		//const inverseParentMatrix = new THREE.Matrix4().copy(parentWorldMatrix).invert();
		//const relativeMatrix = new THREE.Matrix4().multiplyMatrices(inverseParentMatrix, selectedObject.matrixWorld);

		// Estrai posizione/rotazione/scala dalla matrice relativa
		//const relativePosition = new THREE.Vector3();
		//const relativeQuaternion = new THREE.Quaternion();
		//const relativeScale = new THREE.Vector3();
		//relativeMatrix.decompose(relativePosition, relativeQuaternion, relativeScale);

		// Aggiungi il gruppo al parent
		parentObject.add(group);

		// Imposta la trasformazione del gruppo
		//group.position.copy(relativePosition);
		//group.quaternion.copy(relativeQuaternion);
		//group.scale.copy(relativeScale);

		// Rimuovi l'oggetto dal parent originale
		parentObject.remove(selectedObject);

		// Resetta la trasformazione dell'oggetto (ora relativa al gruppo)
		//selectedObject.position.set(0, 0, 0);
		//selectedObject.quaternion.set(0, 0, 0, 1);
		//selectedObject.scale.set(1, 1, 1);

		// Aggiungi l'oggetto al gruppo
		group.add(selectedObject);

		// Aggiorna l'editor
		editor.signals.sceneGraphChanged.dispatch();
		editor.signals.objectSelected.dispatch(group); // Seleziona il gruppo invece dell'oggetto

		console.log(`Oggetto ${selectedObject.name} raggruppato in ${group.name}`);
	});

	container.add(groupBtn);

	// CollisionDetection Checkbox
	const collisionDetection = new UICheckbox(false);
	collisionDetection.dom.title = strings.getKey('toolbar/detectCollision');
	collisionDetection.onChange(function () {
		//signals.detectionCollisionChanged.dispatch(this.getValue());
		editor.collisionDetection = this.getValue();
	});
	container.add(collisionDetection);

	// Local Checkbox
	/*const local = new UICheckbox(false);
	local.dom.title = strings.getKey('toolbar/local');
	local.onChange(function () {

		signals.spaceChanged.dispatch(this.getValue() === true ? 'local' : 'world');

	});
	container.add(local);*/

	/*// Center View
	const centerViewIcon = document.createElement('img');
	centerViewIcon.title = strings.getKey('toolbar/centerview');
	centerViewIcon.src = 'images/centerview.svg';

	const centerViewBtn = new UIButton();
	centerViewBtn.dom.appendChild(centerViewIcon);
	centerViewBtn.onClick(function () {
		const selectedObject = editor.selected;

		// Or if you have your own selection system:
		// const selectedObject = yourSelectionSystem.selectedObject;

		if (!selectedObject) {
			console.warn('No object selected');
			return;
		}

		// Calculate the bounding box of the selected object
		const bbox = new THREE.Box3().setFromObject(selectedObject);
		const center = bbox.getCenter(new THREE.Vector3());
		const size = bbox.getSize(new THREE.Vector3());

		// Calculate the distance needed to fit the object in view
		const maxDim = Math.max(size.x, size.y, size.z);
		const fov = editor.camera.fov * (Math.PI / 180);
		let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

		// Add some padding
		cameraZ *= 1.5;

		editor.camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, cameraZ)));
		editor.camera.lookAt(center);

		// Update controls if needed
		editor.camera.updateProjectionMatrix();

		editor.signals.sceneGraphChanged.dispatch();
	});

	container.add(centerViewBtn);
	*/

	signals.transformModeChanged.add(function (mode) {

		translate.dom.classList.remove('selected');
		rotate.dom.classList.remove('selected');
		scale.dom.classList.remove('selected');

		switch (mode) {

			case 'translate': translate.dom.classList.add('selected'); break;
			case 'rotate': rotate.dom.classList.add('selected'); break;
			case 'scale': scale.dom.classList.add('selected'); break;

		}

	});

	return container;

}

export { Toolbar };
