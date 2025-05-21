import { Modal } from "./Modal.js";

export class ModelManager {
  constructor(editor, models = []) {
    this.editor = editor;
    this.models = models || [];
    this.selectedModel = null;
    this.modelsPath = 'models/';

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
      width: '70%',
      height: '60%',
      draggable: false,
      resizable: false,
    });

    this.init();
  }

  init() {
    this.loadModels();
    this.openEditor();
    this.renderModelTable();
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
    this.modalContainer.close();
  }

  getEditorHTML() {
    const columns = [
      { id: 'name', label: 'Name', width: '60%' },
      { id: 'type', label: 'Type', width: '15%' },
      { id: 'size', label: 'Size', width: '15%' },
      { id: 'actions', label: 'Actions', width: '10%' }
    ];

    return `
      <div class="model-manager-container">
        <div class="editor-header">
          <div class="title">Gestione Modelli</div>
          <div class="header-actions">
            <button class="modal-buttons" id="importButton">Import</button>
          </div>
        </div>
        
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
          min-width: 60px;
          border-radius: 3px;
          border: 1px solid #ddd;
          background-color: #f8f9fa;
          cursor: pointer;
          font-size: 12px;
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
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .model-manager-container {
            color: #ddd;
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

      /*const exportButton = document.createElement('button');
      exportButton.className = 'action-button export';
      exportButton.textContent = 'Export';
      exportButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.exportModel(index);
      });*/

      const deleteButton = document.createElement('button');
      deleteButton.className = 'action-button delete';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteModel(index);
      });

      //buttonsContainer.appendChild(exportButton);
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
        this.editor.loader.loadJSON(this.modelsPath + this.modelMapping[this.selectedModel].fileName);
        this.closeEditor()
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.selectedModel !== null) {
        this.deleteModel(this.selectedModel);
      }
    });
  }
}