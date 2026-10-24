// Renderer, orthographic camera and scene-transition compositor.
import * as THREE from 'three';

export const W = 1080, H = 1920;
export const VIEW_H = 19.2;   // world units visible vertically at zoom 1 (1 unit = 100 px)

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.sortObjects = true;
  const rtA = new THREE.WebGLRenderTarget(W, H, { samples: 4, colorSpace: THREE.SRGBColorSpace });
  const rtB = new THREE.WebGLRenderTarget(W, H, { samples: 4, colorSpace: THREE.SRGBColorSpace });
  // full-screen compositor for transitions
  const qScene = new THREE.Scene();
  const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const qMat = new THREE.ShaderMaterial({
    uniforms: { tA: { value: rtA.texture }, tB: { value: rtB.texture }, uK: { value: 0 }, uMode: { value: 0 }, uC: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: H / W }, uEdge: { value: new THREE.Color('#FFEB00') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      precision highp float; varying vec2 vUv; uniform sampler2D tA, tB; uniform float uK; uniform int uMode; uniform vec2 uC; uniform float uAspect; uniform vec3 uEdge;
      void main(){
        vec4 a = texture2D(tA, vUv), b = texture2D(tB, vUv);
        float m = 0.0; float edge = 0.0;
        if (uMode == 0) { m = uK; }
        else if (uMode == 1) { // iris circle reveal of B
          vec2 d = vUv - uC; d.y *= uAspect; float r = uK * 1.25; float e = length(d) - r;
          m = 1.0 - smoothstep(-0.002, 0.002, e); edge = (1.0 - smoothstep(0.0, 0.004, abs(e - 0.012))) * step(0.001, uK) * step(uK, 0.999);
        } else if (uMode == 2) { // diagonal wipe with a yellow band
          float x = (vUv.x * 0.6 + (1.0 - vUv.y) * 0.4); float e = x - (uK * 1.3 - 0.15);
          m = 1.0 - smoothstep(-0.002, 0.002, e); edge = step(-0.03, e) * step(e, 0.0) * step(0.001, uK) * step(uK, 0.999);
        } else if (uMode == 3) { // vertical push: A slides up, B enters from below
          if (vUv.y < uK) { a = texture2D(tB, vec2(vUv.x, vUv.y + 1.0 - uK)); } else { a = texture2D(tA, vec2(vUv.x, vUv.y - uK)); }
          m = 0.0;
        }
        vec4 c = mix(a, b, m);
        c.rgb = mix(c.rgb, uEdge, edge);
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false,
  });
  qScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), qMat));

  const cam = new THREE.OrthographicCamera(-W / 200, W / 200, H / 200, -H / 200, -200, 200);
  cam.position.z = 50;
  function view(c, cx, cy, zoom = 1, rot = 0) {
    const hw = W / 200 / zoom, hh = H / 200 / zoom;
    c.left = -hw; c.right = hw; c.top = hh; c.bottom = -hh;
    c.position.set(cx, cy, 50); c.rotation.z = rot; c.updateProjectionMatrix();
  }
  return {
    renderer, cam, view,
    render(scene, c = cam) { renderer.setRenderTarget(null); renderer.render(scene, c); },
    /** composite two already-set-up scenes with a transition */
    transition(sceneA, camA, sceneB, camB, k, mode = 0, center = [0.5, 0.5]) {
      renderer.setRenderTarget(rtA); renderer.render(sceneA, camA);
      renderer.setRenderTarget(rtB); renderer.render(sceneB, camB);
      renderer.setRenderTarget(null);
      qMat.uniforms.uK.value = k; qMat.uniforms.uMode.value = mode; qMat.uniforms.uC.value.set(center[0], center[1]);
      renderer.render(qScene, qCam);
    },
  };
}
