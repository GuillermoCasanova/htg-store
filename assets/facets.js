
class CollectionFilters extends HTMLElement {
  constructor() {
    super();

    this.style.opacity = 0;
    this.totalProducts = []; 
    this.totalSortedProducts = []; 
    this.getProductsFromJson(); 
    this.pullColorFilters(); 
    this.pullSizeFilters(); 
    this.renderFilters(); 
    this.tags = []; 
    this.filterBy = {
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 

    if(this.querySelector('[data-activate-filters]')) {
      this.querySelector('[data-activate-filters]').addEventListener('click', (event)=> {
        this.setActiveButton('filter-by'); 
        this.filterProducts(); 
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

    let sortingType = event.target.value
    const url = `${window.location.pathname}?sort_by=${sortingType}&?section_id=main-collection-product-grid`;
    const queryUrl = new URL(window.location.href); 
    let params = new URLSearchParams(url.search); 


    params.delete('section');
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
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('collection-grid');
        let orderedArray  = []; 
        
        resultsMarkup.querySelectorAll('[data-product-json]').forEach((element)=> {
          orderedArray.push(JSON.parse(element.textContent))
        });
        
        document.querySelector('collection-grid').renderFilteredProducts([], orderedArray, true);
        this.closeFilterOptions();
      })
      .catch((error) => {
        this.closeFilterOptions();
        throw error;
      });
  }
  
  getProductsFromJson() {
    const productContainerId = '[data-product-json]';
    let collectionGrid = document.querySelector('collection-grid'); 

    collectionGrid.querySelectorAll(productContainerId).forEach((element)=> {
      this.totalProducts.push(JSON.parse(element.textContent))
    });
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

  filterProducts() {
    let products = this.totalProducts;
    let filteredList = []; 
    let filterId = '[data-filter]'
    this.filterBy = {
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 

    this.closeFilterOptions(); 

    if( this.querySelectorAll(filterId + ':checked').length <= 0) {
        return
    }

    if(this.querySelectorAll('[data-color-filter]' + ':checked').length > 0) {
      this.querySelectorAll('[data-color-filter]' + ':checked').forEach(color=> {
        this.filterBy.color.push(color.value); 
      });

      const url = new URL(window.location.href); 
      let params = new URLSearchParams(url.search); 
      params.delete('color'); 
      params.delete('section');

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

    document.querySelector('collection-grid').renderFilteredProducts(products); 

    function getProductVariantsOptions(pProduct) {
      let options = []; 
      pProduct.variants.forEach(variant => {
        if(variant.available !== false) {
          options = [...options, ...variant.options];
        }
      });
      return options; 
    }



  }

  clearFilters() {
    this.closeFilterOptions(); 
    this.clearActiveButton('filter-by'); 

    this.filterBy = {
      color: [], 
      sizes: [], 
      hide_sold_out: false
    }; 
    let filterId = '[data-filter]'

    this.querySelectorAll(filterId + ':checked').forEach(elem => {
      elem.checked = false; 
    });


    const url = new URL(window.location.href); 
    let params = new URLSearchParams(url.search); 
    params.delete('color');
    params.delete('sizes'); 

    url.search = "?" + params; 

    window.history.replaceState(null, null, url); 

    document.querySelector('collection-grid').resetCollectionGrid()
  }
}


customElements.define('collection-filters', CollectionFilters); 

class CollectionGrid extends HTMLElement {
  constructor() {
      super(); 
      this.totalProducts = [];
      this.totalFilteredProducts = [];
      this.totalProductsShowing = [];
      this.section = 1; 
      this.paginateBy = this.dataset.paginateBy;
      this.getProductsFromJson(this.dataset.paginateBy); 
      this.setUpPagination(this.totalProductsShowing.length); 
      window.history.replaceState(null, null, null);
  }

  getProductsFromJson(pNumToStartFrom) {

    const productContainerId = '[data-product-json]';
    const queryString = window.location.search; 
    let startFromProduct = pNumToStartFrom;
    let productsToShow = this.paginateBy; 
    
    if(queryString) {
      let urlParams = new URLSearchParams(queryString);
      if(parseInt(urlParams.get('section')) > 1) {
        this.section = parseInt(urlParams.get('section'));
        productsToShow = this.dataset.paginateBy * urlParams.get('section')
      }
    }

    this.querySelectorAll(productContainerId).forEach((element)=> {
      this.totalProducts.push(JSON.parse(element.textContent))
      this.totalProductsShowing = this.totalProducts.slice(0, productsToShow);
    });

  }

  setUpPagination(pNumToStartFrom, pFiltered) {
    // const url = new URL(window.location.href); 
    // let params = new URLSearchParams(url.search); 
    // params.delete('section');
    // url.search = params; 

    let indexToStartFrom = parseInt(pNumToStartFrom); 

    window.history.replaceState(null, null, null); 

    if(pFiltered) {
      if(this.totalFilteredProducts.length>= parseInt(this.dataset.paginateBy)) {
        document.querySelector('load-more-products-button').style.display = 'none';
      }

      if(this.totalFilteredProducts.length <= indexToStartFrom) {
        document.querySelector('load-more-products-button').style.display = 'none';
      }
    } else {

      let productsToHide = this.querySelectorAll(`.grid__item:nth-child(${indexToStartFrom}) ~ *`);

      this.querySelectorAll('.grid__item').forEach(elem => {
        elem.style.display = 'block';
      });

      productsToHide.forEach(elem => {
        elem.style.display = 'none';
      });

      if(this.totalProducts.length <= indexToStartFrom) {
        document.querySelector('load-more-products-button').style.display = 'none';
      }
    }
  } 


  renderMoreProducts(pNumToShowMore) {
     let productsToAdd = this.totalProducts.slice(this.totalProductsShowing.length, this.totalProductsShowing.length + pNumToShowMore);
     this.totalProductsShowing = [...this.totalProductsShowing, ...productsToAdd]
     this.totalProductsShowing.forEach((productJSON)=> {
        this.querySelector(`.grid__item[data-product-id="${productJSON.id}"]`).style.display = 'block';
     });

     window.history.replaceState({page: this.section}, '', '?section=' + (this.section += 1));
  }


  renderFilteredProducts(pProductsToShow, pOrderArray, pSorting) {

    let products = this.querySelectorAll(`.grid__item`);

    if(pSorting && pProductsToShow.length === 0) {
      let idOrders =  []
      let productsToShow = this.totalFilteredProducts.length  > 0 ? this.totalFilteredProducts : false  || pOrderArray

      productsToShow.forEach((elem) => { 
        idOrders.push(parseInt(elem.id)); 
      }); 

      this.totalProducts = pOrderArray; 

      let sortedProducts = _.sortBy(products, function(item){
        return idOrders.indexOf(parseInt(item.dataset.productId)); 
      });

      this.totalProductsShowing = this.totalProducts.slice(0, this.paginateBy);

      sortedProducts.forEach(el => {
          el.parentNode.appendChild(el);
      });
      
      this.setUpPagination(this.dataset.paginateBy, false); 

    } else {

      this.totalFilteredProducts = pProductsToShow; 
      this.totalProductsShowing = pProductsToShow.slice(0, this.paginateBy);

      if(this.totalProducts) {
        
        let idOrders  = [];

        this.totalProducts.forEach((elem) => { 
          idOrders.push(parseInt(elem.id)); 
        }); 

        this.totalFilteredProducts = _.sortBy(this.totalFilteredProducts, function(item) {
            return idOrders.indexOf(item.id)
        });   
      }
      

        products.forEach(product => {
          product.style.display = 'none';
        });
      
        products.forEach(product => {

          if(this.totalFilteredProducts.some(e => e.id == parseInt(product.dataset.productId))) {
              product.style.display = 'block'; 
            } else {
              product.style.display = 'none'; 
            }
        }); 

      this.setUpPagination(this.dataset.paginateBy, true); 


    }


  }


  getProductsRendered() {
    return this.totalProductsShowing; 
  } 

  resetCollectionGrid() {
    this.totalFilteredProducts = []; 
    this.section = 1;
    this.totalProductsShowing = this.totalProducts.slice(0, this.paginateBy);

    let products = this.querySelectorAll(`.grid__item`);

    products.forEach(product => {
      product.style.display = 'block'; 
    });

    this.setUpPagination(this.totalProductsShowing.length); 
    document.querySelector('load-more-products-button').reset(); 
  }
}


customElements.define('collection-grid', CollectionGrid); 