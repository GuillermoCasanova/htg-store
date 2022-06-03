if (!customElements.get('quick-add-modal')) {
  customElements.define('quick-add-modal', class QuickAddModal extends ModalDialog {
    constructor() {
      super();
      this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
    }

    hide(preventFocus = false) {
      const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      if (cartNotification) cartNotification.setActiveElement(this.openedBy);
      this.modalContent.innerHTML = '';

      if (preventFocus) this.openedBy = null;
      super.hide();
    }

    show(opener) {
      opener.setAttribute('aria-disabled', true);
      opener.classList.add('loading');
      opener.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      fetch(opener.getAttribute('data-product-url'))
        .then((response) => response.text())
        .then((responseText) => {
          const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
          this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
          this.preventDuplicatedIDs();
          this.removeDOMElements();
          this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

          if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }

          if (window.ProductModel) window.ProductModel.loadShopifyXR();

          this.removeGalleryListSemantic();
          this.preventVariantURLSwitching();
          super.show(opener);
        })
        .finally(() => {
          opener.removeAttribute('aria-disabled');
          opener.classList.remove('loading');
          opener.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    setInnerHTML(element, html) {
      element.innerHTML = html;

      // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
      element.querySelectorAll('script').forEach(oldScriptTag => {
        const newScriptTag = document.createElement('script');
        Array.from(oldScriptTag.attributes).forEach(attribute => {
          newScriptTag.setAttribute(attribute.name, attribute.value)
        });
        newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
        oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
      });
    }

    preventVariantURLSwitching() {
      this.modalContent.querySelector('variant-radios,variant-selects').setAttribute('data-update-url', 'false');
    }

    removeDOMElements() {
      const pickupAvailability = this.productElement.querySelector('pickup-availability');
      if (pickupAvailability) pickupAvailability.remove();

      const productModal = this.productElement.querySelector('product-modal');
      if (productModal) productModal.remove();
    }

    preventDuplicatedIDs() {
      const sectionId = this.productElement.dataset.section;
      this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${ sectionId }`);
      this.productElement.querySelectorAll('variant-selects, variant-radios').forEach((variantSelect) => {
        variantSelect.dataset.originalSection = sectionId;
      });
    }

    removeGalleryListSemantic() {
      const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
      if (!galleryList) return;

      galleryList.setAttribute('role', 'presentation');
      galleryList.querySelectorAll('[id^="Slide-"]').forEach(li => li.setAttribute('role', 'presentation'));
    }
  });
}


class QuickAddColorPicker extends HTMLElement {
  constructor() {
      super();
      this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
      this.updateVariantData();
      this.updateVariantInput(); 
      this.updateImages(); 
  }

  setCurrentColor() {
      let currentColor = this.getCurrentColor(); 
      this.querySelectorAll('[data-color-option]').forEach((elem) => {
          if(elem.dataset.colorName.toLocaleLowerCase() === currentColorName ) {
              elem.checked = true; 
          }
      });  
  }

  getCurrentColor() { 
      let that = this; 
      this.querySelectorAll('[data-color-option]').forEach((elem) => {
          if(elem.checked) {
              this.currentColor = elem; 
          }
      }); 

      return this.currentColor; 
      
      // .find((variant) => {
      //     return !variant.options.map((option, index) => {
      //       return this.options[index] === option;
      //     }).includes(false);
      //   });
  }; 

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#quick-add-form-${this.dataset.section}`);
    const currentColor = this.getCurrentColor(); 

    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = JSON.parse(currentColor.dataset.product).variants[0].id;
    });
  }

  updateVariantData() {
    const currentColor = this.getCurrentColor(); 

    document.querySelectorAll(`variant-radios[data-section="${this.dataset.section}"]`).forEach((elem) => {
        if( elem.querySelector('[type="application/json"]')) {
            let e = elem.querySelector('[type="application/json"]');
            e.parentElement.removeChild(e); 
        }
        let newScript = document.createElement('script');
        newScript.innerHTML  = ` ` + JSON.stringify(JSON.parse(currentColor.dataset.product).variants);  
        newScript.type = "application/json";
        elem.appendChild(newScript); 
        elem.dispatchEvent(new Event('change'));
    }); 
  }

  updateImages() {
      let currentColor = this.getCurrentColor(); 
      let productObj = JSON.parse(currentColor.dataset.product); 
      let images = productObj.media.splice(0, 2); 
      let imagesContainer =  document.querySelector(`[data-product-images][data-section="${this.dataset.section}"]`); 

      function createImageObj(pSource, pAlt, pWidth, pIndex) {
          let imageTemplate = ``; 
          let index = pIndex + 1;

          function processImageSrc(pImageSrc, pSize) {
              let imageSrc = '';
              imageSrc = pImageSrc.replace(/(\.[^.]*)$/, `_${pSize}$1`)
              .replace('http:', '');
              return imageSrc;
          }


          imageTemplate = `
                <img
                srcset="${processImageSrc(pSource, '165x')} 165w,
                        ${processImageSrc(pSource, '360x')} 360w,
                        ${processImageSrc(pSource, '533x')} 533w,
                        ${processImageSrc(pSource, '720x')} 720w,
                        ${processImageSrc(pSource, '940x')} 940w,
                        ${processImageSrc(pSource, '1066x')} 1066w,
                        ${processImageSrc(pSource, '1066x')} ${pWidth}w"
                src="${processImageSrc(pSource, '533x')}"
                sizes="(min-width: {{ settings.page_width }}px) {{ settings.page_width | minus: 130 | divided_by: 4 }}px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                alt="${pAlt}"
                aria-hidden="true"
                width="1000"
                height="1000"
              >
          `; 

          imagesContainer.innerHTML +=(imageTemplate);

       }
              
      function clearImages() {
        imagesContainer.innerHTML = ""; 
      }

      clearImages() 

      images.forEach((image, index)=> {
          if(image.alt === null || image.alt.indexOf('swatch_') == -1) {
              createImageObj(image.src, '', index);
          }
      });

  }

  setUpEvents() {
      if(this.querySelectorAll("[data-color-container]").length > 0) {
          let colorContainer = this.querySelector('[data-color-container]');
          let currentColor = this.querySelector("[data-color-container]").textContent; 
  
          function showColor(pColor) {
              colorContainer.textContent = pColor; 
          }
      
          this.querySelectorAll('[data-color-label]').forEach((element) => {
              element.addEventListener('mouseenter', function(event) {
                  let name = this.dataset.colorName; 
                  showColor(name)
              })
              element.addEventListener('mouseleave', (event) => {
                  showColor(this.getSelectedColor().dataset.colorName)
              })
          }); 
      
      }
  }

}

if (!customElements.get('quick-add-color-picker')) {
  customElements.define('quick-add-color-picker', QuickAddColorPicker)
}


class QuickAddButton extends HTMLElement {
  constructor() {
    super();
    this.querySelector('button').addEventListener('click', this.addToCart.bind(this));
  }

  addToCart() {
    const quickAddForm = document.querySelector(`#quick-add-form-${this.dataset.section}`);
    quickAddForm.dispatchEvent(new Event('submit'));
  }
}

if (!customElements.get('quick-add-button')) {
  customElements.define('quick-add-button', QuickAddButton)
}