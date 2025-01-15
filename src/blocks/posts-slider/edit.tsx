import { useBlockProps } from "@wordpress/block-editor";
import React, { useEffect, useRef } from "react";
import ServerSideRender from "@wordpress/server-side-render";
import type { BlockEditProps } from "@wordpress/blocks";
import Slider from "../../lib/slider";
import InspectorControls from "./components/InspectorControls";

function Edit(props: BlockEditProps<{}>) {
	const { attributes, setAttributes } = props;
	const blockProps = useBlockProps();
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!ref.current) return;
		const initSlider = () => {
			if (!ref.current) return;
			const slider = ref.current.querySelector<HTMLElement>(".rt-slider");
			if (!slider || slider.dataset.init) return;
			new Slider(slider).mount();
		};

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					initSlider();
				}
			});
		});

		observer.observe(ref.current, {
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
		};
	}, []);
	return (
		<>
			<InspectorControls
				attributes={attributes}
				setAttributes={setAttributes}
			/>
			<div {...blockProps}>
				<div ref={ref}>
					<ServerSideRender
						block="rtb/posts-slider"
						attributes={props.attributes}
						httpMethod="post"
					/>
				</div>
			</div>
		</>
	);
}

export { Edit };
