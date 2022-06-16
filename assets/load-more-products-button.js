

class loadMoreProductsButton extends HTMLElement {
    constructor() {
        super(); 

        if(this.querySelector('button')) {
            this.querySelector('button').addEventListener('click', this.loadMoreProducts.bind(this))
        }

        this.collectionTotal = 0; 
    
    }

    hide() {
        this.style.display = 'none';
    }
    
    reset() {
        this.style.display = 'block';
    }

    setCollectionTotal() {
        const productContainerId = '[data-product-json]';

        document.querySelectorAll(productContainerId).forEach((element)=> {
          this.totalProducts.push(JSON.parse(element.textContent))
        });

        // IF NO MORE PRODUCTS, HIDE BUTTON
        if(document.querySelector('collection-grid')) {
            let CollectionProducs = document.querySelector('collection-grid'); 
            if(CollectionProducs.getProductsRendered().length >=  parseInt(this.totalProducts.length)) {
                this.style.display = 'none';
            }
        }
    }

    updateButton() {
        if(CollectionProducs.getProductsRendered().length >=  CollectionProducs.totalProducts.length) {
            this.style.display = 'none';
        }
    }

    loadMoreProducts() {
        let collectionHandle = this.dataset.collectionHandle;
        let collectionCount = this.dataset.collectionCount;
        let collectionTag = this.dataset.filteredByTag; 

        let CollectionProducs = document.querySelector('collection-grid'); 
        CollectionProducs.renderMoreProducts(parseInt(this.dataset.paginateBy));

            // console.log(CollectionProducs.getProductsRendered().length); 
            // console.log(CollectionProducs.totalProducts.length); 

     
        // if(CollectionProducs.getProductsRendered().length <=  CollectionProducs.totalProducts) {
        //     this.style.display = 'block';
        // }
    }

}

customElements.define('load-more-products-button', loadMoreProductsButton)