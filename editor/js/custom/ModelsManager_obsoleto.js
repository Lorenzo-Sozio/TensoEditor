class ModelsManager {
    constructor(editor, modelsSubmenu) {
        this.editor = editor;
        this.modelsSubmenu = modelsSubmenu;
        this.modelsPath = 'models/';
        this.modelMapping = [
            { 'name':'MODULO INIZIALE', 'fileName': 'MODULO INIZIALE.json', 'type': 'json'},
            { 'name':'MODULO CENTRALE', 'fileName': 'MODULO CENTRALE.json', 'type': 'json'},
            { 'name':'MODULO FINALE', 'fileName': 'MODULO FINALE.json', 'type': 'json'},
            { 'name':'TRAVE CENTRALE', 'fileName': 'TRAVE CENTRALE.json', 'type': 'json'},
            { 'name':'TRAVE LATERALE', 'fileName': 'TRAVE LATERALE.json', 'type': 'json'},
            { 'name':'TENDA 10x20', 'fileName': 'TENDA 10x20.json', 'type': 'json'}            
        ];
    }

    getModels() {
        try {
            // Instead of fetching from directory, use modelMapping directly
            const fileList = this.modelMapping.map(model => ({
                name: model.name,
                fileName: model.fileName,
                type: model.type
            }));
            
            return fileList;
            //this._createMenuOptions(fileList);
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }
    
/*
    _createMenuOptions(fileList) {
        fileList.forEach(model => {
            const option = new UIRow();
            option.setClass('option');
            option.setTextContent(model.name); // Use display name instead of filename
            option.onClick(async () => await this._handleModelClick(model.fileName));
            this.modelsSubmenu.add(option);
        });
    }
*/

    async _handleModelClick(fileName) {
        editor.loader.loadJSON(this.modelsPath + fileName);
        /*
        console.log("FILENAME: " + fileName);
        console.log(this.modelsPath + fileName);
        const response = await fetch(this.modelsPath + fileName);
        if (!response.ok) throw new Error('Error loading models from directory');
        
        const fileModel = await response.text();
        */
        //editor.loader.loadJSON( fileModel );
        /*const extension = fileName.split('.').pop().toLowerCase();
        const loader = await this._getappropriateLoader(extension);

        if (loader) {
            this._loadModel(loader, fileName);
        }*/
    }

    async _getappropriateLoader(extension) {
        try {
            switch(extension) {
                case 'gltf':
                case 'glb':
                    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
                    return new GLTFLoader();
                case 'fbx':
                    const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
                    return new FBXLoader();
                case 'obj':
                    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
                    return new OBJLoader();
                default:
                    console.warn(`Unsupported file extension: ${extension}`);
                    return null;
            }
        } catch (error) {
            console.error(`Error loading loader for extension ${extension}:`, error);
            return null;
        }
    }

    _loadModel(loader, fileName) {
        loader.load(
            this.modelsPath + fileName,
            (object) => {
                object.name = fileName;
                this.editor.execute(new AddObjectCommand(this.editor, object));
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }
}

// Export the class
export { ModelsManager };