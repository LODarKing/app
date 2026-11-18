# Além do Visível — EP. 05: Como um QR Code guarda informações?

Status: **piloto v2 (narração do usuário) renderizado, aguardando aprovação**. O episódio completo ainda não foi produzido.

## Como regenerar
```bash
cd episodio_05_qrcode
python3 ferramentas/tratar_narracao.py   # narração do usuário (audio/usuario/narracao_original.mp3) -> audio/narracao_ia.wav
python3 ferramentas/palavras.py audio/narracao_ia.wav medium   # Whisper: conferência + tempos por palavra
python3 ferramentas/legendas.py          # legendas.srt + projeto_remotion/src/legendas.json
python3 ferramentas/trilha.py piloto     # trilha + efeitos sintetizados + mixagem -14 LUFS
python3 ferramentas/medir_batidas.py piloto   # beats.json (grade medida)
cp audio/piloto_mix.wav projeto_remotion/public/
cd projeto_remotion && npm install && npm run qr && node render.mjs Piloto   # -> ../piloto_10s.mp4
node render.mjs Piloto folha && cd .. && python3 ferramentas/folha.py projeto_remotion/out/folha folha.png
```
Modelos do Kokoro: `VOZES/modelos/kokoro-v1.0.onnx` e `voices-v1.0.bin` (release model-files-v1.0 do kokoro-onnx; fora do git).
Dependências Python: numpy, scipy, soundfile, pyloudnorm, pedalboard, librosa, kokoro-onnx, faster-whisper, zxing-cpp, opencv-python-headless, pillow.
