import { Modal } from "./Modal.js";
import { CatalogoManager } from "./CatalogoManager.js";

export class EditorTabellaArticoli {
  constructor(editor, object) {
    this.editor = editor;
    this.object = object;
    this.modalContainer = new Modal({
      title: 'Editor Tabella Articoli',
      width: '80%',
      height: '75%',
      draggable: false,
      resizable: true,
      //containerId: "jsonEditor" // Opzionale: specifica il container
    });
    this.catalogData = [];
    this.mainArticle = object.userData || {
      ARTICOLO_ID: "",
      ART_Codice: "",
      ART_Descrizione: "",
      tipo: "",
      children: [],
      ART_Alternative: []
    };
    this.init();
  }

  getEditorHTML() {
    return `
       <div class="container">
          <div class="search-container">
            <div class="form-group">
                <label for="searchInputArt">Cerca Articolo nel Catalogo</label>
                <input type="text" id="searchInputArt" placeholder="Digita per cercare nel catalogo...">
            </div>
            <div id="searchResultsArt"></div>
        </div>

        <h2>Componenti</h2>
        
        <div class="search-container">
            <div class="form-group">
                <label for="searchInputChild">Cerca Articolo nel Catalogo</label>
                <input type="text" id="searchInputChild" placeholder="Digita per cercare nel catalogo...">
            </div>
            <div id="searchResultsChild"></div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Art. Codice</th>
                        <th>Art. Descrizione</th>
                        <th>Tipo</th>
                        <th>Quantità</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody id="componentsTableBody">
                    <!-- I componenti verranno inseriti qui dinamicamente -->
                </tbody>
            </table>
        </div>
        
        <h2>Articoli Alternativi</h2>
        
        <div class="search-container">
            <div class="form-group">
                <label for="searchInputAlternative">Cerca Articolo Alternativo nel Catalogo</label>
                <input type="text" id="searchInputAlternative" placeholder="Digita per cercare nel catalogo...">
            </div>
            <div id="searchResultsAlternative"></div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Art. Codice</th>
                        <th>Art. Descrizione</th>
                        <th>Tipo</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody id="alternativesTableBody">
                    <!-- Gli articoli alternativi verranno inseriti qui dinamicamente -->
                </tbody>
            </table>
        </div>
        
        <div class="form-group">
            <label for="jsonOutput">JSON Output</label>
            <div class="json-container">
                <pre id="jsonOutput">{}</pre>
            </div>
        </div>
      </div>
      
      <style>
        .editor-tabella-articoli-container {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0,0,0,0.1);
        }
        
        .container {
          flex:1;
        }

        .container h1 {
          color: #333;
          margin-bottom: 20px;
          font-size: 24px;
        }
        
        .container h2 {
          color: #444;
          margin: 25px 0 15px;
          font-size: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
        
        .row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .col {
          flex: 1;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
        }
        
        .form-group label.required:after {
          content: " *";
          color: #e74c3c;
        }
        
        .form-group input, 
        .form-group select {
          width: -webkit-fill-available;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .search-container {
          margin-bottom: 20px;
        }
        
        #searchResultsChild {
          display: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          margin-top: 5px;
        }
        
        #searchResultsArt {
          display: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          margin-top: 5px;
        }
        
        #searchResultsAlternative {
          display: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          margin-top: 5px;
        }

        .search-result-item {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        
        .search-result-item:hover {
          background-color: #f5f5f5;
        }
        
        .table-container {
          margin-bottom: 20px;
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .action-panel {
          margin-bottom: 20px;
        }
        
        .action-button {
          padding: 8px 15px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .action-button:hover {
          background-color: #2980b9;
        }
        
        .delete-button {
          background-color: #e74c3c;
        }
        
        .delete-button:hover {
          background-color: #c0392b;
        }
        
        .json-container {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          background-color: #f8f9fa;
          max-height: 200px;
          overflow-y: auto;
        }
        
        #jsonOutput {
          margin: 0;
          font-family: monospace;
          white-space: pre-wrap;
        }
        .search-results-table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 5px;
        }

        .search-results-table th {
          background-color: #f8f9fa;
          padding: 8px 12px;
          text-align: left;
          font-weight: bold;
        }

        .search-results-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #eee;
        }

        .search-results-table tr.search-result-item:hover {
          background-color: #f5f5f5;
          cursor: pointer;
        }

        /* Aggiungi queste regole alla fine della sezione <style> esistente */

@media (prefers-color-scheme: dark) {
  .editor-tabella-articoli-container {
    background-color: #111;
    color: #aaa;
  }

  .container h1, 
  .container h2 {
    color: #ddd;
    border-bottom-color: #333;
  }

  .form-group label {
    color: #bbb;
  }

  .form-group input,
  .form-group select {
    background-color: #222;
    border-color: #333;
    color: #ddd;
  }

  .search-container {
    background-color: #111;
  }

  #searchResultsChild,
  #searchResultsArt,
  #searchResultsAlternative {
    background-color: #222;
    border-color: #333;
  }

  .search-result-item {
    color: #ddd;
    border-bottom-color: #333;
  }

  .search-result-item:hover {
    background-color: #2a2a2a;
  }

  table {
    border-color: #333;
  }

  th {
    background-color: #1a1a1a;
    color: #ddd;
  }

  td {
    border-bottom-color: #333;
    color: #ddd;
  }

  tr:hover {
    background-color: #2a2a2a;
  }

  .action-button {
    background-color: #3498db;
    color: white;
  }

  .action-button:hover {
    background-color: #2980b9;
  }

  .delete-button {
    background-color: #e74c3c;
  }

  .delete-button:hover {
    background-color: #c0392b;
  }

  .json-container {
    background-color: #1a1a1a;
    border-color: #333;
    color: #ddd;
  }

  #jsonOutput {
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
    background-color: #2ecc71;
    color: white;
  }

  #saveButton:hover {
    background-color: #27ae60;
  }

  .search-results-table th {
    background-color: #1a1a1a;
    color: #ddd;
  }

  .search-results-table td {
    border-bottom-color: #333;
    color: #ddd;
  }

  .search-results-table tr.search-result-item:hover {
    background-color: #2a2a2a;
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
                <button class="modal-button" id="cancelButton">Annulla</button>
                <button class="modal-button" id="saveButton">Salva</button>
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
            
            .modal-button {
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
              
              .modal-button {
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

  async init() {
    try {
      // Carica i dati dal catalogo
      const catalogoManager = new CatalogoManager();
      this.catalogData = await catalogoManager.getCatalogo();

      this.openEditor();
      // Inizializza il JSON nell'interfaccia
      this.updateJsonView();
      this.renderComponentsTable();
      this.renderAlternativesTable();
    } catch (error) {
      console.error('Errore nel caricamento del catalogo:', error);
    }
  }

  setupEventListeners() {
    // Aggiungi listener per elementi dell'interfaccia
    const searchInputChild = this.modalContainer.modalContent.querySelector('#searchInputChild');
    if (searchInputChild) {
      searchInputChild.addEventListener('input', () => this.searchCatalog(false));
    }

    const searchInputArt = this.modalContainer.modalContent.querySelector('#searchInputArt');
    if (searchInputArt) {
      searchInputArt.addEventListener('input', () => this.searchCatalog(true));
    }

    const searchInputAlternative = this.modalContainer.modalContent.querySelector('#searchInputAlternative');
    if (searchInputAlternative) {
      searchInputAlternative.addEventListener('input', () => this.searchCatalog('alternative'));
    }

    // Pulsanti footer
    const cancelButton = this.modalContainer.modalFooter.querySelector('#cancelButton');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.closeEditor());
    }

    const saveButton = this.modalContainer.modalFooter.querySelector('#saveButton');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveArticle());
    }
  }

  updateMainArticle(item) {
    this.mainArticle.ARTICOLO_ID = item.ARTICOLO_ID || 0;
    this.mainArticle.ART_Codice = item.ART_Codice;
    this.mainArticle.ART_Descrizione = item.ART_Descrizione;
    this.mainArticle.tipo = item.tipo;
    //this.mainArticle.children = item.children || [];

    this.updateJsonView();
  }

  searchCatalog(searchType) {
    let searchInput, searchTerm, resultsContainer;
    
    if (searchType === true) { // Main article search
      searchInput = this.modalContainer.modalContent.querySelector('#searchInputArt');
      resultsContainer = this.modalContainer.modalContent.querySelector('#searchResultsArt');
    } else if (searchType === false) { // Components search
      searchInput = this.modalContainer.modalContent.querySelector('#searchInputChild');
      resultsContainer = this.modalContainer.modalContent.querySelector('#searchResultsChild');
    } else if (searchType === 'alternative') { // Alternatives search
      searchInput = this.modalContainer.modalContent.querySelector('#searchInputAlternative');
      resultsContainer = this.modalContainer.modalContent.querySelector('#searchResultsAlternative');
    }

    searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

    if (!resultsContainer) return;

    // Se il campo di ricerca è vuoto, nascondi i risultati
    if (!searchTerm) {
      resultsContainer.style.display = 'none';
      return;
    }

    // Filtra il catalogo in base al termine di ricerca
    const filteredItems = this.catalogData.filter(item =>
      item.ART_Codice.toLowerCase().includes(searchTerm) ||
      item.ART_Descrizione.toLowerCase().includes(searchTerm)
    );

    // Mostra i risultati in una tabella
    resultsContainer.innerHTML = '';
    if (filteredItems.length) {
      const table = document.createElement('table');
      table.className = 'search-results-table';
      table.style.width = '100%';

      // Intestazione della tabella
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Codice', 'Descrizione', 'Tipo'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Corpo della tabella
      const tbody = document.createElement('tbody');
      filteredItems.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'search-result-item';

        // Cella nascosta per ARTICOLO_ID
        const idCell = document.createElement('td');
        idCell.style.display = 'none';
        idCell.textContent = item.ARTICOLO_ID;
        idCell.setAttribute('data-ref', 'ARTICOLO_ID');  // Add reference
        row.appendChild(idCell);

        // Cella Codice
        const codeCell = document.createElement('td');
        codeCell.textContent = item.ART_Codice;
        codeCell.setAttribute('data-ref', 'ART_Codice');  // Add reference
        row.appendChild(codeCell);

        // Cella Descrizione
        const descCell = document.createElement('td');
        descCell.textContent = item.ART_Descrizione;
        descCell.setAttribute('data-ref', 'ART_Descrizione');  // Add reference
        row.appendChild(descCell);

        // Cella Tipo
        const typeCell = document.createElement('td');
        typeCell.textContent = item.tipo || '';
        typeCell.setAttribute('data-ref', 'tipo');  // Add reference
        row.appendChild(typeCell);

        if (searchType === true) {
          row.addEventListener('click', () => this.updateMainArticle(item));
        } else if (searchType === false) {
          row.addEventListener('click', () => this.addComponentFromCatalog(item));
        } else if (searchType === 'alternative') {
          row.addEventListener('click', () => this.addAlternativeFromCatalog(item));
        }
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      resultsContainer.appendChild(table);
      resultsContainer.style.display = 'block';
    } else {
      resultsContainer.innerHTML = '<div class="search-result-item">Nessun risultato trovato</div>';
      resultsContainer.style.display = 'block';
    }
  }

  addComponentFromCatalog(item) {
    const component = {
      ARTICOLO_ID: item.ARTICOLO_ID,
      ART_Codice: item.ART_Codice,
      ART_Descrizione: item.ART_Descrizione,
      tipo: item.tipo,
      quantita: 1
    };

    if (!this.mainArticle.ARTICOLO_ID) this.mainArticle.ARTICOLO_ID = 0;
    if (!this.mainArticle.ART_Codice) this.mainArticle.ART_Codice = '';
    if (!this.mainArticle.ART_Descrizione) this.mainArticle.ART_Descrizione = '';
    if (!this.mainArticle.children) this.mainArticle.children = [];

    // Aggiungi il nuovo componente
    this.mainArticle.children.push(component);

    // Aggiorna la tabella e nascondi i risultati di ricerca
    this.renderComponentsTable();
    this.updateJsonView();

    const searchResultsChild = this.modalContainer.modalContent.querySelector('#searchResultsChild');
    const searchInputChild = this.modalContainer.modalContent.querySelector('#searchInputChild');
    if (searchResultsChild) searchResultsChild.style.display = 'none';
    if (searchInputChild) searchInputChild.value = '';
  }

  addAlternativeFromCatalog(item) {
    const alternative = {
      ARTICOLO_ID: item.ARTICOLO_ID,
      ART_Codice: item.ART_Codice,
      ART_Descrizione: item.ART_Descrizione,
      tipo: item.tipo
    };

    if (!this.mainArticle.ART_Alternative) this.mainArticle.ART_Alternative = [];

    // Aggiungi il nuovo articolo alternativo
    this.mainArticle.ART_Alternative.push(alternative);

    // Aggiorna la tabella e nascondi i risultati di ricerca
    this.renderAlternativesTable();
    this.updateJsonView();

    const searchResultsAlternative = this.modalContainer.modalContent.querySelector('#searchResultsAlternative');
    const searchInputAlternative = this.modalContainer.modalContent.querySelector('#searchInputAlternative');
    if (searchResultsAlternative) searchResultsAlternative.style.display = 'none';
    if (searchInputAlternative) searchInputAlternative.value = '';
  }

  updateComponent(index, field, value) {
    if (field === 'id') {
      this.mainArticle.children[index].id = value;

      // Aggiorna anche nome e tipo se trovati nel catalogo
      const catalogItem = this.catalogData.find(item => item.id === value);
      if (catalogItem) {
        this.mainArticle.children[index].ARTICOLO_ID = catalogItem.ARTICOLO_ID;
        this.mainArticle.children[index].ART_Codice = catalogItem.ART_Codice;
        this.mainArticle.children[index].ART_Descrizione = catalogItem.ART_Descrizione;
        this.mainArticle.children[index].tipo = catalogItem.tipo;
      }
    } else if (field === 'quantita') {
      const qty = parseInt(value);
      this.mainArticle.children[index].quantita = isNaN(qty) ? 1 : qty;
    }

    this.updateJsonView();
    this.renderComponentsTable(); // Ri-render per aggiornare nome e tipo se cambiati
  }

  removeComponent(index) {
    this.mainArticle.children.splice(index, 1);
    this.renderComponentsTable();
    this.updateJsonView();
  }

  removeAlternative(index) {
    this.mainArticle.ART_Alternative.splice(index, 1);
    this.renderAlternativesTable();
    this.updateJsonView();
  }

  renderComponentsTable() {
    const tableBody = this.modalContainer.modalContent.querySelector('#componentsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    this.mainArticle.children.forEach((component, index) => {
      const row = document.createElement('tr');

      // Cella Codice
      const codeCell = document.createElement('td');
      const codeInput = document.createElement('input');
      codeInput.type = 'text';
      codeInput.value = component.ART_Codice || '';
      codeInput.addEventListener('change', () => this.updateComponent(index, 'ART_Codice', codeInput.value));
      codeCell.appendChild(codeInput);

      // Cella Descrizione
      const nameCell = document.createElement('td');
      nameCell.textContent = component.ART_Descrizione || '';

      // Cella Tipo
      const typeCell = document.createElement('td');
      typeCell.textContent = component.tipo || '';

      // Cella Quantità
      const qtyCell = document.createElement('td');
      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = component.quantita;
      qtyInput.addEventListener('change', () => this.updateComponent(index, 'quantita', qtyInput.value));
      qtyCell.appendChild(qtyInput);

      // Cella Azioni
      const actionCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.className = 'action-button delete-button';
      deleteButton.textContent = 'Elimina';
      deleteButton.addEventListener('click', () => this.removeComponent(index));
      actionCell.appendChild(deleteButton);

      // Aggiungi tutte le celle alla riga
      row.appendChild(codeCell);
      row.appendChild(nameCell);
      row.appendChild(typeCell);
      row.appendChild(qtyCell);
      row.appendChild(actionCell);

      tableBody.appendChild(row);
    });
  }

  renderAlternativesTable() {
    const tableBody = this.modalContainer.modalContent.querySelector('#alternativesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!this.mainArticle.ART_Alternative) this.mainArticle.ART_Alternative = [];

    this.mainArticle.ART_Alternative.forEach((alternative, index) => {
      const row = document.createElement('tr');

      // Cella Codice
      const codeCell = document.createElement('td');
      codeCell.textContent = alternative.ART_Codice || '';

      // Cella Descrizione
      const nameCell = document.createElement('td');
      nameCell.textContent = alternative.ART_Descrizione || '';

      // Cella Tipo
      const typeCell = document.createElement('td');
      typeCell.textContent = alternative.tipo || '';

      // Cella Azioni
      const actionCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.className = 'action-button delete-button';
      deleteButton.textContent = 'Elimina';
      deleteButton.addEventListener('click', () => this.removeAlternative(index));
      actionCell.appendChild(deleteButton);

      // Aggiungi tutte le celle alla riga
      row.appendChild(codeCell);
      row.appendChild(nameCell);
      row.appendChild(typeCell);
      row.appendChild(actionCell);

      tableBody.appendChild(row);
    });
  }

  updateJsonView() {
    const jsonOutput = this.modalContainer.modalContent.querySelector('#jsonOutput');
    if (jsonOutput) {
      jsonOutput.textContent = JSON.stringify(this.mainArticle, null, 2);
    }
  }

  getArticle() {
    return this.mainArticle;
  }

  closeEditor() {
    console.log('Chiusura editor articoli...');
    this.modalContainer.close();
  }

  openEditor() {
    this.modalContainer.modalContent.innerHTML = this.getEditorHTML();

    const footerContent = this.getFooterHTML();
    this.modalContainer.setFooter(footerContent);

    this.modalContainer.open();

    this.setupEventListeners();
  }

  saveArticle() {
    // Qui puoi implementare la logica per salvare l'articolo
    console.log('Articolo salvato:', this.mainArticle);
    // Emetti un evento o chiama una callback per gestire il salvataggio
    if (this.editor && this.editor.signals) {
      this.editor.signals.editJsonData.dispatch(this.object, this.mainArticle);
    }

    this.closeEditor();
  }
}