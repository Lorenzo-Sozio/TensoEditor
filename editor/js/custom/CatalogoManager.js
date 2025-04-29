import { SetValueCommand } from "../commands/SetValueCommand.js";

export class CatalogoManager {
  constructor(editor) {
    this.catalogo = [];
    this.server = "http://127.0.0.1:3000/api"; // Cambia questo con l'URL del tuo server
  }

  async getCatalogo() {
    try {
      const response = await fetch(this.server + "/catalogo");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.catalogo = await response.json();
      return this.catalogo;
    } catch (error) {
      console.error('Errore nel recupero del catalogo:', error);
      throw error;
    }
  }

  async renderTree() {
    if (this.catalogo.length === 0)
      await this.getCatalogo();

    if (!this.catalogo || this.catalogo.length === 0) {
      return '<div>Nessun dato disponibile nel catalogo</div>';
    }
    //if(document.getElementsByClassName("catalogo-container") != undefined) return;

    let html = `
        <div class="catalogo-container">
          <div class="search-bar">
            <div class="inline">
              <input type="text" id="search-input" placeholder="Cerca articoli..." />
              <button id="search-button">
                <img src="./images/search.svg" alt="" width="26" height="26" />
              </button>
            </div>  
          </div>
          <div id="${this.treeId}" class="treeview">
      `;
    /*<button id="expand-all">Espandi tutto</button>
          <button id="collapse-all">Collassa tutto</button>*/

    const generateTree = (items) => {
      let treeHtml = '<ul class="tree-ul">';

      items.forEach(item => {
        // Determina se è un elemento padre (ha Articolo_Descrizione) o figlio
        const isParent = item.Articolo_Descrizione !== undefined;
        const hasChildren = item.children && item.children.length > 0;

        treeHtml += `<li class="tree-li">
                    <div class="tree-item-container" data-id="${isParent ? item.Articolo_ID : item.ID}" data-code="${isParent ? item.Articolo_Codice : item.code}">
                        ${hasChildren ? '<span class="caret"></span>' : '<span class="spacer"></span>'}
                        <span class="tree-item ${isParent ? 'parent-item' : 'child-item'}">
                            ${isParent ?
            `${item.Articolo_Descrizione} (${item.Articolo_Codice})` :
            `${item.code} (Qty: ${item.quantity})`}
                        </span>
                    </div>`;

        if (hasChildren) {
          treeHtml += `<div class="nested">${generateTree(item.children)}</div>`;
        }

        treeHtml += `</li>`;
      });

      treeHtml += '</ul>';
      return treeHtml;
    };

    html += generateTree(this.catalogo);
    html += `</div>
              <div class="confirm-container" id="confirm-container" style="display: none;">
                <button id="confirm-button">Conferma Associazione</button>
              </div>
            </div>`;
    html += `</div></div>`;

    // Stile CSS
    html += `
        <style>
          .catalogo-container {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 5px;
          }
          
          .search-bar {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          
          .search-bar input {
            padding: 8px;
            flex-grow: 1;
            min-width: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          
          .search-bar button {
            //padding: 8px 15px;
            //background-color: #4CAF50;
            vertical-align: middle;
            height: 33px;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .search-bar button:hover {
            background-color:rgb(106, 183, 255);
          }
          
          .treeview {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            background-color: #f9f9f9;
            max-height: 80vh;
            overflow-y: auto;
          }
          
          .tree-ul {
            list-style-type: none;
            padding-left: 20px;
            margin: 0;
          }
          
          .tree-li {
            margin: 5px 0;
            position: relative;
          }
          
          .tree-item-container {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .caret {
            cursor: pointer;
            user-select: none;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            transition: transform 0.2s;
          }
          
          .caret-down {
            transform: rotate(90deg);
          }
          
          .spacer {
            display: inline-block;
            width: 18px;
          }
          
          .tree-item {
            padding: 5px 8px;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .parent-item {
            font-weight: bold;
            color: #2c3e50;
          }
          
          .child-item {
            color: #7f8c8d;
          }
          
          .tree-item:hover {
            background-color: #e0e0e0;
          }
          
          .tree-item.highlight {
            background-color: #ffe0b2;
            color: #e65100;
          }
          
          .nested {
            display: none;
            padding-left: 20px;
          }
          
          .active {
            display: block;
          }

           .tree-item.selected {
            background-color: #4CAF50 !important;
            color: white !important;
          }
          
          .confirm-container {
            margin-top: 15px;
            text-align: center;
            padding: 10px;
          }
          
          #confirm-button {
            padding: 8px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
          }
          
          #confirm-button:hover {
            background-color: #45a049;
          }
        </style>
      `;

    return html;
  }

