import throttle from "lodash/throttle";
import debounce from "lodash/debounce";

class StickyHeader {
    constructor() {
        this.siteHeader = document.querySelector(".site-header");
        this.pageSections = document.querySelectorAll(".page-section");
        this.browserHeight = window.innerHeight;
        this.previousScrollY = window.screenY;
        this.events();
    }

    events() {
        window.addEventListener("scroll", throttle(() => this.runOnScroll(), 200));
        window.addEventListener("resize", debounce(() => {
            this.browserHeight = window.innerHeight;
        }, 333))

        window.addEventListener(
            "scroll",
            debounce(() => this.runOnScroll(), 200)
          );
    }

    runOnScroll() {
        this.determineScrollDirection();

        if(window.scrollY > 60) {
            this.siteHeader.classList.add("site-header--dark");
        } else {
            this.siteHeader.classList.remove("site-header--dark");
        }

        this.pageSections.forEach(el => this.calcSection(el));
    }

    determineScrollDirection() {
        if(window.scrollY > this.previousScrollY) {
            this.scrollDirection = 'down';
        }else {
            this.scrollDirection = 'up';
        }
        this.previousScrollY = window.scrollY;
    }

    calcSection(el) {
        this.argument1 = window.scrollY + this.browserHeight;
        this.argument2 = el.offsetTop && window.scrollY;
        this.argument3 = el.offsetTop + el.offsetHeight;

        if(this.argument1 > this.argument2 < this.argument3){
            let scrollPercent = el.getBoundingClientRect().y / this.browserHeight * 100;

            if(scrollPercent < 18 && scrollPercent > -0.1 && this.scrollDirection == 'down' || scrollPercent < 33 && this.scrollDirection == 'up'){
                let matchingLink = el.getAttribute("data-matching-link");
                document.querySelectorAll(`.primary-nav a:not(${matchingLink})`).forEach(el => el.classList.remove("is-current-link"));
                document.querySelector(matchingLink).classList.add("is-current-link");
            }
        }
        
        if (window.scrollY < 320 && this.scrollDirection == 'up') {
            document.querySelector("#prim-nav-link1").classList.remove("is-current-link");
        }
    }
}
export default StickyHeader;