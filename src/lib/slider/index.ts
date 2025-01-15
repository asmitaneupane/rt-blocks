import type { Config, State } from "./types";
import "./index.scss";

const DEFAULT_CONFIG = {
	perView: 4,
	gap: 20,
	showTitle: true,
	showDate: true,
	showExcerpt: true,
	enableAutoPlay: false,
	autoScrollInterval: 3000,
	newTab: false,
	noFollow: false,
};

class Slider {
	private config: Config;
	private track: HTMLElement;
	private list: HTMLElement;
	private slides: Array<HTMLElement>;
	private controls: {
		next?: HTMLElement | null;
		prev?: HTMLElement | null;
	} = {};
	private state: State;
	private element: HTMLElement;

	constructor(element: HTMLElement) {
		this.element = element;
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onNextClick = this.onNextClick.bind(this);
		this.onPrevClick = this.onPrevClick.bind(this);
	}

	private validateElements() {
		const track = Array.from(this.element.children).find((c) =>
			c.classList.contains("rt-slider__track"),
		) as HTMLElement | undefined;

		if (!track) {
			throw new Error("No track found");
		}
		const list = Array.from(track.children).find((c) =>
			c.classList.contains("rt-slider__list"),
		) as HTMLElement | undefined;
		if (!list) {
			throw new Error("No list found");
		}
		const slides = Array.from(list.children) as HTMLElement[];
		if (slides.length === 0) {
			throw new Error("No slides found");
		}
		for (const slide of slides) {
			if (!slide.classList.contains("rt-slider__slide")) {
				slide.classList.add("rt-slider__slide");
			}
		}

		return {
			track,
			list,
			slides,
		};
	}

	public mount() {
		this.init();
		this.addEventListeners();
	}

	public unmount() {
		this.removeEventListeners();
	}

	private addEventListeners() {
		this.list.addEventListener("pointerdown", this.onDragStart);
		this.list.addEventListener("pointerup", this.onDragEnd);
		this.list.addEventListener("pointerleave", this.onDragEnd);
		this.list.addEventListener("pointermove", this.onDrag);
		this.list.addEventListener("touchstart", this.onDragStart, {
			passive: true,
		});
		this.list.addEventListener("touchend", this.onDragEnd, {
			passive: true,
		});
		this.list.addEventListener("touchmove", this.onDrag, { passive: true });
		this.list.addEventListener("click", this.onClick, true);
		this.controls?.next?.addEventListener("click", this.onNextClick);
		this.controls?.prev?.addEventListener("click", this.onPrevClick);
	}

	private removeEventListeners() {
		this.list.removeEventListener("pointerdown", this.onDragStart);
		this.list.removeEventListener("pointerup", this.onDragEnd);
		this.list.removeEventListener("pointerleave", this.onDragEnd);
		this.list.removeEventListener("pointermove", this.onDrag);
		this.list.removeEventListener("touchstart", this.onDragStart);
		this.list.removeEventListener("touchend", this.onDragEnd);
		this.list.removeEventListener("touchmove", this.onDrag);
		this.list.removeEventListener("click", this.onClick, true);
		this.controls?.next?.removeEventListener("click", this.onNextClick);
		this.controls?.prev?.removeEventListener("click", this.onPrevClick);
	}

	init() {
		const configAttr = this.element.dataset.config;
		this.config = {
			...DEFAULT_CONFIG,
			...JSON.parse(configAttr ?? "{}"),
		};
		this.state = {
			x: 0,
			startX: 0,
			currentX: 0,
			lastX: 0,
			dragging: false,
			isDragged: false,
			index: 0,
		};
		const { slides, track, list } = this.validateElements();
		this.track = track;
		this.list = list;
		this.slides = slides;
		this.controls.next = this.element.querySelector<HTMLElement>(
			".rt-slider__control--next",
		);
		this.controls.prev = this.element.querySelector<HTMLElement>(
			".rt-slider__control--prev",
		);
		this.calculateSlideWidth();
		this.list.style.setProperty("--translate--x", `${this.state.x}px`);
		this.list.style.setProperty("--gap", `${this.config.gap}px`);
		for (let i = 0; i < this.slides.length; i++) {
			this.slides[i]!.dataset.index = `${i}`;
		}
		this.element.setAttribute("data-init", "true");
	}

