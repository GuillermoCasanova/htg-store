


class ProductImagesSlideshow extends HTMLElement {
    constructor() {
        super(); 
        this.selectors = {
            slideshow: '[data-product-images-slideshow]', 
            slideshowWrapper: '[data-product-images-slideshow-wrapper]',
            slides: '[data-product-images-slideshow-slide]',
            thumbnails: '[data-product-images-slideshow-thumbs]',
            thumbnailsWrapper: '[data-product-images-slideshow-thumbs-wrapper]',
            thumbnailSlides: '[data-product-images-slideshow-thumb]',
            pagination: '[data-product-images-slideshow-pagination]',
            paginationWrapper: '[data-product-images-slideshow-pagination-wrapper]',
            paginationThumbs: '[data-product-images-slideshow-pagination-thumb]'
        }

        this.mediaQueries = {
            largeUp: window.matchMedia('(min-width: 930px)')
        }
        
        this.init(); 
    }
  
    init() {
        import('./swiper.module.js').then((Swiper) => {
            this.mediaQueries.largeUp.addEventListener("change", this.handleLargeUp.bind(this)); 
            this.handleLargeUp(this.mediaQueries.largeUp, Swiper); 
        }); 
    } 
    
    appendThumbImages() {
        this.querySelectorAll('[data-thumb]').forEach((elem)=> {
            let img = document.createElement('img'); 
            img.src = elem.dataset.thumbSrc;
            img.sizes = elem.dataset.thumbSizes;
            img.srcset = elem.dataset.thumbSrcset; 
            img.height = elem.dataset.thumbHeight;
            img.width = elem.dataset.thumbWidth;
            img.alt = elem.dataset.thumbAlt;
            img.loading = 'lazy';
            elem.appendChild(img); 
        }); 
    }
    
    handleLargeUp(pEvent, Swiper) {

        let slideshowProps = {}; 

        if(pEvent.matches) {
            this.appendThumbImages();
            document.querySelector(this.selectors.thumbnails).classList.add('swiper'); 
            document.querySelector(this.selectors.thumbnails).querySelector(this.selectors.thumbnailsWrapper).classList.add('swiper-wrapper');
            document.querySelector(this.selectors.thumbnails).querySelectorAll(this.selectors.thumbnailSlides).forEach(element => {
                element.classList.add('swiper-slide');
            });

            this.slideshowThumbs = new Swiper.default(this.querySelector(this.selectors.thumbnails), {
                spaceBetween: 14,
                slidesPerView: 4,
                direction: 'horizontal',
                loop: false
            });

        } else {
            this.destroy('thumbs'); 
        }


        if(pEvent.matches) {
            slideshowProps =  {
                direction: 'horizontal', 
                loop: true,
                loopedSlides: 6,
                grabCursor: false, 
                preventInteractionOnTransition: true,
                pagination: {
                    el: this.selectors.pagination,
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<button aria-label="Slide to product image ' + (index + 1) + '" class="' + className + '"><span class="visually-hidden">' + 'Slide to product image ' + (index + 1) + "</span></button>";
                    }
                },
                thumbs: {
                    swiper: this.slideshowThumbs
                }
            }
        } else {
            slideshowProps = {
                direction: 'horizontal', 
                loop: true,
                loopedSlides: 6,
                grabCursor: false, 
                preventInteractionOnTransition: true,
                pagination: {
                    el: this.selectors.pagination,
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<button aria-label="Slide to product image ' + (index + 1) + '" class="' + className + '"><span class="visually-hidden">' + 'Slide to product image ' + (index + 1) + "</span></button>";
                    }
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

        this.slideshow = new Swiper.default(this.querySelector(this.selectors.slideshow), slideshowProps);
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

        if(this.slideshowThumbs) {
            this.slideshowThumbs.removeAllSlides(); 
        }
    }

    appendThumb(pSlide) {
        if(this.slideshowThumbs) {
            this.slideshowThumbs.appendSlide(pSlide); 
        }
    }

    checkForThumbnailsActive() {
        return this.slideshowThumbs
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


customElements.define('product-images-slideshow', ProductImagesSlideshow);

