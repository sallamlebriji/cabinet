/**
 * Shader d'une "photo WebGL" : technique classique des sites d'agence primés
 * (ex. otsuka-air.jp, qui embarque un <canvas> + Lenis pour ce genre d'effet).
 * Révélation façon polaroid qui se développe (bruit + seuil animé) à l'entrée en vue.
 * Se joue en distordant le seuil de révélation par pixel : pas de géométrie détaillée
 * nécessaire, un seul plan suffit, donc c'est bon marché pour le GPU.
 */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uScale;
  uniform float uReveal;
  uniform vec3 uTint;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uScale + 0.5;
    vec4 tex = texture2D(uTexture, uv);

    // Révélation façon développement photo : un bruit par bloc + un seuil qui balaie 0 -> 1.
    float grain = hash(floor(vUv * 26.0)) * 0.72 + (1.0 - vUv.y) * 0.28;
    float edge = smoothstep(grain - 0.06, grain + 0.06, uReveal);

    vec3 finalColor = mix(uTint, tex.rgb, edge);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
