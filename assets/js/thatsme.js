(function () {
	var palette = {
		H: '#683713', // hair
		S: '#ffc397', // skin
		E: '#30221b', // eyes and mouth
		T: '#087577', // teal jacket
		D: '#03484c', // collar and zip
		R: '#a84720', // rust shirt
		B: '#3d5a99', // jeans
		K: '#8b5a3c', // shoes
		O: '#1a1f47', // bubble outline and text
		W: '#ffffff'  // bubble
	};

	var guy = [
		'.....HHHHH....',
		'....HHHHHHHH..',
		'...HHHHHHHHH..',
		'....HHHSSSHH..',
		'....HSSSSSSH..',
		'....HSESSESH..',
		'....SSSSSSSS..',
		'.....SSEESS...',
		'......SSSS....',
		'....TDRRRRDT..',
		'....TTDRRDTTT.',
		'....TTTDDTTTT.',
		'.....TTDDTT.T.',
		'.....TTDDTT.S.',
		'.....BBBBBB...',
		'.....BB..BB...',
		'.....BB..BB...',
		'....KKK..KKK..'
	];

	// The waving arm raised, raised further and lowered, as [column, row, colour].
	var arms = [
		[[3, 10, 'T'], [2, 9, 'T'], [2, 8, 'T'], [2, 7, 'S']],
		[[3, 10, 'T'], [2, 9, 'T'], [1, 8, 'T'], [0, 7, 'S']],
		[[3, 10, 'T'], [3, 11, 'T'], [3, 12, 'T'], [3, 13, 'S']]
	];
	var loweredArm = 2;

	// Rows 0-5 sit on the baseline, an optional row 6 hangs below it.
	var font = {
		'T': ['###', '.#.', '.#.', '.#.', '.#.', '.#.'],
		'Y': ['#.#', '#.#', '#.#', '.#.', '.#.', '.#.'],
		'a': ['...', '...', '.##', '#.#', '#.#', '.##'],
		'b': ['#..', '#..', '##.', '#.#', '#.#', '##.'],
		'd': ['..#', '..#', '.##', '#.#', '#.#', '.##'],
		'e': ['...', '...', '.#.', '###', '#..', '.##'],
		'h': ['#..', '#..', '##.', '#.#', '#.#', '#.#'],
		'i': ['#', '.', '#', '#', '#', '#'],
		'l': ['#', '#', '#', '#', '#', '#'],
		'm': ['.....', '.....', '####.', '#.#.#', '#.#.#', '#.#.#'],
		'n': ['...', '...', '##.', '#.#', '#.#', '#.#'],
		'o': ['...', '...', '.#.', '#.#', '#.#', '.#.'],
		'r': ['...', '...', '#.#', '##.', '#..', '#..'],
		's': ['...', '...', '.##', '#..', '..#', '##.'],
		't': ['.#.', '.#.', '###', '.#.', '.#.', '.##'],
		'u': ['...', '...', '#.#', '#.#', '#.#', '.##'],
		'w': ['.....', '.....', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
		'y': ['...', '...', '#.#', '#.#', '.##', '..#', '##.'],
		'\'': ['#', '#', '.', '.', '.', '.'],
		'!': ['#', '#', '#', '#', '.', '#'],
		'.': ['.', '.', '.', '.', '.', '#'],
		' ': ['.', '.', '.', '.', '.', '.']
	};

	var messages = ['That\'s me!', 'You are already\non my website.'];
	var lingers = [1400, 2200];
	var pixelSize = 3;
	var lineHeight = 9;
	var bubbleX = 15;
	var bubbleBottom = 12;

	var lineWidth = function (line) {
		return line.split('').reduce(function (width, letter) {
			return width + font[letter][0].length + 1;
		}, -1);
	};
	var textWidth = function (text) {
		return Math.max.apply(null, text.split('\n').map(lineWidth));
	};

	// Space above his head for bubbles with more than one line.
	var headroom = lineHeight * (Math.max.apply(null, messages.map(function (message) {
		return message.split('\n').length;
	})) - 1);
	var width = bubbleX + 6 + Math.max.apply(null, messages.map(textWidth));
	var height = headroom + guy.length;

	var bubbleWidthOf = function (text) {
		return Math.max(1, textWidth(text)) + 6;
	};

	var popup = null;
	var context = null;
	var timer = null;

	var paint = function (x, y, color, w, h) {
		context.fillStyle = palette[color];
		context.fillRect(x, y + headroom, w || 1, h || 1);
	};

	var drawBubble = function (text) {
		var lines = text.split('\n');
		var bubbleWidth = bubbleWidthOf(text);
		var bubbleHeight = 12 + lineHeight * (lines.length - 1);
		var top = bubbleBottom - bubbleHeight;

		paint(bubbleX + 1, top, 'O', bubbleWidth - 2, bubbleHeight);
		paint(bubbleX, top + 1, 'O', bubbleWidth, bubbleHeight - 2);
		paint(bubbleX + 1, top + 1, 'W', bubbleWidth - 2, bubbleHeight - 2);

		// Tail pointing at the face.
		paint(bubbleX - 1, 6, 'O', 1, 3);
		paint(bubbleX - 2, 7, 'O');
		paint(bubbleX - 1, 7, 'W', 2, 1);

		context.fillStyle = palette.O;
		lines.forEach(function (line, index) {
			var x = bubbleX + 3;
			var y = headroom + top + 3 + index * lineHeight;
			line.split('').forEach(function (letter) {
				font[letter].forEach(function (row, rowIndex) {
					row.split('').forEach(function (cell, column) {
						if (cell === '#') context.fillRect(x + column, y + rowIndex, 1, 1);
					});
				});
				x += font[letter][0].length + 1;
			});
		});
	};

	var draw = function (rise, arm, text) {
		var offset = guy.length - rise;
		context.clearRect(0, 0, width, height);
		guy.forEach(function (row, y) {
			row.split('').forEach(function (cell, x) {
				if (cell !== '.') paint(x, y + offset, cell);
			});
		});
		arms[arm].forEach(function (cell) {
			paint(cell[0], cell[1] + offset, cell[2]);
		});
		if (text) drawBubble(text);
	};

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	var climbFrames = 6;
	var waveFrames = 2;

	// He climbs up from behind the name, then keeps waving and saying his lines.
	var climb = function (frame) {
		draw(frame * guy.length / climbFrames, 0);
		timer = setTimeout(function () {
			if (frame < climbFrames) climb(frame + 1);
			else wave(0);
		}, 45);
	};

	var wave = function (frame) {
		draw(guy.length, frame % 2);
		timer = setTimeout(function () {
			if (frame + 1 < waveFrames) wave(frame + 1);
			else speak(0, 1);
		}, 150);
	};

	var speak = function (index, typed) {
		var message = messages[index];
		// He is still waving while he types his first line.
		var waving = index === 0 && typed < message.length;
		draw(guy.length, waving ? Math.floor(typed / 3) % 2 : loweredArm, message.slice(0, typed));

		timer = setTimeout(function () {
			if (typed < message.length) {
				speak(index, typed + 1);
				return;
			}
			draw(guy.length, loweredArm);
			timer = setTimeout(function () {
				if (index + 1 < messages.length) speak(index + 1, 1);
				else wave(0);
			}, 250);
		}, typed < message.length ? 55 : lingers[index]);
	};

	var hide = function () {
		if (!popup) return;
		var leaving = popup;
		popup = null;
		clearTimeout(timer);
		leaving.classList.remove('is-visible');
		setTimeout(function () {
			leaving.remove();
		}, 200);
	};

	var show = function (name) {
		hide();

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = width * pixelSize + 'px';
		context = canvas.getContext('2d');

		popup = document.createElement('span');
		popup.className = 'thats-me';
		popup.setAttribute('aria-hidden', 'true');
		popup.appendChild(canvas);
		name.appendChild(popup);

		// Keep the widest bubble on screen.
		var room = document.documentElement.clientWidth - 8 - name.getBoundingClientRect().left - width * pixelSize;
		popup.style.left = Math.min(0, room) + 'px';

		popup.offsetWidth; // Start the fade from transparent.
		popup.classList.add('is-visible');

		if (reducedMotion.matches) wave(0);
		else climb(1);
	};

	document.querySelectorAll('.publication-main p').forEach(function (line) {
		Array.from(line.childNodes).forEach(function (node) {
			var start = node.nodeType === Node.TEXT_NODE ? node.data.indexOf('T. S. Gutleb') : -1;
			if (start === -1) return;

			var name = document.createElement('span');
			var match = node.splitText(start);
			match.splitText('T. S. Gutleb'.length);
			name.className = 'publication-me';
			match.replaceWith(name);
			name.appendChild(match);

			name.addEventListener('pointerenter', function (event) {
				if (event.pointerType !== 'touch') show(name);
			});
			name.addEventListener('pointerleave', function (event) {
				if (event.pointerType !== 'touch') hide();
			});
			name.addEventListener('click', function (event) {
				if (event.pointerType === 'touch') show(name);
			});
		});
	});

	document.addEventListener('pointerdown', function (event) {
		if (popup && event.pointerType === 'touch' && !popup.parentNode.contains(event.target)) hide();
	});
}());
