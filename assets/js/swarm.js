(function () {
	var colors = ['#3b82f6', '#ea580c', '#e11d48', '#8b5cf6', '#d69e2e', '#22a45d'];
	var themes = ['ml', 'molecular', 'medical', 'spectral', 'functions', 'fractional'];
	var repulsionZone = 12;
	var alignmentZone = 38;
	var attractionZone = 72;
	var maxNeighbors = 24;
	var blindCosine = -0.6;
	var cruiseSpeed = 95;
	var turnRate = 4.2;
	var turnNoise = 0.9;
	var cursorRadius = 95;
	var orbitRadius = 19;
	var orbitBand = 7;
	var captureRadius = 44;
	var orbitStrength = 8;
	var orbitSpeed = 62;
	var arrowLength = 8;
	var arrowWidth = 3.4;
	var arrowNotch = 1.8;

	window.createResearchSwarm = function (map) {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		var width = 0;
		var height = 0;
		var ratio = 1;
		var count = 0;
		var x, y, angle, nextAngle, speed, cosines, sines, next, heads;
		var columns = 1;
		var rows = 1;
		var cursor = null;
		var nodes = [];
		var running = false;
		var onScreen = true;
		var frame = null;
		var lastTime = 0;
		var stopTimer = null;

		canvas.className = 'research-swarm';
		canvas.setAttribute('aria-hidden', 'true');
		map.append(canvas);

		var resize = function () {
			ratio = Math.min(window.devicePixelRatio || 1, 2);
			width = map.clientWidth;
			height = map.clientHeight;
			canvas.width = width * ratio;
			canvas.height = height * ratio;
			columns = Math.max(3, Math.floor(width / attractionZone));
			rows = Math.max(3, Math.floor(height / attractionZone));
			heads = new Int32Array(columns * rows);
		};

		var updateNodes = function () {
			var box = map.getBoundingClientRect();

			nodes = [];
			map.querySelectorAll('.research-dot').forEach(function (dot) {
				var dotBox = dot.getBoundingClientRect();
				var id = Array.prototype.find.call(dot.classList, function (name) {
					return /^dot-/.test(name) && name !== 'dot-paper' && name !== 'dot-package';
				});
				var attracted = document.querySelector('.theme-node.' + id).dataset.themes.split(',').map(function (theme) {
					return themes.indexOf(theme);
				});

				if (dotBox.width) {
					nodes.push({
						x: dotBox.left + dotBox.width / 2 - box.left,
						y: dotBox.top + dotBox.height / 2 - box.top,
						spin: nodes.length % 2 ? 1 : -1,
						attracted: attracted
					});
				}
			});
		};

		var spawn = function (originX, originY) {
			count = Math.max(120, Math.min(400, Math.round(width * height / 1400)));
			x = new Float32Array(count);
			y = new Float32Array(count);
			angle = new Float32Array(count);
			nextAngle = new Float32Array(count);
			speed = new Float32Array(count);
			cosines = new Float32Array(count);
			sines = new Float32Array(count);
			next = new Int32Array(count);

			for (var i = 0; i < count; i++) {
				x[i] = originX;
				y[i] = originY;
				angle[i] = Math.random() * Math.PI * 2;
				speed[i] = cruiseSpeed * (1.5 + Math.random() * 3);
			}
		};

		var step = function (delta) {
			var i, column, row;

			heads.fill(-1);
			for (i = 0; i < count; i++) {
				cosines[i] = Math.cos(angle[i]);
				sines[i] = Math.sin(angle[i]);
				column = Math.floor(x[i] / width * columns) % columns;
				row = Math.floor(y[i] / height * rows) % rows;
				next[i] = heads[row * columns + column];
				heads[row * columns + column] = i;
			}

			for (i = 0; i < count; i++) {
				var repelX = 0, repelY = 0, alignX = 0, alignY = 0, attractX = 0, attractY = 0;
				var repelled = false;
				var neighbors = 0;

				column = Math.floor(x[i] / width * columns) % columns;
				row = Math.floor(y[i] / height * rows) % rows;

				for (var rowOffset = -1; rowOffset <= 1 && neighbors < maxNeighbors; rowOffset++) {
					for (var columnOffset = -1; columnOffset <= 1 && neighbors < maxNeighbors; columnOffset++) {
						var cell = ((row + rowOffset + rows) % rows) * columns + (column + columnOffset + columns) % columns;

						for (var j = heads[cell]; j !== -1 && neighbors < maxNeighbors; j = next[j]) {
							if (j === i) continue;

							var dx = x[j] - x[i];
							var dy = y[j] - y[i];

							if (dx > width / 2) dx -= width;
							else if (dx < -width / 2) dx += width;
							if (dy > height / 2) dy -= height;
							else if (dy < -height / 2) dy += height;

							var distance = dx * dx + dy * dy;

							if (distance >= attractionZone * attractionZone || distance === 0) continue;

							distance = Math.sqrt(distance);
							if (distance < repulsionZone) {
								repelX -= dx / distance;
								repelY -= dy / distance;
								repelled = true;
							} else if ((dx * cosines[i] + dy * sines[i]) / distance > blindCosine) {
								if (distance < alignmentZone) {
									alignX += cosines[j];
									alignY += sines[j];
								} else {
									attractX += dx / distance;
									attractY += dy / distance;
								}
								neighbors += 1;
							}
						}
					}
				}

				var targetX = cosines[i];
				var targetY = sines[i];

				if (repelled) {
					targetX = repelX;
					targetY = repelY;
				} else if (neighbors) {
					targetX += alignX + attractX;
					targetY += alignY + attractY;
				}

				var targetLength = Math.sqrt(targetX * targetX + targetY * targetY) || 1;

				targetX /= targetLength;
				targetY /= targetLength;

				var targetSpeed = cruiseSpeed;
				var turn = turnRate;
				var nearestDistance = captureRadius * captureRadius;
				var nearest = null;

				for (var n = 0; n < nodes.length; n++) {
					if (nodes[n].attracted.indexOf(i % colors.length) === -1) continue;

					var nodeX = x[i] - nodes[n].x;
					var nodeY = y[i] - nodes[n].y;
					var nodeDistance = nodeX * nodeX + nodeY * nodeY;

					if (nodeDistance < nearestDistance && nodeDistance > 0) {
						nearestDistance = nodeDistance;
						nearest = nodes[n];
					}
				}

				if (nearest) {
					nearestDistance = Math.sqrt(nearestDistance);

					var radialX = (x[i] - nearest.x) / nearestDistance;
					var radialY = (y[i] - nearest.y) / nearestDistance;
					var radial = Math.max(-1.5, Math.min(1.5, (orbitRadius - nearestDistance) / orbitBand));
					var pull = Math.min(1, (captureRadius - nearestDistance) / (captureRadius - orbitRadius));

					targetX += (-radialY * nearest.spin + radialX * radial) * pull * orbitStrength;
					targetY += (radialX * nearest.spin + radialY * radial) * pull * orbitStrength;
					targetSpeed += (orbitSpeed - cruiseSpeed) * pull;
					turn += turnRate * pull;
				}

				if (cursor) {
					var awayX = x[i] - cursor.x;
					var awayY = y[i] - cursor.y;
					var cursorDistance = Math.sqrt(awayX * awayX + awayY * awayY);

					if (cursorDistance < cursorRadius && cursorDistance > 0) {
						var strength = 1 - cursorDistance / cursorRadius;

						targetX = targetX * (1 - strength) + awayX / cursorDistance * strength * 12;
						targetY = targetY * (1 - strength) + awayY / cursorDistance * strength * 12;
						targetSpeed = cruiseSpeed * (1 + strength * 2);
						turn = turnRate * 3;
					}
				}

				var change = Math.atan2(targetY, targetX) - angle[i];

				if (change > Math.PI) change -= Math.PI * 2;
				else if (change < -Math.PI) change += Math.PI * 2;

				var limit = turn * delta;

				nextAngle[i] = angle[i] + Math.max(-limit, Math.min(limit, change)) + (Math.random() - 0.5) * turnNoise * delta;
				speed[i] += (targetSpeed - speed[i]) * Math.min(1, delta * 3);
			}

			var swap = angle;

			angle = nextAngle;
			nextAngle = swap;

			for (i = 0; i < count; i++) {
				x[i] += Math.cos(angle[i]) * speed[i] * delta;
				y[i] += Math.sin(angle[i]) * speed[i] * delta;
				if (x[i] < 0) x[i] += width;
				else if (x[i] >= width) x[i] -= width;
				if (y[i] < 0) y[i] += height;
				else if (y[i] >= height) y[i] -= height;
			}
		};

		var draw = function () {
			context.setTransform(ratio, 0, 0, ratio, 0, 0);
			context.clearRect(0, 0, width, height);

			colors.forEach(function (color, colorIndex) {
				context.beginPath();
				for (var i = colorIndex; i < count; i += colors.length) {
					var cosine = Math.cos(angle[i]);
					var sine = Math.sin(angle[i]);

					context.moveTo(x[i] + cosine * arrowLength, y[i] + sine * arrowLength);
					context.lineTo(x[i] - sine * arrowWidth, y[i] + cosine * arrowWidth);
					context.lineTo(x[i] + cosine * arrowNotch, y[i] + sine * arrowNotch);
					context.lineTo(x[i] + sine * arrowWidth, y[i] - cosine * arrowWidth);
					context.closePath();
				}
				context.fillStyle = color;
				context.fill();
			});
		};

		var schedule = function () {
			if (running && onScreen && frame === null) {
				lastTime = 0;
				frame = requestAnimationFrame(tick);
			}
		};

		var tick = function (time) {
			frame = null;
			if (!running || !onScreen) return;

			step(lastTime ? Math.min((time - lastTime) / 1000, 1 / 30) : 1 / 60);
			lastTime = time;
			draw();
			frame = requestAnimationFrame(tick);
		};

		var moveCursor = function (event) {
			var box = map.getBoundingClientRect();

			cursor = { x: event.clientX - box.left, y: event.clientY - box.top };
		};

		var clearCursor = function () {
			cursor = null;
		};

		map.addEventListener('pointermove', moveCursor);
		map.addEventListener('pointerdown', moveCursor);
		map.addEventListener('pointerleave', clearCursor);
		map.addEventListener('pointercancel', clearCursor);
		map.addEventListener('pointerup', function (event) {
			if (event.pointerType !== 'mouse') clearCursor();
		});

		new ResizeObserver(function () {
			resize();
			updateNodes();
			if (running) draw();
		}).observe(map);

		new IntersectionObserver(function (entries) {
			onScreen = entries[entries.length - 1].isIntersecting;
			schedule();
		}).observe(map);

		resize();

		return {
			start: function (originX, originY) {
				clearTimeout(stopTimer);
				spawn(originX, originY);
				updateNodes();
				running = true;
				canvas.classList.add('is-active');
				schedule();
			},
			updateNodes: updateNodes,
			stop: function () {
				canvas.classList.remove('is-active');
				stopTimer = setTimeout(function () {
					running = false;
					count = 0;
					context.clearRect(0, 0, width, height);
				}, 300);
			}
		};
	};
})();
