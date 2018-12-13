<?php
/**
 * La configuration de base de votre installation WordPress.
 *
 * Ce fichier contient les réglages de configuration suivants : réglages MySQL,
 * préfixe de table, clés secrètes, langue utilisée, et ABSPATH.
 * Vous pouvez en savoir plus à leur sujet en allant sur
 * {@link http://codex.wordpress.org/fr:Modifier_wp-config.php Modifier
 * wp-config.php}. C’est votre hébergeur qui doit vous donner vos
 * codes MySQL.
 *
 * Ce fichier est utilisé par le script de création de wp-config.php pendant
 * le processus d’installation. Vous n’avez pas à utiliser le site web, vous
 * pouvez simplement renommer ce fichier en "wp-config.php" et remplir les
 * valeurs.
 *
 * @package WordPress
 */

// ** Réglages MySQL - Votre hébergeur doit vous fournir ces informations. ** //
/** Nom de la base de données de WordPress. */
define('DB_NAME', 'mademoiselle');

/** Utilisateur de la base de données MySQL. */
define('DB_USER', 'root');

/** Mot de passe de la base de données MySQL. */
define('DB_PASSWORD', 'root');

/** Adresse de l’hébergement MySQL. */
define('DB_HOST', 'localhost');

/** Jeu de caractères à utiliser par la base de données lors de la création des tables. */
define('DB_CHARSET', 'utf8mb4');

/** Type de collation de la base de données.
  * N’y touchez que si vous savez ce que vous faites.
  */
define('DB_COLLATE', '');

/**#@+
 * Clés uniques d’authentification et salage.
 *
 * Remplacez les valeurs par défaut par des phrases uniques !
 * Vous pouvez générer des phrases aléatoires en utilisant
 * {@link https://api.wordpress.org/secret-key/1.1/salt/ le service de clefs secrètes de WordPress.org}.
 * Vous pouvez modifier ces phrases à n’importe quel moment, afin d’invalider tous les cookies existants.
 * Cela forcera également tous les utilisateurs à se reconnecter.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '1nv`6O@]lLMT_kWalqW,Z}8./x@Fh/Nq_a#vBBEj :|*DNE3&y374)t,H;:v{2YZ');
define('SECURE_AUTH_KEY',  'pTlbYcy E=/`>k_$bKXf;5_b8#:AEx>lr]zDMD4IImw$bU#4r3j,+ o)7ZXa$JZW');
define('LOGGED_IN_KEY',    'LK:|sXN**q}qB4Sbut|bLKfN.70%2*0-kxD|c3*#(Sn0CB5`Xj4~)a[4aXJoUZ?t');
define('NONCE_KEY',        '>)=#bF2^AewxyM!dfhMkwfGyRWu`]hc^S5Nw6]v8_*o/ay=6o#Ky;sha56(I9>75');
define('AUTH_SALT',        'h}.O;uXHdqFSN:g]s6|N3dZ$){A>FP7z7sMs|SUIuzLw]Zv^oioIs16&0L0F#M7z');
define('SECURE_AUTH_SALT', 'p.R$-eCd4d;MLRN#8vfr7#U ~NC{V.KJe.Rl[m^OdZ#<l)UL-,V!f[StZ=8-UQ.g');
define('LOGGED_IN_SALT',   ']%_W05pe&x$y$nE?8Q_MHvz~!O<.8tsPcNko/u(Pm!lKl%@pF/9>6EA!5m^@O.U]');
define('NONCE_SALT',       '5`*jqRwGOg,:7Qrf2QluFEMh(`z#byGgWx7kMZGy[eBWylti).S:hs_3t-pXfGgs');
/**#@-*/

/**
 * Préfixe de base de données pour les tables de WordPress.
 *
 * Vous pouvez installer plusieurs WordPress sur une seule base de données
 * si vous leur donnez chacune un préfixe unique.
 * N’utilisez que des chiffres, des lettres non-accentuées, et des caractères soulignés !
 */
$table_prefix  = 'wp_';

/**
 * Pour les développeurs : le mode déboguage de WordPress.
 *
 * En passant la valeur suivante à "true", vous activez l’affichage des
 * notifications d’erreurs pendant vos essais.
 * Il est fortemment recommandé que les développeurs d’extensions et
 * de thèmes se servent de WP_DEBUG dans leur environnement de
 * développement.
 *
 * Pour plus d’information sur les autres constantes qui peuvent être utilisées
 * pour le déboguage, rendez-vous sur le Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* C’est tout, ne touchez pas à ce qui suit ! */

/** Chemin absolu vers le dossier de WordPress. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Réglage des variables de WordPress et de ses fichiers inclus. */
require_once(ABSPATH . 'wp-settings.php');