"""Build hyperframes/pilot/index.html: v2 world (world.js) + subtitles for the first 10.6 s of scene 1."""
import re, os, json
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
DUR = 10.6
main = open('hyperframes/main/index.html').read()
fonts = re.search(r'<style>(@font-face.*?)\n', main, re.S).group(1)
cues = [
    (0.164, 2.51, 'Imagine chegar ao<br>seu clube, cheio de'),
    (2.53, 4.61, 'vontade de <span class="k">participar,</span><br>mas encontrar'),
    (4.63, 7.07, 'uma <span class="k">barreira</span> que<br>impede você de entrar.'),
    (7.09, 8.75, 'Será que isso é <span class="k">inclusão?</span>'),
    (8.77, DUR, 'Hoje, vamos<br>descobrir…'),
]
html = f'''<!doctype html>
<html data-composition-variables='[{{"id":"subs","type":"string","label":"Legendas (on/off)","default":"on"}}]'>
<head><meta charset="utf-8"><title>Piloto — Educação Inclusiva (0–10,6 s)</title>
<style>{fonts}
html,body{{margin:0;background:#CDEFFB}}
#root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#CDEFFB}}
#world{{position:absolute;left:0;top:0;width:1080px;height:1920px}}
#subs{{position:absolute;left:70px;width:940px;top:1400px;height:170px}}
.cue{{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;opacity:0;font-family:PoppinsB;font-size:52px;line-height:1.22;color:#fff;
  -webkit-text-stroke:11px #190C3C;paint-order:stroke fill;text-shadow:0 5px 12px rgba(0,0,0,.35);white-space:nowrap}}
.cue .k{{color:#FFEB00}}
</style>
<script src="gsap.min.js"></script></head>
<body>
<div id="root" data-composition-id="root" data-width="1080" data-height="1920" data-start="0" data-duration="{DUR}">
<canvas id="world" width="1080" height="1920"></canvas>
<div id="subs">{''.join(f'<div class="cue" id="c{i}">{t}</div>' for i, (_, _, t) in enumerate(cues))}</div>
</div>
<script src="world.js"></script>
<script>
(function(){{
  const C = {json.dumps([[s, e] for s, e, _ in cues])};
  const vars = (window.__hyperframes && window.__hyperframes.getVariables) ? window.__hyperframes.getVariables() : {{}};
  if ((vars.subs || 'on') === 'off') document.getElementById('subs').style.display = 'none';
  const tl = gsap.timeline({{ paused: true }});
  C.forEach(([s, e], i) => {{
    tl.fromTo('#c' + i, {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }}, s);
    if (e < {DUR}) tl.to('#c' + i, {{ opacity: 0, duration: 0.12 }}, e - 0.12);
  }});
  tl.set({{}}, {{}}, {DUR});
  window.__timelines = window.__timelines || {{}};
  window.__timelines['root'] = tl;
}})();
</script>
</body></html>
'''
open('hyperframes/pilot/index.html', 'w').write(html)
print('ok', len(html))
