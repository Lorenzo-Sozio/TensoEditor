import { Modal } from "./Modal.js";

export class SceneJsonEditor {
  constructor(editor, jsonData) {
    this.editor = editor;
    this.jsonData = jsonData || [];
    this.editingRow = null;
    this.selectedNode = null;
    this.expandedNodes = new Set();

    // Configurazione tabella
    this.columns = [
      { id: 'ART_Codice', label: 'Articolo Codice', width: '30%', editable: true },
      { id: 'ART_Descrizione', label: 'Articolo Descrizione', width: '50%', editable: true },
      { id: 'quantita', label: 'Quantità', width: '20%', editable: true, type: 'number' }
    ];

    this.modalContainer = new Modal({
      title: 'JSON Tree Table Editor',
      width: '80%',
      height: '75%',
      draggable: false,
      resizable: false,
    });


    this.init();
  }

  init() {
    // Imposta lo stato iniziale dei nodi espansi
    this.setupInitialExpandedState(this.jsonData);

    // Apri l'editor e renderizza la tabella
    this.openEditor();
    this.renderTreeTable();
    this.setupEventListeners();
  }

  setupInitialExpandedState(nodes, path = '') {
    if (!nodes || !Array.isArray(nodes)) return;

    nodes.forEach((node, index) => {
      const nodePath = path ? `${path}.${index}` : `${index}`;

      // Aggiungi il nodo al set dei nodi espansi
      if (node.children && node.children.length > 0) {
        this.expandedNodes.add(nodePath);
        this.setupInitialExpandedState(node.children, nodePath);
      }
    });
  }

  openEditor() {
    this.modalContainer.modalContent.innerHTML = this.getEditorHTML();

    const footerContent = this.getFooterHTML();
    this.modalContainer.setFooter(footerContent);
  }

  closeEditor() {
    this.modalContainer.close();
  }

  getEditorHTML() {
    return `
        <div class="scene-json-editor-container">
          <div class="editor-header">
            <div class="search-container">
              <input type="text" id="searchInput" placeholder="Cerca..." class="search-input">
              <span class="search-icon">🔍</span>
            </div>
            <div class="editor-actions">
              <button class="modal-buttons" id="expandAllButton" title="Espandi tutti">⊞</button>
              <button class="modal-buttons" id="collapseAllButton" title="Comprimi tutti">⊟</button>
              <button class="modal-buttons" id="addItemButton" title="Aggiungi elemento">+</button>
            </div>
          </div>
          
          <div class="tree-table-container">
            <table id="jsonTreeTable">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  ${this.columns.map(col => `<th style="width: ${col.width}">${col.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
          
        <div class="status-bar">
              <span id="statusMessage">Pronto</span>
            </div>
        </div>
        
        <style>
          .scene-json-editor-container {
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
            margin-bottom: 10px;
          }
          
          .search-container {
            position: relative;
          }
          
          .search-input {
            padding: 8px 30px 8px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
          }
          
          .search-icon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #888;
            pointer-events: none;
          }
          
          .editor-actions {
            display: flex;
            gap: 8px;
          }
          
          .editor-actions button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            padding: 0;
            border-radius: 4px;
          }
          
          .tree-table-container {
            flex: 1;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #fff;
            margin-bottom: 10px;
          }
          
          #jsonTreeTable {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          
          #jsonTreeTable th {
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
          
          #jsonTreeTable td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            vertical-align: middle;
            height: 36px;
            box-sizing: border-box;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .tree-row {
            cursor: pointer;
            transition: background-color 0.1s ease;
          }
          
          .tree-row:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
          
          .tree-row.editing {
            background-color: rgba(0, 136, 255, 0.05);
          }
          
          .tree-row.selected {
            background-color: rgba(0, 136, 255, 0.1);
          }
          
          .tree-indent {
            display: inline-block;
            width: 16px;
            height: 16px;
          }
          
