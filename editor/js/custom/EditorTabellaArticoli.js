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
    this.mainArticle = object.userData ||{
      ARTICOLO_ID: "",
      ART_Codice: "",
      ART_Descrizione: "",
      tipo: "",
      children: []
    };


    this.init();
  }

  getEditorHTML() {
    return `
      <div class="container">        
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="mainArticleCode" class="required">Codice Articolo</label>
                    <input type="text" id="mainArticleCode" placeholder="Inserisci codice" required>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="mainArticleName" class="required">Descrizione Articolo</label>
                    <input type="text" id="mainArticleName" placeholder="Inserisci descrizione" required>
                </div>
            </div>
        </div>
        
        <h2>Componenti</h2>
        
        <div class="search-container">
            <div class="form-group">
                <label for="searchInput">Cerca Articolo nel Catalogo</label>
                <input type="text" id="searchInput" placeholder="Digita per cercare nel catalogo...">
            </div>
            <div id="searchResults"></div>
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
        
       
        
        <div class="form-group">
            <label for="jsonOutput">JSON Output</label>
            <div class="json-container">
                <pre id="jsonOutput">{}</pre>
            </div>
        </div>
        
        <div class="footer">
            <button id="cancelButton">Annulla</button>
            <button id="saveButton">Salva</button>
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
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .search-container {
          margin-bottom: 20px;
        }
        
        #searchResults {
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
        
        .footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .footer button {
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        #cancelButton {
          background-color: #f1f1f1;
          border: 1px solid #ddd;
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
    } catch (error) {
      console.error('Errore nel caricamento del catalogo:', error);
    }
  }

  setupEventListeners() {
    // Aggiungi listener per elementi dell'interfaccia
    const searchInput = this.modalContainer.modalContent.querySelector('#searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.searchCatalog());
    }

    // Aggiungi listener per i campi dell'articolo principale
    const mainArticleCode = this.modalContainer.modalContent.querySelector('#mainArticleCode');
    if (mainArticleCode) {
      mainArticleCode.addEventListener('change', () => this.updateMainArticle());
    }

    const mainArticleName = this.modalContainer.modalContent.querySelector('#mainArticleName');
    if (mainArticleName) {
      mainArticleName.addEventListener('change', () => this.updateMainArticle());
    }

    const mainArticleType = this.modalContainer.modalContent.querySelector('#mainArticleType');
    if (mainArticleType) {
      mainArticleType.addEventListener('change', () => this.updateMainArticle());
    }

    const mainArticleUnitMeasure = this.modalContainer.modalContent.querySelector('#mainArticleUnitMeasure');
    if (mainArticleUnitMeasure) {
      mainArticleUnitMeasure.addEventListener('change', () => this.updateMainArticle());
    }

    // Pulsanti footer
    const cancelButton = this.modalContainer.modalContent.querySelector('#cancelButton');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.closeEditor());
    }

    const saveButton = this.modalContainer.modalContent.querySelector('#saveButton');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveArticle());
    }
  }

  updateMainArticle() {
    const mainArticleCode = this.modalContainer.modalContent.querySelector('#mainArticleCode');
    const mainArticleDescription = this.modalContainer.modalContent.querySelector('#mainArticleDescription');
    const mainArticleType = this.modalContainer.modalContent.querySelector('#mainArticleType');
    const mainArticleUnitMeasure = this.modalContainer.modalContent.querySelector('#mainArticleUnitMeasure');

    if (mainArticleCode) this.mainArticle.ART_Codice = mainArticleCode.value;
    if (mainArticleDescription) this.mainArticle.ART_Descrizione = mainArticleDescription.value;
    if (mainArticleType) this.mainArticle.tipo = mainArticleType.value;
    if (mainArticleUnitMeasure) this.mainArticle.unita_misura = mainArticleUnitMeasure.value;

    this.updateJsonView();
  }

  searchCatalog() {
    const searchInput = this.modalContainer.modalContent.querySelector('#searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const resultsContainer = this.modalContainer.modalContent.querySelector('#searchResults');

    if (!resultsContainer) return;

    // Se il campo di ricerca è vuoto, nascondi i risultati
    if (!searchTerm) {
      resultsContainer.style.display = 'none';
      return;
    }

    console.log('Ricerca nel catalogo:', searchTerm);
    console.log('CatalogData:', this.catalogData);
    // Filtra il catalogo in base al termine di ricerca
    const filteredItems = this.catalogData.filter(item =>
      item.ART_Codice.toLowerCase().includes(searchTerm) ||
      item.ART_Descrizione.toLowerCase().includes(searchTerm)
    );

    // Mostra i risultati
    resultsContainer.innerHTML = '';
    if (filteredItems.length) {
      filteredItems.forEach(item => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `<strong>${item.ART_Codice}</strong> - ${item.ART_Descrizione}`;
        resultItem.addEventListener('click', () => this.addComponentFromCatalog(item));
        resultsContainer.appendChild(resultItem);
      });
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

    // Aggiungi il nuovo componente
    this.mainArticle.children.push(component);

    // Aggiorna la tabella e nascondi i risultati di ricerca
    this.renderComponentsTable();
    this.updateJsonView();

    const searchResults = this.modalContainer.modalContent.querySelector('#searchResults');
    const searchInput = this.modalContainer.modalContent.querySelector('#searchInput');
    if (searchResults) searchResults.style.display = 'none';
    if (searchInput) searchInput.value = '';
  }

  addEmptyComponent() {
    const component = {
      id: "",
      nome: "",
      tipo: "",
      quantita: 1
    };

    this.mainArticle.children.push(component);
    this.renderComponentsTable();
    this.updateJsonView();
  }

  updateComponent(index, field, value) {
    if (field === 'id') {
      this.mainArticle.children[index].id = value;

      // Aggiorna anche nome e tipo se trovati nel catalogo
      const catalogItem = this.catalogData.find(item => item.id === value);
      if (catalogItem) {
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

  updateJsonView() {
    const jsonOutput = this.modalContainer.modalContent.querySelector('#jsonOutput');
    if (jsonOutput) {
      jsonOutput.textContent = JSON.stringify(this.mainArticle, null, 2);
    }
  }

  setArticle(article) {
    this.mainArticle = article;

    // Aggiorna i campi dell'interfaccia
    const mainArticleCode = this.modalContainer.modalContent.querySelector('#mainArticleCode');
    const mainArticleName = this.modalContainer.modalContent.querySelector('#mainArticleName');
    const mainArticleType = this.modalContainer.modalContent.querySelector('#mainArticleType');
    const mainArticleUnitMeasure = this.modalContainer.modalContent.querySelector('#mainArticleUnitMeasure');

    if (mainArticleCode) mainArticleCode.value = article.id || '';
    if (mainArticleName) mainArticleName.value = article.nome || '';
    if (mainArticleType) mainArticleType.value = article.tipo || '';
    if (mainArticleUnitMeasure) mainArticleUnitMeasure.value = article.unita_misura || '';

    this.updateJsonView();
    this.renderComponentsTable();
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