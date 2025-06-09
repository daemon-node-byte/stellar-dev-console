varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vNormal = normalize(mat3(modelMatrix) * normal); // world-space normal
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}