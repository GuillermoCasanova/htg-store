

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
            console.log('COLLECTION GRID FOUND');
            let CollectionProducts = document.querySelector('collection-grid'); 
            if(CollectionProducts.getProductsRendered().length >=  parseInt(this.totalProducts.length)) {
                this.style.display = 'none';
            }
        }
    }

    updateButton() {
        let CollectionProducts = document.querySelector('collection-grid'); 
        if(CollectionProducts.getProductsRendered().length >=  CollectionProducts.getTotalProducts().length) {
            this.style.display = 'none';
        }
    }

    loadMoreProducts() {
        let collectionHandle = this.dataset.collectionHandle;
        let collectionCount = this.dataset.collectionCount;
        let collectionTag = this.dataset.filteredByTag; 

        let CollectionProducts = document.querySelector('collection-grid'); 
        CollectionProducts.renderMoreProducts(parseInt(this.dataset.paginateBy));

            // console.log(CollectionProducts.getProductsRendered().length); 
            // console.log(CollectionProducts.totalProducts.length); 

     
        // if(CollectionProducts.getProductsRendered().length <=  CollectionProducts.totalProducts) {
        //     this.style.display = 'block';
        // }
    }

}

customElements.define('load-more-products-button', loadMoreProductsButton)