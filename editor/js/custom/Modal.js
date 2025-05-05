/**
 * Classe per gestire un modal che può caricare e visualizzare pagine HTML
 */
export class Modal {
  /**
   * Crea una nuova istanza di Modal
   * @param {Object} options - Opzioni di configurazione
   * @param {string} options.title - Titolo del modal (opzionale)
   * @param {string} options.width - Larghezza del modal (default: '80%')
   * @param {string} options.height - Altezza del modal (default: '80%')
   * @param {boolean} options.draggable - Se il modal è trascinabile (default: false)
   * @param {boolean} options.resizable - Se il modal è ridimensionabile (default: false)
   * @param {string} options.containerId - ID del container in cui inserire il modal (default: document.body)
   */
  constructor(options = {}) {
    this.options = {
      title: options.title || 'Modal',
      width: options.width || '80%',
      height: options.height || '80%',
      draggable: options.draggable || false,
      resizable: options.resizable || false,
      containerId: options.containerId || null
    };
    
    this.isOpen = false;
    this.modal = null;
    this.modalContent = null;

    this.dragging = false;
    this.offset = { x: 0, y: 0 };
    
    this.create();
  }
  
  /**
   * Crea l'elemento modal nel DOM
   * @private
   */
  create() {
    // Crea il container del modal
    this.modal = document.createElement('div');
    this.modal.className = 'custom-modal';
    this.modal.style.display = 'none';
    this.modal.style.position = 'fixed';
    this.modal.style.zIndex = '1000';
    this.modal.style.backgroundColor = '#fff';
    this.modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    this.modal.style.border = '1px solid #ccc';
    this.modal.style.borderRadius = '4px';
    this.modal.style.overflow = 'hidden';
    this.modal.style.width = this.options.width;
    this.modal.style.height = this.options.height;
    this.modal.style.top = '50%';
    this.modal.style.left = '50%';
    this.modal.style.transform = 'translate(-50%, -50%)';
    
    // Crea l'header del modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'custom-modal-header';
    modalHeader.style.padding = '10px';
    modalHeader.style.backgroundColor = '#f1f1f1';
    modalHeader.style.borderBottom = '1px solid #ccc';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.cursor = this.options.draggable ? 'move' : 'default';
    
    // Titolo del modal
    const modalTitle = document.createElement('div');
    modalTitle.className = 'custom-modal-title';
    modalTitle.textContent = this.options.title;
    modalTitle.style.fontWeight = 'bold';
    
    // Bottone di chiusura
    const closeButton = document.createElement('button');
    closeButton.className = 'custom-modal-close';
    closeButton.textContent = '×';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 5px';
    closeButton.title = 'Chiudi';
    closeButton.addEventListener('click', () => this.close());
    
    // Aggiungi titolo e bottone di chiusura all'header
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Crea il contenuto del modal
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'custom-modal-content';
    this.modalContent.style.padding = '0';
    this.modalContent.style.height = 'calc(100% - 41px)'; // Altezza totale meno l'header

    
    // Assembla il modal
    this.modal.appendChild(modalHeader);
    this.modal.appendChild(this.modalContent);
    
    // Crea l'overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'custom-modal-overlay';
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.overlay.style.zIndex = '999';
    this.overlay.style.display = 'none';
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
    
    // Aggiungi il modal e l'overlay al container specificato o al body
    const container = this.options.containerId 
      ? document.getElementById(this.options.containerId) 
      : document.body;
    
    if (container) {
      container.appendChild(this.overlay);
      container.appendChild(this.modal);
    }
    
    // Configura il drag se abilitato
    if (this.options.draggable) {
      this.setupDraggable(modalHeader);
    }
    
    // Configura resize se abilitato
    if (this.options.resizable) {
      this.setupResizable();
    }
  }
  
