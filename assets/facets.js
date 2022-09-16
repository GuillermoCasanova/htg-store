

class CollectionFilters extends HTMLElement {
  constructor() {
    super();

    this.style.opacity = 0;
    this.totalProducts = []; 
    this.totalSortedProducts = []; 
    this.getProductsFromJson(); 

   

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

    let rawData = JSON.parse(document.querySelector('#product-data').textContent.trim()).products;

    rawData.forEach((element)=> {
      let productObject  = element.product; 
      productObject.options_with_values = element.options_with_values; 
      this.totalProducts.push(productObject)
    }); 

    this.pullColorFilters(); 
    this.pullSizeFilters(); 
    this.renderFilters(); 
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
      this.pagesLoadedCache = []; 
      this.getProductsFromJson(this.dataset.paginateBy); 
      this.setUpPagination(this.totalProductsShowing.length); 
      window.history.replaceState(null, null, null);
  }

  returnTemplateForProduct(pJson) {
    return template; 
  }

  getTotalPages() {
    return  Math.round(this.totalProducts.length / this.paginateBy); 
  }

  getPagination() {
    return this.dataset.paginateBy; 
  }

  getCollectionURL() {
    return this.dataset.collectionUrl; 
  }

  getSectionId() {
    return this.dataset.sectionId; 
  }

  getProductsFromJson(pNumToStartFrom) {

    const productContainerId = '[data-product-json]';
    const queryString = window.location.search; 
    let startFromProduct = pNumToStartFrom;
    let productsToShow = this.paginateBy;
    let pageNum = 1;  
    
    // if(queryString) {
    //   let urlParams = new URLSearchParams(queryString);
    //   if(parseInt(urlParams.get('page_num')) > 1) {
    //     this.querySelector('.product-grid-container').classList.add('is-loading'); 
    //     pageNum = parseInt(urlParams.get('page_num'));
    //     this.section = pageNum;
    //     productsToShow = this.dataset.paginateBy * pageNum;
    //     this.loadAndRenderProducts(2);
    //   }

    // }  

    let rawData = JSON.parse(document.querySelector('#product-data').textContent.trim()).products;

    rawData.forEach((element)=> {
      let productObject  = element.product; 
      productObject.options_with_values = element.options_with_values; 
      this.totalProducts.push(productObject)
    }); 
    
    // this.totalProducts = JSON.parse(document.querySelector('#product-data').textContent.trim()).products;
    this.totalProductsShowing = this.totalProducts.slice(0, productsToShow);
        

    console.log(this.totalProducts); 

    // if(this.totalProducts.length > this.totalProductsShowing.length) {
    //   this.preLoadProducts(2); 
    // }

    // this.cachePageLoaded(1, document.querySelector('collection-grid')); 

  }

  setUpPagination(pNumToStartFrom, pFiltered) {
    // const url = new URL(window.location.href); 
    // let params = new URLSearchParams(url.search); 
    // params.delete('page_num');
    // url.search = params; 

    let indexToStartFrom = parseInt(pNumToStartFrom); 

    window.history.replaceState(null, null, null); 

    // if(pFiltered) {
    //   if(this.totalFilteredProducts.length>= parseInt(this.dataset.paginateBy)) {
    //     document.querySelector('load-more-products-button').style.display = 'none';
    //   }

    //   if(this.totalFilteredProducts.length <= indexToStartFrom) {
    //     document.querySelector('load-more-products-button').style.display = 'none';
    //   }
    // } else {

    //   let productsToHide = this.querySelectorAll(`.grid__item:nth-child(${indexToStartFrom}) ~ *`);

    //   this.querySelectorAll('.grid__item').forEach(elem => {
    //     elem.style.display = 'block';
    //   });

    //   productsToHide.forEach(elem => {
    //     elem.style.display = 'none';
    //   });

    //   if(this.totalProducts.length <= indexToStartFrom) {
    //     document.querySelector('load-more-products-button').style.display = 'none';
    //   }
    // }
  } 


