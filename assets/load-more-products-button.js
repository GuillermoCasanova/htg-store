

class loadMoreProductsButton extends HTMLElement {
    constructor() {
        super(); 

        if(this.querySelector('button')) {
            this.querySelector('button').addEventListener('click', this.loadMoreProducts.bind(this))
        }
        
        // IF NO MORE PRODUCTS, HIDE BUTTON
        if(document.querySelector('collection-grid')) {
            let CollectionProducs = document.querySelector('collection-grid'); 
            if(CollectionProducs.getProductsRendered().length >=  parseInt(this.dataset.collectionTotal)) {
                this.style.display = 'none';
            }
        }
    }

    hide() {
        this.style.display = 'none';
    }
    
    reset() {
        this.style.display = 'block';
    }
    
    loadMoreProducts() {
        let collectionHandle = this.dataset.collectionHandle;
        let collectionCount = this.dataset.collectionCount;
        let collectionTag = this.dataset.filteredByTag; 

        let CollectionProducs = document.querySelector('collection-grid'); 
        CollectionProducs.renderMoreProducts(parseInt(this.dataset.paginateBy));
        
        if(CollectionProducs.getProductsRendered().length >=  parseInt(this.dataset.collectionTotal)) {
            this.style.display = 'none';
        }

        // IF NO MORE PRODUCTS, HIDE BUTTON
        if(CollectionProducs.getProductsRendered().length >=  parseInt(this.dataset.collectionTotal)) {
            this.style.display = 'none';
        }
    }

}

customElements.define('load-more-products-button', loadMoreProductsButton)