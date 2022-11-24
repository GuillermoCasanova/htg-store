

class CollectionFilters extends HTMLElement {
  constructor() {
    super();

    this.style.opacity = 0;
    this.totalSortedProducts = []; 
    this.totalProducts = this.getProductsFromJson(document.querySelector('#product-data').textContent.trim()); 
    this.pullColorFilters(); 
    this.pullSizeFilters(); 
    this.renderFilters(); 


    this.tags = []; 
    this.filterBy = {
      active: false, 
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 


    if(this.querySelector('[data-activate-filters]')) {
      this.querySelector('[data-activate-filters]').addEventListener('click', (event)=> {

        let productsToFilter = this.totalSortedProducts.length > 0 ? this.totalSortedProducts : this.totalProducts;

        this.setActiveButton('filter-by'); 

        this.getFilteredProducts(productsToFilter).then((result) => {
          this.hideLoadingScreen(); 
          document.querySelector('collection-grid').renderProducts(result);
        }); 
      }); 
    }
  
    if(this.querySelector('[data-clear-filters]')) {
      this.querySelector('[data-clear-filters]').addEventListener('click', this.clearFilters.bind(this)); 
    }

    this.querySelectorAll('[data-filter-toggle]').forEach(toggle => {
        toggle.addEventListener('click', (event)=> {
          if(event.target.getAttribute('aria-expanded') == 'true') {
            this.closeFilterOptions(); 
            return
          }
          this.toggleFilterOption(event); 
        }); 
    });

    if(this.querySelector('[data-sort-options')) {
      this.querySelector('[data-sort-options]').addEventListener('change', this.sortproducts.bind(this)); 
    }
  

    document.addEventListener('click', (event) => {
      var isClickInside = this.contains(event.target);
      if (!isClickInside) {
        this.closeFilterOptions(); 
      }
    });


  }

  clearActiveButton(buttonId) {
    this.querySelector(`[data-filter-toggle]#` + `${buttonId}`).classList.remove('is-active'); 
  }
  
  setActiveButton(buttonId) {
    this.querySelector(`[data-filter-toggle]#` + `${buttonId}`).classList.add('is-active'); 
  }

  toggleFilterOption(pFilterToOpen) {

    let filterToOpenId = pFilterToOpen.target.id; 

    this.querySelectorAll('[data-filter-toggle]').forEach(toggle => {
      toggle.setAttribute('aria-expanded', false);
      if(toggle.id === filterToOpenId) {
        toggle.setAttribute('aria-expanded', true); 
      }
    });

    this.querySelectorAll('[data-filter-form]').forEach(form => {
      form.setAttribute('aria-hidden', true);
      if(form.getAttribute('aria-labelledby') === filterToOpenId) {
        form.setAttribute('aria-hidden', false); 
      }
    });

  }

  closeFilterOptions() {
    this.querySelectorAll('[data-filter-form]').forEach(form => {
      form.setAttribute('aria-hidden', true);
    });

    this.querySelectorAll('[data-filter-toggle]').forEach(form => {
      form.setAttribute('aria-expanded', false);
    });
  
    // this.querySelectorAll('[data-sort-toggle]').forEach(form => {
    //   form.setAttribute('aria-expanded', false);
    // });
  }


  sortproducts(pProductsArray, pSortBy) {

    this.setActiveButton('sort-by');
    this.showLoadingScreen(); 


    let sortingType = event.target.value
    const url = `${window.location.pathname}?sort_by=${sortingType}&?section_id=main-collection-product-grid`;
    const queryUrl = new URL(window.location.href); 
    let params = new URLSearchParams(url.search); 


    params.delete('page_num');
    queryUrl.search = `?sort_by=${sortingType}` + params; 

    window.history.replaceState(null, null, queryUrl); 

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        return response.text();
      })
      .then((text) => {

        let productsToShow = []; 

         const jsonData = new DOMParser().parseFromString(text, 'text/html').querySelector('#product-data');

         this.totalSortedProducts = this.getProductsFromJson(jsonData.textContent.trim()); 

         if(this.filterBy.active) {
            this.getFilteredProducts(this.totalSortedProducts).then((result) => {
              productsToShow = result
              document.querySelector('collection-grid').renderProducts(productsToShow, true);
              this.hideLoadingScreen(); 
            }); 
         }  else {
          productsToShow = this.totalSortedProducts 
          document.querySelector('collection-grid').renderProducts(productsToShow, true);
          this.hideLoadingScreen(); 
         }

        this.closeFilterOptions();
      })
      .catch((error) => {
        this.closeFilterOptions();
        throw error;
      });
  }
  
  getProductsFromJson(pJSON) {
    let products = []; 
    let rawData = JSON.parse(pJSON).products;

    rawData.forEach((element)=> {

      if(element.collections == null || element.tags == undefined) {
        return
      }
      
      let productObject  = element.product || element; 
      productObject.collections = element.collections;
      productObject.options_with_values = element.options_with_values; 
      productObject.metafields = element.metafields; 
      products.push(productObject)
    }); 

    return products; 
  }

  pullColorFilters() {
    let tags = []; 
    this.totalProducts.forEach(prod => {
      tags = [...tags, ...prod.tags]; 
    });
    let filtersOnly = tags.filter(tag => tag.indexOf('filter-color:') >= 0);    
    this.colorFilters = _.uniq(filtersOnly);
  }

  pullSizeFilters() {
    let sizeVariants = []; 
    let sizes = []; 

    this.totalProducts.forEach(prod => {
      sizeVariants = [...sizeVariants, ...prod.variants]; 
    });

    sizeVariants.forEach(variant => {
      if(variant.option1) {
        sizes.push(variant.option1); 
      }
    });

    this.sizeFilters = _.uniq(sizes);
  } 

  renderFilters() {
    const colorFilterContainer = '[data-color-filters]'; 
    const sizeFilterContainer = '[data-size-filters]'; 

    this.colorFilters.forEach(color => {
        this.querySelector(colorFilterContainer).insertAdjacentHTML( 'beforeend', `
        <div class="filter-color" data-color="${color}">
        <input type="checkbox" 
        id="${color}"
        name="color" 
        form="filter-sort-form"
        value="${color}"
        class="filter-color__input"
        data-filter
        data-color-filter
        >
        <label class="filter-color__label" for="${color}">
          <span class="visually-hidden">${color.replace('filter-color:', "")}</span>
          <div class="filter-color__label__swatch" data-color="${color}">
          </div>
        </label> 
      </div>`);
    }); 

    if(this.colorFilters.length === 0) {
      this.querySelector('[data-filter-id="color"]').style.display = 'none'; 
    }

    this.sizeFilters.forEach(size => {
      this.querySelector(sizeFilterContainer).insertAdjacentHTML( 'beforeend', `

      <div class="filter-size">
        <input type="checkbox" 
        id="${size}"
        name="size" 
        form="filter-sort-form"
        value="${size}"
        class="quick-add-color-picker__input"
        data-filter
        data-size-filter
        >
        <label class="filter-size__label" for="${size}">
        <div class="filter-size__label__box">
          ${size}
        </div>
      </label> 
      </div>
        `);
    })

    this.style.opacity = 1;

  }

  hideLoadingScreen() {
    document.querySelector('.loading-overlay').style.display = 'none'; 
  }


  showLoadingScreen() {
    document.querySelector('.loading-overlay').style.display = 'flex'; 
  }

  getFilteredProducts(pProducts) {
    let products = pProducts;
    let filteredList = []; 
    let filterId = '[data-filter]'
    this.filterBy = {
      active: true, 
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 

    this.showLoadingScreen(); 
    this.closeFilterOptions(); 

    if( this.querySelectorAll(filterId + ':checked').length <= 0) {
        return false
    }

    if(this.querySelectorAll('[data-color-filter]' + ':checked').length > 0) {
      const url = new URL(window.location.href); 
      let params = new URLSearchParams(url.search); 

      this.querySelectorAll('[data-color-filter]' + ':checked').forEach(color=> {
        this.filterBy.color.push(color.value); 
      });


      params.delete('color'); 
      params.delete('page_num');
      
      this.filterBy.color.forEach(color => {
        params.append('color', color.replace('filter-color:', ""));
      });


      url.search = "?" + params; 
      window.history.replaceState(null, null, url); 

      products = products.filter((product) => {
        for(var i = 0; i < this.filterBy.color.length; i++) {
          if(product.tags.indexOf(this.filterBy.color[i]) > -1) {
            return true
          }
        }
        return false 
      });
      
    }


    if(this.querySelectorAll('[data-size-filter]' + ':checked').length > 0) {
      
      this.querySelectorAll('[data-size-filter]' + ':checked').forEach(color=> {
        this.filterBy.sizes.push(color.value); 
      });

      const url = new URL(window.location.href); 
      let params = new URLSearchParams(url.search); 
      params.delete('sizes'); 

      this.filterBy.sizes.forEach(sizes => {
        params.append('sizes', sizes);
      });

      url.search = "?" + params; 

      window.history.replaceState(null, null, url); 
      
      products = products.filter((product) => {
        for(var i = 0; i < this.filterBy.sizes.length; i++) {
          if(getProductVariantsOptions(product).indexOf(this.filterBy.sizes[i]) > -1) {
            return true
          }
        }
        return false 
      });

    }


    function getProductVariantsOptions(pProduct) {
      let options = []; 
      pProduct.variants.forEach(variant => {
        if(variant.available !== false) {
          options = [...options, ...variant.options];
        }
      });
      return options; 
    }



    return new Promise((resolve, reject) => {
      setTimeout(()=> {
        resolve(products); 
      }, 200); 
    }); 

  }

  getTotalProducts() {
    return this.totalProducts; 
  }

  clearFilters() {
    this.showLoadingScreen(); 
    this.closeFilterOptions(); 
    this.clearActiveButton('filter-by'); 
    this.clearActiveButton('sort-by'); 
    let collectionGrid =  document.querySelector('collection-grid');
    
    this.filterBy = {
      active: false, 
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 
    let filterId = '[data-filter]'

    this.querySelectorAll(filterId + ':checked').forEach(elem => {
      elem.checked = false; 
    });

    this.querySelector('[data-sort-options]').querySelectorAll('input').forEach(elem => {
      elem.checked = false; 
    });


    const url = new URL(window.location.href); 
    let params = new URLSearchParams(url.search); 
    params.delete('color');
    params.delete('sizes'); 
    params.delete('sort_by'); 
    params.delete('page_num'); 


    url.search = "?" + params; 
    window.history.replaceState(null, null, url); 

    setTimeout(()=> {
      this.hideLoadingScreen(); 
      collectionGrid.renderProducts(this.totalProducts);
    }, 200); 

  }


}


customElements.define('collection-filters', CollectionFilters); 
