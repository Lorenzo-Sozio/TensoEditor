export default class ContextMenu {
  constructor(editor, options) {
    this.options = options;
    this.menu = null;
    this.init();
  }

  init() {
    // Crea il contenitore del menu
    this.menu = document.createElement('div');
    this.menu.className = 'custom-context-menu';
    Object.assign(this.menu.style, {
      position: 'absolute',
      display: 'none',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '4px',
      zIndex: '10000',
      minWidth: '200px',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px'
    });
    document.body.appendChild(this.menu);

    // Aggiungi le voci al menu
    this.options.items.forEach(item => {
      if (item.type === 'separator') {
        this.addSeparator();
        return;
      }

      this.addMenuItem(item);
    });

    // Aggiungi event listeners
    this.addEventListeners();
  }

  addSeparator() {
    const separator = document.createElement('div');
    Object.assign(separator.style, {
      height: '1px',
      backgroundColor: '#e0e0e0',
      margin: '4px 0'
    });
    this.menu.appendChild(separator);
  }

  addMenuItem(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.id = item.value;
    Object.assign(menuItem.style, {
      padding: '8px 16px',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: item.disabled ? '#999' : '#333',
      pointerEvents: item.disabled ? 'none' : 'auto'
    });

    // Label e shortcut
    const labelContainer = document.createElement('div');
    labelContainer.textContent = item.label;

    const shortcut = document.createElement('span');
    shortcut.textContent = item.shortcut || '';
    shortcut.style.color = '#999';
    shortcut.style.marginLeft = '20px';
    shortcut.style.fontSize = '12px';

    menuItem.appendChild(labelContainer);
    menuItem.appendChild(shortcut);

    // Icona (opzionale)
    if (item.icon) {
      const icon = document.createElement('span');
      icon.textContent = item.icon;
      icon.style.marginRight = '8px';
      labelContainer.prepend(icon);
    }

    // Stile hover
    if (!item.disabled) {
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#f0f0f0';

        // Gestione sottomenu
        if (item.submenu) {
          this.showSubMenu(menuItem, item.submenu);
        } else {
          this.removeSubMenus();
        }
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
      });
    }

    // Click handler
    if (!item.disabled && !item.submenu) {
      menuItem.addEventListener('click', () => {
        this.options.onItemClick(item);
        this.hide();
      });
    }

    this.menu.appendChild(menuItem);
  }

  showSubMenu(parentElement, submenuItems) {
    this.removeSubMenus();

    const submenu = document.createElement('div');
    submenu.className = 'submenu';
    Object.assign(submenu.style, {
      position: 'absolute',
      left: '100%',
      top: '0',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '0 4px 4px 4px',
      minWidth: '160px'
    });

    // Aggiungi voci al sottomenu
    submenuItems.forEach(item => {

      const submenuItem = document.createElement('div');
      submenuItem.textContent = item.label;
      Object.assign(submenuItem.style, {
        padding: '8px 16px',
        cursor: 'pointer'
      });

      submenuItem.addEventListener('mouseenter', () => {
        submenuItem.style.backgroundColor = '#f0f0f0';
      });

      submenuItem.addEventListener('mouseleave', () => {
        submenuItem.style.backgroundColor = 'transparent';
      });

      submenuItem.addEventListener('click', (e) => {
        e.stopPropagation();
        this.options.onItemClick(item);
        this.hide();
      });

      submenu.appendChild(submenuItem);
    });

    parentElement.appendChild(submenu);
    parentElement.style.position = 'relative';
  }

  removeSubMenus() {
    document.querySelectorAll('.submenu').forEach(el => el.remove());
  }

  simulateLeftClick(element) {
    // Crea e dispatcha un evento click
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(clickEvent);
  }

  addEventListeners() {
    // Gestione eventi
    document.addEventListener('contextmenu', (e) => {
      // Simula click sinistro sull'elemento
      this.simulateLeftClick(e.target);  

      const target = e.target;
      //const parent = target.closest('section');

      console.log("e.target.class: " + e.target.className);
      if (!e.target.classList.contains('option')){
        this.hide();
        return;
      }
      
      e.preventDefault();
      
          
      this.show(e.clientX, e.clientY);
    });

    document.addEventListener('click', () => this.hide());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }

  show(x, y) {
    this.removeSubMenus();
    this.menu.style.display = 'block';

    // Posizionamento senza uscire dalla viewport
    const rect = this.menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const adjustedX = x + rect.width > windowWidth ? windowWidth - rect.width - 5 : x;
    const adjustedY = y + rect.height > windowHeight ? windowHeight - rect.height - 5 : y;

    this.menu.style.left = `${adjustedX}px`;
    this.menu.style.top = `${adjustedY}px`;
  }

  hide() {
    if (this.menu) {
      this.menu.style.display = 'none';
      this.removeSubMenus();
    }
  }

  destroy() {
    if (this.menu) {
      document.body.removeChild(this.menu);
      this.menu = null;
    }
    document.removeEventListener('contextmenu', this.show);
    document.removeEventListener('click', this.hide);
  }
}