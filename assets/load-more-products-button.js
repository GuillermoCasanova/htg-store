

class loadMoreProductsButton extends HTMLElement {
    constructor() {
        super(); 

        if(this.querySelector('button')) {
            this.querySelector('button').addEventListener('click', this.loadMoreProducts.bind(this))
        }
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
    }

}

customElements.define('load-more-products-button', loadMoreProductsButton)