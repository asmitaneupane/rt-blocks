declare module "@wordpress/server-side-render" {
	import { ComponentType } from "react";
	interface ServerSideRenderProps {
		block: string;
		attributes?: Record<string, unknown>;
		className?: string;
		httpMethod?: "get" | "post";
		skipBlockSupportAttributes?: boolean;
		urlQueryArgs?: Record<string, unknown>;
		ErrorResponsePlaceholder?: ComponentType;
		LoadingResponsePlaceholder?: ComponentType;
	}
	const ServerSideRender: ComponentType<ServerSideRenderProps>;
	export default ServerSideRender;
}
