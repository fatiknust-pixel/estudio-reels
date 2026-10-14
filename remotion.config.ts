import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
if (process.env.CHROMIUM_PATH) Config.setBrowserExecutable(process.env.CHROMIUM_PATH);
