"""Cover page: final line-up frame from the Three.js world + title layout. -> deliverables/EDUCACAO_INCLUSIVA_CAPA.png"""
import base64, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def font(name, file):
    b = base64.b64encode(open(f'{ROOT}/assets/generated_assets/fonts/{file}', 'rb').read()).decode()
    return f"@font-face{{font-family:'{name}';src:url(data:font/ttf;base64,{b}) format('truetype');}}"
html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{font('PoppinsB','Poppins-Bold.ttf')}{font('PoppinsK','Poppins-Black.ttf')}
html,body{{margin:0}} #root{{position:relative;width:1080px;height:1920px;overflow:hidden}} canvas{{position:absolute;inset:0;width:1080px;height:1920px}}
.series{{position:absolute;top:120px;left:50%;transform:translateX(-50%);font-family:PoppinsB;font-size:34px;letter-spacing:3px;color:#fff;background:#190C3C;padding:12px 30px;border-radius:999px;white-space:nowrap;border:4px solid #13B9C5}}
.t1{{position:absolute;top:230px;left:50%;transform:translateX(-50%);font-family:PoppinsK;font-size:104px;line-height:1.0;color:#fff;text-align:center;white-space:nowrap;
  -webkit-text-stroke:16px #211C55;paint-order:stroke fill;filter:drop-shadow(0 12px 0 #190C3C)}}
.t2{{position:absolute;top:470px;left:50%;transform:translateX(-50%) rotate(-2deg);font-family:PoppinsK;font-size:66px;color:#211C55;background:#FFEB00;padding:14px 36px 10px;border-radius:24px;white-space:nowrap;box-shadow:0 10px 0 #190C3C}}
.foot{{position:absolute;bottom:150px;left:50%;transform:translateX(-50%);font-family:PoppinsB;font-size:40px;color:#fff;background:#211C55;padding:14px 34px;border-radius:999px;white-space:nowrap;border:4px solid #FFEB00}}
.foot b{{color:#FFEB00}}
</style></head><body><div id="root"><canvas id="world" width="1080" height="1920"></canvas>
<div class="series">SÉRIE ESPECIALIDADES DOS DESBRAVADORES</div>
<div class="t1">EDUCAÇÃO<br>INCLUSIVA</div>
<div class="t2">NINGUÉM FICA DE FORA!</div>
<div class="foot">DESBRAVADORES — <b>INCLUIR É NOSSA MISSÃO</b></div>
</div><script src="../main/world.js"></script></body></html>"""
open(f'{ROOT}/hyperframes/cover/cover.html', 'w').write(html)
