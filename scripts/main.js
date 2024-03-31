/* ************************
        text opacity
************************** */
$(window).scroll(function () {
    //title and navigation at the top
    let nav_top = $(".navtop");
    let title = $(".title");
    let titlename = $(".titlename");
    let subtitle = $(".subtitle");
    let scrollTop = $(window).scrollTop();
    title.css("opacity", 1 - scrollTop / 150);
    nav_top.css("opacity", 1 - scrollTop / 150);
    //titlename.css("opacity", 1 - (scrollTop-800) / 600);
    //subtitle.css("opacity", 1 - (scrollTop-800) / 600);

    //navigation at the bottom
    let nav_bottom = $(".navbottom");
    var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
    nav_bottom.css("opacity", 1 - scrollBottom / 50);
 });
