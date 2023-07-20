
class CollectionGrid extends HTMLElement {
    constructor() {
        super(); 
        this.totalCollectionProducts = [];
        this.section = 1; 
        this.paginateBy = parseInt(this.dataset.paginateBy);
        //window.history.replaceState(null, null, null);
    }

  
    setUpPagination(pNumToStartFrom, pFiltered) {
      // const url = new URL(window.location.href); 
      // let params = new URLSearchParams(url.search); 
      // params.delete('page_num');
      // url.search = params; 
  
      let indexToStartFrom = parseInt(pNumToStartFrom); 
  
     // window.history.replaceState(null, null, null); 
  
      // if(pFiltered) {
      //   if(this.totalCollectionProducts.length>= parseInt(this.dataset.paginateBy)) {
      //     document.querySelector('load-more-products-button').style.display = 'none';
      //   }
  
      //   if(this.totalCollectionProducts.length <= indexToStartFrom) {
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

      console.log(pProductData);
  
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

      function checkSoldOut(pThumbProductData) {
            if(pThumbProductData.available === true) {
                return false
            } else {
                return true
            }
      }

      function checkOnSale(pThumbProductData) {
        console.log(pProductData);
        if(pThumbProductData.compare_at_price > pThumbProductData.price) {
          return true
      } else {
          return false
      }
      }
  
      function getOptionsPickerHTML(pProductData) {
  
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


        function getQuickAddColorPicker(pProductData) {
            
            let htmlString = '';
            let mainProduct = pProductData;
            
            if(!mainProduct.metafields ||  !mainProduct.metafields.color_swatch.related_swatches) {
                return ''
            }

            function getColorValues(pProductData) {
                let colorInputsHtml = ``; 
                let swatches = pProductData.metafields.color_swatch.related_swatches;

                let firstSwatch = swatches.filter(swatch => swatch.handle === mainProduct.handle);
                let filteredSwatches = swatches.filter(swatch => swatch.handle !== mainProduct.handle);

                swatches = [...firstSwatch, ...filteredSwatches];


                swatches.forEach((swatch, index) => {
                    let valueHTML = '';

                    valueHTML = `
                    <span class="quick-add-color-picker__color"
                          data-more-text="+${swatches.length} more color${swatches.length >= 5 ? 's' : ''}" >
                            <input type="radio" 
                            id="${sectionId}-${mainProduct.id}-${swatch.metafields.color_swatch.name}"
                            name="color" 
                            form="quick-add-form-${sectionId}-${mainProduct.id}"
                            value="${swatch.metafields.color_swatch.name.toLowerCase()}"
                            title="Shop ${mainProduct.title} in ${swatch.metafields.color_swatch.name}" 
                            data-color-option
                            data-product-media='${JSON.stringify(swatch.media)}'
                            data-product='${JSON.stringify(swatch.variants)}'
                            data-product-title="${swatch.title}" 
                            data-handle="${swatch.title}"
                            data-product-url="${swatch.url}"
                            data-product-id="${swatch.id}"
                            data-swatch="${swatch.metafields.color_swatch.name}"
                            class="quick-add-color-picker__input"
                            >
                        <label class="quick-add-color-picker__label" for="${sectionId}-${mainProduct.id}-${swatch.metafields.color_swatch.name}" 
                            data-color-label 
                            data-color-name="${swatch.metafields.color_swatch.name}">
                            <span class="quick-add-color-picker__label__swatch" 
                            style="background-color: ${swatch.metafields.color_swatch.hex_color};">

                            </span>
                            <span class="quick-add-color-picker__label__ring">
                            </span>
                        </label>
                    </span>
                `;

                    colorInputsHtml = colorInputsHtml + valueHTML; 

                }); 

                return colorInputsHtml
            }

            return `
                <quick-add-color-picker data-section="${sectionId}-${pProductData.id}" data-url="${pProductData.url}">
                    <div class="quick-add-color-picker  x-product-form__input">
                        <fieldset>
                            <legend  class="quick-add-color-picker__current-color visually-hidden" >
                                <span class="quick-add-color-picker__current-color__label">Available colors for ${pProductData.title}:</span>
                            </legend>
                            <span class="quick-add-color-picker__colors">
                                ${getColorValues(pProductData)}
                            </span>
                        </fieldset>
                    </div>
                </quick-add-color-picker>
            `;
        }
  

        let HTML = `

        ${getQuickAddColorPicker(pProductData)}

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


                
                  <div class="product-card__badge">
                    <span class="product-card__badge-text product-card__badge__text--sold-out  ${checkSoldOut(pProductData) ? ' is-visible': ' is-hidden' }">Sold out</span>
                    <span class="product-card__badge-text product-card__badge__text--on-sale  ${checkOnSale(pProductData) ? ' is-visible' : ' is-hidden' }">On Sale</span>
                  </div>
                  
                  <div class="quick-add-button-container">
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
                  
                  <div class="price product-card__price ${pProductData.price < pProductData.compare_at_price ? ' price--on-sale' : ''}">
                    <div class="price__container">
                    
                     <div class="price__regular">
                        <span class="visually-hidden visually-hidden--inline">Regular price</span>
                        <span class="price-item price-item--regular">
                          ${new Shopify.currency().formatMoney(pProductData.price)}
                        </span>
                      </div>
                      <div class="price__sale">
                          <span class="visually-hidden visually-hidden--inline">Regular price</span>
                            <span class="price-item price-item--regular">
                          ${new Shopify.currency().formatMoney(pProductData.compare_at_price)}
                            </span>
                            
                            <span class="visually-hidden visually-hidden--inline">Sale price</span>
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
  
  
    renderMoreProducts() {


      if(this.totalCollectionProducts.length <= 0) {
        this.totalCollectionProducts = document.querySelector('collection-filters').getTotalProducts(); 
        this.totalProductsShowing = this.totalCollectionProducts.length < 16 ? this.totalCollectionProducts.length : this.paginateBy 
      }
      
      this.section += 1

      // window.history.replaceState({page: this.section}, '', '?page_num=' + (this.section += 1));
      // const url = `${window.location.pathname}?page=${this.section}&?section_id=main-collection-product-grid`;
      // const queryUrl = new URL(window.location.href); 
  
      // params.delete('page_num');
      // // queryUrl.search = `?sort_by=${sortingType}`; 
  
      let collectionProductsContainer = this.querySelector('ul'); 
      let productsToShow = []; 
  
      document.querySelector('load-more-products-button').showLoadState(); 

      productsToShow = this.totalCollectionProducts.slice(this.totalProductsShowing, this.section * this.getPagination()); 


      
      setTimeout(()=> {
        document.querySelector('load-more-products-button').hideLoadState(); 
        
        productsToShow.forEach((element)=> {
          let productThumb = this.getproductThumbTemplate(element); 
          collectionProductsContainer.insertAdjacentHTML('beforeend', productThumb); 
         });

        this.totalProductsShowing = this.totalProductsShowing + productsToShow.length

        this.checkIfPaginationNeeded(this.totalProductsShowing,  this.totalCollectionProducts.length); 

      }, 200); 
      
    }
  
    renderProducts(pProductsToShow, pSorting) {
        console.log(pProductsToShow); 
         let collectionProductsContainer = this.querySelector('ul'); 
  
        collectionProductsContainer.innerHTML = '';
  
        this.totalCollectionProducts = pProductsToShow; 
        this.totalProductsShowing = this.paginateBy;
        
        pProductsToShow.slice(0, this.paginateBy).forEach((element)=> {
          let productThumb = this.getproductThumbTemplate(element); 
          collectionProductsContainer.insertAdjacentHTML('beforeend', productThumb); 
         });
         
        this.checkIfPaginationNeeded(this.totalProductsShowing, this.totalCollectionProducts.length); 


    }
  
    checkIfPaginationNeeded(pProductsRendered, pTotalProducts) {
      if(document.querySelector('load-more-products-button')) {
        if(pProductsRendered >= pTotalProducts) {
          document.querySelector('load-more-products-button').hide(); 
        } else {
          document.querySelector('load-more-products-button').reset(); 
        }
      }

    }

          
    resetCollectionGrid() {
        this.totalCollectionProducts = []; 
        this.section = 1;
        this.totalProductsShowing = this.totalProducts.slice(0, this.paginateBy);
        this.setUpPagination(this.totalProductsShowing.length); 
        document.querySelector('load-more-products-button').reset(); 
      }
  

    getTotalProducts() {
      return this.totalProducts; 
    } 
    getProductsRendered() {
      return this.totalProductsShowing; 
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

  }
  
  
  customElements.define('collection-grid', CollectionGrid); 