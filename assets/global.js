function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [role='button'], [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    ) {
      return;
    }

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

/*
 * Commonly Used JS Functions
 *
 */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};


/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};


Shopify.utils = function() {}

Shopify.utils.prototype = {

    /**
     * Return an object from an array of objects that matches the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
     findInstance: function(array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
    },
  
    /**
     * Remove an object from an array of objects by matching the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
     removeInstance: function(array, key, value) {
      var i = array.length;
      while(i--) {
        if (array[i][key] === value) {
          array.splice(i, 1);
          break;
        }
      }
  
      return array;
    },
  
    /**
     * _.compact from lodash
     * Remove empty/false items from array
     * Source: https://github.com/lodash/lodash/blob/master/compact.js
     *
     * @param {array} array
     */
    compact: function(array) {
      var index = -1;
      var length = array == null ? 0 : array.length;
      var resIndex = 0;
      var result = [];
  
      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    },
  
    /**
     * _.defaultTo from lodash
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
     *
     * @param {*} value - Value to check
     * @param {*} defaultValue - Default value
     * @returns {*} - Returns the resolved value
     */
    defaultTo: function(value, defaultValue) {
      return (value == null || value !== value) ? defaultValue : value
    }
}


Shopify.currency = function() {}

Shopify.currency.prototype = {
  formatMoney: function(cents, format) {
 
    var moneyFormat = '${{amount}}';

    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }

    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = new Shopify.utils().defaultTo(precision, 2);
      thousands = new Shopify.utils().defaultTo(thousands, ',');
      decimal = new Shopify.utils().defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }
    

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }

    return formatString.replace(placeholderRegex, value);
}
}


class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        this.mainDetailsToggle.classList.remove('menu-closing');
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.remove('menu-closing');
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.classList.add('menu-closing');
    
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    // const parentMenuElement = detailsElement.closest('.submenu-open');
    // parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    // detailsElement.classList.remove('menu-opening');
    // detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    // removeTrapFocus(detailsElement.querySelector('summary'));
    // this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);


class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);


