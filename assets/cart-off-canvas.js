
class CartOffCanvas extends HTMLElement {
    constructor() {
      super();
  
      this.headerDrawer = document.querySelector('header-drawer');
      this.notification = document.getElementById('cart-notification');
      this.header = document.querySelector('sticky-header');
      this.onBodyClick = this.handleBodyClick.bind(this);
      this.productsContainer = this.querySelector('.cart-notification-product');
      this.totals = this.querySelector('[data-cart-notification-totals]');
      this.overlay = this.querySelector('[data-cart-nofication-overlay]');
      this.cartToggle = document.querySelectorAll('cart-toggle'); 
      this.cartFooter = this.querySelector('[data-cart-footer]'); 
      this.cartOrderDetails = this.querySelector('[data-cart-order-details]');
  
      this.openCartMessage = this.querySelector('[data-open-cart-message]');
      this.addedItemMessage = this.querySelector('[data-added-item-message]');
  
      document.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
  
      this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
        closeButton.addEventListener('click', this.close.bind(this))
      );
  
  
      this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
  
      this.debouncedOnChange = debounce((event) => {
        this.onChange(event);
      }, 300);
  
      this.addEventListener('change', this.debouncedOnChange.bind(this));
  
      if(window.location.hash === '#cart') {
        this.open(); 
        this.showLatestCart();
        this.overlay.classList.add('is-visible');
      }

    }
    
    showAddedItemMessage() {
      this.openCartMessage.setAttribute('aria-hidden', true); 
      this.openCartMessage.setAttribute('hidden', true); 
      this.addedItemMessage.setAttribute('aria-hidden', false); 
      this.addedItemMessage.removeAttribute('hidden'); 
    }
  
    showNormalCartTitle() {
      this.addedItemMessage.setAttribute('aria-hidden', true); 
      this.addedItemMessage.setAttribute('hidden', true); 
      this.openCartMessage.setAttribute('aria-hidden', false); 
      this.openCartMessage.removeAttribute('hidden'); 
    }
  
    open(addedItemToCart = false) {
  
      if(addedItemToCart) {
        this.showAddedItemMessage(); 
      }  else {
        this.showNormalCartTitle();
      }
  
      this.notification.classList.remove('is-hidden');
      this.notification.classList.add('is-active');
  
      this.notification.addEventListener('transitionend', () => {
        this.notification.querySelector('button').focus();
      }, { once: true });
  
      document.body.addEventListener('click', this.onBodyClick);
      document.body.classList.add('overflow-hidden-tablet');
      //document.querySelector('header').classList.add('menu-is-open'); 
      this.overlay.classList.add('is-visible');
      this.showLatestCart();
    }
  
    close() {
      this.notification.classList.remove('is-active');
      this.notification.classList.add('is-hidden');
  
      this.notification.addEventListener('transitionend', () => {
        removeTrapFocus(this.notification);
        document.querySelector('cart-toggle').querySelector('button').focus(); 
      }, { once: true });
    
      document.body.removeEventListener('click', this.onBodyClick);
      document.body.classList.remove('overflow-hidden-tablet');
      //this.headerDrawer.close(); 
      document.querySelector('header').classList.remove('menu-is-open'); 
      this.overlay.classList.remove('is-visible');
    }
  
    onChange(event) {
      this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
      this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    }
  
    showLatestCart() {

      fetch(window.Shopify.routes.root + `${routes.cart_get_url}`)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.cartToggle.forEach((elem) => elem.updateToggleQty(parsedState)); 
        this.renderContents(parsedState);
      })
      .catch((err) => {
        console.log(err);
      }); 
    }
  
    updateQuantity(line, quantity, name) {
      this.enableLoading(line);
  
      const body = JSON.stringify({
        line,
        quantity,
        sections: this.getSectionsToRender().map((section) => section.section),
        sections_url: window.location.pathname
      });

  
      fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
        .then((response) => {
          return response.text();
        })
        .then((state) => {
            const parsedState = JSON.parse(state);
            // this.classList.toggle('is-empty', parsedState.item_count === 0);
            // document.getElementById('main-cart-footer')?.classList.toggle('is-empty', parsedState.item_count === 0);
            this.renderContents(parsedState);
            this.cartToggle.forEach((elem) => elem.updateToggleQty(parsedState)); 
            //this.disableLoading();
  
        }).catch((err) => {
          console.log(err); 
          // this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
          // document.getElementById('cart-errors').textContent = window.cartStrings.error;
          //this.disableLoading();
        });
    }
  
    showEmptyCartState() {
      this.productsContainer.innerHTML = ""; 
      this.cartFooter.innerHTML = ""; 
      this.querySelector('[data-cart]').classList.add('is-empty'); 
  
    }
  
  
    resetCartState() {
      this.querySelector('[data-cart]').classList.remove('is-empty'); 
  
    }
  
  
    renderContents(parsedState) {
  
      let cartContents = {
        items: parsedState.items, 
        originl_total_price: parsedState.originl_total_price,
        currency: parsedState.currency, 
        requires_shipping: parsedState.requires_shipping
      };
  
      document.querySelector('.cart-notification-product').innerHTML = ""; 
  
      let allProducts = []; 
  
      cartContents.items.forEach(function(element, index) { 
  
        let cartItem = element; 
        let item = null; 
  
       /* Hack to get product image thumbnail
         *   - If image is not null
         *     - Remove file extension, add _small, and re-add extension
         *     - Create server relative link
         *   - A hard-coded url of no-image
        */
       var prodImg;
       if (cartItem.image !== null) {
         prodImg = cartItem.image
           .replace(/(\.[^.]*)$/, '_medium$1')
           .replace('http:', '');
       } else {
         prodImg =
           '//cdn.shopify.com/s/assets/admin/no-image-medium-cc9732cb976dd349a0df1d39816fbcc7.gif';
       }
  
      //  if (cartItem.properties !== null) {
      //    $.each(cartItem.properties, function(key, value) {
      //      if (key.charAt(0) === '_' || !value) {
      //        delete cartItem.properties[key];
      //      }
      //    });
      //  }
  
  
      // Create item's data object and add to 'items' array
      item = {
        originalObject: cartItem, 
        key: cartItem.key,
        line: index + 1, // Shopify uses a 1+ index in the API
        url: cartItem.url,
        img: prodImg,
        name: cartItem.product_title,
        options: cartItem.options_with_values,
        variation: cartItem.variant_title,
        properties: cartItem.properties,
        itemAdd: cartItem.quantity + 1,
        itemMinus: cartItem.quantity - 1,
        itemQty: cartItem.quantity,
        original_price: cartItem.original_price,
        final_price: new Shopify.currency().formatMoney(cartItem.final_price,window.moneyFormat),
        variant: cartItem.variant,
        regular_price: new Shopify.currency().formatMoney(cartItem.price.regular_price,window.moneyFormat), 
        price: new Shopify.currency().formatMoney(cartItem.price,window.moneyFormat),
        subtotal: new Shopify.currency().formatMoney(cartItem.final_line_price,window.moneyFormat),
        discountedPrice: new Shopify.currency().formatMoney(
          cartItem.price - cartItem.total_discount / cartItem.quantity,
         window.moneyFormat
        ),
        discounts: cartItem.discounts,
        discountsApplied:
          cartItem.price === cartItem.price - cartItem.total_discount
            ? false
            : true,
        vendor: cartItem.vendor
      };
  
       allProducts.push(item); 
  
  
      }); 
  
        // this.productId = parsedState.id;
        // parsedState.sections && this.getSectionsToRender().forEach((section => {
        //   document.getElementById(section.id).innerHTML =
        //     this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
        // }));
        
  
       let products =  allProducts.reduce((prevValue, currentVal) => prevValue + productTemplate(currentVal), "");
  
       let productList = `
        <ul class="cart-notification-products__inner">
            ${products}
        </ul>
        `;
  
        let total = new Shopify.currency().formatMoney(parsedState.total_price);
        let formAction = this.querySelector('[data-cart-footer]').dataset.formAction; 
        let checkoutText = this.querySelector('[data-cart-footer]').dataset.checkoutText; 

        let orderDetailsTemplate = `
          <div data-cart-notification-totals class="cart-nofication__totals">
              <h3 class="cart-nofication__totals__subtotal">Total</h3>
              <p class="cart-nofication__totals__subtotal-value" data-cart-subtotal>
              ${total}
              </p>
          </div>`;
  
        let cartFooterTemplate = `
          <div class="cart-notification__links">
            <form action="${formAction}" method="post" id="cart">
              <button class="button button--secondary  button--large button--full-width" name="checkout" form="cart">
                ${checkoutText}
              </button>
            </form>
          </div>`;
        
  
        if(products.length <= 0) {
          this.cartOrderDetails.innerHTML = orderDetailsTemplate; 
          this.showEmptyCartState();
        } else {
          this.cartOrderDetails.innerHTML = orderDetailsTemplate; 
          this.productsContainer.innerHTML = productList; 
          this.cartFooter.innerHTML = cartFooterTemplate; 
          this.resetCartState(); 
        }
  
        trapFocus(this);
        this.notification.querySelector('button').focus();
  
        
        function variantTemplate(pItem) {
          
          let product_contents = pItem; 

            if(product_contents.originalObject.product_has_only_default_variant == false) {
              
              
              function getOptionHtml() {
                  if(product_contents.originalObject.product_has_only_default_variant == false) {
      
                    let productOptionTemplate ='';
                    
                    product_contents.originalObject.options_with_values.forEach(function(element) {
                      let template = `
                        <div class="product-option">
                          <span class="option-name">${element.name}: </span>
                          <span class="option-value">${element.value}</span>
                        </div>
                      `;
                      productOptionTemplate =  productOptionTemplate + template; 
                    }); 
      
                    // if( Object.keys(pItem.originalObject.properties).legth > 0) {
                    //     pItem.originalObject.properties.forEach(function(element) {
                    //       let property_first_char = element.first.slide(0, 1); 
                    //       if(element.last !== '' && property_first_char !== "_") {
                    //         let template = `
                    //         <div class="product-option">
                    //         <dt>${element.first}: </dt>
                    //         <dd>
      
                    //               {%- if property.last contains '/uploads/' -%}
                    //               <a href="{{ property.last }}" target="_blank">
                    //                 {{ property.last | split: '/' | last }}
                    //               </a>
                    //             {%- else -%}
                    //               {{ property.last }}
                    //             {%- endif -%}
                                
                    //             ${element.last}
                    //         </dd>
                    //       </div>
                            
                    //         `;
                    //       }
                    //       productOptionTemplate = productOptionTemplate + template; 
                    //     }); 
                    // }
      
                    if(product_contents.discounts.length > 0 ) {
      
                      let discounts = `
                        <ul class="discounts list-unstyled" role="list" aria-label="Discount">
                          ${(() => {
                            
                              let discounts = ''; 
      
                              product_contents.discounts.forEach(function(discount) {
                                discounts = discounts + `<li>${discount.title}</li>`; 
                              }); 
                              
                              return discounts;
                            })()}
                        </ul>
                      `;
                      productOptionTemplate = productOptionTemplate + discounts; 
                    }
      
                    return productOptionTemplate; 
                    
                  } else {
                    return ' '
                  }
              }
      
              return getOptionHtml(); 
      
            } else {
              return ''
            }
          }
        
        function productTemplate(pProduct, pProductIndex, pCart) {
  
          let productIndex =  pProduct.line; 
          let prod_contents = pProduct; 
          
          // </p>
          // <p class="cart-notification__product__info__variant"> 

          return  `
          <li>
              <div class="cart-notification__product">
    
                <div class="cart-notification__product__inner">
                  <div class="cart-notification__product__image-container">
                    <a  href="${pProduct.url}" title="Go to ${pProduct.name}" class="cart-notification__product__image">
                      <img src="${pProduct.img}" role="presentation" aria-hidden="true"/>
                    </a>
                  </div>
    
                  <div class="cart-notification__product__info">
                    <h3 class="cart-notification__product__info__title">
                      ${pProduct.name}
                    </h3>
                   
                      ${variantTemplate(prod_contents)}

                      <p class="cart-notification__product__info__price">
                         ${pProduct.subtotal}
                      </p>
  
                      <p class="cart-notification__product__info__quantity-select">
                      <quantity-select data-index="${productIndex}">
                    
                      <label class="option-name" for="Quantity-${productIndex}"> 
                      
                        <span class="visually-hidden">
                        Quantity
                        </span>
  
                        <span aria-hidden="true">
                          Qty:
                        </span>
                      </label>
                      <span class="option-name">
                      ${prod_contents.itemQty}
                      </span>
                      <select  
                        class="quantity__input"
                        name="updates[]"
                        data-quantity-update
                        value="${prod_contents.itemQty}"
                        id="Quantity-${productIndex}"  data-index="${productIndex}">
                          <option value="0" ${prod_contents.itemQty === 0 ? 'selected' : '' }>
                              0
                          </option>
                          <option value="1"  ${prod_contents.itemQty === 1 ? 'selected' : '' }>
                              1
                          </option>
                          <option value="2"  ${prod_contents.itemQty === 2 ? 'selected' : '' }>
                              2
                          </option>
                          <option value="3"  ${prod_contents.itemQty === 3 ? 'selected' : '' }>
                              3
                          </option>
                          <option value="4"  ${prod_contents.itemQty === 4 ? 'selected' : '' }>
                              4
                          </option>
                          <option value="5"  ${prod_contents.itemQty === 5 ? 'selected' : '' }>
                            5
                          </option>
                          <option value="6"  ${prod_contents.itemQty === 6 ? 'selected' : '' }>
                            6
                          </option>
                          <option value="7"  ${prod_contents.itemQty === 7 ? 'selected' : '' }>
                            7
                          </option>
                          <option value="8"  ${prod_contents.itemQty === 8 ? 'selected' : '' }>
                            8
                          </option>
                          <option value="9"  ${prod_contents.itemQty === 9 ? 'selected' : '' }>
                            9
                          </option>
                      </select>
                </quantity-select>
            
                      </p>
                  </div>
  
                  <div class="cart-notification__remove-btn"> 
                    <cart-remove-button id="Remove-${productIndex}" data-index="${productIndex}">
                      <a href="${pProduct.url}" class="button button--tertiary">
                      
                        Remove
  
                        <span class="visually-hidden">
                        ${prod_contents.name}
                        ${variantTemplate(prod_contents)}
                        </span>
                      </a>
                    </cart-remove-button>
                  </div>
                </div>
  
              
              </div>
          </li>
          `; 
        }
  
  
  
    }
  
  
  //   <div class="loading-overlay  hidden" hidden>
  //   <div class="loading-overlay__spinner">
  //     <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
  //       <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
  //     </svg>
  //   </div>
  // </div>
  
    enableLoading(line) {
      //document.getElementById('main-cart-items').classList.add('cart__items--disabled');
     ///this.querySelectorAll('.loading-overlay')[line - 1].classList.remove('hidden');
      document.activeElement.blur();
     // this.lineItemStatusElement.setAttribute('aria-hidden', false);
    }
  
  
    getSectionsToRender() {
      return [
        {
          id: 'cart-notification-product',
          selector: `#cart-notification-product-${this.productId}`,
        },
        {
          id: 'cart-notification-button'
        },
        {
          id: 'cart-icon-bubble'
        }
      ];
    }
  
    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector(selector).innerHTML;
    }
  
    handleBodyClick(evt) {
      // const target = evt.target;
      // if (target !== this.notification && !target.closest('cart-notification')) {
      //   const disclosure = target.closest('details-disclosure');
      //   this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      //   this.close();
      // }
    }
  
    setActiveElement(element) {
      this.activeElement = element;
    }
  }
  
  customElements.define('cart-off-canvas', CartOffCanvas);
  


class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      if(this.closest('cart-items')) {
        this.closest('cart-items').updateQuantity(this.dataset.index, 0);
      } 

      if(this.closest('cart-off-canvas')) {
        this.closest('cart-off-canvas').updateQuantity(this.dataset.index, 0);
      }
    });
  }

}

customElements.define('cart-remove-button', CartRemoveButton);
   
  