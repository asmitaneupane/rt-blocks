import { type BlockConfiguration } from "@wordpress/blocks";
import metadata from "./block.json";
import { Edit } from "./edit";
import "./style.scss";

export const name = metadata.name;

export const settings = {
	...metadata,
	edit: Edit,
	save: () => null,
	icon: undefined,
} satisfies BlockConfiguration;
