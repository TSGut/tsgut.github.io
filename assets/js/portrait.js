(function () {
	var portrait = document.querySelector('.portrait-toggle');
	if (!portrait) return;

	// Clicking cycles the styles; hovering previews the next one.
	var styles = ['photo', 'pixel', 'ascii'];
	var layers = [portrait.querySelector('.portrait-pixel'), portrait.querySelector('.portrait-ascii')];
	var enable = function () {
		portrait.disabled = !layers.every(function (layer) {
			return layer.complete && layer.naturalWidth;
		});
	};
	layers.forEach(function (layer) {
		layer.addEventListener('load', enable);
	});
	enable();

	var reveal = function (event) {
		if (portrait.disabled || event.pointerType === 'touch') return;
		var bounds = portrait.getBoundingClientRect();
		portrait.style.setProperty('--portrait-x', (event.clientX - bounds.left - portrait.clientLeft) + 'px');
		portrait.style.setProperty('--portrait-y', (event.clientY - bounds.top - portrait.clientTop) + 'px');
		portrait.classList.add('is-revealing');
	};
	var hideReveal = function () {
		portrait.classList.remove('is-revealing');
	};

	portrait.addEventListener('pointerenter', reveal);
	portrait.addEventListener('pointermove', reveal);
	portrait.addEventListener('pointerleave', hideReveal);
	portrait.addEventListener('pointercancel', hideReveal);
	portrait.addEventListener('blur', hideReveal);
	portrait.addEventListener('click', function () {
		var next = (styles.indexOf(portrait.dataset.portrait) + 1) % styles.length;
		portrait.dataset.portrait = styles[next];
	});
}());
