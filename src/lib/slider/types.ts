export type Config = {
	perView: number;
	gap: number;
	breakpoints?: Record<number, Omit<Config, "breakpoints">>;
	showTitle?: boolean;
	showDate?: boolean;
	showExcerpt?: boolean;
	enableAutoPlay?: boolean;
	autoScrollInterval?: number;
	newTab?: boolean;
	noFollow?: boolean;
};

export type State = {
	x: number;
	startX: number;
	currentX: number;
	lastX: number;
	dragging: boolean;
	isDragged: boolean;
	index: number;
};
