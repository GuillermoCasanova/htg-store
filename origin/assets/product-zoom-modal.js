

class ProductZoomModal extends HTMLElement {
    constructor() {
        super();
        this.selectors =   {
            slideshow: '[data-product-images-modal-slideshow]', 
            slideshowWrapper: '[data-product-images-modal-slideshow-wrapper]',
            images: '[data-product-images-modal-slideshow-slide]',
            pagination: '[data-product-images-modal-slideshow-pagination]',
            thumbnails: '[data-images-scroller-thumb]',
            close: '[data-product-images-modal-close]',
            modal: '[data-product-images-modal]',
            open: '[data-product-images-modal-open]',
            zoomImage: '[data-zoom-image]'
        }

        this.init(); 
        
    }

  
    close(pCloseButton) {
        document.body.classList.remove('overflow-hidden-tablet');
        this.classList.remove('is-visible'); 
        removeTrapFocus(); 
  

        if(pCloseButton) {
            pCloseButton.closest(this.selectors.modal).classList.add('is-hidden');  
        } else {
            document.querySelector(this.selectors.modal).classList.add('is-hidden'); 
        }   

        this.closeZoom(); 
    } 

    updateImageUrls(pImages) {

        let images = pImages; 

        let slideshow = this.querySelector(this.selectors.slideshow); 
        let pagination = this.querySelector(this.selectors.pagination); 

        slideshow.innerHTML = ""; 
        pagination.innerHTML = ""; 

        function createImageObj(pSource, pAlt, pIndex, pImageType) {
            let imageTemplate = ``; 
            let index = pIndex + 1;

            function processImageSrc(pImageSrc, pSize) {
                let imageSrc = '';
                imageSrc = pImageSrc.replace(/(\.[^.]*)$/, `_${pSize}$1`)
                .replace('http:', '');
                return imageSrc;
            }

            if(pImageType === 'slide') {
                imageTemplate = `
                     <li class="slide" data-id="${index}" 
                     data-product-images-modal-slideshow-slide  
                     data-id="${index}"
                     data-img-url="${processImageSrc(pSource, '2000x')}" alt="${pAlt}"></li>`; 
            } 
            
            if(pImageType === 'thumbnail'){
                imageTemplate = `
                     <li class="slide product-images-slideshow__pagination__thumb" 
                     data-images-scroller-thumb role="button" tabindex="0" 
                     data-id="${index}"
                     data-img-url="${processImageSrc(pSource, '80x')}" alt="Thumbnail for image ${index}" aria-label="Go to image ${index}"></li>`;     
            }

            return imageTemplate; 
         }


        images.forEach((image, index)=> {
         pagination.insertAdjacentHTML("beforeend", createImageObj(image.src, '', index, 'thumbnail')); 
         slideshow.insertAdjacentHTML("beforeend", createImageObj(image.src, '', index, 'slide')); 
        });

    }


