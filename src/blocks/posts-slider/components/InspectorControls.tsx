import { __ } from "@wordpress/i18n";
import { InspectorControls as WPInspectorControls } from "@wordpress/block-editor";
import {
	PanelBody,
	ToggleControl,
	BaseControl,
	RangeControl,
	SelectControl,
} from "@wordpress/components";
import React from "react";

type Props = {
	attributes: any;
	setAttributes: (attributes: any) => void;
};

const InspectorControls: React.ComponentType<Props> = (props) => {
	const {
		attributes: {
			apiUrl,
			showTitle,
			showUpdatedDate,
			showExcerpt,
			enableAutoPlay,
			autoScrollInterval,
			newTab,
			noFollow,
			showControls,
			perView,
		},
		setAttributes,
	} = props;

	return (
		<WPInspectorControls>
			<PanelBody
				title={__("General", "rt-blocks")}
				className="rt-panel-body"
			>
				<BaseControl
					label={__("API Url", "rt-blocks")}
					className="rt-base-control"
				>
					<input
						value={apiUrl}
						onChange={(value) => setAttributes({ apiUrl: value })}
						className="rt-input-text"
					/>
					<p
						style={{
							fontStyle: "italic",
							textWrap: "wrap",
							color: "#d7d7d7",
						}}
					>
						{__(
							"Note: wp-json/wp/v2/posts will be append automatically.",
							"rt-blocks",
						)}
					</p>
					{apiUrl && (
						<>
							<ToggleControl
								checked={newTab ?? false}
								onChange={() =>
									setAttributes({ newTab: !newTab })
								}
								label={__(
									"Open Link in a New Tab",
									"rt-blocks",
								)}
								className="rt-toggle-control"
							/>
							<ToggleControl
								checked={noFollow ?? false}
								onChange={() =>
									setAttributes({ noFollow: !noFollow })
								}
								label={__("Nofollow Link", "rt-blocks")}
								className="rt-toggle-control"
							/>
						</>
					)}
				</BaseControl>
				<SelectControl
					label={__("Per View", "rt-blocks")}
					value={perView}
					options={[
						{ label: "2", value: "2" },
						{ label: "3", value: "3" },
					]}
					onChange={(value) => setAttributes({ perView: value })}
				/>
				<ToggleControl
					label={__("Show Title", "rt-blocks")}
					checked={showTitle}
					onChange={() => setAttributes({ showTitle: !showTitle })}
					className="rt-toggle-control"
				/>
				<ToggleControl
					label={__("Show Date", "rt-blocks")}
					checked={showUpdatedDate}
					onChange={() =>
						setAttributes({ showUpdatedDate: !showUpdatedDate })
					}
					className="rt-toggle-control"
				/>
				<ToggleControl
					label={__("Show Excerpt", "rt-blocks")}
					checked={showExcerpt}
					onChange={() =>
						setAttributes({ showExcerpt: !showExcerpt })
					}
					className="rt-toggle-control"
				/>
				<ToggleControl
					label={__("Auto Scroll", "rt-blocks")}
					checked={enableAutoPlay}
					onChange={() =>
						setAttributes({ enableAutoPlay: !enableAutoPlay })
					}
					className="rt-toggle-control"
				/>
				{enableAutoPlay && (
					<RangeControl
						label={__("Auto Scroll Interval (ms)", "rt-blocks")}
						value={autoScrollInterval}
						onChange={(value) =>
							setAttributes({ autoScrollInterval: value })
						}
						min={1000}
						max={10000}
						step={500}
					/>
				)}
				<ToggleControl
					label={__("Show Controls", "rt-blocks")}
					checked={showControls}
					onChange={() =>
						setAttributes({ showControls: !showControls })
					}
					className="rt-toggle-control"
				/>
			</PanelBody>
		</WPInspectorControls>
	);
};

export default InspectorControls;
