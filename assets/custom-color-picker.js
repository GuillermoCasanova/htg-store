class CustomColorPicker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('change', this.onVariantChange);

        if(this.querySelector("[data-color-container]") !== null ) {
            this.init(); 
        }
    }

    onVariantChange() {
        
        this.updateActiveColorLabel(this.getCurrentColor().dataset.colorName); 
        this.updateURL(); 
        this.updateImages();
        this.updateVariantData(); 
        this.updateDescription() 
    }

    updateURL() {
        let url = this.currentColor.dataset.productUrl; 
        window.history.replaceState({ }, '', `${url}`);
    }

    updateActiveColorLabel(pColorName) {
        this.querySelector("[data-color-container]").textContent = pColorName;
    }

    setCurrentColor() {
        let currentColorName =  this.querySelector("[data-color-container]").textContent.toLocaleLowerCase().replace(/[\n\r]+|[\s]{2,}/g, '');
        this.querySelectorAll('[data-color-option]').forEach((elem) => {
            if(elem.dataset.colorName.toLocaleLowerCase() === currentColorName ) {
                elem.checked = true; 
            }
        });  
    }

    getCurrentColor() { 
        let that = this; 
        this.querySelectorAll('[data-color-option]').forEach((elem) => {
            console.dir(elem); 
            if(elem.checked) {
                console.log(elem)
                this.currentColor = elem; 
            }
        }); 

        return this.currentColor; 
    }; 

    

    updateVariantData() {
        const currentColor = this.getCurrentColor(); 
        let sectionId = this.dataset.section; 
        let productContainer = document.querySelector(`[data-product-container][data-section="${sectionId}"]`); 


            
            productContainer.querySelectorAll(`variant-radios[data-section="${this.dataset.section}"]`).forEach((elem) => {
                if( elem.querySelector('[type="application/json"]')) {
                    let e = elem.querySelector('[type="application/json"]');
                    e.parentElement.removeChild(e); 
                }
                let newScript = document.createElement('script');
                newScript.innerHTML  = ` ` + JSON.stringify(JSON.parse(currentColor.dataset.product).variants);  
                newScript.type = "application/json";
                elem.appendChild(newScript); 
                elem.dispatchEvent(new Event('change'));
            }); 
        
            
            productContainer.querySelectorAll(`variant-selects[data-section="${this.dataset.section}"]`).forEach((elem) => {
                elem.dataset.url = this.getCurrentColor().dataset.productUrl;

            if( elem.querySelector('[type="application/json"]')) {
                let e = elem.querySelector('[type="application/json"]');
                e.parentElement.removeChild(e); 
            }

                let newScript = document.createElement('script');
                newScript.innerHTML  = ` ` + JSON.stringify(JSON.parse(currentColor.dataset.product).variants);  
                newScript.type = "application/json";
                elem.appendChild(newScript); 
                elem.dispatchEvent(new Event('change'));
            });

            // productContainer.querySelector('[data-active-product-id]').value = JSON.parse(this.currentColor.dataset.product).variants[0].id; 

        // console.log(productContainer.querySelector('[data-active-product-id]').value); 

        // if(productContainer.querySelectorAll('variant-radios').length > 0) {
            
        //     productContainer.querySelectorAll('variant-radios').forEach((elem) => {
        //         elem.dataset.url = this.getCurrentColor().dataset.productUrl;

        //             if( elem.querySelector('[type="application/json"]')) {
        //                 let e = elem.querySelector('[type="application/json"]');
        //                 e.parentElement.removeChild(e); 
        //             }

        //         let newScript = document.createElement('script');
        //         newScript.innerHTML  = ` ` + JSON.stringify(JSON.parse(this.currentColor.dataset.product).variants);  
        //         newScript.type = "application/json";
        //         elem.appendChild(newScript); 
        //         elem.onVariantChange(true);
        //     }); 
        // }
    }

    updateImages() {
        let productObj = JSON.parse(this.currentColor.dataset.product); 
        let images = productObj.media; 
        let imagesTemplate = ``;

        
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
                <li class="slide swiper-slide"  data-product-images-slideshow-slide  data-product-images-modal-open data-id="${index}">
                <div class="product-images-slideshow__image-container">
                            <img
                            srcset="${processImageSrc(pSource, '155x')} 165w,
                                    ${processImageSrc(pSource, '360x')} 360w,
                                    ${processImageSrc(pSource, '533x')} 533w,
                                    ${processImageSrc(pSource, '720x')} 720w,
                                    ${processImageSrc(pSource, '940x')} 940w,
                                    ${processImageSrc(pSource, '1066x')} 1066w,
                                    ${processImageSrc(pSource, '2000x')} 2000w"
                            src="${processImageSrc(pSource, '533x')}"
                            sizes="(min-width: 1200px) 50vw, (min-width: 930px) 40vw, 100vw"
                            alt="${pAlt}"
                            aria-hidden="true"
                            width="1000"
                            height="1000"
                        >
                    </div>
                </li> 
                `; 
            } 
            
            if(pImageType === 'thumbnail'){
                imageTemplate = `
                <li class="slide swiper-slide product-images-slideshow-thumbs__thumbnail-container"  data-product-images-slideshow-thumb   data-id="${index}">
                    <div class="product-images-slideshow-thumbs__thumbnail" role="button"  aria-label="Go to image ${index}" >
                            <img
                            srcset="${processImageSrc(pSource, '155x')} 165w,
                                    ${processImageSrc(pSource, '360x')} 360w,
                                    ${processImageSrc(pSource, '533x')} 533w"
                            src="${processImageSrc(pSource, '533x')}"
                            sizes="(min-width: 930px) 15vw, 25vw"
                            alt="${pAlt}"
                            aria-hidden="true"
                            width="500"
                            height="500"
                        >
                    </div>
                </li> 
                `;     
            }

            return imageTemplate; 
         }
                
        function clearImages() {
            document.querySelector('product-images-slideshow').removeSlides();
        }

        clearImages() 

        if(document.querySelector('product-images-slideshow').checkForThumbnailsActive()) {
            images.forEach((image, index)=> {
                document.querySelector('product-images-slideshow').appendThumb(createImageObj(image.src, '', index, 'thumbnail')); 
            });
        }

        images.forEach((image, index)=> {
            document.querySelector('product-images-slideshow').appendSlide(createImageObj(image.src, '', index, 'slide')); 
        });


        let updateEvent = new Event("images-updated", {
            bubbles: true
        }); 

        document.dispatchEvent(updateEvent); 

    }
    
    updateDescription() {
        let productObj = JSON.parse(this.currentColor.dataset.product); 
        let descriptionContainer = document.querySelector('[data-product-description-container]'); 
        descriptionContainer.innerHTML = productObj.description; 
    }

    setUpEvents() {
        if(this.querySelectorAll("[data-color-container]").length > 0) {
            let colorContainer = this.querySelector('[data-color-container]');
            let currentColor = this.querySelector("[data-color-container]").textContent; 
    
            function showColor(pColor) {
                colorContainer.textContent = pColor; 
            }
        
            this.querySelectorAll('[data-color-label]').forEach((element) => {
                element.addEventListener('mouseenter', function(event) {
                    let name = this.dataset.colorName; 
                    showColor(name)
                })
                element.addEventListener('mouseleave', (event) => {
                    console.log(this.getCurrentColor());

                    showColor(this.getCurrentColor().dataset.colorName)
                })
            }); 
        
        }
    }

    init() {
        this.setUpEvents(); 
        this.setCurrentColor(); 
    }
}

customElements.define('custom-color-picker', CustomColorPicker); 