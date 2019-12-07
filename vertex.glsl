precision mediump float;

attribute vec3 vPosition;
attribute vec3 vColor;
attribute vec3 vNormal;
attribute vec2 vTexCoord;

varying vec3 fNormal;
varying vec3 fColor;
varying vec3 fPosition;
varying vec2 fTexCoord;

uniform float scaleX;
uniform float x_huruf;
uniform float y_huruf;
uniform float z_huruf;
uniform int flag;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;  // Berperan sebagai modelMatrix-nya vektor normal

void main() {
  vec3 pusat = vec3(x_huruf, y_huruf, z_huruf);

  mat4 matrixSkalasi = mat4(
    scaleX, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  mat4 matrixTranslation = mat4(
    0.7, 0.0, 0.0, 0.0,
    0.0, 0.7, 0.0, 0.0,
    0.0, 0.0, 0.7, 0.0,
    pusat, 1.0
  );

  if(flag == 0){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(vPosition, 1.0);
    // Transfer koordinat tekstur ke fragment shader
    fTexCoord = vTexCoord;

    // Transfer vektor normal (yang telah ditransformasi) ke fragment shader
    fNormal = normalize(normalMatrix * vNormal);

    // Transfer posisi verteks
    fPosition = vPosition;
  }
  else if(flag == 1){
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * matrixTranslation * matrixSkalasi * vec4(vPosition, 1.0);
    fColor = vColor;
  }

}
