"""QC of the encoded deliverables -> documentation/QC_FINAL.json, renders/scenes/*, renders/final/*sheet*"""
import json, subprocess, os, re
import numpy as np, soundfile as sf
from PIL import Image, ImageDraw
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
SC = json.load(open('documentation/scene_bounds.json'))


def probe(f):
    o = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', f], capture_output=True, text=True).stdout)
    v = [s for s in o['streams'] if s['codec_type'] == 'video'][0]; a = [s for s in o['streams'] if s['codec_type'] == 'audio'][0]
    return dict(file=f, size_mb=round(int(o['format']['size']) / 1e6, 1), duration=float(o['format']['duration']), bitrate_kbps=int(int(o['format']['bit_rate']) / 1000),
                video=dict(codec=v['codec_name'], profile=v.get('profile'), w=v['width'], h=v['height'], fps=v['r_frame_rate'], pix_fmt=v['pix_fmt'], frames=int(v.get('nb_frames', 0)), color=v.get('color_space')),
                audio=dict(codec=a['codec_name'], sr=int(a['sample_rate']), ch=a['channels'], bitrate_kbps=int(int(a.get('bit_rate', 0)) / 1000)))
def loud(f):
    e = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-i', f, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = e[e.rfind('Summary'):]
    g = lambda k: float(re.search(k + r':\s+(-?[\d.]+)', s).group(1))
    return dict(integrated_lufs=g('I'), lra=g('LRA'), true_peak_dbtp=g('Peak'))
def detect(f):
    e = subprocess.run(['ffmpeg', '-nostats', '-hide_banner', '-i', f, '-map', '0:v', '-vf', 'blackdetect=d=0.05:pix_th=0.06,freezedetect=n=-55dB:d=2.5', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return dict(black=re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', e), freeze=re.findall(r'freeze_start: ([\d.]+)', e))
def av_offset(f):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-map', '0:a', '-t', '30', '-ar', '48000', '-ac', '1', '/tmp/claude-0/qc_a.wav'])
    a = sf.read('/tmp/claude-0/qc_a.wav')[0]; m = sf.read('audio/master.wav', frames=48000 * 30)[0].mean(1)
    n = min(len(a), len(m)); a, m = a[:n], m[:n]
    lags = range(-2400, 2401, 24); c = [np.dot(a[max(0, l):n + min(0, l)], m[max(0, -l):n - max(0, l)]) for l in lags]
    return round(list(lags)[int(np.argmax(c))] / 48000 * 1000, 1)

out = {}
for name in ['EDUCACAO_INCLUSIVA_FINAL', 'EDUCACAO_INCLUSIVA_SEM_LEGENDAS']:
    f = f'deliverables/{name}.mp4'
    out[name] = dict(probe=probe(f), loudness=loud(f), detect=detect(f), av_offset_ms=av_offset(f))
    print(name, json.dumps(out[name])[:400])

# per-scene QC sheets + clips from the subtitled final
os.makedirs('renders/scenes', exist_ok=True)
f = 'deliverables/EDUCACAO_INCLUSIVA_FINAL.mp4'
def grab(t, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.3f}', '-i', f, '-frames:v', '1', path])
for i, s in enumerate(SC, 1):
    st, en = s['start'], min(s['end'], 179.98); d = en - st
    ts = [st + 0.02, st + 0.25 * d, st + 0.5 * d, st + 0.75 * d, en - 0.05]
    if i > 1: ts = [st - 0.25, st + 0.2] + ts
    ims = []
    for k, t in enumerate(ts):
        p = f'/tmp/claude-0/qc_{i}_{k}.png'; grab(t, p); ims.append((t, Image.open(p).resize((216, 384))))
    sheet = Image.new('RGB', (216 * len(ims), 404), (20, 16, 40)); dr = ImageDraw.Draw(sheet)
    for k, (t, im) in enumerate(ims): sheet.paste(im, (k * 216, 20)); dr.text((k * 216 + 4, 4), f'{t:.2f}s', fill=(255, 235, 0))
    sheet.save(f'renders/scenes/cena_{i:02d}_qc.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{st:.3f}', '-i', f, '-t', f'{d:.3f}', '-c:v', 'libx264', '-crf', '22', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', f'renders/scenes/cena_{i:02d}.mp4'])
json.dump(out, open('documentation/QC_FINAL.json', 'w'), indent=1)
print('qc done')
