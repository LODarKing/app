// Entry for the character test composition.
import { createStage } from './core/stage.js';
import * as T from './scenes/characterTest.js';

const stage = createStage(document.getElementById('world'));
const S = T.build();
stage.view(stage.cam, 0, -1.0, 1.0);
function draw(t) { T.update(S, t); stage.render(S.scene); }
window.addEventListener('hf-seek', (e) => draw(e.detail.time));
window.__draw = draw;
window.__view = (x, y, z) => stage.view(stage.cam, x, y, z);
draw(0);