  // Aggiungi questo metodo per gestire gli eventi dopo l'iniezione dell'HTML
  setupTreeEvents() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const confirmButton = document.getElementById('confirm-button');
    const confirmContainer = document.getElementById('confirm-container');
    //const expandAllBtn = document.getElementById('expand-all');
    //const collapseAllBtn = document.getElementById('collapse-all');
    let selectedArticolo_ID = null;
    let selectedArticolo_Codice = null;
    
    document.querySelectorAll(`#${this.treeId} .tree-item-container`).forEach(container => {
      container.addEventListener('click', function (e) {
        // Evita la propagazione quando si clicca sul caret
        if (e.target.classList.contains('caret')) return;

        // Rimuovi la selezione precedente
        document.querySelectorAll(`#${this.treeId} .tree-item`).forEach(item => {
          item.classList.remove('selected');
        });

        // Aggiungi la selezione all'item corrente
        const item = this.querySelector('.tree-item');
        item.classList.add('selected');
        selectedArticolo_ID = this.getAttribute('data-id');
        selectedArticolo_Codice = this.getAttribute('data-code');
        
        // Mostra il pulsante Conferma
        confirmContainer.style.display = 'block';
      });
    });

    // Gestione caret per espandere/collassare
    document.querySelectorAll(`#${this.treeId} .caret`).forEach(caret => {
      caret.addEventListener('click', function () {
        this.classList.toggle('caret-down');
        this.parentElement.parentElement.querySelector('.nested').classList.toggle('active');
      });
    });

    // Funzione di filtro
    const filterTree = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const treeItems = document.querySelectorAll(`#${this.treeId} .tree-item`);
      let hasResults = false;

      treeItems.forEach(item => {
        item.classList.remove('highlight');
        const text = item.textContent.toLowerCase();
        const li = item.closest('li');

        if (text.includes(searchTerm)) {
          hasResults = true;
          item.classList.add('highlight');
          // Espandi i parent
          let parent = li.parentNode.closest('li');
          while (parent) {
            const nested = parent.querySelector('.nested');
            const caret = parent.querySelector('.caret');
            if (nested) {
              nested.classList.add('active');
              if (caret) caret.classList.add('caret-down');
            }
            parent = parent.parentNode.closest('li');
          }
        }

        li.style.display = text.includes(searchTerm) ? '' : 'none';
      });

      return hasResults;
    };

    // Espandi tutto
    /*expandAllBtn.addEventListener('click', () => {
      document.querySelectorAll(`#${this.treeId} .nested`).forEach(nested => {
        nested.classList.add('active');
      });
      document.querySelectorAll(`#${this.treeId} .caret`).forEach(caret => {
        caret.classList.add('caret-down');
      });
    });*/

    // Collassa tutto
    /*collapseAllBtn.addEventListener('click', () => {
      document.querySelectorAll(`#${this.treeId} .nested`).forEach(nested => {
        nested.classList.remove('active');
      });
      document.querySelectorAll(`#${this.treeId} .caret`).forEach(caret => {
        caret.classList.remove('caret-down');
      });
    });*/

    // Gestione pulsante Conferma
    confirmButton.addEventListener('click', () => {
      if(!editor.selected){
        alert("Seleziona un oggetto prima di confermare l'associazione.");
        return;
      }
        
      console.log('Articolo selezionato:', selectedArticolo_ID, selectedArticolo_Codice);
      if (selectedArticolo_ID && selectedArticolo_Codice) {
        let object = editor.selected;

        editor.execute(new SetValueCommand(editor, object, 'userData', {
          'ARTICOLO_SYSID' : selectedArticolo_ID,
          'ART_Codice' : selectedArticolo_Codice
        }));
        

        //console.log('Articolo selezionato:', selectedArticolo_ID);

        // Nascondi il pulsante dopo la conferma
        confirmContainer.style.display = 'none';
      }
    });

    // Gestione eventi ricerca (mantieni l'esistente)
    searchButton.addEventListener('click', filterTree);
    searchInput.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') {
        filterTree();
      }
    });
  }
}