  /**
   * Configura la funzionalità di trascinamento del modal
   * @private
   * @param {HTMLElement} handle - Elemento da usare come maniglia per il trascinamento
   */
  setupDraggable(handle) {
    handle.addEventListener('mousedown', (e) => {
      if (e.target === handle || handle.contains(e.target)) {
        e.preventDefault();
        this.dragging = true;
        
        // Calcola l'offset del mouse rispetto al modal
        const rect = this.modal.getBoundingClientRect();
        this.offset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        
        // Rimuovi transform per facilitare il posizionamento assoluto
        this.modal.style.transform = 'none';
        this.modal.style.top = rect.top + 'px';
        this.modal.style.left = rect.left + 'px';
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.dragging) {
        e.preventDefault();
        
        // Calcola la nuova posizione
        const newLeft = e.clientX - this.offset.x;
        const newTop = e.clientY - this.offset.y;
        
        // Applica la nuova posizione
        this.modal.style.left = newLeft + 'px';
        this.modal.style.top = newTop + 'px';
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.dragging = false;
    });
  }
  
  /**
   * Configura la funzionalità di ridimensionamento del modal
   * @private
   */
  setupResizable() {
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'custom-modal-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.backgroundImage = 'linear-gradient(135deg, transparent 70%, #ccc 70%, #ccc 100%)';
    
    this.modal.appendChild(resizeHandle);
    
    let isResizing = false;
    let originalWidth, originalHeight, originalX, originalY;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      
      originalWidth = this.modal.offsetWidth;
      originalHeight = this.modal.offsetHeight;
      originalX = e.clientX;
      originalY = e.clientY;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isResizing) {
        e.preventDefault();
        
        // Calcola la differenza
        const deltaX = e.clientX - originalX;
        const deltaY = e.clientY - originalY;
        
        // Applica il nuovo dimensionamento
        this.modal.style.width = (originalWidth + deltaX) + 'px';
        this.modal.style.height = (originalHeight + deltaY) + 'px';
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
    });
  }
  
  /**
   * Apre il modal e carica la pagina specificata
   * @param {string} url - URL della pagina da caricare nell'iframe
   */
  open(url) {
    // Mostra l'overlay e il modal
    this.overlay.style.display = 'block';
    this.modal.style.display = 'block';    
    this.isOpen = true;
    
    // Previeni lo scroll della pagina sottostante
    document.body.style.overflow = 'hidden';
    
    // Emetti un evento personalizzato
    this.modal.dispatchEvent(new CustomEvent('modal:open', {
      detail: { url }
    }));
  }
  
  /**
   * Chiude il modal
   */
  close() {
    // Nascondi l'overlay e il modal
    this.overlay.style.display = 'none';
    this.modal.style.display = 'none';    
    this.isOpen = false;
    
    // Ripristina lo scroll della pagina
    document.body.style.overflow = '';
    
    // Emetti un evento personalizzato
    this.modal.dispatchEvent(new CustomEvent('modal:close'));
  }
      
  /**
   * Cambia il titolo del modal
   * @param {string} title - Nuovo titolo
   */
  setTitle(title) {
    const titleElement = this.modal.querySelector('.custom-modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }
  
  /**
   * Cambia le dimensioni del modal
   * @param {string|number} width - Nuova larghezza
   * @param {string|number} height - Nuova altezza
   */
  setSize(width, height) {
    if (width) {
      this.modal.style.width = typeof width === 'number' ? width + 'px' : width;
    }
    
    if (height) {
      this.modal.style.height = typeof height === 'number' ? height + 'px' : height;
    }
  }
  
  /**
   * Verifica se il modal è aperto
   * @returns {boolean} True se il modal è aperto, altrimenti false
   */
  isVisible() {
    return this.isOpen;
  }
  
  /**
   * Aggiungi un event listener al modal
   * @param {string} event - Nome dell'evento
   * @param {Function} callback - Funzione da chiamare quando l'evento si verifica
   */
  on(event, callback) {
    this.modal.addEventListener(`modal:${event}`, (e) => {
      callback(e.detail, e);
    });
  }
}