

import Swiper from './swiper.module.js'


class ProductImagesSlideshow extends HTMLElement {
    constructor() {
        super(); 
        this.selectors = {
            slideshow: '[data-product-images-slideshow]', 
            slideshowWrapper: '[data-product-images-slideshow-wrapper]',
            slides: '[data-product-images-slideshow-slide]',
            pagination: '[data-product-images-slideshow-pagination]',
            paginationWrapper: '[data-product-images-slideshow-pagination-wrapper]',
            paginationThumbs: '[data-product-images-slideshow-pagination-thumb]'
        }

        this.init(); 

        console.log(this.selectors);
    }
  
    init() {
        const slideshowElem = document.querySelector(this.selectors.slideshow); 
        const that = this; 
        slideshowElem.classList.add('swiper'); 
        slideshowElem.querySelector(this.selectors.slideshowWrapper).classList.add('swiper-wrapper');
        slideshowElem.querySelectorAll(this.selectors.slides).forEach(element => {
            element.classList.add('swiper-slide');
        });

        this.slideshow = new Swiper(this.querySelector(this.selectors.slideshow), {
            direction: 'horizontal', 
            loop: true,
            loopedSlides: 6,
            preventInteractionOnTransition: true,
            pagination: {
                el: this.selectors.pagination,
                clickable: true,
                renderBullet: function (index, className) {
                    return '<button aria-label="Slide to product image ' + (index + 1) + '" class="' + className + '"><span class="visually-hidden">' + 'Slide to product image ' + (index + 1) + "</span></button>";
                }
            },
            zoom: {
                maxRatio: 1.5
            },
            thumbs: {
                swiper:  that.pagination
            }
           
        });

        console.log(this.slideshow); 
    } 
    initPagination() {
        const paginationElem = document.querySelector(this.selectors.pagination); 
        // paginationElem.classList.add('swiper'); 
        // paginationElem.querySelector(this.selectors.paginationWrapper).classList.add('swiper-wrapper');
        // paginationElem.querySelectorAll(this.selectors.paginationThumbs).forEach(element => {
        //     element.classList.add('swiper-slide');
        // });

        // let className = "swiper-bullet"; 

        // this.pagination = new Swiper(this.selectors.slideshow, {
           
        //     breakpoints: {
        //         1000: {
        //             enabled: false
        //         }
        //     }
        // });

    }

    appendSlide(pSlide) {
        if(this.slideshow) {
            this.slideshow.appendSlide(pSlide); 
        }
    }

    removeSlides() {
        if(this.slideshow) {
            this.slideshow.removeAllSlides(); 
        }
    }

    destroy() {
        if(this.slideshow) {
            document.querySelector(this.selectors.slideshow).classList.remove('swiper');
            document.querySelector(this.selectors.slideshowWrapper).classList.remove('swiper-wrapper');
            this.slideshow.detachEvents(); 
            this.slideshow.destroy(true, true); 
        }
        if(this.pagination) {
            document.querySelector(this.selectors.pagination).classList.remove('swiper');
            document.querySelector(this.selectors.paginationWrapper).classList.remove('swiper-wrapper');
            this.pagination.detachEvents(); 
            this.pagination.destroy(true, true); 
        }
    }
}


customElements.define('product-images-slideshow', ProductImagesSlideshow);

