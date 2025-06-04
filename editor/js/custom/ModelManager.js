import { Modal } from "./Modal.js";

export class ModelManager {
  constructor(editor, models = []) {
    this.editor = editor;
    this.models = models || [];
    this.selectedModel = null;
    this.modelsPath = 'models/';
    this.previewScene = null;
    this.previewRenderer = null;
    this.previewCamera = null;
    this.previewControls = null;
    this.currentPreviewObject = null;
    this.animationId = null;

    //TO DO: usare backend webservice for this
    this.modelMapping = [
      { 'name': 'MODULO INIZIALE', 'fileName': 'MODULO INIZIALE.json', 'type': 'json' },
      { 'name': 'MODULO CENTRALE', 'fileName': 'MODULO CENTRALE.json', 'type': 'json' },
      { 'name': 'MODULO FINALE', 'fileName': 'MODULO FINALE.json', 'type': 'json' },
      { 'name': 'TRAVE CENTRALE', 'fileName': 'TRAVE CENTRALE.json', 'type': 'json' },
      { 'name': 'TRAVE LATERALE', 'fileName': 'TRAVE LATERALE.json', 'type': 'json' },
      { 'name': 'TENDA 10x20', 'fileName': 'TENDA 10x20.json', 'type': 'json' }
    ];

    this.modalContainer = new Modal({
      title: 'Model Manager',
      width: '85%',
      height: '75%',
      draggable: false,
      resizable: false,
    });

    this.loadModels();
  }

  initEditor() {
    this.openEditor();
    this.renderModelTable();
    this.initPreview();
  }