	private calculateSlideWidth() {
		const { perView, gap } = this.config;
		const trackWidth = this.track.offsetWidth;
		const slideWidth = trackWidth / perView;
		this.list.style.setProperty("--slide--width", `${slideWidth}px`);
		return slideWidth;
	}

	private onClick(e: MouseEvent) {
		if (this.state.isDragged) {
			e.preventDefault();
			e.stopPropagation();
			setTimeout(() => {
				this.state.isDragged = false;
			}, 0);
		}
	}

	public next() {
		if (this.isLastSlideVisible()) return;
		const slideWidth = this.calculateSlideWidth();
		const movement = -slideWidth;
		this.moveSlides(movement);
	}

	public prev() {
		if (this.state.index === 0) return;
		const slideWidth = this.calculateSlideWidth();
		const movement = slideWidth;
		this.moveSlides(movement);
	}

	private moveSlides(movement: number) {
		this.list.style.setProperty("--transition--duration", "300ms");
		const newX = this.state.x + movement;
		const slideWidth = this.calculateSlideWidth();
		const minScroll =
			-(this.slides.length - this.config.perView) * slideWidth;

		this.state.x = Math.max(minScroll, Math.min(0, newX));
		this.state.lastX = this.state.x;

		this.list.style.setProperty("--translate--x", `${this.state.x}px`);

		const newIndex = Math.abs(Math.round(this.state.x / slideWidth));
		if (newIndex !== this.state.index) {
			this.state.index = newIndex;
			this.element.dataset.index = newIndex.toString();
		}
		this.updateNavigationState();
	}

	private onNextClick(e: Event) {
		e.preventDefault();
		this.next();
	}

	private onPrevClick(e: Event) {
		e.preventDefault();
		this.prev();
	}

	private onDragStart(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		this.state.dragging = true;
		this.state.isDragged = false;
		this.state.startX =
			e instanceof PointerEvent ? e.pageX : (e.touches[0]?.pageX ?? 0);
		this.state.lastX = this.state.x;
		this.list.style.setProperty("--transition--duration", "0ms");
	}

	private onDragEnd(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		if (!this.state.dragging) return;

		if (Math.abs(this.state.currentX - this.state.startX) > 5) {
			this.state.isDragged = true;
		}

		this.state.dragging = false;
		this.list.style.setProperty("--transition--duration", "300ms");

		const slideWidth = this.calculateSlideWidth();
		const movement = this.state.currentX - this.state.startX;
		const minScroll =
			-(this.slides.length - this.config.perView) * slideWidth;

		let newX = this.state.lastX + movement;
		newX = Math.max(minScroll, Math.min(0, newX));

		const slidePosition = Math.round(newX / slideWidth) * slideWidth;
		this.state.x = slidePosition;
		this.state.lastX = slidePosition;

		this.list.style.setProperty("--translate--x", `${this.state.x}px`);

		const newIndex = Math.abs(Math.round(slidePosition / slideWidth));
		if (newIndex !== this.state.index) {
			this.state.index = newIndex;
		}

		this.updateNavigationState();
	}

	private onDrag(e: PointerEvent | TouchEvent) {
		e.preventDefault();
		if (!this.state.dragging) return;

		const currentX =
			e instanceof PointerEvent ? e.pageX : (e.touches[0]?.pageX ?? 0);

		this.state.currentX = currentX;
		const movement = currentX - this.state.startX;

		if (Math.abs(movement) > 5) {
			this.state.isDragged = true;
		}

		const slideWidth = this.calculateSlideWidth();
		const minScroll =
			-(this.slides.length - this.config.perView) * slideWidth;

		let newX = this.state.lastX + movement;
		newX = Math.max(minScroll, Math.min(0, newX));

		this.state.x = newX;
		this.list.style.setProperty("--translate--x", `${this.state.x}px`);
	}

	private updateNavigationState() {
		if (!this.controls?.next || !this.controls?.prev) return;
		if (this.state.index === 0) {
			this.controls.prev.setAttribute("disabled", "");
		} else {
			this.controls.prev.removeAttribute("disabled");
		}
		if (this.isLastSlideVisible()) {
			this.controls.next.setAttribute("disabled", "");
		} else {
			this.controls.next.removeAttribute("disabled");
		}
	}

	private isLastSlideVisible(): boolean {
		return this.state.index >= this.slides.length - this.config.perView;
	}
}

export default Slider;
