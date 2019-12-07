(function () {

	var canvas;
	var gl;
	var program;
	var scaleXUniformLocation;
	var scaleX = 1.0;
	var scale = 1.0;
	var directionX = 1.0;
	var directionY = 1.0;
	var directionZ = 1.0;
	var theta = 0;
	var thetaSpeed = 0.0;
	var modelMatrix;
	var viewMatrix;
	var projectionMatrix;
	var camera;
	var centerObjectX = 0.0;
	var centerObjectY = 0.0;
	var centerObjectZ = 0.0;
	var diffuseColor, diffusePosition, ambientColor;
	var theta, phi;
	var vPosition;
	var vNormal;
	var vTexCoord;
	var vPosition;
	var vColor;
	var samplerLocation;
	var modelMatrixLocation;
	var viewMatrixLocation;
	var projectionMatrixLocation;
	var centerObjectXLocation;
	var centerObjectYLocation;
	var centerObjectZLocation;
	var scaleXUniformLocation;
	var vFlagUniformLocation;
	var fFlagUniformLocation;
	var diffuseColorLocation;
	var diffusePositionLocation;
	var ambientColorLocation;
	var normalMatrixLocation;

	var verticesKubus = [];
	var cubePoints = [
		[-0.8, -0.8, 0.8],
		[-0.8, 0.8, 0.8],
		[0.8, 0.8, 0.8],
		[0.8, -0.8, 0.8],
		[-0.8, -0.8, -0.8],
		[-0.8, 0.8, -0.8],
		[0.8, 0.8, -0.8],
		[0.8, -0.8, -0.8]
	];
	var cubeColors = [ // tidak dipakai
		[],
		[0.0, 0.0, 0.0],
		[0.0, 0.0, 0.0],
		[0.0, 0.0, 0.0],
		[0.0, 0.0, 0.0],
		[0.0, 0.0, 0.0],
		[0.0, 0.0, 0.0],
		[]
	];
	var cubeNormals = [
		[],
		[0.0, 0.0, 1.0], // depan
		[1.0, 0.0, 0.0], // kanan
		[0.0, -1.0, 0.0], // bawah
		[0.0, 0.0, -1.0], // belakang
		[-1.0, 0.0, 0.0], // kiri
		[0.0, 1.0, 0.0], // atas
		[]
	];
	function quad(a, b, c, d) {
		var indices = [a, b, c, a, c, d];
		for (var i = 0; i < indices.length; i++) {
			for (var j = 0; j < 3; j++) {
				verticesKubus.push(cubePoints[indices[i]][j]);
			}
			for (var j = 0; j < 3; j++) {
				verticesKubus.push(cubeColors[a][j]);
			}
			for (var j = 0; j < 3; j++) {
				verticesKubus.push(-1 * cubeNormals[a][j]);
			}
			switch (indices[i]) {
				case a:
					verticesKubus.push((a - 2) * 0.125);
					verticesKubus.push(0.0);
					break;
				case b:
					verticesKubus.push((a - 2) * 0.125);
					verticesKubus.push(1.0);
					break;
				case c:
					verticesKubus.push((a - 1) * 0.125);
					verticesKubus.push(1.0);
					break;
				case d:
					verticesKubus.push((a - 1) * 0.125);
					verticesKubus.push(0.0);
					break;

				default:
					break;
			}
		}
	}

	var w_fill = new Float32Array([
		-0.49891469942, 0.404953571, 0.0, 1.0, 0.0, 0.0, // A
		-0.2936433668434, 0.40429267676999997, 0.0, 1.0, 0.0, 0.0, // B
		-0.3314953957192, -0.2932661410845, 0.0, 1.0, 0.0, 0.0, // C
		-0.15305011673320001, -0.10400599670539999, 0.0, 1.0, 0.0, 0.0, // E
		-0.15305011673320001, -0.2932661410845, 0.0, 1.0, 0.0, 0.0, // D
		0.0029505660734999717, -0.15808032367080002, 0.0, 1.0, 0.0, 0.0, // G
		-0.15305011673320001, -0.10400599670539999, 0.0, 1.0, 0.0, 0.0, // E
		-0.001642001229899992, 0.0311798207083, 0.0, 1.0, 0.0, 0.0, // F
		0.0029505660734999717, -0.15808032367080002, 0.0, 1.0, 0.0, 0.0, // G
		0.14976611427340003, -0.0956357274915, 0.0, 1.0, 0.0, 0.0, // H
		0.16058097966649998, -0.2878587083879, 0.0, 1.0, 0.0, 0.0, // I
		0.3206559894387, -0.2878587083879, 0.0, 1.0, 0.0, 0.0, // L
		0.14976611427340003, -0.0956357274915, 0.0, 1.0, 0.0, 0.0, // H
		0.32280396056289995, 0.39347781137689997, 0.0, 1.0, 0.0, 0.0, // J
		0.3206559894387, -0.2878587083879, 0.0, 1.0, 0.0, 0.0, // L
		0.50108530058, 0.404953571, 0.0, 1.0, 0.0, 0.0, // K
	]);


	glUtils.SL.init({ callback: function () { main(); } });

	var slideFactor = 0.56;
	var isDragged = false;
	var old_x, old_y;
	var dX = 0, dY = 0;
	theta = 0;
	phi = 0;

	var mouseUp = function (e) {
		isDragged = false;
	};

	document.addEventListener("mousedown", function (e) {
		isDragged = true;
		old_x = e.pageX, old_y = e.pageY;
		e.preventDefault();
		return false;
	}, false);
	document.addEventListener("mouseup", mouseUp, false);
	document.addEventListener("mouseout", mouseUp, false);
	document.addEventListener("mousemove", function (e) {
		if (!isDragged) return false;
		dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width;
		dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;
		theta += dX;
		phi += dY;
		old_x = e.pageX, old_y = e.pageY;
		e.preventDefault();
	}, false);

	function rotateX(m, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var mv1 = m[1], mv5 = m[5], mv9 = m[9];

		m[1] = m[1] * c - m[2] * s;
		m[5] = m[5] * c - m[6] * s;
		m[9] = m[9] * c - m[10] * s;

		m[2] = m[2] * c + mv1 * s;
		m[6] = m[6] * c + mv5 * s;
		m[10] = m[10] * c + mv9 * s;
	}

	function rotateY(m, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var mv0 = m[0], mv4 = m[4], mv8 = m[8];

		m[0] = c * m[0] + s * m[2];
		m[4] = c * m[4] + s * m[6];
		m[8] = c * m[8] + s * m[10];

		m[2] = c * m[2] - s * mv0;
		m[6] = c * m[6] - s * mv4;
		m[10] = c * m[10] - s * mv8; 2
	}

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


		var nm = glMatrix.mat3.create();
		glMatrix.mat3.normalFromMat4(nm, modelMatrix);
		gl.uniformMatrix3fv(normalMatrixLocation, false, nm);

		glMatrix.mat4.lookAt(viewMatrix,
			[camera.x, camera.y, camera.z],
			[0.0, 0.0, -2.0],
			[0.0, 1.0, 0.0]
		);
		gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

		modelMatrix = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]

		theta += thetaSpeed;
		if (!isDragged) {
			dX *= slideFactor, dY *= slideFactor;
			theta += dX, phi += dY;
		}

		glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -2.0]);

		rotateY(modelMatrix, theta);
		rotateX(modelMatrix, phi);

		gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

		{ // DRAW CUBE OBJECT

			var vertexBufferObject = gl.createBuffer();
			if (!vertexBufferObject) {
				console.log('Failed to create the buffer object');
				return -1;
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesKubus), gl.STATIC_DRAW);

			gl.vertexAttribPointer(
				vPosition,
				3,
				gl.FLOAT,
				gl.FALSE,
				11 * Float32Array.BYTES_PER_ELEMENT,
				0
			);

			gl.vertexAttribPointer(
				vNormal,
				3,
				gl.FLOAT,
				gl.FALSE,
				11 * Float32Array.BYTES_PER_ELEMENT,
				6 * Float32Array.BYTES_PER_ELEMENT
			);

			gl.vertexAttribPointer(
				vTexCoord,
				2,
				gl.FLOAT,
				gl.FALSE,
				11 * Float32Array.BYTES_PER_ELEMENT,
				9 * Float32Array.BYTES_PER_ELEMENT
			);

			gl.enableVertexAttribArray(vPosition);
			gl.enableVertexAttribArray(vNormal);
			gl.enableVertexAttribArray(vTexCoord);

			gl.uniform1i(vFlagUniformLocation, 0);
			gl.uniform1i(fFlagUniformLocation, 0);
			gl.drawArrays(gl.TRIANGLES, 0, verticesKubus.length / 11);

			gl.disableVertexAttribArray(vNormal);
			gl.disableVertexAttribArray(vTexCoord);
		}

		{ // BOUNCE SETUP
			// pseudo-rotate
			if (scaleX >= 1.0) scale = -1.0;
			else if (scaleX <= -1.0) scale = 1.0;
			scaleX += 0.0028 * scale;

			gl.uniform1f(scaleXUniformLocation, scaleX);

			{ // CHECK COLLISION
				if (centerObjectX >= (0.7 - Math.abs(0.2 * 0.7 * scaleX))) directionX = -1.0;
				else if (centerObjectX <= (-0.7 + Math.abs(0.2 * 0.7 * scaleX))) directionX = 1.0;
				centerObjectX += 0.012 * directionX;
				gl.uniform1f(centerObjectXLocation, centerObjectX);

				if (centerObjectY >= (0.7 - (0.3 * 0.7))) directionY = -1.0;
				else if (centerObjectY <= (-0.7 + (0.3 * 0.7))) directionY = 1.0;
				centerObjectY += 0.015 * directionY;
				gl.uniform1f(centerObjectYLocation, centerObjectY);

				if (centerObjectZ >= (0.7 - Math.abs(0.2 * 0.7 * scaleX))) directionZ = -1.0;
				else if (centerObjectZ <= (-0.7 + Math.abs(0.2 * 0.7 * scaleX))) directionZ = 1.0;
				centerObjectZ += 0.018 * directionZ;
				gl.uniform1f(centerObjectZLocation, centerObjectZ);
			}

			diffusePosition = glMatrix.vec3.fromValues(centerObjectX, centerObjectY, centerObjectZ);  // xyz
			gl.uniform3fv(diffusePositionLocation, diffusePosition);
		}
		{ // DRAW BOUNCE OBJECT
			var vertexBufferObject = gl.createBuffer();
			if (!vertexBufferObject) {
				console.log('Failed to create the buffer object');
				return -1;
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(w_fill), gl.STATIC_DRAW);

			gl.vertexAttribPointer(
				vPosition,
				3,
				gl.FLOAT,
				gl.FALSE,
				6 * Float32Array.BYTES_PER_ELEMENT,
				0
			);

			gl.vertexAttribPointer(
				vColor,
				3,
				gl.FLOAT,
				gl.FALSE,
				6 * Float32Array.BYTES_PER_ELEMENT,
				3 * Float32Array.BYTES_PER_ELEMENT
			);

			gl.enableVertexAttribArray(vPosition);
			gl.enableVertexAttribArray(vColor);
			gl.uniform1i(vFlagUniformLocation, 1);
			gl.uniform1i(fFlagUniformLocation, 1);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, w_fill.length / 6);
			gl.disableVertexAttribArray(vColor);
		}
		requestAnimationFrame(render);
	}

	function main() {
		canvas = document.getElementById("glcanvas");
		gl = glUtils.checkWebGL(canvas);

		var width = canvas.getAttribute("width"), height = canvas.getAttribute("height");
		if (width) {
			gl.maxWidth = width;
		}
		if (height) {
			gl.maxHeight = height;
		}

		var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex);
		var fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
		program = glUtils.createProgram(gl, vertexShader, fragmentShader);
		gl.useProgram(program);

		{ // LOCATION
			vPosition = gl.getAttribLocation(program, 'vPosition');
			vNormal = gl.getAttribLocation(program, 'vNormal');
			vTexCoord = gl.getAttribLocation(program, 'vTexCoord');
			vPosition = gl.getAttribLocation(program, 'vPosition');
			vColor = gl.getAttribLocation(program, 'vColor');
			samplerLocation = gl.getUniformLocation(program, 'sampler0');
			modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix');
			viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix');
			projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
			centerObjectXLocation = gl.getUniformLocation(program, 'x_huruf');
			centerObjectYLocation = gl.getUniformLocation(program, 'y_huruf');
			centerObjectZLocation = gl.getUniformLocation(program, 'z_huruf');
			scaleXUniformLocation = gl.getUniformLocation(program, 'scaleX');
			vFlagUniformLocation = gl.getUniformLocation(program, 'flag');
			fFlagUniformLocation = gl.getUniformLocation(program, 'fFlag');
			diffuseColorLocation = gl.getUniformLocation(program, 'diffuseColor');
			diffusePositionLocation = gl.getUniformLocation(program, 'diffusePosition');
			ambientColorLocation = gl.getUniformLocation(program, 'ambientColor');
			normalMatrixLocation = gl.getUniformLocation(program, 'normalMatrix');
		}

		quad(2, 3, 7, 6);
		quad(3, 0, 4, 7);
		quad(4, 5, 6, 7);
		quad(5, 4, 0, 1);
		quad(6, 5, 1, 2);

		{ // TEXTURE

			gl.uniform1i(samplerLocation, 0);
			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 255, 255]));

			var image = new Image();
			image.src = "images/img.jpg";
			image.addEventListener('load', function () {
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.generateMipmap(gl.TEXTURE_2D);
			});
		}

		{ // RENDER
			modelMatrix = glMatrix.mat4.create();
			glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -2.0]);
			viewMatrix = glMatrix.mat4.create();

			projectionMatrix = glMatrix.mat4.create();

			camera = { x: 0.0, y: 0.0, z: 0.0 };
			glMatrix.mat4.perspective(projectionMatrix,
				glMatrix.glMatrix.toRadian(90),
				canvas.width / canvas.height,
				0.5,
				10.0,
			);

			gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
			gl.uniform1f(centerObjectXLocation, centerObjectX);
			gl.uniform1f(centerObjectYLocation, centerObjectY);
			gl.uniform1f(centerObjectZLocation, centerObjectZ);
			gl.uniform1f(scaleXUniformLocation, scaleX);
			gl.uniform1i(vFlagUniformLocation, 0);
			gl.uniform1i(fFlagUniformLocation, 0);


			diffuseColor = glMatrix.vec3.fromValues(1.0, 1.0, 1.0);
			gl.uniform3fv(diffuseColorLocation, diffuseColor);

			ambientColor = glMatrix.vec3.fromValues(0.17, 0.00, 0.28);
			gl.uniform3fv(ambientColorLocation, ambientColor);

			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);

			render();
		}

	}

})();