          .tree-toggle {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 20px;
              height: 20px;
              cursor: pointer;
              border-radius: 3px;
              margin-right: 4px;
              font-size: 16px;
              font-weight: bold;
              user-select: none;
              color: #555; /* Aggiunto per migliorare la visibilità */
              background-color: rgba(0, 0, 0, 0.05); /* Sfondo leggero */
          }

          /* Per dark mode */
          @media (prefers-color-scheme: dark) {
              .tree-toggle {
                  color: #ddd;
                  background-color: rgba(255, 255, 255, 0.1);
              }
          }
          
          .tree-toggle:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }
          
          .tree-toggle.no-children {
            opacity: 0.3;
            cursor: default;
          }
          
          .tree-toggle.no-children:hover {
            background-color: transparent;
          }
          
          .tree-content {
            display: inline-flex;
            align-items: center;
            height: 100%;
            width: calc(100% - 16px);
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .edit-input {
            width: 100%;
            height: 28px;
            padding: 4px 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-sizing: border-box;
            font-family: inherit;
            font-size: inherit;
            outline: none;
          }
          
          .edit-input:focus {
            border-color: #08f;
            box-shadow: 0 0 0 2px rgba(0, 136, 255, 0.2);
          }
          
          .editor-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 10px;
            //border-top: 1px solid #eee;
          }
          
          .status-bar {
            color: #666;
            font-size: 13px;
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
          
          #cancelButton {
            background-color: #f1f1f1;
            border: 1px solid #ddd;
            color: #333;
          }
          
          #cancelButton:hover {
            background-color: #e0e0e0;
          }
          
          #saveButton {
            background-color: #2ecc71;
            color: white;
            border: none;
          }
          
          #saveButton:hover {
            background-color: #27ae60;
          }
          
          .empty-table-message {
            padding: 40px;
            text-align: center;
            color: #999;
            font-size: 16px;
          }
            
          /* Dark Mode */
          @media (prefers-color-scheme: dark) {
            .scene-json-editor-container {
              color: #ddd;
            }
            
            .tree-table-container {
              border-color: #333;
              background-color: #222;
            }
            
            .search-input {
              background-color: #333;
              border-color: #444;
              color: #ddd;
            }
            
            .search-icon {
              color: #777;
            }
            
            #jsonTreeTable th {
              background-color: #1a1a1a;
              border-color: #333;
              color: #888;
            }
            
            #jsonTreeTable td {
              border-color: #333;
              color: #ddd;
            }
            
            .tree-row:hover {
              background-color: rgba(21, 60, 94, 0.3);
            }
            
            .tree-row.editing {
              background-color: rgba(0, 136, 255, 0.15);
            }
            
            .tree-row.selected {
              background-color: rgba(0, 136, 255, 0.2);
            }
            
            .tree-toggle:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }
            
            .edit-input {
              background-color: #333;
              border-color: #444;
              color: #ddd;
            }
            
            #cancelButton {
              background-color: #333;
              border-color: #444;
              color: #ddd;
            }
            
            #cancelButton:hover {
              background-color: #444;
            }
            
            #saveButton {
              background-color: #2980b9;
            }
            
            #saveButton:hover {
              background-color: #3498db;
            }
            
            button {
              color: #ddd;
              background-color: #333;
            }
            
            button:hover {
              background-color: #444;
            }
            
            .editor-footer {
              border-color: #333;
            }
            
            .status-bar {
              color: #888;
            }
          }
        </style>
      `;
  }

  getFooterHTML() {
    return `
          <div class="editor-footer">
              <div class="status-bar">
              </div>
              <div class="footer-actions">
                <button class="modal-buttons" id="cancelButton">Annulla</button>
                <button class="modal-buttons" id="saveButton">Salva</button>
              </div>
            </div>
          
          <style>            
            .editor-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 10px;
              //border-top: 1px solid #eee;
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
            
            #cancelButton {
              background-color: #f1f1f1;
              border: 1px solid #ddd;
              color: #333;
            }
            
            #cancelButton:hover {
              background-color: #e0e0e0;
            }
            
            #saveButton {
              background-color: #2ecc71;
              color: white;
              border: none;
            }
            
            #saveButton:hover {
              background-color: #27ae60;
            }
              
            /* Dark Mode */
            @media (prefers-color-scheme: dark) {
              
              #cancelButton {
                background-color: #333;
                border-color: #444;
                color: #ddd;
              }
              
              #cancelButton:hover {
                background-color: #444;
              }
              
              #saveButton {
                background-color: #2980b9;
              }
              
              #saveButton:hover {
                background-color: #3498db;
              }
              
              button {
                color: #ddd;
                background-color: #333;
              }
              
              button:hover {
                background-color: #444;
              }
              
            }
          </style>
        `;
  }

  renderTreeTable() {
    const tbody = this.modalContainer.modalContent.querySelector('#jsonTreeTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!this.jsonData || this.jsonData.length === 0) {
      this.renderEmptyState(tbody);
      return;
    }

    this.renderTreeRows(tbody, this.jsonData);
  }

  renderEmptyState(tbody) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = this.columns.length + 1; // +1 per la colonna di toggle
    cell.innerHTML = `
            <div class="empty-table-message">
                <div>Nessun dato disponibile</div>
                <button class="modal-buttons" id="addFirstItemButton" style="margin-top: 10px;">Aggiungi elemento</button>
            </div>
        `;
    row.appendChild(cell);
    tbody.appendChild(row);

    // Aggiungi evento al pulsante
    const addButton = cell.querySelector('#addFirstItemButton');
    if (addButton) {
      addButton.addEventListener('click', () => this.addNewItem());
    }
  }

  // Approccio più efficiente per renderizzare i nodi in modo ricorsivo
  renderTreeRows(tbody, nodes, parentPath = '') {
    if (!nodes || !Array.isArray(nodes)) return;

    nodes.forEach((node, index) => {
      const nodePath = parentPath ? `${parentPath}.${index}` : `${index}`;
      const row = this.createTreeRow(node, nodePath);
      tbody.appendChild(row);

      // Renderizza i figli se il nodo è espanso
      if (node.children && node.children.length > 0 && this.expandedNodes.has(nodePath)) {
        this.renderTreeRows(tbody, node.children, nodePath);
      }
    });
  }

  createTreeRow(node, nodePath) {
    const row = document.createElement('tr');
    row.className = 'tree-row';
    row.dataset.path = nodePath;

    // Aggiungi classe se selezionato
    if (this.selectedNode === nodePath) {
      row.classList.add('selected');
    }

    const depth = nodePath.split('.').length - 1;
    const isParent = node.children && node.children.length > 0;
    const isExpanded = this.expandedNodes.has(nodePath);

    // Aggiungi indentazione all'intera riga
    row.style.paddingLeft = `${depth * 16}px`;

    // Cella per il toggle
    const toggleCell = this.createToggleCell(node, nodePath, depth, isParent, isExpanded);
    row.appendChild(toggleCell);

    // Celle per i dati
    this.columns.forEach(column => {
      const cell = document.createElement('td');
      const content = document.createElement('div');
      content.className = 'tree-content';

      // Formatta il valore in base al tipo
      let displayValue = node[column.id] || '';
      if (column.type === 'number' && displayValue !== '') {
        displayValue = parseFloat(displayValue).toLocaleString();
      }

      content.textContent = displayValue;
      cell.appendChild(content);
      row.appendChild(cell);
    });

    // Aggiungi eventi alla riga
    this.setupRowEvents(row, node, nodePath);

    return row;
  }

  createToggleCell(node, nodePath, depth, isParent, isExpanded) {
    const cell = document.createElement('td');
    cell.style.width = '40px';
    cell.style.textAlign = 'right';

    // Crea toggle per espandere/comprimere
    const toggle = document.createElement('span');
    toggle.className = isParent ? 'tree-toggle' : 'tree-toggle no-children';
    toggle.textContent = isParent ? (isExpanded ? '−' : '+') : '•';

    // Stile per il toggle
    toggle.style.display = 'inline-block';
    toggle.style.width = '20px';
    toggle.style.textAlign = 'center';
    toggle.style.fontSize = '16px';
    toggle.style.lineHeight = '20px';

    // Aggiungi evento di toggle solo se è un nodo genitore
    if (isParent) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNodeExpansion(nodePath);
      });
    }

    cell.appendChild(toggle);
    return cell;
  }

  setupRowEvents(row, node, nodePath) {
    // Click singolo per selezionare
    row.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        this.selectNode(nodePath);
      }
    });

    // Doppio click per modificare
    row.addEventListener('dblclick', (e) => {
      if (e.target.tagName !== 'INPUT') {
        this.editRow(row, node, nodePath);
      }
    });

    // Menu contestuale
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e, node, nodePath);
    });
  }

  toggleNodeExpansion(nodePath) {
    if (this.expandedNodes.has(nodePath)) {
      this.expandedNodes.delete(nodePath);
    } else {
      this.expandedNodes.add(nodePath);
    }

    this.renderTreeTable();
    this.updateStatusMessage(`Nodo ${this.expandedNodes.has(nodePath) ? 'espanso' : 'compresso'}`);
  }

  selectNode(nodePath) {
    this.selectedNode = nodePath;

    // Aggiorna la visualizzazione delle righe selezionate
    const rows = this.modalContainer.modalContent.querySelectorAll('.tree-row');
    rows.forEach(row => {
      row.classList.toggle('selected', row.dataset.path === nodePath);
    });

    this.updatePathStatus(nodePath);
  }

  updatePathStatus(nodePath) {
    const pathParts = nodePath.split('.');
    let currentNode = this.jsonData;
    let nodeName = '';

    // Trova il nome del nodo corrente
    for (let i = 0; i < pathParts.length; i++) {
      const index = parseInt(pathParts[i]);
      if (currentNode[index]) {
        currentNode = currentNode[index];
        nodeName = currentNode.ART_Descrizione || currentNode.ART_Codice || `Item ${index + 1}`;
      }
    }

    this.updateStatusMessage(`Selezionato: ${nodeName}`);
  }

  editRow(row, node, nodePath) {
    // Esci dalla modifica se già in editing
    if (this.editingRow) {
      this.finishEditing();
    }

    // Imposta la riga in modalità editing
    this.editingRow = { row, node, nodePath };
    row.classList.add('editing');

    // Trova le celle da modificare (salta la prima colonna che contiene il toggle)
    const cells = Array.from(row.querySelectorAll('td')).slice(1);

    // Crea input per ogni colonna
    cells.forEach((cell, index) => {
      const column = this.columns[index];
      if (!column.editable) return;

      const originalContent = cell.innerHTML;
      cell.dataset.originalContent = originalContent;

      const input = document.createElement('input');
      input.className = 'edit-input';
      input.type = column.type || 'text';
      input.value = node[column.id] || '';
      input.dataset.field = column.id;

      cell.innerHTML = '';
      cell.appendChild(input);

      // Metti il focus sul primo campo modificabile
      if (index === 0) {
        input.focus();
        input.select();
      }

      // Eventi dell'input
      this.setupEditInputEvents(input, cell);
    });
  }

  setupEditInputEvents(input, cell) {
    // Naviga tra i campi con Tab e Shift+Tab
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveAndFinishEditing();
      } else if (e.key === 'Escape') {
        this.cancelEditing();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.navigateInputs(e.shiftKey ? 'prev' : 'next');
      }
    });

    // Salva su perdita del focus
    input.addEventListener('blur', (e) => {
      // Controlla se il focus è passato ad un altro input nella stessa riga
      const relatedTarget = e.relatedTarget;
      if (!relatedTarget || !relatedTarget.classList.contains('edit-input') ||
        !this.editingRow || !this.editingRow.row.contains(relatedTarget)) {
        this.saveAndFinishEditing();
      }
    });
  }

  navigateInputs(direction) {
    if (!this.editingRow) return;

    const inputs = Array.from(this.editingRow.row.querySelectorAll('.edit-input'));
    const currentIndex = inputs.findIndex(input => input === document.activeElement);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % inputs.length;
    } else {
      newIndex = (currentIndex - 1 + inputs.length) % inputs.length;
    }

    inputs[newIndex].focus();
    inputs[newIndex].select();
  }

  saveAndFinishEditing() {
    if (!this.editingRow) return;

    const inputs = this.editingRow.row.querySelectorAll('.edit-input');
    inputs.forEach(input => {
      const field = input.dataset.field;
      let value = input.value.trim();

      // Converti il tipo in base alla colonna
      const column = this.columns.find(col => col.id === field);
      if (column && column.type === 'number') {
        value = value === '' ? '' : parseFloat(value) || 0;
      }

      this.editingRow.node[field] = value;
    });

    this.finishEditing();
    this.updateStatusMessage('Modifiche salvate');
  }

  cancelEditing() {
    if (!this.editingRow) return;

    const cells = this.editingRow.row.querySelectorAll('td');
    cells.forEach(cell => {
      if (cell.dataset.originalContent) {
        cell.innerHTML = cell.dataset.originalContent;
      }
    });

    this.finishEditing();
    this.updateStatusMessage('Modifiche annullate');
  }

  finishEditing() {
    if (this.editingRow) {
      this.editingRow.row.classList.remove('editing');
      this.editingRow = null;
      this.renderTreeTable();
    }
  }

  addNewItem(parentPath = null) {
    const newItem = {
      ART_Codice: '',
      ART_Descrizione: 'Nuovo elemento',
      quantita: 1
    };

    if (parentPath === null) {
      // Aggiungi al livello principale
      this.jsonData.push(newItem);
      const newPath = `${this.jsonData.length - 1}`;
      this.renderTreeTable();
      this.selectNode(newPath);

      // Metti in modalità editing
      setTimeout(() => {
        const row = this.findRowByPath(newPath);
        if (row) {
          this.editRow(row, newItem, newPath);
        }
      }, 50);
    } else {
      // Aggiungi come figlio di un nodo esistente
      const pathParts = parentPath.split('.');
      let currentNode = this.jsonData;

      // Naviga fino al nodo genitore
      for (let i = 0; i < pathParts.length; i++) {
        const index = parseInt(pathParts[i]);
        currentNode = currentNode[index];
      }

      // Assicurati che il nodo abbia un array di figli
      if (!currentNode.children) {
        currentNode.children = [];
      }

      // Aggiungi il nuovo elemento e assicurati che il nodo sia espanso
      currentNode.children.push(newItem);
      this.expandedNodes.add(parentPath);

      // Calcola il percorso del nuovo nodo
      const newPath = `${parentPath}.${currentNode.children.length - 1}`;

      this.renderTreeTable();
      this.selectNode(newPath);

      // Metti in modalità editing
      setTimeout(() => {
        const row = this.findRowByPath(newPath);
        if (row) {
          this.editRow(row, newItem, newPath);
        }
      }, 50);
    }
  }

  findRowByPath(path) {
    return this.modalContainer.modalContent.querySelector(`.tree-row[data-path="${path}"]`);
  }

  showContextMenu(event, node, nodePath) {
    // Seleziona il nodo cliccato
    this.selectNode(nodePath);

    // Rimuovi eventuali menu contestuali esistenti
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    // Crea il menu contestuale
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'absolute';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
    menu.style.backgroundColor = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '4px';
    menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    menu.style.zIndex = '1000';
    menu.style.minWidth = '180px';

    // Aggiungi le opzioni del menu
    const options = [
      { label: 'Modifica', icon: '✏️', action: () => this.editRow(this.findRowByPath(nodePath), node, nodePath) },
      { label: 'Aggiungi elemento', icon: '➕', action: () => this.addNewItem(nodePath) },
      { label: 'Elimina', icon: '🗑️', action: () => this.deleteNode(nodePath) }
    ];

    options.forEach(option => {
      const item = document.createElement('div');
      item.style.padding = '8px 16px';
      item.style.cursor = 'pointer';
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.innerHTML = `<span>${option.icon}</span> ${option.label}`;

      item.addEventListener('click', () => {
        menu.remove();
        option.action();
      });

      item.addEventListener('mouseover', () => {
        item.style.backgroundColor = 'rgba(0,0,0,0.05)';
      });

      item.addEventListener('mouseout', () => {
        item.style.backgroundColor = 'transparent';
      });

      menu.appendChild(item);
    });

    document.body.appendChild(menu);

    // Rimuovi il menu quando si fa clic altrove
    document.addEventListener('click', function removeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', removeMenu);
      }
    });
  }

  deleteNode(nodePath) {
    if (!nodePath) return;

    const pathParts = nodePath.split('.');
    const index = parseInt(pathParts.pop());

    if (pathParts.length === 0) {
      // Elimina dal livello principale
      this.jsonData.splice(index, 1);
    } else {
      // Elimina da un nodo annidato
      const parentPath = pathParts.join('.');
      let parentNode = this.jsonData;

      // Naviga fino al nodo genitore
      for (let i = 0; i < pathParts.length; i++) {
        const idx = parseInt(pathParts[i]);
        parentNode = parentNode[idx];
      }

      // Elimina il nodo figlio
      if (parentNode.children) {
        parentNode.children.splice(index, 1);

        // Rimuovi il nodo genitore dalla lista dei nodi espansi se non ha più figli
        if (parentNode.children.length === 0) {
          this.expandedNodes.delete(parentPath);
        }
      }
    }

    this.renderTreeTable();
    this.updateStatusMessage('Elemento eliminato');
  }

  expandAll() {
    this.collectAllPaths(this.jsonData).forEach(path => {
      this.expandedNodes.add(path);
    });
    this.renderTreeTable();
    this.updateStatusMessage('Tutti i nodi espansi');
  }

  collapseAll() {
    this.expandedNodes.clear();
    this.renderTreeTable();
    this.updateStatusMessage('Tutti i nodi compressi');
  }

  collectAllPaths(nodes, path = '') {
    let paths = [];

    if (!nodes || !Array.isArray(nodes)) return paths;

    nodes.forEach((node, index) => {
      const nodePath = path ? `${path}.${index}` : `${index}`;

      if (node.children && node.children.length > 0) {
        paths.push(nodePath);
        paths = paths.concat(this.collectAllPaths(node.children, nodePath));
      }
    });

    return paths;
  }

  searchNodes(searchText) {
    if (!searchText) {
      this.renderTreeTable();
      this.updateStatusMessage('Ricerca cancellata');
      return;
    }

    searchText = searchText.toLowerCase();
    const matches = [];

    // Funzione ricorsiva per cercare nei nodi
    const findMatches = (nodes, path = '') => {
      if (!nodes || !Array.isArray(nodes)) return;

      nodes.forEach((node, index) => {
        const nodePath = path ? `${path}.${index}` : `${index}`;

        // Cerca in tutti i campi disponibili
        const matches_in_node =
          (node.ART_Codice || '').toLowerCase().includes(searchText) ||
          (node.ART_Descrizione || '').toLowerCase().includes(searchText) ||
          String(node.quantita || '').toLowerCase().includes(searchText);

        if (matches_in_node) {
          matches.push(nodePath);

          // Espandi tutti i genitori del nodo corrispondente
          let parentPath = nodePath.split('.');
          while (parentPath.length > 1) {
            parentPath.pop();
            this.expandedNodes.add(parentPath.join('.'));
          }
        }

        // Cerca nei figli
        if (node.children && node.children.length > 0) {
          findMatches(node.children, nodePath);
        }
      });
    };

    findMatches(this.jsonData);

    // Renderizza la tabella
    this.renderTreeTable();

    // Evidenzia i risultati
    matches.forEach(path => {
      const row = this.findRowByPath(path);
      if (row) {
        row.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';

        // Scorrimento automatico al primo risultato
        if (path === matches[0]) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    this.updateStatusMessage(`Trovati ${matches.length} risultati per "${searchText}"`);
    return matches.length;
  }

  // Aggiungo i metodi mancanti alla fine della classe

  setupEventListeners() {
    // Riferimenti ai pulsanti e agli input nel modal
    const expandAllBtn = this.modalContainer.modalContent.querySelector('#expandAllButton');
    const collapseAllBtn = this.modalContainer.modalContent.querySelector('#collapseAllButton');
    const addItemBtn = this.modalContainer.modalContent.querySelector('#addItemButton');
    const saveBtn = this.modalContainer.modalFooter.querySelector('#saveButton');
    const cancelBtn = this.modalContainer.modalFooter.querySelector('#cancelButton');
    const searchInput = this.modalContainer.modalContent.querySelector('#searchInput');

    // Espandi/comprimi tutti i nodi
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => this.expandAll());
    }

    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => this.collapseAll());
    }

    // Aggiungi nuovo elemento
    if (addItemBtn) {
      addItemBtn.addEventListener('click', () => {
        // Se c'è un nodo selezionato, aggiungi come figlio di quello
        // altrimenti aggiungi al livello principale
        if (this.selectedNode) {
          this.addNewItem(this.selectedNode);
        } else {
          this.addNewItem();
        }
      });
    }

    // Salva le modifiche
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        console.log('EditingRow:', this.editingRow);
        console.log('Salva i dati JSON:', this.jsonData);
        // Termina qualsiasi modifica in corso
        if (this.editingRow) {
          this.saveAndFinishEditing();
        }

        // Salva i dati e chiudi l'editor
        this.saveData();
      });
    }

    // Annulla e chiudi
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeEditor();
      });
    }

    // Ricerca
    if (searchInput) {
      // Timeout per non eseguire la ricerca ad ogni digitazione
      let searchTimeout = null;

      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchNodes(e.target.value.trim());
        }, 300); // Ritardo di 300ms
      });

      // Tasto invio nella ricerca
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(searchTimeout);
          this.searchNodes(e.target.value.trim());
        } else if (e.key === 'Escape') {
          e.target.value = '';
          this.searchNodes('');
        }
      });
    }

    // Gestione click fuori dal modal per chiudere eventuali menu contestuali
    document.addEventListener('click', (e) => {
      const contextMenu = document.querySelector('.context-menu');
      if (contextMenu && !contextMenu.contains(e.target)) {
        contextMenu.remove();
      }
    });

    // Gestione tasti di scorciatoia
    document.addEventListener('keydown', (e) => {
      // Se stiamo modificando, non gestire altre scorciatoie
      if (this.editingRow) return;

      if (e.key === 'Delete' && this.selectedNode) {
        this.deleteNode(this.selectedNode);
      } else if (e.key === 'F2' && this.selectedNode) {
        const row = this.findRowByPath(this.selectedNode);
        const node = this.getNodeByPath(this.selectedNode);
        if (row && node) {
          this.editRow(row, node, this.selectedNode);
        }
      }
    });
  }

  updateStatusMessage(message) {
    const statusMessage = this.modalContainer.modalContent.querySelector('#statusMessage');
    if (statusMessage) {
      statusMessage.textContent = message;

      // Optional: Cancella il messaggio dopo alcuni secondi
      // setTimeout(() => {
      //     statusMessage.textContent = 'Pronto';
      // }, 3000);
    }
  }

  getNodeByPath(path) {
    if (!path) return null;

    const pathParts = path.split('.');
    let currentNode = this.jsonData;

    for (let i = 0; i < pathParts.length; i++) {
      const index = parseInt(pathParts[i]);
      if (currentNode[index] === undefined) {
        return null;
      }
      currentNode = currentNode[index];
    }

    return currentNode;
  }

  saveData() {
    let output = this.jsonData;

    try {
      output = JSON.stringify(output, null, '\t');
      output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
    } catch (e) {
      output = JSON.stringify(output);
    }

    this.editor.utils.save(new Blob([output]), `Tenso-ExportScene.json`);
  }
}