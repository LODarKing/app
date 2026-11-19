import { Config } from '@remotion/cli/config';

// Navegador já instalado no ambiente (o Remotion não precisa baixar outro).
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
import fs from 'node:fs';
if (fs.existsSync(CHROME)) Config.setBrowserExecutable(CHROME);
Config.setVideoImageFormat('png');
Config.setEntryPoint('src/index.ts');
