import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(94);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(17);
Config.setPixelFormat("yuv420p");
if (process.env.CHROMIUM_PATH) Config.setBrowserExecutable(process.env.CHROMIUM_PATH);
