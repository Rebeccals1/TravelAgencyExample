import '../styles/styles.css';
import 'lazysizes';
import MobileMenu from './modules/mobileMenu';
import RevealOnScroll from './modules/RevealOnScroll';
import StickyHeader from './modules/StickyHeader';

new StickyHeader();
new RevealOnScroll(".feature-item", 75);
new RevealOnScroll(".testimonial", 80);
new MobileMenu();
let modal;

// Don't load the modal until the user clicks the link
document.querySelectorAll(".open-modal").forEach(el => {
    el.addEventListener("click", e => {
        e.preventDefault();
        if(typeof modal == "undefined"){
            import(/* webpackChunkName: "modal" */'./modules/Modal').then(x => {
                modal = new x.default()
                setTimeout(() => modal.OpenTheModal(), 20)
            }).catch(() => console.log("There was a problem."));
        } else {
            modal.OpenTheModal();
        }
    })
});

if (module.hot) {
    module.hot.accept();
}


