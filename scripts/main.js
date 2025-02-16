/**************************
      go to top button
 **************************/
// Get the button:
let mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
} else {
        mybutton.style.display = "none";
}
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
document.body.scrollTop = 0; // For Safari
document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
} 


/* ************************
    scroll-opacity effect
************************** */
$(window).scroll(function () {
    //title and navigation at the top
    let nav_top = $(".navtop");
    let title = $(".title");
    let titlename = $(".titlename");
    let subtitle = $(".subtitle");
    let teaser = $(".teaser");
    let scrollTop = $(window).scrollTop();

    title.css("opacity", 1 - scrollTop / 300);
    teaser.css("opacity", scrollTop / 600);

//     nav_top.css("opacity", 1 - scrollTop / 150);
    //titlename.css("opacity", 1 - (scrollTop-800) / 600);
    //subtitle.css("opacity", 1 - (scrollTop-800) / 600);

    //navigation at the bottom
//     let nav_bottom = $(".navbottom");
//     var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
//     nav_bottom.css("opacity", 1 - scrollBottom / 50);
 });



/* ************************
    scroll-to-play video
************************** */
//  const video = document.getElementById('videoID');
//  video.pause();
//  let playing = 0;
//  let firsttime = true;
//  window.addEventListener('scroll', function() {
//         if (!firsttime){
//    playing = 10;
//         }
//         firsttime = false;
//  })

//  setInterval(function(){
//         playing--;
//   if (playing>0){
//         const rect = video.getBoundingClientRect();
//         const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
//         if (isVisible) {
//           video.play();
//         } else {
//           video.pause();
//         }
//   }else{
//         video.pause();
//   }
//  },100)

/************************
JavaScript for Dynamic Opacity Effect
************************/
window.addEventListener('scroll', function () {
const videoContainer = document.getElementById('videoContainer');
const scrollY = window.scrollY;            // Current scroll position
const maxScroll = window.innerHeight;  // Maximum scroll distance for fading effect

// Calculate opacity: 1 at the top, decreasing as you scroll
let opacity = 1 - (scrollY / maxScroll);
opacity = Math.max(opacity, 0); // Ensure opacity never goes below 0

videoContainer.style.opacity = opacity;
});



/********************
 Don't play video until I scroll to that place
 *********************/

const video= document.getElementById('videoID');
let userScrolling = false;
video.pause()

window.addEventListener('scroll', function() {
        userScrolling = true
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isVisible) {
          video.play();
        } else {
          video.pause();
        }
      });
video.pause();