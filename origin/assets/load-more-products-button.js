

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

    showLoadState() {
        this.querySelector('button').classList.add('is-loading'); 
    }

    hideLoadState() {
        this.querySelector('button').classList.remove('is-loading'); 
    }


    updateButton() {
        let CollectionProducts = document.querySelector('collection-grid'); 
        if(CollectionProducts.getProductsRendered() >=  CollectionProducts.getTotalProducts()) {
            this.style.display = 'none';
        }
    }

    loadMoreProducts() {
        let CollectionProducts = document.querySelector('collection-grid'); 
        CollectionProducts.renderMoreProducts();
    }

}

customElements.define('load-more-products-button', loadMoreProductsButton)