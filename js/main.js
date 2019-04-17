$(document).ready(initPage);
function initPage(){
	ImgTobg();
	mobileMenu();
	dropdownToggle();
	formEffect();
	customSelect();
}

function ImgTobg() {
	$('.img-to-bg').each(function() {
		if ($(this).find('img').length) {
			$(this).css('background-image', 'url(' + $(this).find('> img').attr('src') + ')');
		}
	});
}

function mobileMenu(){
	$('<span class="open-menu"><span></span><span></span><span></span><span></span></span>').appendTo('.header-page > .container');
	$('<span class="fader"/>').appendTo('.header-page > .container');
	$('html').on('click', '.open-menu', function() {
		$('body').toggleClass('menu-opened');
		return false;
	});
	$('.fader').on('click touchmove', function(event) {
		$('body').removeClass('menu-opened');
	});
}

function dropdownToggle(){
	$('.dropdown-block__toggle').click(function(event){
		$(this).parent().toggleClass('open');
		event.preventDefault();
	});
	$(document).on('mouseup touchend ', function(e){
		var container = $('.dropdown-block');
		if ($(window).width() >= 992) {
			if (!container.is(e.target) && container.has(e.target).length === 0){
				container.removeClass('open');
			}
		}
	});
}

function formEffect(){
	$('.form_subscribe .form__control').focusin(function(event) {
		$(this).parent().addClass('input--filled');
	}).focusout(function(event) {
		if ($(this).val().length < 1) {
			$(this).parent().removeClass('input--filled');
		}
	});
}

function customSelect() {
	jcf.setOptions('Select', {
		wrapNative: false,
		wrapNativeOnMobile: false,
	});

	jcf.replaceAll();
}


// POST commands to YouTube or Vimeo API
function postMessageToPlayer(player, command){
	if (player == null || command == null) return;
	player.contentWindow.postMessage(JSON.stringify(command), "*");
}

// When the slide is changing
function playPauseVideo(slick, control){
	var currentSlide, slideType, startTime, player, video;

	currentSlide = slick.find(".slick-current");
	slideType = currentSlide.attr("class").split(" ")[1];
	player = currentSlide.find("iframe").get(0);
	startTime = currentSlide.data("video-start");

	if (slideType === "vimeo") {
		switch (control) {
			case "play":
				if ((startTime != null && startTime > 0 ) && !currentSlide.hasClass('started')) {
					currentSlide.addClass('started');
					postMessageToPlayer(player, {
						"method": "setCurrentTime",
						"value" : startTime
					});
				}
				postMessageToPlayer(player, {
					"method": "play",
					"value" : 1
				});
				break;
			case "pause":
				postMessageToPlayer(player, {
					"method": "pause",
					"value": 1
				});
				break;
		}
	} else if (slideType === "youtube") {
		switch (control) {
			case "play":
				postMessageToPlayer(player, {
					"event": "command",
					"func": "mute"
				});
				postMessageToPlayer(player, {
					"event": "command",
					"func": "playVideo"
				});
				break;
			case "pause":
				postMessageToPlayer(player, {
					"event": "command",
					"func": "pauseVideo"
				});
				break;
		}
	} else if (slideType === "video") {
		video = currentSlide.children("video").get(0);
		if (video != null) {
			if (control === "play"){
				video.play();
			} else {
				video.pause();
			}
		}
	}
}

// Resize player
function resizePlayer(iframes, ratio) {
	if (!iframes[0]) return;
	var win = $(".main-slider"),
			width = win.width(),
			playerWidth,
			height = win.height(),
			playerHeight,
			ratio = ratio || 16/9;

	iframes.each(function(){
		var current = $(this);
		if (width / ratio < height) {
			playerWidth = Math.ceil(height * ratio);
			current.width(playerWidth).height(height).css({
				left: (width - playerWidth) / 2,
				 top: 0
				});
		} else {
			playerHeight = Math.ceil(width / ratio);
			current.width(width).height(playerHeight).css({
				left: 0,
				top: (height - playerHeight) / 2
			});
		}
	});
}

// DOM Ready
$(function() {
	var slideWrapper = $(".main-slider"),
		iframes = slideWrapper.find('.embed-player'),
		lazyImages = slideWrapper.find('.slide-image'),
		lazyCounter = 0;
	// Initialize
	slideWrapper.on("init", function(slick){
		slick = $(slick.currentTarget);
		setTimeout(function(){
			playPauseVideo(slick,"play");
		}, 1000);
		resizePlayer(iframes, 16/9);
	});
	slideWrapper.on("beforeChange", function(event, slick) {
		slick = $(slick.$slider);
		playPauseVideo(slick,"pause");
	});
	slideWrapper.on("afterChange", function(event, slick) {
		slick = $(slick.$slider);
		playPauseVideo(slick,"play");
	});
	slideWrapper.on("lazyLoaded", function(event, slick, image, imageSource) {
		lazyCounter++;
		if (lazyCounter === lazyImages.length){
			lazyImages.addClass('show');
			// slideWrapper.slick("slickPlay");
		}
	});

	//start the slider
	$(".main-slider").slick({
		// fade:true,
		autoplay: true,
		autoplaySpeed: 40000,
		lazyLoad:"progressive",
		speed:600,
		arrows:false,
		dots:false,
		cssEase:"cubic-bezier(0.87, 0.03, 0.41, 0.9)"
	});
	$(window).on("resize.slickVideoPlayer", function(){
		resizePlayer(iframes, 16/9);
	});
});

// Resize event