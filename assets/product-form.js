class ProductForm extends HTMLElement {
  constructor() {
    super();   

    this.form = this.querySelector('form');
    this.form.querySelector('[name=id]').disabled = false;
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('[data-error-message-wrapper]');
    if (!this.errorMessageWrapper) return;
    this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('[data-error-message]');

    this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);
    
    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    console.log(this.form);
    const body = JSON.stringify({
      ...JSON.parse(serializeForm(this.form))
      // sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      // sections_url: window.location.pathname
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {
        console.log(parsedState);
       // this.cartNotification.open(true);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        console.log('finally!');
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('disabled');
      });
  }
}
if (!customElements.get('product-form')) {
  customElements.define('product-form', ProductForm);
}