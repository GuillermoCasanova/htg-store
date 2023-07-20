

    class QuickAddColorPicker extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
        this.updateVariantData();
        this.updateImages(); 
    }

    setCurrentColor() {
        let currentColor = this.getCurrentColor(); 
        this.querySelectorAll('[data-color-option]').forEach((elem) => {
            if(elem.dataset.colorName.toLocaleLowerCase() === currentColorName ) {
                elem.checked = true; 
            }
        });  
    }

    getCurrentColor() { 
        let that = this; 
        this.querySelectorAll('[data-color-option]').forEach((elem) => {
            if(elem.checked) {
                this.currentColor = elem; 
            }
        }); 

        return this.currentColor; 
    }; 

    updateVariantData() {
        const currentColor = this.getCurrentColor(); 
        let sectionId = this.dataset.section; 
        let productContainer = document.querySelector(`[data-product-card-wrapper][data-section="${sectionId}"]`); 

        productContainer.querySelectorAll(`variant-radios[data-section="${this.dataset.section}"]`).forEach((elem) => {
            if( elem.querySelector('[type="application/json"]')) {
                let e = elem.querySelector('[type="application/json"]');
                e.parentElement.removeChild(e); 
            }
            let newScript = document.createElement('script');
            newScript.innerHTML  = ` ` + JSON.stringify(JSON.parse(currentColor.dataset.product).variants || JSON.parse(currentColor.dataset.product) );  
            newScript.type = "application/json";
            elem.appendChild(newScript); 
            elem.dispatchEvent(new Event('change'));
        }); 
    }

    updateImages() {
        let currentColor = this.getCurrentColor(); 
        let productObj = JSON.parse(currentColor.dataset.productMedia); 
        let images = productObj.splice(0, 2); 
        let imagesContainer =  document.querySelector(`[data-product-images][data-section="${this.dataset.section}"]`); 

        function createImageObj(pSource, pAlt, pWidth, pIndex) {
            let imageTemplate = ``; 
            let index = pIndex + 1;

            function processImageSrc(pImageSrc, pSize) {
                let imageSrc = '';
                imageSrc = pImageSrc.replace(/(\.[^.]*)$/, `_${pSize}$1`)
                .replace('http:', '');
                return imageSrc;
            }


            imageTemplate = `
                    <img
                    srcset="${processImageSrc(pSource, '165x')} 165w,
                            ${processImageSrc(pSource, '360x')} 360w,
                            ${processImageSrc(pSource, '533x')} 533w,
                            ${processImageSrc(pSource, '720x')} 720w,
                            ${processImageSrc(pSource, '940x')} 940w,
                            ${processImageSrc(pSource, '1066x')} 1066w,
                            ${processImageSrc(pSource, '1066x')} ${pWidth}w"
                    src="${processImageSrc(pSource, '533x')}"
                    sizes="(min-width: {{ settings.page_width }}px) {{ settings.page_width | minus: 130 | divided_by: 4 }}px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                    alt="${pAlt}"
                    aria-hidden="true"
                    width="1000"
                    height="1000"
                >
            `; 

            imagesContainer.innerHTML +=(imageTemplate);

        }
                
        function clearImages() {
            imagesContainer.innerHTML = ""; 
        }

        clearImages() 

        images.forEach((image, index)=> {
            if(image.alt === null || image.alt.indexOf('swatch_') == -1) {
                createImageObj(image.src, '', index);
            }
        });

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
                    showColor(this.getSelectedColor().dataset.colorName)
                })
            }); 
        
        }
    }
    }


    if (!customElements.get('quick-add-color-picker')) {
      customElements.define('quick-add-color-picker', QuickAddColorPicker)

    }


    class QuickAddButton extends HTMLElement {
    constructor() {
        super();
        this.querySelector('button').addEventListener('click', this.addToCart.bind(this));
        this.variantRadios =  document.querySelector(`variant-radios[data-section="${this.dataset.section}"]`); 
    }

    addToCart() {
        const quickAddForm = document.querySelector(`#quick-add-form-${this.dataset.section}`);
        quickAddForm.dispatchEvent(new Event('submit'));
    }
    }

    if (!customElements.get('quick-add-button')) {
    customElements.define('quick-add-button', QuickAddButton)
    }