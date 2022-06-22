


class instagramFeed extends HTMLElement {
    constructor() {
        super()
        this.instaFeed = this.querySelector('#instafeed'); 
        this.feed = null; 

        this.mediaQueries = {
            mediumUp: window.matchMedia('(min-width: 600px)'),
            largeUp: window.matchMedia('(min-width: 930px)')
        }

        this.initObserver(); 
    }

    initObserver() {
        let mediaQueries = this.mediaQueries; 
        let options = {
            threshold: .3
        }
        let callback = (entry) => {
            if(entry[0].isIntersecting) {
                this.initFeed(mediaQueries);
            }
        }

        this.observer = new IntersectionObserver(callback, options);
        this.observer.observe(this.instaFeed); 

        //this.mediaQueries.largeUp.addEventListener("change", this.handleLargeUp.bind(this)); 

    }

    initFeed(pMediaQueries) {
        
        console.log('hit!');
        
        if(this.feed) {
            return 
        }

        let script = document.createElement('script');
        script.src = this.instaFeed.dataset.scriptUrl;
        document.querySelector('footer').appendChild(script); 

        let feedOptions = {
            success: ()=> {
                this.instaFeed.innerHTML = "";
            },
            limit: 3, //Limit of posts to show,
            target: 'instafeed',
            template: '<li class="instagram-feed__post"><a href="{{link}}" aria-label="Open instagram post in a new tab" rel="external" target="_blank" class="instagram-feed__post__inner"><img src="{{image}}" loading="lazy" alt="{{model.caption}}" /></a></li>'
        }; 

        if(pMediaQueries.mediumUp.matches) {
            feedOptions.limit = 4; 
        } 

        if(pMediaQueries.largeUp.matches) {
            feedOptions.limit = 5; 
        } 

        script.onload = () => {
            fetch('https://ig.instant-tokens.com/users/88352ce5-9a6e-4f98-9171-c08b585aa65c/instagram/17841406217784312/token?userSecret=mdowgpka9xcke3cngny8')
            .then(resp => resp.json())
            .then(data => {
                feedOptions.accessToken = data.Token;
                this.feed = new Instafeed(feedOptions);
                this.feed.run();
            })
            .catch((error) => {
                console.log(error)
            });      
        };

    }

    
}

customElements.define('instagram-feed', instagramFeed); 