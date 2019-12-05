/// <reference path="libs/glUtils.js" />
/// <reference path="libs/signals.js" />

function quattomatrix(quat) { // output: matrix 3x3
	var w = quat[3];
	var x = quat[0];
	var y = quat[1];
	var z = quat[2];

	var n = w * w + x * x + y * y + z * z;
	var s = n === 0 ? 0 : 2 / n;
	var wx = s * w * x, wy = s * w * y, wz = s * w * z;
	var xx = s * x * x, xy = s * x * y, xz = s * x * z;
	var yy = s * y * y, yz = s * y * z, zz = s * z * z;

	return [
	  1 - (yy + zz), xy - wz, xz + wy,
	  xy + wz, 1 - (xx + zz), yz - wx,
	  xz - wy, yz + wx, 1 - (xx + yy)];
}

function threetofour(input) {
	return [
		input[0],input[3],input[6], 0.0,
		input[1],input[4],input[7], 0.0,
		input[2],input[5],input[8], 0.0,
		0.0, 0.0, 0.0, 1.0,
	];
}


(function () {
	var sl = new SL({ callback: function () { main(); } });
	function main() {
		/** @type {HTMLCanvasElement} */
		var canvas = document.getElementById("glcanvas");
		var gl = glUtils.checkWebGL(canvas);

		var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, sl.Shaders.v1.vertex);
		var fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, sl.Shaders.v1.fragment);
		var program = glUtils.createProgram(gl, vertexShader, fragmentShader);
		gl.useProgram(program);

		{ // UNIFORM LOCATION
			var modelMatrixLocation = gl.getUniformLocation(program, 'modelMatrix');
			var viewMatrixLocation = gl.getUniformLocation(program, 'viewMatrix');
			var projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
		}

		{ // OBJECT DEFINITION
			var vertices = [];
			var cubePoints = [
				[-1.0, -1.0, 1.0],
				[-1.0, 1.0, 1.0],
				[1.0, 1.0, 1.0],
				[1.0, -1.0, 1.0],
				[-1.0, -1.0, -1.0],
				[-1.0, 1.0, -1.0],
				[1.0, 1.0, -1.0],
				[1.0, -1.0, -1.0]
			];
			var cubeColors = [
				[1.0, 1.0, 1.0],
				[1.0, 0.0, 0.0], // merah
				[0.0, 1.0, 0.0], // hijau
				[0.0, 0.0, 1.0], // biru
				[1.0, 1.0, 1.0], // putih
				[1.0, 0.5, 0.0], // oranye
				[1.0, 1.0, 0.0], // kuning
				[0.5, 0.5, 0.5],
			];
			function quad(a, b, c, d) {
				var indices = [a, b, c, d];
				for (var i = 0; i < indices.length; i++) {
					for (var j = 0; j < 3; j++) {
						vertices.push(cubePoints[indices[i]][j]);
					}
					for (var j = 0; j < 3; j++) {
						vertices.push(cubeColors[a][j]);
					}
				}
			}

			quad(1, 0, 0, 3);
			quad(3, 2, 2, 1);
			quad(5, 4, 4, 7);
			quad(7, 6, 6, 5);
			quad(1, 5, 2, 6);
			quad(0, 4, 3, 7);


			var cubeModelMatrix = glMatrix.mat4.create();

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


			var w_fill_ModelMatrix = glMatrix.mat4.create();
			var w_fill_ModelMatrixQuat = glMatrix.quat.create();

		}

		{ // VARIABLES
			var loc_track = [0.0, 0.0, -2.2];
			var trajectory = [0.05, 0.02, 0.07];
			var traj_direction = [1, 1, 1];
		}

		{ // PROJECTION SETUP
			var projectionMatrix = glMatrix.mat4.create();
			glMatrix.mat4.perspective(projectionMatrix,
				glMatrix.glMatrix.toRadian(90),
				canvas.width / canvas.height,
				0.5,
				10.0,
			);
			gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
		}

		{ // RENDER

			{ // PROJECTION SETUP
				var viewMatrix = glMatrix.mat4.create();
				glMatrix.mat4.lookAt(viewMatrix,
					[0.0, 0.0, 0.0],
					[0.0, 0.0, -2.0],
					[0.0, 1.0, 0.0]
				);
				gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
			}

			// Move object once
			glMatrix.mat4.translate(cubeModelMatrix, cubeModelMatrix, [0.0, 0.0, -2.2]);
			var translatemat=glMatrix.mat4.create()
			glMatrix.mat4.fromTranslation(translatemat, [0.0, 0.0, -2.2]);
			glMatrix.quat.rotateY(w_fill_ModelMatrixQuat, w_fill_ModelMatrixQuat, 45/180*Math.PI);

			function render() {
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				glUtils.draw(gl, program, gl.LINES, new Float32Array(vertices), 6 * Float32Array.BYTES_PER_ELEMENT, function (gl) {
					var vPosition = gl.getAttribLocation(program, 'vPosition');
					var vColor = gl.getAttribLocation(program, 'vColor');
					gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
					gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
					gl.enableVertexAttribArray(vPosition);
					gl.enableVertexAttribArray(vColor);
					gl.uniformMatrix4fv(modelMatrixLocation, false, cubeModelMatrix);
					return gl;
				});

				{
					// Collision check

					glMatrix.mat4.translate(translatemat, translatemat, 
						[traj_direction[0] * trajectory[0], traj_direction[1] * trajectory[1], traj_direction[2] * trajectory[2]]);

					var blankvec4 = glMatrix.vec4.create();
					let flag = 0;
					let did = 0;
					debugger;
					let quat4tmp = threetofour(quattomatrix(w_fill_ModelMatrixQuat));
					for (let i = 0; i < 16; i++) {
						glMatrix.vec4.set(blankvec4, w_fill[6 * i + 0], w_fill[6 * i + 1], w_fill[6 * i + 2], 1.0);
						var used_vec = glMatrix.vec4.create();
						let transtmp = glMatrix.mat4.create();
						glMatrix.mat4.multiply(transtmp, translatemat, quat4tmp);
						glMatrix.vec4.transformMat4(used_vec, blankvec4, transtmp);
						if ((used_vec[0] > 0.9 || used_vec[0] < -0.9)) {
							
							debugger;
							flag |= 1;
							traj_direction[0] = (used_vec[0] > 0.9) ? -1 : 1;
							debugger;1
							break;
						}
					}
					for (let i = 0; i < 16; i++) {
						glMatrix.vec4.set(blankvec4, w_fill[6 * i + 0], w_fill[6 * i + 1], w_fill[6 * i + 2], 1.0);
						var used_vec = glMatrix.vec4.create();
						let transtmp = glMatrix.mat4.create();
						glMatrix.mat4.multiply(transtmp, translatemat, quat4tmp);
						glMatrix.vec4.transformMat4(used_vec, blankvec4, transtmp);
						if ((used_vec[1] > 0.9 || used_vec[1] < -0.9)) {
							
							debugger;
							flag |= 2;
							traj_direction[1] = (used_vec[1] > 0.9) ? -1 : 1;
							debugger;1
							break;
						}
					}
					for (let i = 0; i < 16; i++) {
						glMatrix.vec4.set(blankvec4, w_fill[6 * i + 0], w_fill[6 * i + 1], w_fill[6 * i + 2], 1.0);
						var used_vec = glMatrix.vec4.create();
						let transtmp = glMatrix.mat4.create();
						glMatrix.mat4.multiply(transtmp, translatemat, quat4tmp);
						glMatrix.vec4.transformMat4(used_vec, blankvec4, transtmp);
						if ((used_vec[2] > -1.1 || used_vec[2] < -3.1)) {
							
							debugger;
							flag |= 4;
							traj_direction[2] = (used_vec[2] > -1.1) ? -1 : 1;
							debugger;1
							break;
						}
					}
				}


				glMatrix.quat.rotateY(w_fill_ModelMatrixQuat, w_fill_ModelMatrixQuat, 0.1);
				
				var w_fill_quatasmatrix = threetofour(quattomatrix(w_fill_ModelMatrixQuat));
				var w_fill_final = glMatrix.mat4.create();
				glMatrix.mat4.multiply(w_fill_final, translatemat, w_fill_quatasmatrix);
				glUtils.draw(gl, program, gl.TRIANGLE_STRIP, w_fill, 6 * Float32Array.BYTES_PER_ELEMENT, function (gl) {
					var vPosition = gl.getAttribLocation(program, 'vPosition');
					var vColor = gl.getAttribLocation(program, 'vColor');
					gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
					gl.vertexAttribPointer(vColor, 3, gl.FLOAT, gl.FALSE, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
					gl.enableVertexAttribArray(vPosition);
					gl.enableVertexAttribArray(vColor);
					gl.uniformMatrix4fv(modelMatrixLocation, false, w_fill_final);
					return gl;
				});

				requestAnimationFrame(render);
			}

			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			render();
		}
	}
})();