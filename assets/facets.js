
class CollectionFilters extends HTMLElement {
  constructor() {
    super();
    this.totalProducts = []; 
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
      this.querySelector('[data-activate-filters]').addEventListener('click', this.filterProducts.bind(this)); 
    }
  
    if(this.querySelector('[data-clear-filters]')) {
      this.querySelector('[data-clear-filters]').addEventListener('click', this.clearFilters.bind(this)); 
    }

  }

  filterProducts(pProductsArray, pFilters) {

  }


  sortproducts(pProductsArray, pSortBy) {

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
        <label for="${color}">
          ${color.replace('filter-color:', "")}
        </label> 
        <input type="checkbox" 
        id="${color}"
        name="color" 
        form="filter-sort-form"
        value="${color}"
        class="quick-add-color-picker__input"
        data-filter
        data-color-filter
        >`);
    }); 

    this.sizeFilters.forEach(size => {
      this.querySelector(sizeFilterContainer).insertAdjacentHTML( 'beforeend', `
      <label for="${size}">
        ${size}
      </label> 
      <input type="checkbox" 
      id="${size}"
      name="size" 
      form="filter-sort-form"
      value="${size}"
      class="quick-add-color-picker__input"
      data-filter
      data-size-filter
      >`);
    })

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

    // function getColorParamsFromArray(pColorParamsArray) {
    //   let queryString = ''; 

    //   pColorParamsArray.forEach((value, index) => {
    //     let color = value.replace('filter-color:', ""); 

    //     if(index >= pColorParamsArray.length) {
    //         queryString += color; 
    //     } else {
    //       queryString += (color + '&'); 
    //     }
    //   });

    //   console.log(queryString); 
    //   return queryString;
    // }

  }

  clearFilters() {
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
    console.log('TELL COLLECTION GRID TO RESET');
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
    window.history.replaceState(null, null, null); 

    let productsToHide = this.querySelectorAll(`.grid__item:nth-child(${pNumToStartFrom}) ~ *`);

    productsToHide.forEach(elem => {
      elem.style.display = 'none';
    });

    if(pFiltered) {
      if(this.totalFilteredProducts.length <= pNumToStartFrom) {
        document.querySelector('load-more-products-button').style.display = 'none';
      }
    } else {
      if(this.totalProducts.length <= pNumToStartFrom) {
        document.querySelector('load-more-products-button').style.display = 'none';
      }
    }

  } 


  renderMoreProducts(pNumToShowMore) {
     let productsToAdd = this.totalProducts.slice(this.totalProductsShowing.length, this.totalProductsShowing.length + pNumToShowMore);
     this.totalProductsShowing = [...this.totalProductsShowing, ...productsToAdd]

     productsToAdd.forEach((productJSON)=> {
        this.querySelector(`[data-product-id="${productJSON.id}"]`).style.display = 'block';
     });

     window.history.replaceState({page: this.section}, '', '?section=' + (this.section += 1));
  }


  renderFilteredProducts(pProductsToShow) {
    this.totalFilteredProducts = pProductsToShow; 
    this.totalProductsShowing = pProductsToShow.slice(0, this.paginateBy);

    let products = this.querySelectorAll(`.grid__item`);

    products.forEach(product => {
      product.style.display = 'none';
    });


    products.forEach(product => {
        if(this.totalProductsShowing .some(e => e.id === parseInt(product.dataset.productId))) {
          product.style.display = 'block'; 
        }
    }); 

    this.setUpPagination(this.dataset.paginateBy, true); 

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