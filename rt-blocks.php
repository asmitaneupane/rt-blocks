<?php

/**
 * Plugin Name:     RT Blocks
 * Plugin URI:      http://example.com
 * Description:     Collection of advanced blocks.
 * Author:          rt
 * Author URI:      http://example.com
 * Text Domain:     rt-blocks
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         RTBlocks
 */

namespace RTBlocks;

defined( 'ABSPATH' ) || exit;

const RT_BLOCKS_VERSION     = '0.1.0';
const RT_BLOCKS_PLUGIN_FILE = __FILE__;
const RT_BLOCKS_PLUGIN_DIR  = __DIR__;
define( 'RT_BLOCKS_PLUGIN_DIR_URI', plugin_dir_url( RT_BLOCKS_PLUGIN_FILE ) );
define( 'RT_BLOCKS_DIST_DIR', RT_BLOCKS_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'dist' );
define( 'RT_BLOCKS_DIST_DIR_URI', RT_BLOCKS_PLUGIN_DIR_URI . 'dist' );
define( 'RT_BLOCKS_LANGUAGE_DIR', RT_BLOCKS_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'languages' );

final class RTBlocks {

	private static ?self $instance = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'init', [ $this, 'on_init' ], 0 );
		add_action( 'rest_api_init', [ $this, 'on_rest_api_init' ] );
	}

	public function on_init(): void {
		$this->load_textdomain();
		$this->register_scripts_styles();
		$this->register_blocks();
	}

	public function on_rest_api_init(): void {
		register_rest_route(
			'rtb/v1',
			'posts',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_posts' ],
				'permission_callback' => '__return_true',
			]
		);
	}

	private function register_blocks(): void {
		register_block_type_from_metadata(
			RT_BLOCKS_DIST_DIR . DIRECTORY_SEPARATOR . 'blocks' . DIRECTORY_SEPARATOR . 'posts-slider',
			[
				'render_callback' => [ $this, 'render_posts_slider' ],
			]
		);
	}

	private function parse_api_uri( string $uri, array $params = [] ): string {
		$parsed   = wp_parse_url( $uri );
		$base_uri = $parsed['scheme'] . '://' . $parsed['host'];

		return add_query_arg( $params, trailingslashit( $base_uri ) . 'wp-json/wp/v2/posts' );
	}

	public function render_posts_slider( array $block_attributes, string $content ): string {
		$api_uri = $this->parse_api_uri( $block_attributes['apiUrl'] ?? 'https://wptavern.com/', [] );
		$posts   = $this->fetch_remote_posts( $api_uri );

		if ( is_wp_error( $posts ) ) {
			return '<p>' . $posts->get_error_message() . '</p>';
		}

		$is_rest_request = defined( 'REST_REQUEST' ) && REST_REQUEST;
		$slider_config   = wp_json_encode( $block_attributes );

		ob_start();
		?>
		<rt-slider class="rt-slider" data-config='<?php echo esc_attr( $slider_config ); ?>'>
			<div class="rt-slider__track">
				<div class="rt-slider__list rt-posts">
					<?php foreach ( $posts['posts'] as $post ) : ?>
						<div class="rt-slider__slide">
							<div class="rt-post">
								<a class="rt-post__link" href="<?php echo esc_url( $is_rest_request ? '#' : $post['link'] ); ?>" <?php echo ! empty( $block_attributes['newTab'] ) ? 'target="_blank"' : ''; ?>
									<?php echo ! empty( $block_attributes['noFollow'] ) ? 'rel="nofollow"' : ''; ?>>
									<div class="rt-post__head">
										<?php if ( isset( $post['jetpack_featured_media_url'] ) ) : ?>
											<img decoding="async" height="720px" width="1280px" class="rt-post__image" src="<?php echo esc_url( $post['jetpack_featured_media_url'] ); ?>" alt="<?php echo esc_attr( $post['title']['rendered'] ); ?>">
										<?php endif; ?>
									</div>
								</a>

								<div class="rt-post__meta">
									<time class="rt-post__date" datetime="<?php echo esc_attr( $post['date'] ); ?>">
										<?php
										printf(
											/* translators: %s: post modified date */
											esc_html__( 'Created: %s', 'rt-blocks' ),
											esc_html( date_i18n( get_option( 'date_format' ), strtotime( $post['date'] ) ) )
										);
										?>
									</time>
									<?php if ( $post['date'] !== $post['modified'] ) : ?>
										<?php if ( ! empty( $block_attributes['showUpdatedDate'] ) ) : ?>
											<time class="rt-post__updated" datetime="<?php echo esc_attr( $post['modified'] ); ?>">
												<?php
												printf(
													/* translators: %s: post modified date */
													esc_html__( 'Updated: %s', 'rt-blocks' ),
													esc_html( date_i18n( get_option( 'date_format' ), strtotime( $post['modified'] ) ) )
												);
												?>
											</time>
										<?php endif; ?>
									<?php endif; ?>
								</div>
								<div class="rt-post__footer">
									<?php if ( ! empty( $block_attributes['showTitle'] ) ) : ?>
										<a
											class="rt-post__link"
											href="<?php echo esc_url( $is_rest_request ? '#' : $post['link'] ); ?>"
											<?php echo ! empty( $block_attributes['newTab'] ) ? 'target="_blank"' : ''; ?>
											<?php echo ! empty( $block_attributes['noFollow'] ) ? 'rel="nofollow"' : ''; ?>>
											<h3 class="rt-post__title"><?php echo esc_html( $post['title']['rendered'] ); ?></h3>
										</a>
									<?php endif; ?>
									<?php if ( ! empty( $block_attributes['showExcerpt'] ) ) : ?>
										<p class="rt-post__excerpt">
											<?php
											$excerpt        = wp_strip_all_tags( $post['excerpt']['rendered'] );
											$excerpt        = html_entity_decode( $excerpt );
											$excerpt        = preg_replace( '/[^\w\s\.\,\!\?\-]/u', '', $excerpt );
											$excerpt_length = ! empty( $block_attributes['excerptLength'] ) ? $block_attributes['excerptLength'] : 30;

											if ( str_word_count( $excerpt ) > $excerpt_length ) {
												$excerpt = wp_trim_words( $excerpt, $excerpt_length, '...' );
											}
											echo esc_html( $excerpt );
											?>
											<a
												class="rt-post__read-more"
												href="<?php echo esc_url( $is_rest_request ? '#' : $post['link'] ); ?>"
												<?php echo ! empty( $block_attributes['newTab'] ) ? 'target="_blank"' : ''; ?>
												<?php echo ! empty( $block_attributes['noFollow'] ) ? 'rel="nofollow"' : ''; ?>>
												<?php esc_html_e( 'read more...', 'rt-blocks' ); ?>
											</a>
										</p>
									<?php endif; ?>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
			<?php if ( ! empty( $block_attributes['showControls'] ) ) : ?>
				<div class="rt-slider__controls">
					<button class="rt-slider__control rt-slider__control--prev"><?php esc_html_e( 'Previous', 'rt-blocks' ); ?></button>
					<button class="rt-slider__control rt-slider__control--next"><?php esc_html_e( 'Next', 'rt-blocks' ); ?></button>
				</div>
			<?php endif; ?>
		</rt-slider>
		<?php
		return ob_get_clean();
	}

	public function get_posts( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error {
		$params  = $request->get_query_params();
		$api_uri = $this->parse_api_uri( $request['apiUrl'] ?? 'https://wptavern.com/', $params );
		$posts   = $this->fetch_remote_posts( $api_uri );
		if ( is_wp_error( $posts ) ) {
			return $posts;
		}
		$response = rest_ensure_response( $posts['posts'] );
		$response->header( 'RT-WP-TotalPages', $posts['totalpages'] );
		$response->header( 'RT-WP-Total', $posts['total'] );
		$response->header( 'Link', $posts['link'] );
		return $response;
	}

	private function fetch_remote_posts( string $api_url ): array|\WP_Error {
		$key    = '_rt_posts[' . md5( $api_url ) . ']';
		$cached = get_transient( $key );

		if ( ! empty( $cached ) ) {
			return $cached;
		}

		// $api_url  = add_query_arg( $args, 'https://wptavern.com/wp-json/wp/v2/posts' );
		$response = wp_remote_get( $api_url );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
			return new \WP_Error( 'rt_posts_error', __( 'Unable to fetch posts.', 'rt-blocks' ) );
		}

		$headers = wp_remote_retrieve_headers( $response );
		$posts   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_Error( 'rt_posts_error', __( 'Unable to decode posts.', 'rt-blocks' ) );
		}

		$data = [
			'posts'      => $posts,
			'totalpages' => $headers['rt-wp-totalpages'] ?? 0,
			'total'      => $headers['rt-wp-total'] ?? 0,
		];

		set_transient( $key, $data, DAY_IN_SECONDS );

		return $data;
	}

	private function load_textdomain(): void {
		load_plugin_textdomain( 'rt-blocks', false, RT_BLOCKS_LANGUAGE_DIR );
	}

	private function register_scripts_styles(): void {
		$blocks_asset_file = RT_BLOCKS_DIST_DIR . '/blocks.asset.php';
		$blocks_asset      = file_exists( $blocks_asset_file ) ? include $blocks_asset_file : [
			'dependencies' => [],
			'version'      => RT_BLOCKS_VERSION,
		];

		wp_register_script(
			'rt-posts-slider',
			RT_BLOCKS_DIST_DIR_URI . '/posts-slider.js',
			[],
			time(),
			true
		);

		wp_register_script(
			'rt-blocks',
			RT_BLOCKS_DIST_DIR_URI . '/blocks.js',
			$blocks_asset['dependencies'],
			$blocks_asset['version'],
			true
		);

		$rtl_suffix = is_rtl() ? '-rtl.css' : '.css';

		wp_register_style(
			'rt-posts-slider',
			RT_BLOCKS_DIST_DIR_URI . '/posts-slider' . $rtl_suffix,
			[],
			RT_BLOCKS_VERSION
		);

		wp_register_style(
			'rt-blocks',
			RT_BLOCKS_DIST_DIR_URI . '/blocks' . $rtl_suffix,
			[ 'wp-components' ],
			RT_BLOCKS_VERSION
		);

		wp_register_style(
			'rt-blocks-style',
			RT_BLOCKS_DIST_DIR_URI . '/style-blocks' . $rtl_suffix,
			[ 'rt-posts-slider' ],
			RT_BLOCKS_VERSION
		);
	}

	public function __wakeup() {}
	public function __clone() {}
}

RTBlocks::instance();