  getproductThumbTemplate(pProductData) {

    let collectionUrl = this.getCollectionURL(); 
    let sectionId = this.getSectionId(); 

    function getImageHTML(pData, pImage) {

      if(!pImage) {
        return 
      }

      let images = pData.media; 

      let imageObject = document.createElement('img'); 

      imageObject.alt = pData.title; 
      imageObject.setAttribute('aria-hidden', true); 
      imageObject.setAttribute('loading', 'lazy'); 
      imageObject.width = images.width;
      imageObject.height = images.height; 
      imageObject.sizes = "(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"; 
      imageObject.classList.add('reduce-motion'); 
      imageObject.src = images[0].src.slice(0, images[0].src.indexOf('?') + 1) + 'format=pjpg&' + images[0].src.split("?").pop() + "width=" + 100;
      
      function getSrcSet(pImage) {

        let sizes = [165, 360, 533, 720, 940, 1066, 2000]; 
        let srcset = ""; 

        sizes.forEach((pSize, index) => {
          let formattedURL = pImage.src.slice(0, pImage.src.indexOf('?') + 1) + 'format=pjpg&' + pImage.src.split("?").pop() + "&width=" + pSize + " " + pSize + "w"; 
          if(index !== sizes.length - 1) {
            formattedURL = formattedURL + ","
          }
          srcset = srcset + formattedURL; 
        }); 

        return srcset

      }

      imageObject.srcset = getSrcSet(pImage); 

      return imageObject.outerHTML; 

    }

    function getOptionsPickerHTML(pProductData) {

      let collections = pProductData.collections; 
      let  htmlString = ``; 

      function getOptionRadios(pOptionsWithValues) {

        function getValues(pOption) {


          let values = pOption.values; 
          let allValuesHtml = "";  

          values.forEach((value, index)=> {
            let valueHTML = `
            <div class="quick-add-variants__option">
              <input type="radio" id="${sectionId}-${pProductData.id}-${pOption.name}-${index}"
                    name="${pOption.name}"
                    value="${value}"
                    form="quick-add-form-${sectionId}-${pProductData.id}" >
              <label for="${sectionId}-${pProductData.id}-${pOption.name}-${index}" data-option-label data-option-name="${value}">
                ${value}
              </label>
            </div>`

            allValuesHtml = allValuesHtml + valueHTML; 

          });

          return allValuesHtml
        }

        pOptionsWithValues.forEach((option) => {
          let optionVariant = `
            <div class="quick-add-variants">
            <fieldset >
              <legend class="quick-add-variants__label  visually-hidden">
                <span class="quick-add-variants__label__text">
                  Item ${option.name}
                </span>
              </legend>
              <div class="quick-add-variants__options">
                ${getValues(option)}
              </div>
            </fieldset>
          </div>`

            htmlString = htmlString + optionVariant; 

        }); 

        return htmlString; 
      }

      let HTML = `
      <variant-radios 
          data-update-url="false" 
          data-is-quick-add="true" 
          class="no-js-hidden" 
          data-section="${sectionId}-${pProductData.id}" data-url="${pProductData.url}">

          ${getOptionRadios(pProductData.options_with_values)}
          
        <script type="application/json">
          ${JSON.stringify(pProductData.variants)}
        </script>
      </variant-radios>
      
      <noscript>
        <div class="product-form__input{% if product.has_only_default_variant %} hidden{% endif %}">
          <label class="form__label" for="Variants-{{ section.id }}-{{ card_product.id }}">{{ 'products.product.product_variants' | t }}</label>
          <div class="select">
            <select name="id" id="Variants-{{ section.id }}-{{ card_product.id }}" class="select__select" form="quick-add-form-{{ section.id }}-{{ card_product.id }}">
              {%- for variant in card_product.variants -%}
                <option
                  {% if variant == card_product.selected_or_first_available_variant %}selected="selected"{% endif %}
                  {% if variant.available == false %}disabled{% endif %}
                  value="{{ variant.id }}"
                >
                  {{ variant.title }}
                  {%- if variant.available == false %} - {{ 'products.product.sold_out' | t }}{% endif %}
                  - {{ variant.price | money | strip_html }}
                </option>
              {%- endfor -%}
            </select>
          </div>
        </div>
      </noscript>
      `;

      return HTML; 
    }


    return `
    <li class="grid__item" data-product-id="${pProductData.id}">
      <div class="product-card-wrapper underline-links-hover" data-product-card-wrapper="" data-section="${sectionId}-${pProductData.id}">
        <div data-product-card="" data-section="${sectionId}-${pProductData.id}" class="product-card  ">
          <div class="product-card__inner">
              <div class="product-card__media">
                <div class="product-card__badge"></div><div class="quick-add-button-container">
                  <quick-add-button data-section="${sectionId}-${pProductData.id}">
                    <button type="submit" class="button  quick-add-button" tabindex="-1" aria-hidden="true">
                      <span>Quick Add+</span>
                    </button>
                  </quick-add-button>
                </div>
                  
                  <a title="Shop ${pProductData.title}" rel="internal" href="${collectionUrl}/products/${pProductData.handle}" class="media media--square" data-product-images="" data-section="${sectionId}-${pProductData.id}"> 
                    ${getImageHTML(pProductData, pProductData.media[0])}
                    ${getImageHTML(pProductData,  pProductData.media[1])}
                  </a>
              </div>
          </div>
      
          <div class="product-card__content">
            <a title="Shop ${pProductData.title}" rel="internal" href="${collectionUrl}/products/${pProductData.handle}" tabindex="-1" class="product-card__information">
              
              <h3 class="product-card__heading" id="title-${sectionId}-${pProductData.id}">
                  ${pProductData.title}
              </h3>
              
              <div class="product-card__price-info">
                
                <div class="price product-card__price">
                  <div class="price__container"><div class="price__regular">
                      <span class="visually-hidden visually-hidden--inline">Regular price</span>
                      <span class="price-item price-item--regular">
                        ${new Shopify.currency().formatMoney(pProductData.price)}
                      </span>
                    </div>
                    <div class="price__sale">
                        <span class="visually-hidden visually-hidden--inline">Regular price</span>
                          <span class="price-item price-item--regular">
                            
                          </span><span class="visually-hidden visually-hidden--inline">Sale price</span>
                      <span class="price-item price-item--sale price-item--last">
                        ${new Shopify.currency().formatMoney(pProductData.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
        
        <div class="quick-add-form no-js-hidden" tabindex="-1" aria-hidden="true">
          <div class="quick-add-form__inner">

              ${getOptionsPickerHTML(pProductData)}

              <product-form class="quick-add-form__to-submit visually-hidden" data-section="${sectionId}-${pProductData.id}" data-cart-type="notification">
              
                  <div class="quick-add-form__error-message-wrapper" data-error-message-wrapper="" role="alert" hidden="">
                    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-error" viewBox="0 0 13 13">
                      <circle cx="6.5" cy="6.50049" r="5.5" stroke="white" stroke-width="2"></circle>
                      <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width="0.7"></circle>
                      <path d="M5.87413 3.52832L5.97439 7.57216H7.02713L7.12739 3.52832H5.87413ZM6.50076 9.66091C6.88091 9.66091 7.18169 9.37267 7.18169 9.00504C7.18169 8.63742 6.88091 8.34917 6.50076 8.34917C6.12061 8.34917 5.81982 8.63742 5.81982 9.00504C5.81982 9.37267 6.12061 9.66091 6.50076 9.66091Z" fill="white"></path>
                      <path d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z" fill="white" stroke="#EB001B" stroke-width="0.7">
                    </path></svg>
                    <span class="quick-add-form__error-message" data-error-message=""></span>
                  </div>

                  <form method="post" action="/cart/add" id="quick-add-form-${sectionId}-${pProductData.id}" 
                     accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form">
                    <input type="hidden" name="form_type" value="product">
                    <input type="hidden" name="utf8" value="✓">
                    <input type="hidden" name="id" 
                       value="${pProductData.variants[0].id}" 
                       id="active-product-id-${sectionId}-${pProductData.id}" 
                       data-desktop>
                    <div class="quick-add-form__buttons">
                      <button type="submit" name="add" class="product-form__submit button button--full-width  button--secondary button--primary">
                        <span class="product-form__submit__text">
                           Add to Cart
                        </span>
                      </button>
                    </div>
                  </form>
              </product-form>
            </div>
        </div>
      </div>
  </li>
    `; 
  }

