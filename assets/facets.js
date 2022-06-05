

class CollectionGrid extends HTMLElement {
  constructor() {
      super(); 
      this.totalProducts = [];
      this.totalProductsShowing = [];
      this.getProductsFromJson(); 
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

  getProductsFromJson() {
    this.totalProducts = JSON.parse(this.querySelector('[id="collection-products"]').textContent)
    this.totalProductsShowing = this.totalProducts.slice(0, this.dataset.paginateBy); 
 
    // fetch('/products/inner-city-cinema-t-shirt-blonde?variant=39898892566607')
    // .then((response) => response.text())
    // .then((responseText) => {
    //   console.log(responseText);
    // });
  
  }

  renderMoreProducts(pNumToShowMore) {
     let productsToAdd = this.totalProducts.slice(this.totalProductsShowing.length, this.totalProductsShowing.length + pNumToShowMore);
     console.log(productsToAdd); 
     this.totalProductsShowing = [...this.totalProductsShowing, ...productsToAdd]

     console.log(this.totalProductsShowing); 
     console.log("NOW SHOWING " + this.totalProductsShowing.length);

  }

  filterProducts() {

  }


  getProductsRendered() {
    console.log(this.totalProductsShowing); 
    return this.totalProductsShowing; 
  }
}


customElements.define('collection-grid', CollectionGrid); 