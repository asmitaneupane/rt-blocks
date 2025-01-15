import * as postsSlider from "./posts-slider";
import { registerBlockType } from "@wordpress/blocks";

const blocks = [postsSlider];

for (const block of blocks) {
	registerBlockType(block.name, block.settings);
}
