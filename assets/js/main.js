!function(e){var a=e(window),o=e("body"),t=e("#header"),d=null,r=e("#nav");e("#wrapper"),breakpoints({xlarge:["1281px","1680px"],large:["1025px","1280px"],medium:["737px","1024px"],small:["481px","736px"],xsmall:[null,"480px"]}),a.on("load",function(){window.setTimeout(function(){o.removeClass("is-preload")},100)}),browser.canUse("object-fit")||e(".image[data-position]").each(function(){var a=e(this),o=a.children("img");a.css("background-image",'url("'+o.attr("src")+'")').css("background-position",a.data("position")).css("background-size","cover").css("background-repeat","no-repeat"),o.css("opacity","0")});var i=r.find("a");i.addClass("scrolly").on("click",function(){var a=e(this);"#"==a.attr("href").charAt(0)&&(i.removeClass("active"),a.addClass("active").addClass("active-locked"))}).each(function(){var a=e(this),o=e(a.attr("href"));o.length<1||o.scrollex({mode:"middle",top:"5vh",bottom:"5vh",initialize:function(){o.addClass("inactive")},enter:function(){o.removeClass("inactive"),0==i.filter(".active-locked").length?(i.removeClass("active"),a.addClass("active")):a.hasClass("active-locked")&&a.removeClass("active-locked")}})}),d=e('<menubar id="titleBar" aria="Title bar containing navigation sidebar toggle."><a href="#header" class="toggle" alt="Toggle navigation sidebar" title="Toggle navigation sidebar"></a><span class="title">'+e("#logo").html()+"</span></menubar>").appendTo(o),t.panel({delay:500,hideOnClick:!0,hideOnSwipe:!0,resetScroll:!0,resetForms:!0,side:"right",target:o,visibleClass:"header-visible"}),e(".scrolly").scrolly({speed:1e3,offset:function(){return breakpoints.active("<=medium")?d.height():0}})}(jQuery);const body=document.querySelector("body");let darkMode=localStorage.getItem("darkMode");const darkModeToggle=document.querySelector(".dark-mode-button"),darkModeToggleFooter=document.querySelector("footer .dark-mode-button"),enableDarkMode=()=>{body.classList.add("dark-mode"),localStorage.setItem("darkMode","enabled")},disableDarkMode=()=>{body.classList.remove("dark-mode"),localStorage.setItem("darkMode",null)};"enabled"==darkMode&&enableDarkMode(),darkModeToggle.addEventListener("click",()=>{"enabled"!==(darkMode=localStorage.getItem("darkMode"))?enableDarkMode():disableDarkMode()});