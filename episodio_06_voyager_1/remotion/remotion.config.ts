import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setChromiumOpenGlRenderer('swiftshader');
