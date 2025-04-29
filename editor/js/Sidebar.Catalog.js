import { UIDiv } from './libs/ui.js';
import { CatalogoManager } from './custom/CatalogoManager.js';

function SidebarCatalog(editor) {
	const catalogoManager = new CatalogoManager();
	const container = new UIDiv();
	container.setId('catalog');

	// Catalogo

	catalogoManager.renderTree().then((html) => {
		container.setInnerHTML(html);
		catalogoManager.setupTreeEvents();
	})

	return container;
}

export { SidebarCatalog };
