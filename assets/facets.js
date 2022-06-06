

class CollectionGrid extends HTMLElement {
  constructor() {
      super(); 
      this.totalProducts = [];
      this.totalProductsShowing = [];
      this.section = 1; 
      this.getProductsFromJson(this.dataset.paginateBy); 
      this.setUpPagination(this.dataset.paginateBy); 
     window.history.replaceState(null, null, null);
  }

  fetchProducts(pNumToLoad, pHandleOrTag, pLastProduct) {

      let collectionId =  document.querySelector('[data-collection-filtered-by-tag]').dataset.collectionId;
      let collectionHandle = pHandleOrTag; 

      function getCollectionProducts() {
        console.log('calling');
          return fetch('/apps/proxy-test/collectionProducts/?' +  new URLSearchParams({
              handle: collectionHandle,
              lastProduct: pLastProduct || "",
              quantity: 100
          }).toString(), {
                      method: 'GET',
                      headers: {
                      "content-type":  "application/json; charset=utf-8"
                      }
          }
                  );
                  
      }
  
      getCollectionProducts()
      .then(res => res.json()).then(response => {
        
        let productsRetrieved = response.collectionByHandle.products.edges; 
        this.totalProducts = [...this.totalProducts, ...productsRetrieved]
        console.log(this.totalProducts); 
        console.log(response.collectionByHandle);

        if(response.collectionByHandle.products.pageInfo.hasNextPage) {
          console.log('theres more!');
          this.fetchProducts(pNumToLoad, pHandleOrTag, productsRetrieved[productsRetrieved.length -1].cursor); 

        } else {
           console.log('load filter!');
           console.log(this.totalProducts); 
        }
      });
  }

  getProductsFromJson(pNumToStartFrom) {

    const productContainerId = '[data-product-json]';
    const queryString = window.location.search; 
    let startFromProduct = pNumToStartFrom;
    let productsToShow = this.dataset.paginateBy ; 
    
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

  setUpPagination(pNumToStartFrom) {
    window.history.replaceState(null, null, null);
    let productsToHide = this.querySelectorAll(`.grid__item:nth-child(${this.totalProductsShowing.length}) ~ *`);

    productsToHide.forEach(elem => {
      elem.style.display = 'none';
    });
  } 


  renderMoreProducts(pNumToShowMore) {
     let productsToAdd = this.totalProducts.slice(this.totalProductsShowing.length, this.totalProductsShowing.length + pNumToShowMore);
     this.totalProductsShowing = [...this.totalProductsShowing, ...productsToAdd]

     productsToAdd.forEach((productJSON)=> {
        this.querySelector(`[data-product-id="${productJSON.id}"]`).style.display = 'block';
     });

     window.history.replaceState({page: this.section}, '', '?section=' + (this.section += 1));
  }

  filterProducts() {

  }


  getProductsRendered() {
    return this.totalProductsShowing; 
  }

  renderProductFromTemplate() {

  }
}


customElements.define('collection-grid', CollectionGrid); 