  loadModels() {
    try {
      // Instead of fetching from directory, use modelMapping directly
      this.models = this.modelMapping.map(model => ({
        name: model.name,
        fileName: model.fileName,
        type: model.type
      }));
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  openEditor() {
    this.modalContainer.modalContent.innerHTML = this.getEditorHTML();
    const footerContent = this.getFooterHTML();
    this.modalContainer.setFooter(footerContent);

    this.setupEventListeners();
  }

  closeEditor() {
    this.cleanupPreview();
    this.modalContainer.close();
  }

  getEditorHTML() {
    const columns = [
      { id: 'name', label: 'Name', width: '50%' },
      { id: 'type', label: 'Type', width: '15%' },
      { id: 'size', label: 'Size', width: '15%' },
      { id: 'actions', label: 'Actions', width: '20%' }
    ];

    return `
      <div class="model-manager-container">
        <div class="editor-header">
          <div class="title">Gestione Modelli</div>
          <div class="header-actions">
            <button class="modal-buttons" id="importButton">Import</button>
          </div>
        </div>
        
        <div class="main-content">
          <div class="left-panel">
            <div class="model-table-container">
              <table id="modelTable">
                <thead>
                  <tr>
                    ${columns.map(col => `<th style="width: ${col.width}">${col.label}</th>`).join('')}
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            
            <div class="status-bar">
              <span id="statusMessage">${this.models.length} models loaded</span>
            </div>
          </div>
          
          <div class="right-panel">
            <div class="preview-header">
              <span class="preview-title">Preview</span>
              <div class="preview-controls">
                <button class="preview-button" id="resetCameraButton" title="Reset Camera">🏠</button>
                <button class="preview-button" id="wireframeButton" title="Toggle Wireframe">📐</button>
              </div>
            </div>
            <div class="preview-container">
              <div id="previewCanvas" class="preview-canvas"></div>
              <div class="preview-info" id="previewInfo">
                <div class="preview-message">Select a model to see preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        .model-manager-container {
          font-family: inherit;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 10px;
          box-sizing: border-box;
        }
        
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .editor-header .title {
          font-size: 18px;
          font-weight: bold;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          gap: 15px;
          min-height: 0;
        }
        
        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        
        .right-panel {
          width: 400px;
          display: flex;
          flex-direction: column;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fff;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          background-color: #f8f9fa;
        }
        
        .preview-title {
          font-weight: bold;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
        }
        
        .preview-controls {
          display: flex;
          gap: 5px;
        }
        
        .preview-button {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background-color: #fff;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s ease;
        }
        
        .preview-button:hover {
          background-color: #f0f0f0;
          transform: translateY(-1px);
        }
        
        .preview-container {
          flex: 1;
          position: relative;
          min-height: 300px;
        }
        
        .preview-canvas {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .preview-info {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .preview-info.visible {
          opacity: 1;
        }
        
        .preview-message {
          text-align: center;
          color: #999;
          font-style: italic;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          white-space: nowrap;
        }
        
        .model-table-container {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fff;
          margin-bottom: 10px;
        }
        
        #modelTable {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        
        #modelTable th {
          background-color: #f8f9fa;
          padding: 10px 8px;
          text-align: left;
          border-bottom: 1px solid #ccc;
          position: sticky;
          top: 0;
          z-index: 1;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          color: #666;
        }
        
        #modelTable td {
          padding: 8px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
          height: 36px;
          box-sizing: border-box;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .model-row {
          cursor: pointer;
          transition: background-color 0.1s ease;
        }
        
        .model-row:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        
        .model-row.selected {
          background-color: rgba(0, 136, 255, 0.1);
        }
        
        .action-buttons {
          display: flex;
          gap: 4px;
          justify-content: flex-start;
        }
        
        .action-button {
          padding: 4px 8px;
          min-width: 50px;
          border-radius: 3px;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .action-button:hover {
          background-color: #e9ecef;
        }
        
        .action-button.export {
          background-color: #e3f2fd;
          border-color: #bbdefb;
        }
        
        .action-button.delete {
          background-color: #ffebee;
          border-color: #ffcdd2;
          color: #c62828;
        }
        
        .status-bar {
          color: #666;
          font-size: 13px;
          padding: 5px 0;
        }
        
        /* Loading spinner */
        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .model-manager-container {
            color: #ddd;
          }
          
          .right-panel {
            border-color: #333;
            background-color: #222;
          }
          
          .preview-header {
            background-color: #1a1a1a;
            border-color: #333;
          }
          
          .preview-title {
            color: #888;
          }
          
          .preview-button {
            background-color: #333;
            border-color: #444;
            color: #ddd;
          }
          
          .preview-button:hover {
            background-color: #444;
          }
          
          .model-table-container {
            border-color: #333;
            background-color: #222;
          }
          
          #modelTable th {
            background-color: #1a1a1a;
            border-color: #333;
            color: #888;
          }
          
          #modelTable td {
            border-color: #333;
            color: #ddd;
          }
          
          .model-row:hover {
            background-color: rgba(21, 60, 94, 0.3);
          }
          
          .model-row.selected {
            background-color: rgba(0, 136, 255, 0.2);
          }
          
          .action-button {
            background-color: #333;
            border-color: #444;
            color: #ddd;
          }
          
          .action-button:hover {
            background-color: #444;
          }
          
          .action-button.export {
            background-color: #1a237e;
            border-color: #303f9f;
          }
          
          .action-button.delete {
            background-color: #4a148c;
            border-color: #7b1fa2;
            color: #ff5252;
          }
        }
      </style>
    `;
  }

  getFooterHTML() {
    return `
      <div class="editor-footer">
        <div class="status-bar">
          <span id="footerStatusMessage"></span>
        </div>
        <div class="footer-actions">
          <button class="modal-buttons" id="closeButton">Annulla</button>
          <button class="modal-buttons" id="addButton">Aggiungi</button>
        </div>
      </div>
      
      <style>
        .editor-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 10px;
        }
        
        .footer-actions {
          display: flex;
          gap: 8px;
        }
        
        .modal-buttons {
          padding: 8px 16px;
          border-radius: 4px;
          border: 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: background-color 0.2s ease;
        }
            
        #closeButton {
          background-color: #f1f1f1;
          border: 1px solid #ddd;
          color: #333;
        }
        
        #closeButton:hover {
          background-color: #e0e0e0;
        }
        
        #addButton {
          background-color: #2ecc71;
          color: white;
          border: none;
        }
        
        #addButton:hover {
          background-color: #27ae60;
        }
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          #closeButton {
            background-color: #333;
            border-color: #444;
            color: #ddd;
          }
              
          #closeButton:hover {
            background-color: #444;
          }
              
          #addButton {
            background-color: #2980b9;
          }
              
          #addButton:hover {
            background-color: #3498db;
          }
        }
      </style>
    `;
  }

  initPreview() {
    const previewCanvas = this.modalContainer.modalContent.querySelector('#previewCanvas');
    if (!previewCanvas) return;

    // Create Three.js scene
    this.previewScene = new THREE.Scene();
    this.previewScene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    this.previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.previewCamera.position.set(5, 5, 5);

    // Create renderer
    this.previewRenderer = new THREE.WebGLRenderer({ antialias: true });
    this.previewRenderer.setSize(400, 300);
    this.previewRenderer.shadowMap.enabled = true;
    this.previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    previewCanvas.appendChild(this.previewRenderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.previewScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.previewScene.add(directionalLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(10, 10);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    this.previewScene.add(gridHelper);

    // Initialize orbit controls (assuming OrbitControls is available)
    if (window.THREE && THREE.OrbitControls) {
      this.previewControls = new THREE.OrbitControls(this.previewCamera, this.previewRenderer.domElement);
      this.previewControls.enableDamping = true;
      this.previewControls.dampingFactor = 0.05;
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      this.resizePreview();
    });
    resizeObserver.observe(previewCanvas);

    // Start render loop
    this.startPreviewRenderLoop();
  }

  resizePreview() {
    if (!this.previewRenderer || !this.previewCamera) return;

    const previewCanvas = this.modalContainer.modalContent.querySelector('#previewCanvas');
    if (!previewCanvas) return;

    const rect = previewCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.previewCamera.aspect = width / height;
    this.previewCamera.updateProjectionMatrix();
    this.previewRenderer.setSize(width, height);
  }

  startPreviewRenderLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      if (this.previewControls) {
        this.previewControls.update();
      }
      
      if (this.previewRenderer && this.previewScene && this.previewCamera) {
        this.previewRenderer.render(this.previewScene, this.previewCamera);
      }
    };
    animate();
  }

  cleanupPreview() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.currentPreviewObject) {
      this.previewScene.remove(this.currentPreviewObject);
      this.currentPreviewObject = null;
    }
    
