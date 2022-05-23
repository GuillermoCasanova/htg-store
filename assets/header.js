
class HeaderDrawer  extends MenuDrawer {
    constructor() {
      super();
      this.setUpEvents(); 
    }
    
    closeDrawer() {
        this.changeToggleText('menu', 'closed');
        document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
        document.querySelector('header').classList.remove('menu-is-open'); 
        document.documentElement.style.removeProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    }

    changeToggleText(pWhatIsOpened, pState) {
        if(pWhatIsOpened === 'menu') {

            if(pState === 'closed') {
                this.text = this.headerDrawerToggle.querySelector('[data-text]');
                this.text.textContent = 'Open Menu';  
            } else {
                this.text = this.headerDrawerToggle.querySelector('[data-text]');
                this.text.textContent = 'Close Menu';  
            }

        }

        if(pWhatIsOpened === 'cart') {
            this.text = this.headerDrawerToggle.querySelector('[data-text]');
            this.text.textContent = 'Close Cart'; 
        }
    }
    
    openDrawer() {
        
        this.header = this.header || document.getElementById('shopify-section-header');
        this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
        document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
        
        this.changeToggleText('menu');
        trapFocus(this, this.headerDrawerToggle);
        document.querySelector('header').classList.add('menu-is-open'); 
    }

    toggleHeaderMenus() {
        // if(this.offCanvasCart.querySelector('[data-cart]').classList.contains('is-active')) {
        //     this.offCanvasCart.close();
        //     document.querySelector('[data-cart-toggle]').classList.remove('is-open');
        //     return
        // }

        if(this.headerDrawerMenuContainer.hasAttribute('open')) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    switchToCartToggle() {  
        this.text = this.headerDrawerToggle.querySelector('[data-text]');
        this.text.textContent = 'Close Cart'; 
        this.headerDrawerToggle.setAttribute('aria-expanded', true);
        this.headerDrawerToggle.setAttribute('aria-label', 'Close Cart');
        this.headerDrawerToggle.classList.add('is-close'); 
    }


    setUpEvents() {
        this.offCanvasCart = document.querySelector('cart-notification');
        this.headerDrawerToggle = this.querySelector('[data-header-drawer-toggle]'); 
        this.headerDrawerMenu = this.querySelector('[data-header-drawer-menu]');
        this.headerDrawerMenuContainer = this.querySelector('[data-menu-drawer-container]');
       
        this.headerDrawerToggle.addEventListener('click', () => {
            this.toggleHeaderMenus(); 
        }); 
    }
  }
  
  customElements.define('header-drawer', HeaderDrawer);
  

  

class CartToggle extends HTMLElement {
  constructor() {
    super(); 
    this.cartNotification = document.querySelector('cart-notification');
    this.cartCount = this.querySelector('[data-cart-count]');
    this.cartCountAria = this.querySelector('[data-cart-count-aria]');
    this.setUpEvents(); 
  }
  
  updateToggleQty(pCart) {
   this.cartCount.textContent = pCart.item_count; 
   this.cartCountAria.textContent = pCart.item_count > 1 ? `${pCart.item_count} Items` : `${pCart.item_count} Item`;
  }

  setUpEvents() {
    this.querySelector('[data-cart-toggle]').addEventListener('click', (event) => {
      event.preventDefault();

      if(this.getAttribute('aria-expanded') == 'false') {
        this.setAttribute('aria-expanded', true); 
      } else {
        this.setAttribute('aria-expanded', false); 
      }

      event.currentTarget.classList.add('is-open');
      
        this.cartNotification.open(); 
        document.querySelector('header-drawer').switchToCartToggle(); 
    
        // fetch('/cart.js', { 
        //   method: 'GET',
        //   headers: {
        //   'Content-Type': 'application/json'
        //   }
        //   })
        //   .then((response) => response.json())
        //   .then((parsedState) => {
        //     this.cartNotification.renderContents(parsedState);
        //   })
        //   .catch((e) => {
        //     console.error(e);
        //   });

    })
  }
}

customElements.define('cart-toggle', CartToggle);



class MenuDropdown extends HTMLElement {
  constructor() {
    super(); 
  
    this.dropDownToggle = this.querySelector('button');
    this.dropDownContent = this.querySelector('.header__submenu');

    this.addEventListener('keyup', this.onKeyUp);
    this.addEventListener('focusout', this.onFocusOut.bind(this));  
    this.addEventListener('click', (e) => {
      if(e.target.hasAttribute('href')) {
        this.close(); 
      }
    }); 

    this.setUpEvents(); 
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;


    const toggleElement = this.querySelector("button[aria-expanded='true']");
    if (!toggleElement) return;

    // const summaryElement = toggleElement.querySelector('summary');
    // toggleElement.removeAttribute('open');

    this.close(); 
    toggleElement.focus();
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  close() {
    this.dropDownContent.setAttribute('aria-hidden', true); 
    this.dropDownToggle.setAttribute('aria-expanded', false); 
  }

  setUpEvents() {
    if(this.dropDownToggle) {
      this.dropDownToggle.addEventListener('click', () => {
    
          if(this.dropDownContent.getAttribute('aria-hidden') == 'false') {
            this.dropDownContent.setAttribute('aria-hidden', true); 
            this.dropDownToggle.setAttribute('aria-expanded', false); 
          } else {
            this.dropDownContent.setAttribute('aria-hidden', false); 
            this.dropDownToggle.setAttribute('aria-expanded', true); 
          }
      }); 
    }
  }
}

customElements.define('menu-dropdown', MenuDropdown);



