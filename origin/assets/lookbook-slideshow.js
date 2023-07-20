
import Swiper from './swiper.module.js'

class LookbookSlideshow extends HTMLElement {
    constructor() {
        super(); 
        this.selectors = {
            slideshow: '[data-lookbook-images-slideshow]', 
            slideshowWrapper: '[data-lookbook-images-slideshow-wrapper]',
            slides: '[data-lookbook-images-slideshow-slide]',
            pagination: '[data-lookbook-images-slideshow-pagination]',
            paginationWrapper: '[data-lookbook-images-slideshow-pagination-wrapper]',
            paginationThumbs: '[data-lookbook-images-slideshow-pagination-thumb]'
        }

        this.mediaQueries = {
            largeUp: window.matchMedia('(min-width: 930px)')
        }
        
        this.init(); 
    }
  
    init() {
        this.mediaQueries.largeUp.addEventListener("change", this.handleLargeUp.bind(this)); 
        this.handleLargeUp(this.mediaQueries.largeUp); 
    } 
    
    handleLargeUp(pEvent) {
        let slideshowProps = {}; 

        console.log('INIT SLIDESHOW');

        slideshowProps = {
            direction: 'horizontal', 
            loop: true,
            preventInteractionOnTransition: true,
            pagination: {
                el: this.selectors.pagination,
                clickable: true,
                renderBullet: function (index, className) {
                    return '<button aria-label="Slide to product image ' + (index + 1) + '" class="' + className + '"><span class="visually-hidden">' + 'Slide to product image ' + (index + 1) + "</span></button>";
                }
            },
            breakpoints: {
                600: {
                    slidesPerView: 2,
                    grabCursor: true
                },
                930: {
                    slidesPerView: 3
                }
            }
        }

        if(this.slideshow) {
            this.destroy('slideshow'); 
        }
        
        const slideshowElem = document.querySelector(this.selectors.slideshow); 
        const that = this; 
        slideshowElem.classList.add('swiper'); 
        slideshowElem.querySelector(this.selectors.slideshowWrapper).classList.add('swiper-wrapper');
        slideshowElem.querySelectorAll(this.selectors.slides).forEach(element => {
            element.classList.add('swiper-slide');
        });

        this.slideshow = new Swiper(this.querySelector(this.selectors.slideshow), slideshowProps);
    }

    destroy(pToDestroy) {
        if(pToDestroy == 'slideshow'  && this.slideshow) {
            document.querySelector(this.selectors.slideshow).classList.remove('swiper');
            document.querySelector(this.selectors.slideshowWrapper).classList.remove('swiper-wrapper');
            this.slideshow.detachEvents(); 
            this.slideshow.destroy(true, true); 
            this.slideshow = null; 
        }
        if(pToDestroy == 'thumbs' && this.slideshowThumbs) {
            document.querySelector(this.selectors.thumbnails).classList.remove('swiper');
            document.querySelector(this.selectors.thumbnailsWrapper).classList.remove('swiper-wrapper');
            this.slideshowThumbs.detachEvents(); 
            this.slideshowThumbs.destroy(true, true); 
            this.slideshowThumbs = null; 
        }
    }
}


customElements.define('lookbook-slideshow', LookbookSlideshow);