    if (this.previewRenderer) {
      this.previewRenderer.dispose();
      this.previewRenderer = null;
    }
    
    this.previewScene = null;
    this.previewCamera = null;
    this.previewControls = null;
  }

  async loadPreviewModel(modelIndex) {
    if (modelIndex < 0 || modelIndex >= this.modelMapping.length) return;

    const model = this.modelMapping[modelIndex];
    const filePath = this.modelsPath + model.fileName;

    // Show loading state
    this.showPreviewLoading(true);

    try {
      // Load JSON file
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.statusText}`);
      }

      const jsonData = await response.json();
      
      // Clear previous model
      if (this.currentPreviewObject) {
        this.previewScene.remove(this.currentPreviewObject);
      }

      // Load the model using Three.js ObjectLoader
      const loader = new THREE.ObjectLoader();
      this.currentPreviewObject = loader.parse(jsonData);
      
      if (this.currentPreviewObject) {
        this.previewScene.add(this.currentPreviewObject);
        
        // Center and fit the model
        this.fitModelToView(this.currentPreviewObject);
        
        // Update preview info
        this.updatePreviewInfo(model.name, this.currentPreviewObject);
      }

    } catch (error) {
      console.error('Error loading preview model:', error);
      this.showPreviewError('Failed to load model preview');
    } finally {
      this.showPreviewLoading(false);
    }
  }

  fitModelToView(object) {
    if (!object) return;

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Center the object
    object.position.sub(center);

    // Adjust camera to fit the object
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    this.previewCamera.position.set(distance, distance, distance);
    this.previewCamera.lookAt(0, 0, 0);

    if (this.previewControls) {
      this.previewControls.target.set(0, 0, 0);
      this.previewControls.update();
    }
  }

  updatePreviewInfo(modelName, object) {
    const previewInfo = this.modalContainer.modalContent.querySelector('#previewInfo');
    if (!previewInfo) return;

    let vertexCount = 0;
    let triangleCount = 0;

    object.traverse((child) => {
      if (child.geometry) {
        if (child.geometry.attributes.position) {
          vertexCount += child.geometry.attributes.position.count;
        }
        if (child.geometry.index) {
          triangleCount += child.geometry.index.count / 3;
        }
      }
    });

    previewInfo.innerHTML = `
      <div><strong>${modelName}</strong></div>
      <div>Vertices: ${vertexCount.toLocaleString()}</div>
      <div>Triangles: ${Math.floor(triangleCount).toLocaleString()}</div>
    `;
    previewInfo.classList.add('visible');
  }

  showPreviewLoading(show) {
    const previewCanvas = this.modalContainer.modalContent.querySelector('#previewCanvas');
    if (!previewCanvas) return;

    let spinner = previewCanvas.querySelector('.loading-spinner');
    
    if (show && !spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      previewCanvas.appendChild(spinner);
    } else if (!show && spinner) {
      spinner.remove();
    }
  }

  showPreviewError(message) {
    const previewInfo = this.modalContainer.modalContent.querySelector('#previewInfo');
    if (!previewInfo) return;

    previewInfo.innerHTML = `<div style="color: #ff6b6b;">${message}</div>`;
    previewInfo.classList.add('visible');
  }

  renderModelTable() {
    const tbody = this.modalContainer.modalContent.querySelector('#modelTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.models.length === 0) {
      this.renderEmptyState(tbody);
      return;
    }

    this.models.forEach((model, index) => {
      const row = document.createElement('tr');
      row.className = 'model-row';
      row.dataset.index = index;

      if (this.selectedModel === index) {
        row.classList.add('selected');
      }

      // Name column
      const nameCell = document.createElement('td');
      nameCell.textContent = model.name || `Model ${index + 1}`;
      row.appendChild(nameCell);

      // Type column
      const typeCell = document.createElement('td');
      typeCell.textContent = model.type || 'Unknown';
      row.appendChild(typeCell);

      // Size column
      const sizeCell = document.createElement('td');
      sizeCell.textContent = this.formatFileSize(model.size);
      row.appendChild(sizeCell);

      // Actions column
      const actionsCell = document.createElement('td');

      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'action-buttons';

      const deleteButton = document.createElement('button');
      deleteButton.className = 'action-button delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteModel(index);
      });

      buttonsContainer.appendChild(deleteButton);
      actionsCell.appendChild(buttonsContainer);
      row.appendChild(actionsCell);

      // Row click event
      row.addEventListener('click', () => {
        this.selectModel(index);
      });

      tbody.appendChild(row);
    });
  }

  renderEmptyState(tbody) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.style.textAlign = 'center';
    cell.style.padding = '40px';
    cell.style.color = '#999';
    cell.textContent = 'No models available. Click "Import" to add models.';
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  formatFileSize(bytes) {
    if (bytes === undefined || bytes === null) return 'N/A';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat(bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  selectModel(index) {
    this.selectedModel = index;

    // Update table rows
    const rows = this.modalContainer.modalContent.querySelectorAll('.model-row');
    rows.forEach(row => {
      row.classList.toggle('selected', parseInt(row.dataset.index) === index);
    });

    this.updateStatusMessage(`Selected: ${this.models[index]?.name || 'Model ' + (index + 1)}`);
    
    // Load preview
    this.loadPreviewModel(index);
  }

  importModel() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.gltf,.glb,.fbx,.obj'; // Common 3D model formats
    fileInput.multiple = true;

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      files.forEach(file => {
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const modelData = {
              name: file.name,
              type: file.type || file.name.split('.').pop().toUpperCase(),
              size: file.size,
              lastModified: file.lastModified,
              data: event.target.result
            };

            this.models.push(modelData);
            this.renderModelTable();
            this.updateStatusMessage(`Imported ${file.name}`);
          } catch (error) {
            console.error('Error importing model:', error);
            this.updateStatusMessage(`Error importing ${file.name}`);
          }
        };

        reader.onerror = () => {
          this.updateStatusMessage(`Error reading ${file.name}`);
        };

        // Read as text for JSON, array buffer for binary formats
        if (file.name.endsWith('.json')) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      });
    });

    fileInput.click();
  }

  exportModel(index) {
    if (index < 0 || index >= this.models.length) return;

    const model = this.models[index];
    let blob;

    if (typeof model.data === 'string') {
      // For JSON/text data
      blob = new Blob([model.data], { type: 'application/json' });
    } else {
      // For binary data (ArrayBuffer)
      blob = new Blob([model.data], { type: 'application/octet-stream' });
    }

    this.editor.utils.save(blob, model.name);
    this.updateStatusMessage(`Exported ${model.name}`);
  }

  deleteModel(index) {
    if (index < 0 || index >= this.models.length) return;

    const modelName = this.models[index].name;
    this.models.splice(index, 1);

    // Reset selection if needed
    if (this.selectedModel === index) {
      this.selectedModel = null;
      // Clear preview
      if (this.currentPreviewObject) {
        this.previewScene.remove(this.currentPreviewObject);
        this.currentPreviewObject = null;
      }
      const previewInfo = this.modalContainer.modalContent.querySelector('#previewInfo');
      if (previewInfo) {
        previewInfo.innerHTML = '<div class="preview-message">Select a model to see preview</div>';
        previewInfo.classList.remove('visible');
      }
    } else if (this.selectedModel > index) {
      this.selectedModel--;
    }

    this.renderModelTable();
    this.updateStatusMessage(`Deleted ${modelName}`);
  }

  updateStatusMessage(message) {
    const statusMessage = this.modalContainer.modalContent.querySelector('#statusMessage');
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  }

  setupEventListeners() {
    // Import button
    const importButton = this.modalContainer.modalContent.querySelector('#importButton');
    if (importButton) {
      importButton.addEventListener('click', () => this.importModel());
    }

    // Close button
    const closeButton = this.modalContainer.modalFooter.querySelector('#closeButton');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeEditor());
    }

    // Add button
    const addButton = this.modalContainer.modalFooter.querySelector('#addButton');
    if (addButton) {
      addButton.addEventListener('click', () => {
        if (this.selectedModel !== null) {
          this.editor.loader.loadJSON(this.modelsPath + this.modelMapping[this.selectedModel].fileName);
          this.closeEditor();
        }
      });
    }

    // Preview control buttons
    const resetCameraButton = this.modalContainer.modalContent.querySelector('#resetCameraButton');
    if (resetCameraButton) {
      resetCameraButton.addEventListener('click', () => {
        this.resetPreviewCamera();
      });
    }

    const wireframeButton = this.modalContainer.modalContent.querySelector('#wireframeButton');
    if (wireframeButton) {
      wireframeButton.addEventListener('click', () => {
        this.toggleWireframe();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.selectedModel !== null) {
        this.deleteModel(this.selectedModel);
      }
    });
  }

  resetPreviewCamera() {
    if (!this.previewCamera || !this.currentPreviewObject) return;

    this.fitModelToView(this.currentPreviewObject);
  }

  toggleWireframe() {
    if (!this.currentPreviewObject) return;

    this.currentPreviewObject.traverse((child) => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.wireframe = !mat.wireframe;
          });
        } else {
          child.material.wireframe = !child.material.wireframe;
        }
      }
    });
  }
}