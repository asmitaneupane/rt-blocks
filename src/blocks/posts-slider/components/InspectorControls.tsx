import { __ } from "@wordpress/i18n";
import { InspectorControls as WPInspectorControls } from "@wordpress/block-editor";
import {
	PanelBody,
	ToggleControl,
	BaseControl,
	RangeControl,
	SelectControl,
} from "@wordpress/components";
import { URLInput as WPURLInput } from "@wordpress/block-editor";
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
			showDate,
			showExcerpt,
			enableAutoPlay,
			autoScrollInterval,
			newTab,
			noFollow,
			postsPerPage,
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
					<div className="url-input-wrapper">
						<WPURLInput
							value={apiUrl}
							onChange={(value) =>
								setAttributes({ apiUrl: value })
							}
							autoFocus={false}
							disableSuggestions
						/>
					</div>
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
					label={__("Posts Per Page", "rt-blocks")}
					value={postsPerPage}
					options={[
						{ label: "1", value: "1" },
						{ label: "2", value: "2" },
						{ label: "3", value: "3" },
						{ label: "4", value: "4" },
					]}
				/>
				<ToggleControl
					label={__("Show Title", "rt-blocks")}
					checked={showTitle}
					onChange={() => setAttributes({ showTitle: !showTitle })}
					className="rt-toggle-control"
				/>
				<ToggleControl
					label={__("Show Date", "rt-blocks")}
					checked={showDate}
					onChange={() => setAttributes({ showDate: !showDate })}
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
			</PanelBody>
		</WPInspectorControls>
	);
};

export default InspectorControls;
