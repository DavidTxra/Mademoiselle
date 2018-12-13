<?php
/*
Template Name: Formation
*/

get_header();

get_template_part( 'templates/header', 'dashboard' ); ?>
<div id="main-content">
	<div class="container">
		<div id="content-area" class="clearfix">
			<?php get_template_part( 'templates/dossiers/content', 'formation' ); 
			?>
		</div> <!-- #content-area -->
	</div> <!-- .container -->
</div> <!-- #main-content -->
<?php get_template_part( 'templates/footer', 'dashboard' ); ?>
<?php
get_footer();