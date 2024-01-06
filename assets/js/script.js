function loco(){
  gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#main"),
  smooth: true
});

// tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("#main", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});




// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();

}
loco()

// var clutter = "";
// document.querySelectorAll(".program-top-1>h6").forEach(function (element) {
//   element.innerHTML = element.innerText.split(" ").map(function (data) {
//     return `<span>${data}</span>`;
//   }).join(" ");
// });

// gsap.to(".program-top-1>h6>span, .program-top-1>h6>i", {
//   scrollTrigger: {
//     trigger: '.program-top-1>h6',
//     start: 'top bottom',
//     end: 'bottom top',
//     scroller: '#main',
//     scrub: 0.5,
//   },
//   stagger: 0.2,
//   color: '#fff',
//   opacity: 1, 
// });
// var clutter = "";

// // Apply spans to all h6 tags
// document.querySelectorAll(".program-top-1 h6").forEach(function (element) {
//   element.innerHTML = element.innerText.split(" ").map(function (data) {
//     return `<span>${data}</span>`;
//   }).join(" ");
// });

// // Apply scrollTrigger with dynamically calculated scrub value based on text length
// document.querySelectorAll(".program-top-1 h6 span").forEach(function (span) {
//   // Calculate scrub value based on the length of the text inside the span
//   var scrubValue = 0.1 + (span.innerText.length * 2); // You can adjust the multiplier as needed

//   gsap.to(span, {
//     scrollTrigger: {
//       trigger: '.program-top-1 h6 span',
//       start: 'top bottom',
//       end: 'bottom top',
//       scroller: '#main',
//       scrub: 0.1,
//       toggleActions: "play none none none",
//     },

//     color: '#fff',
//   });
// });

// Apply a separate scrollTrigger with a higher scrub value for the last two h6 tags


var clutter = "";
document.querySelectorAll(".col-sm-4>h6").forEach(function (element) {
  element.innerHTML = element.textContent.split(" ").map(function (data) {
    return `<span>${data}</span>`;
  }).join(" ");
});

gsap.to(".col-sm-4>h6>span", {
  scrollTrigger: {
    trigger: '.col-sm-4>h6',
    start: 'top bottom',
    end: 'bottom top',
    scroller: '#main',
    scrub: 0.5,
    markers:false
  },
  stagger: 0.1,
  // color: '#0FFFFF',
  color: '#003262',
  opacity: 1, 
});


var clutter = "";
document.querySelectorAll(".col-sm-8>h5").forEach(function (element) {
  element.innerHTML = element.textContent.split(" ").map(function (data) {
    return `<span>${data}</span>`;
  }).join(" ");
});

gsap.to(".col-sm-8>h5", {
  scrollTrigger: {
    trigger: '.col-sm-8>h5',
    start: 'top bottom',
    end: 'bottom top',
    scroller: '#main',
    scrub: 0.6,
    markers:false
  },
  stagger: 0.1,
  color: '#fff',
  opacity: 1, 
});



function changeColor() {
        var icon = document.getElementById("menuIcon");
        icon.style.color = (icon.style.color === 'blue') ? '#ffa556' : 'blue';
    }






