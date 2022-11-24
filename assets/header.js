

class HeaderDrawer  extends MenuDrawer {
  constructor() {
    super();
    this.setUpEvents(); 
  }
  
  closeDrawer() {
      this.changeToggleText('menu', 'closed');
      this.header = this.header || document.getElementById('shopify-section-header');
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      document.querySelector('header').classList.remove('menu-is-open'); 
     // document.documentElement.style.removeProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
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

      this.changeToggleText('menu');
      document.querySelector('header').classList.add('menu-is-open'); 
      this.querySelector('aside').style.height = `calc(101vh - ${document.querySelector('sticky-header').clientHeight + 'px'})`
      trapFocus(this, this.headerDrawerToggle);

  }

  toggleHeaderMenus() {
      // if(this.offCanvasCart.querySelector('[data-cart]').classList.contains('is-active')) {
      //     this.offCanvasCart.close();
      //     document.querySelector('[data-cart-toggle]').classList.remove('is-open');
      //     return
      // }

      console.log('toggle me');
      
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
    this.cartNotification = document.querySelector('cart-off-canvas');
    this.cartCount = this.querySelector('[data-cart-count]');
    this.cartCountAria = this.querySelector('[data-cart-count-aria]');
    this.cartCountBubble = this.querySelector('[data-cart-count-bubble]'); 
    this.setUpEvents(); 
  }

  updateToggleQty(pCart) {
    this.cartCount.textContent = pCart.item_count; 
    this.cartCountAria.textContent = pCart.item_count > 1 ? `${pCart.item_count} Items` : `${pCart.item_count} Item`

  if(pCart.item_count > 0) {
    this.cartCountBubble.classList.remove('is-hidden') 
  } else {
    this.cartCountBubble.classList.add('is-hidden') 
  }
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
    })
  }
}

customElements.define('cart-toggle', CartToggle);



class SearchToggle extends HTMLElement {
constructor() {
  super(); 
  this.button = this.querySelector('button');
  this.setUpEvents(); 

  document.addEventListener('click', (event) => {
    
    var isClickInside = document.querySelector('[data-search-modal]').contains(event.target);
    var isToggleButton = this.contains(event.target); 

    if (!isClickInside && !isToggleButton) {
      this.closeSearch(); 
    }
  });
}


setUpCloseEvents() {    
  document.addEventListener('keyup', (evt) => {
    evt.code === 'Escape' && this.closeSearch()
  }, { once: true });
}

closeSearch() {
  this.button.setAttribute('aria-expanded', false); 
  this.button.blur();
  document.querySelector('[data-search-modal]').setAttribute('aria-hidden', true);
}

setUpEvents() {

  this.button.addEventListener('click', (event) => {
    if(this.button.getAttribute('aria-expanded') == 'false') {
      this.button.setAttribute('aria-expanded', true); 
    } else {
      this.button.setAttribute('aria-expanded', false); 
    }     

    this.button.blur();

    if(document.querySelector('[data-search-modal]').getAttribute('aria-hidden') == 'false') {
      document.querySelector('[data-search-modal]').setAttribute('aria-hidden', true);
      removeTrapFocus(); 
    }
    else {
      this.setUpCloseEvents();
      document.querySelector('[data-search-modal]').setAttribute('aria-hidden', false);
      trapFocus(document.querySelector('[data-search-modal]'), document.querySelector('[data-search-modal] input[type="search"]'));
    }
  }); 
}

}

customElements.define('search-toggle', SearchToggle);



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

    document.addEventListener('DOMContentLoaded', (event)=> {
      this.removePreloadClasses(); 
    }); 

  }

  removePreloadClasses() {
    setTimeout(()=> {
      this.querySelectorAll('.preload').forEach((elem)=> {
        elem.classList.remove('preload'); 
      });
    }, 300); 
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