class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.onVariantChange();
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterVariantId();
    this.setSoldOutOptions()
    this.updateVariantInput();
    this.setChosenOption(); 
  }

  updateOptions() {
      this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  setSoldOutOptions(resetOptions = false) {
   
    let data = {
       productVariants: JSON.parse(this.querySelector('[type="application/json"]').innerHTML)
     }; 

     let allProductVariants = data.productVariants;
        let sizeOptions = [];

      this.querySelector('select').querySelectorAll("option").forEach(elem => {
        elem.disabled = false;
        sizeOptions.push(elem); 
      });

      for(var i = 0; i < allProductVariants.length; i++) {
        if(allProductVariants[i].available == false) {
          sizeOptions.forEach((elem) => {
            if(allProductVariants[i].option1 == elem.value || allProductVariants[i].option2 == elem.value) {
              elem.disabled = true;
              elem.checked = false; 
            } 
          })
        } 
      }

      if(!this.currentVariant.available) {
        if(this.querySelector('select').querySelectorAll("option:not([disabled])").length === 0) {
          this.toggleAddButton('sold-out', true);
          this.setChosenOption(false); 
        } 

        if(this.querySelector('select').querySelectorAll("option:not([disabled])").length > 0) {
          this.toggleAddButton('variant-sold-out', true);
          this.setChosenOption(); 
        }
      } else {
        this.setChosenOption(); 
        this.toggleAddButton(false, false);
      }
   }

  updateMasterVariantId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#quick-add-form-${this.dataset.section}, #product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      if(productForm.querySelector('input[name="id"][data-mobile]')) {
        const input = productForm.querySelector('input[name="id"][data-mobile]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    if(section.querySelector('product-form')) {
      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }
  }

  toggleSelect(pDisableButton) {
    let disable = pDisableButton; 
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    
    if(this.tagName.toLowerCase() == 'variant-selects') {
      if(disable) {
        this.querySelector('select').setAttribute('disabled', true);
        this.querySelector('[data-select-container]').setAttribute('disabled', true);
      } else {
        this.querySelector('select').removeAttribute('disabled');
        this.querySelector('[data-select-container]').removeAttribute('disabled');
      }
    } 
  }

  toggleQuickAddButton (pSoldOutStatus, pDisableButton, pButton, pButtonText){

    if (pDisableButton) {
      pButton.setAttribute('disabled', true);
      if(pSoldOutStatus === 'sold-out') {
        pButtonText.textContent = window.variantStrings.soldOut;
      }
      if(pSoldOutStatus === 'variant-sold-out') {
        pButtonText.textContent = window.variantStrings.currentOptionSoldOut;
      }
    } else {
      pButton.removeAttribute('disabled');
      pButtonText.textContent = 'Quick Add+';
    }
  }

  
  toggleAddButton(pSoldOutStatus, pDisableButton, pQuickAddButton) {

    let productForm =  document.getElementById(`product-form-${this.dataset.section}`);

    let disable = pDisableButton; 
    if (!productForm) return;
        
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if(pSoldOutStatus === 'sold-out') {
        addButtonText.textContent = window.variantStrings.soldOut;
        this.toggleSelect(true);
      }
      if(pSoldOutStatus === 'variant-sold-out') {
        addButtonText.textContent = window.variantStrings.currentOptionSoldOut;
        this.toggleSelect(false);
      }
    } else {
      addButton.removeAttribute('disabled');
      this.toggleSelect(false);
      addButtonText.textContent = window.variantStrings.addToCart;
    }

  }

  setUnavailable() {
    const addButton = document.getElementById(`product-form-${this.dataset.section}`)?.querySelector('[name="add"]');
    if (!addButton) return;
    addButton.textContent = window.variantStrings.soldOut;
    document.getElementById(`price-${this.dataset.section}`)?.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData === JSON.parse(this.querySelector('[type="application/json"]').textContent) ? this.variantData :  JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  setChosenOption(pIsAvailable) {
    if(this.tagName.toLowerCase() === 'variant-selects') {
      if(pIsAvailable == false) {
        this.querySelector('[data-option-text]').textContent = "";
      } else {
       this.querySelector('[data-option-text]').textContent = this.querySelector('select').value; 
      }
    } 
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
    this.setUpEvents();
  }

  updateOptions() {
    if(this.querySelectorAll('input[type="radio"]:checked').length > 0) {
      this.options = Array.from(this.querySelectorAll('input[type="radio"]:checked'), (input) => input.value);
    } else {
      this.options = Array.from(this.querySelectorAll('input[type="radio"]'), (input) => input.value);
    }
  }

  toggleAddButton(pSoldOutStatus, pDisableButton, pQuickAddButton) {

    if(document.querySelector(`[data-product-card][data-section="${this.dataset.section}"]`)) {
      let quickAddButton = document.querySelector(`[data-product-card][data-section="${this.dataset.section}"]`).querySelector('quick-add-button').querySelector('button');
      let quickAddButtonText = document.querySelector(`[data-product-card][data-section="${this.dataset.section}"]`).querySelector('quick-add-button').querySelector('span');
      this.toggleQuickAddButton(pSoldOutStatus, pDisableButton, quickAddButton, quickAddButtonText);
    }

    let productForm =  document.querySelector(`product-form[data-section="${this.dataset.section}"][data-desktop]`);

    let disable = pDisableButton; 
    if (!productForm) return;
        
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if(pSoldOutStatus === 'sold-out') {
        addButtonText.textContent = window.variantStrings.soldOut;
      }
      if(pSoldOutStatus === 'variant-sold-out') {
        addButtonText.textContent = window.variantStrings.currentOptionSoldOut;
      }
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

  }


  updateMasterVariantId() {
    this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
    });
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#quick-add-form-${this.dataset.section}, #product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);

    productForms.forEach((productForm) => {
      
      if(productForm.querySelector('input[name="id"][data-desktop]')) {
        const input = productForm.querySelector('input[name="id"][data-desktop]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } 
    });
  }

  getVariantData() {
    this.variantData = this.variantData === JSON.parse(this.querySelector('[type="application/json"]').textContent) ? this.variantData :  JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  setSoldOutOptions() {
    let data = {
      productVariants: JSON.parse(this.querySelector('[type="application/json"]').innerHTML)
    }; 

    let allProductVariants = data.productVariants;

       let sizeOptions = [];
       
       this.querySelectorAll('input').forEach(function(elem) {
         sizeOptions.push(elem); 
         elem.parentElement.classList.remove('is-sold-out'); 
         elem.disabled = false;
         elem.setAttribute('aria-disabled', false);
       }); 

       for(var i = 0; i < allProductVariants.length; i++) {
         if(allProductVariants[i].available == false) {
           sizeOptions.forEach((elem) => {

             if(allProductVariants[i].option1 == elem.value || allProductVariants[i].option2 == elem.value) {
               elem.parentElement.classList.add('is-sold-out'); 
               elem.disabled = true;
               elem.setAttribute('aria-disabled', true);
             }
           })
         }
       }  

       if(!this.currentVariant.available) {
         if(this.querySelectorAll("input[type='radio']:not([disabled])").length === 0) {

           if(this.dataset.isQuickAdd == 'true') {
            this.toggleAddButton('sold-out', true, true);
           }
           this.toggleAddButton('sold-out', true);
         } 

         if(this.querySelectorAll("input[type='radio']:not([disabled])").length > 0) {
           if(this.dataset.isQuickAdd ==  'true') {
            this.toggleAddButton('variant-sold-out', true, true);
          }
           this.toggleAddButton('variant-sold-out', true);
         }
       } else {
          if(this.dataset.isQuickAdd == 'true') {
            this.toggleAddButton(false, false, true);
          }
         this.toggleAddButton(false, false, true);
       }
  }

  setUpEvents() {

    if(this.querySelector("[data-current-option]")) {

      let currentOption = this.querySelector("[data-current-option]").textContent; 

      function showOption(pColor) {
          let colorContainer = document.querySelector('[data-current-option]'); 
          colorContainer.textContent = pColor.replace(/[\n\r]+|[\s]{2,}/g, '') 
      }

      this.querySelectorAll('[data-option-label]').forEach((element) => {
  
          element.addEventListener('click', (event)  =>{
            let name = event.target.dataset.optionName; 
            currentOption = name;
            showOption(name)
          })

          element.addEventListener('mouseenter', (event)  =>{
            let name = event.target.dataset.optionName; 
            showOption(name)
        })
        

          element.addEventListener('mouseleave', (event)  =>{
              showOption(currentOption)
          })
      }); 


      this.querySelectorAll('input[type="radio"]').forEach((element) => {
        element.addEventListener('focus', (event)  =>{
            let name = event.target.value; 
            showOption(name)
        });
        
      
        element.addEventListener('blur', (event)  =>{
            showOption(currentOption)
        });
      }); 
    }


}

}

customElements.define('variant-radios', VariantRadios);


// function enableLazyImgAnimations() {

//   document.querySelectorAll('img').forEach((elem) => 
//   elem.addEventListener('load', (event) => {
//     console.log(event);
//     event.target.classList.add('loaded');
// }, {once: true}));
// }

// window.addEventListener('DOMContentLoaded', function() {
//   document.querySelector('variant-radios').setUpEvents(); 
// }); 







class CustomInputWrapper extends HTMLElement {
  constructor() {
    super(); 
    this.init(); 
  }

  init() {

    let textFieldWrapper = this; 

    
    if(this.querySelector('input') !== null) {

      this.querySelector('input').addEventListener('change', function(event) {
          let input = event.currentTarget; 

          if(input.value.length > 0) {
              textFieldWrapper.classList.add('is-active'); 
          } else {
              textFieldWrapper.classList.remove('is-active'); 
          }

      }); 
    
    let changeEvent = new Event("change"); 
    
    this.querySelector('input').dispatchEvent(changeEvent); 
    
    this.querySelector('input').addEventListener('focus', function() {
          textFieldWrapper.classList.add('is-active'); 
    }); 
    
    
    this.querySelector('input').addEventListener('blur', function(event) {
        let input = event.currentTarget; 
          if(input.value.length > 0) {
              textFieldWrapper.classList.add('is-active'); 
          } else {
              textFieldWrapper.classList.remove('is-active'); 
          }
    }); 
}
  }

}

customElements.define('custom-input-wrapper', CustomInputWrapper);