  loadAndRenderProducts(pPage_num) {
      let pageNumToPrerender = pPage_num;
      let urlParams = new URLSearchParams(window.location.search);
  
      if(pageNumToPrerender === 1) {
        return
      }
      const url = `${window.location.pathname}?page=${pageNumToPrerender}&?section_id=main-collection-product-grid`;
  
      this.nextPageMarkup = null; 
      
      if(this.getPageFromCache(pPage_num)) {

        let collectionProductsContainer = this.querySelector('ul'); 


        this.getPageFromCache(pPage_num).markUp.querySelectorAll('.grid__item[data-product-id]').forEach((element, index)=> {
          collectionProductsContainer.appendChild(element); 
          
          if(index === 1) {
              const offsetTop = element.offsetTop - 200;
              scroll({
                top: offsetTop,
                behavior: "smooth"
              });
          }
        });


        if(pageNumToPrerender ===  parseInt(urlParams.get('page_num'))) {
            this.querySelector('.product-grid-container').classList.remove('is-loading'); 
            return
        }

        this.loadAndRenderProducts(pageNumToPrerender + 1)
      }

      fetch(url).then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          this.close();
          throw error;
        }
        return response.text();
      })
      .then((text) => {
        const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('collection-grid');
        //this.cachePageLoaded(pageNumToPrerender, resultsMarkup); 

        let collectionProductsContainer = this.querySelector('ul'); 


        resultsMarkup.querySelectorAll('.grid__item[data-product-id]').forEach((element, index)=> {
          collectionProductsContainer.appendChild(element); 
          
          if(index === 1) {
              const offsetTop = element.offsetTop - 200;
              scroll({
                top: offsetTop,
                behavior: "smooth"
              });
          }
        });


        if(pageNumToPrerender ===  parseInt(urlParams.get('page_num'))) {
            this.querySelector('.product-grid-container').classList.remove('is-loading'); 
            return
        }

        this.loadAndRenderProducts(pageNumToPrerender + 1)

      })
      .catch((error) => {
        throw error;
      });

  }


  preLoadProducts(pPage_num, pSkipInitPage) {
    let pageNumToPrerender = pPage_num;

    if(pageNumToPrerender === 1) {
      pageNumToPrerender += 1
    }

    const url = `${window.location.pathname}?page=${pageNumToPrerender}&?section_id=main-collection-product-grid`;

    this.nextPageMarkup = null; 
    
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
      this.cachePageLoaded(pageNumToPrerender, resultsMarkup); 

      this.nextPageMarkup = resultsMarkup; 

      if(pageNumToPrerender < this.getTotalPages()) {
        this.preLoadProducts(pageNumToPrerender + 1); 
      }

    })
    .catch((error) => {
      console.log(error); 
      throw error;
    });

  }

  cachePageLoaded(pPage_num, pMarkup) {

    let page = {
      pageNum: pPage_num, 
      markUp: pMarkup
    }; 

    this.pagesLoadedCache.push(page); 
    this.pagesLoadedCache = _.uniq(this.pagesLoadedCache); 
    console.log('CACHED PAGES ARE:')
    console.log(this.pagesLoadedCache); 
  }

  getPageFromCache(pPage_num) {
    let page = undefined; 
    page = _.filter(this.pagesLoadedCache, {'pageNum': pPage_num})
    return page.length > 0 ? page : false;
  }

  renderMoreProducts() {

    window.history.replaceState({page: this.section}, '', '?page_num=' + (this.section += 1));
    const url = `${window.location.pathname}?page=${this.section}&?section_id=main-collection-product-grid`;
    // const queryUrl = new URL(window.location.href); 

    // params.delete('page_num');
    // // queryUrl.search = `?sort_by=${sortingType}`; 

    let collectionProductsContainer = this.querySelector('ul'); 

    console.log('getting page returns: ');
    console.log(this.getPageFromCache(this.section));

    
    document.querySelector('load-more-products-button').showLoadState(); 

    let productsToLoad = this.totalProducts.slice(this.totalProductsShowing.length, this.section * this.getPagination()); 
    
    this.totalProductsShowing = this.totalProducts.slice(0, this.section * this.getPagination()); 
    console.log(this.totalProductsShowing); 
    console.log(productsToLoad); 

    setTimeout(()=> {
      document.querySelector('load-more-products-button').hideLoadState(); 
      
      productsToLoad.forEach((element)=> {
        let productThumb = this.getproductThumbTemplate(element); 

        collectionProductsContainer.insertAdjacentHTML('beforeend', productThumb); 
       });
    }, 200); 
    
    // if(!this.getPageFromCache(this.section)) {

    //   document.querySelector('load-more-products-button').showLoadState(); 

    //   fetch(url)
    //   .then((response) => {
    //     if (!response.ok) {
    //       var error = new Error(response.status);
    //       this.close();
    //       throw error;
    //     }
    //     return response.text();
    //   })
    //   .then((text) => {
    //     const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('collection-grid');

    //     this.cachePageLoaded(this.section, resultsMarkup); 

    //     resultsMarkup.querySelectorAll('.grid__item[data-product-id]').forEach((element)=> {
    //       collectionProductsContainer.appendChild(element); 
    //     });

    //     document.querySelector('load-more-products-button').updateButton(); 
    //     document.querySelector('load-more-products-button').hideLoadState(); 
    //     // document.querySelector('collection-grid').renderFilteredProducts([], orderedArray, true);
    //     // this.closeFilterOptions();
    //   })
    //   .catch((error) => {
    //     console.log(error); 
    //     throw error;
    //   });

    // } else {
      
    //   document.querySelector('load-more-products-button').showLoadState(); 

    //   let sectionToLoad = this.getPageFromCache(this.section);

    //   setTimeout(()=> {
    //     document.querySelector('load-more-products-button').hideLoadState(); 
    //     sectionToLoad[0].markUp.querySelectorAll('.grid__item[data-product-id]').forEach((element)=> {
    //       collectionProductsContainer.appendChild(element); 
    //     });
    //   }, 200); 

    //   // this.preLoadProducts(this.section + 1);  
    // }

    // this.totalProductsShowing = this.totalProducts.slice(0, this.section * this.paginateBy); 
    // document.querySelector('load-more-products-button').updateButton(); 

    // console.log(this.totalProductsShowing); 

    //  let productsToAdd = this.totalProducts.slice(this.totalProductsShowing.length, this.totalProductsShowing.length + pNumToShowMore);
    //  this.totalProductsShowing = [...this.totalProductsShowing, ...productsToAdd]
    //  this.totalProductsShowing.forEach((productJSON)=> {
    //     this.querySelector(`.grid__item[data-product-id="${productJSON.id}"]`).style.display = 'block';
    //  });

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

  getTotalProducts() {
    return this.totalProducts; 
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