    goToImage(pThis, pEvent, pForceId) {

        pThis.closeZoom(); 

        let that = pThis; 
        let pImageId = pForceId ? pForceId : pEvent.target.closest('[data-images-scroller-thumb]').dataset.id; 
        let scrollDistance = null; 
        let speed = pForceId ? 'auto' : 'smooth'; 

        that.container.querySelectorAll(that.selectors.thumbnails).forEach(function(element) {
            element.classList.remove('is-active');
        });

        document.querySelectorAll(that.selectors.images).forEach(function(element){
            if(element.dataset.id === pImageId) {
                scrollDistance =  element.offsetTop;
            }
        });

        document.querySelector(that.selectors.slideshow).scrollTo({ top: scrollDistance, behavior: speed})
    }
    initScroller() {
        let that = this; 
        this.container = document.querySelector(this.selectors.modal);
        this.container.querySelectorAll(this.selectors.thumbnails).forEach(function(element) {
        
            if(element.dataset.id === '1' ||  element.dataset.id === 1) {
                element.classList.add('is-active');
            }

            element.addEventListener('click', that.goToImage.bind(this, that)); 
       });


       function callback(entries, observer) {
        entries.forEach(entry => {

            if(entry.isIntersecting) {

                let id = entry.target.dataset.id

                that.container.querySelectorAll(that.selectors.thumbnails).forEach(function(element) {
                    element.classList.remove('is-active');

                    if(parseInt(element.dataset.id) === parseInt(id)) {
                        element.classList.add('is-active');
                    }
               });
    
            }
          });
       }

       let options = {
           root: document.querySelector(this.selectors.slideshow),
           rootMargin: '25%',
           threshold: .8
       }
       
       this.observer = new IntersectionObserver(callback, options); 

       document.querySelectorAll(this.selectors.images).forEach(function(element) {
            let target = element; 
            that.observer.observe(target); 
       }); 
    }
    open(pEvent) {

         document.body.classList.add('overflow-hidden-tablet');

        let currentTarget = pEvent.currentTarget; 

        let script = document.createElement('script');
        script.src = this.dataset.zoomScriptUrl; 
        document.querySelector('footer').appendChild(script); 

        script.onload = (elem) => {
            
            this.classList.remove('is-hidden'); 
            this.classList.add('is-visible'); 

            trapFocus(this, this.querySelector(this.selectors.close));
            
            this.querySelectorAll(this.selectors.images).forEach((element, index) => {

                
                element.classList.add('scroller-slide');
                let image = new Image(); 
                image.loading = 'lazy';
                image.src = element.dataset.imgUrl;

                if(index === 0) {
                    element.innerHTML = `
                    <div class="image-container">
                        <img role="presentation" src="${element.dataset.imgUrl}" data-zoom-image loading="eager"/>
                    </div>`; 
                } else {
                    element.innerHTML = `
                    <div class="image-container">
                        <img role="presentation" src="${element.dataset.imgUrl}" data-zoom-image loading="lazy"/>
                    </div>`; 
                }


            });

              
            this.querySelectorAll(this.selectors.thumbnails).forEach((element, index) => {
                let image = new Image(); 
                image.src = element.dataset.imgUrl;
                image.loading = 'lazy';
                element.innerHTML = `
                    <img role="presentation" src="${element.dataset.imgUrl}" alt="Thumbnail for image ${index}" loading="lazy"/>
                `; 

            });

            this.querySelectorAll(this.selectors.zoomImage).forEach((element) => {
                element.addEventListener('click', (event)=> {
                    this.zoomImage(event); 
                }); 
            }); 

            this.initScroller(); 
            let imageId = currentTarget.dataset.id;
            this.goToImage(this, pEvent, imageId); 
   
        };

    }
    handleLargeUp() {
        let that = this; 

            this.querySelector(this.selectors.close).addEventListener('click', function(event) {
             that.close(event.target);  
            });     

            document.onkeydown = function(event) {
                if(event.key === "Escape" || event.key === "Esc") {
                    that.close();  
                }
            };

            document.querySelectorAll(this.selectors.open).forEach(function(element) {
                element.addEventListener('click', function(event) {
                    that.open(event);  
                }); 
        }); 
    } 
    closeZoom() {
        if(this.panzoom) {
            this.panzoom.destroy();
        }

        if(this.zoomTemplate) {
            this.zoomTemplate.parentNode.removeChild(this.zoomTemplate); 
            this.zoomTemplate = null; 
        }
    }
    zoomImage(pEvent) {

        let that = this; 
        let imageUrl = pEvent.target.src;
        let drag = false;

        this.zoomTemplate = document.createElement('div'); 
        this.zoomTemplate.classList.add('zoom-image'); 
        this.zoomTemplate.innerHTML = `
                <img data-zoom-image-inner src="${imageUrl}"/>
        `; 

        document.querySelector(this.selectors.modal).appendChild(this.zoomTemplate);

        const elem = document.querySelector('[data-zoom-image-inner]')
        this.panzoom = Panzoom(elem, {
             maxScale: 2,
             minScale: 1, 
             handleStartEvent: (event) => {
               event.preventDefault()
               event.stopPropagation()
            },
            exclude: [this.selectors.modal, this.selectors.slideshow]
        });

         this.panzoom.pan(2, 2)
         this.panzoom.zoom(1.5, { animate: true })

        elem.parentElement.addEventListener('wheel',  this.panzoom.zoomWithWheel)

        elem.addEventListener('panzoomstart', (event) => {
            drag = false;
        })

        elem.addEventListener('panzoomend', (event) => {
            if(drag == false) {
                that.closeZoom(that.zoomTemplate, that.panzoom); 
            }
        })

        elem.addEventListener('panzoomchange', (event) => {
            drag = true;
       })
        
    }
    init() {
        mediaQueries.largeUp.addEventListener("change", this.handleLargeUp.bind(this)); 
        this.handleLargeUp(mediaQueries.largeUp); 
    } 
    destroy() {
        let that = this; 
        if(this.container) {
            this.container.querySelectorAll(this.selectors.thumbnails).forEach(function(element) {
                element.removeEventListener("click", that.goToImage)
                element.classList.remove('is-active');
            });
        }

        if(this.observer) {
            this.observer = null; 
        }
    }

}

customElements.define('product-zoom-modal', ProductZoomModal)