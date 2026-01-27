$(document).ready(function () {
  $(".ct_menu_bar").click(function () {
    $("main").addClass("ct_show");
  });
  $(".ct_close_sidebar").click(function () {
    $("main").removeClass("ct_show");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".ct_menu_bar").length) {
      $("main").removeClass("ct_show");
    }
  });

  // $(window).on("load", function () {
  //   $(".ct_loader_main").fadeOut();
  // });
  $(".chat-list a").click(function () {
    $(".chatbox").addClass("showbox");
    return false;
  });

  $(".chat-icon").click(function () {
    $(".chatbox").removeClass("showbox");
  });
  //   Dash Graph js S
  //   Dash Graph js E

  //   var owl = $(".ct_product_detail_slider");

  //   owl.owlCarousel({
  //     items: 1,
  //     loop: true,
  //     autoplay: false,
  //     autoplayTimeout: 3000,
  //     dots: false, // Disable default dots
  //     nav: false,
  //   });

  //   // Custom Dots Click Event
  //   $(".ct_dot").click(function () {
  //     var slideIndex = $(this).data("slide");
  //     owl.trigger("to.owl.carousel", [slideIndex, 300]);
  //   });

  //   // Update Active Dot on Slide Change
  //   owl.on("changed.owl.carousel", function (event) {
  //     var currentIndex =
  //       event.item.index - event.relatedTarget._clones.length / 2;
  //     $(".ct_dot").removeClass("active");
  //     $(".ct_dot").eq(currentIndex).addClass("active");
  //   });

  //   // Set initial active dot
  //   $(".ct_dot").eq(0).addClass("active");
  //   // Product Detail Slider js E
  // });

  // $(document).ready(function () {
  //   var current_fs, next_fs, previous_fs; //fieldsets
  //   var opacity;
  //   var current = 1;
  //   var steps = $("fieldset").length;

  //   setProgressBar(current);

  //   $(".ct_form_next").click(function () {
  //     current_fs = $(this).parent();
  //     next_fs = $(this).parent().next();

  //     //Add Class Active
  //     $("#ct_form_progressbar li")
  //       .eq($("fieldset").index(next_fs))
  //       .addClass("active");

  //     //show the next fieldset
  //     next_fs.show();
  //     //hide the current fieldset with style
  //     current_fs.animate(
  //       { opacity: 0 },
  //       {
  //         step: function (now) {
  //           // for making fielset appear animation
  //           opacity = 1 - now;

  //           current_fs.css({
  //             display: "none",
  //             position: "relative",
  //           });
  //           next_fs.css({ opacity: opacity });
  //         },
  //         duration: 500,
  //       }
  //     );
  //     setProgressBar(++current);
  //   });

  //   $(".previous").click(function () {
  //     current_fs = $(this).parent();
  //     previous_fs = $(this).parent().prev();

  //     //Remove class active
  //     $("#ct_form_progressbar li")
  //       .eq($("fieldset").index(current_fs))
  //       .removeClass("active");

  //     //show the previous fieldset
  //     previous_fs.show();

  //     //hide the current fieldset with style
  //     current_fs.animate(
  //       { opacity: 0 },
  //       {
  //         step: function (now) {
  //           // for making fielset appear animation
  //           opacity = 1 - now;

  //           current_fs.css({
  //             display: "none",
  //             position: "relative",
  //           });
  //           previous_fs.css({ opacity: opacity });
  //         },
  //         duration: 500,
  //       }
  //     );
  //     setProgressBar(--current);
  //   });

  //   function setProgressBar(curStep) {
  //     var percent = parseFloat(100 / steps) * curStep;
  //     percent = percent.toFixed();
  //     $(".progress-bar").css("width", percent + "%");
  //   }

  //   $(".submit").click(function () {
  //     return false;
  //   });
});
