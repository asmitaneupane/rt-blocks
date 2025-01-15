import { exec } from "child_process";
import { dest, parallel, series, src } from "gulp";
import _zip from "gulp-zip";

function clean() {
	return exec(`rm -rf release/ dist/`);
}

function build() {
	return exec(`pnpm build`);
}

const copy = parallel(
	() => src("rt-blocks.php").pipe(dest("release/rt-blocks")),
	() => src("dist/**/*").pipe(dest("release/rt-blocks/dist")),
	() => src("readme.txt").pipe(dest("release/rt-blocks")),
);

function zip() {
	return src(["release/rt-blocks/**/*"], {})
		.pipe(_zip("rt-blocks.zip", {}))
		.pipe(dest("release"));
}

function cleanBuild() {
	return exec(`rm -rf release/rt-blocks`);
}

const release = series(clean, build, copy, zip, cleanBuild);

export { release };
