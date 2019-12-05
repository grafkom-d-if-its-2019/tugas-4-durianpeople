
class SL {
	constructor(options) {
		this.XMLHttpFactories = [
			function () { return new XMLHttpRequest() },
			function () { return new ActiveXObject("Msxml2.XMLHTTP") },
			function () { return new ActiveXObject("Msxml3.XMLHTTP") },
			function () { return new ActiveXObject("Microsoft.XMLHTTP") }
		];
		/** @type {Object} */
		var options = options || {};
		/** @type {CallableFunction} */
		this.callback = options.callback || function () { };
		this.elemName = options.elemName || "shader";
		this.dataSrc = options.dataSrc || "data-src";
		this.dataType = options.dataType || "data-type";
		this.dataVersion = options.dataVersion || "data-version";
		this.shaderElems = document.getElementsByName(this.elemName);
		this.loadedSignal = new signals.Signal();
		this.Shaders = this.Shaders || {};
		this.loadedSignal.add(this.callback);
		this.slShaderCount = this.shaderElems.length;

		for (var i = 0; i < this.slShaderCount; i++) {
			var shader = this.shaderElems[i];
			this.sendRequest(shader.getAttribute(this.dataSrc), this.processShader.bind(this), shader);
		}

		this.checkForComplete();
	}

	/**
	 * @return {XMLHttpRequest}
	 */
	createXMLHTTPObject() {
		var xmlhttp = false;

		for (var i = 0; i < this.XMLHttpFactories.length; i++) {

			try {
				xmlhttp = this.XMLHttpFactories[i]();
			} catch (error) {
				continue;
			}
			break;
		}

		return xmlhttp;
	}

	sendRequest(url, callback, element) {

		var req = this.createXMLHTTPObject();

		if (!req) return;
		var method = "GET";
		req.open(method, url, true);

		req.onreadystatechange = function () {

			if (req.readyState != 4) return;
			if (req.status != 0 && req.status != 200 && req.status != 304) {
				return;
			}
			callback(req, element);
		}

		if (req.readyState == 4) return;
		req.send();
	}

	checkForComplete() {
		if (!this.slShaderCount) {
			this.loadedSignal.dispatch();
		}
	}

	/**
	 * 
	 * @param {XMLHttpRequest} req 
	 * @param {*} element 
	 */
	processShader(req, element) {

		this.slShaderCount--;
		var version = element.getAttribute(this.dataVersion);
		if (!this.Shaders[version]) {
			this.Shaders[version] = {
				vertex: '',
				fragment: ''
			};
		}
		console.log("\nShader source:\n" + req.responseText);
		this.Shaders[version][element.getAttribute(this.dataType)] = req.responseText;
		this.checkForComplete();
	}


};

var glUtils = {
	VERSION: '0.0.3',
	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 * @return {WebGLRenderingContext}
	 */
	checkWebGL: function (canvas) {
		var gl;
		var contexts = ["webgl", "moz-webgl", "webkit-3d", "experimental-webgl"];
		for (let i = 0; i < contexts.length; i++) {
			try {
				gl = canvas.getContext(contexts[i]);
			} catch (error) {
				// Sementara kosong
			}
			if (gl) {
				break;
			}
		}
		if (!gl) {
			alert("WebGL tidak ditemukan. Tolong gunakan Chrome/Firefox terbaru.");
		}
		return gl;
	},
	/**
	 * 
	 * @param {WebGLRenderingContext} gl 
	 * @param {Number} type 
	 * @param {String} source 
	 * @return {WebGLShader}
	 */
	getShader: function (gl, type, source) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log("Shader gagal dikompilasi: " + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	},
	/**
	 * 
	 * @param {WebGLRenderingContext} gl 
	 * @param {WebGLShader} vertexShader 
	 * @param {WebGLShader} fragmentShader 
	 * @return {WebGLProgram}
	 */
	createProgram: function (gl, vertexShader, fragmentShader) {
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.log("Program gagal di-link: " + gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			return null;
		}
		return program;
	},
	initBuffer: function () {

	},
	/**
	 * 
	 * @param {WebGLRenderingContext} gl 
	 */
	clear: function (gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	},
	/**
	 * 
	 * @param {WebGLRenderingContext} gl 
	 * @param {WebGLProgram} program
	 * @param {Number} mode
	 * @param {Float32Array} vertices
	 * @param {Number} dimension
	 * @param {Number} points
	 */
	draw: function (gl, program, mode, vertices, byte_per_point, gl_modifier) {
		var vertexBufferObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


		var vPosition = gl.getAttribLocation(program, 'vPosition');
		if (vPosition < 0) {
			console.log("vPosition err");
			return;
		}

		gl = gl_modifier(gl);
		// console.log(vertices.length / byte_per_point);
		gl.drawArrays(mode, 0, vertices.length / (byte_per_point / Float32Array.BYTES_PER_ELEMENT));
	}
};