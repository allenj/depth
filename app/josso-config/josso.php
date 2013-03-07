<?php
/**
 * PHP Josso lib.  Include this in all pages you want to use josso.
 *
 * @package  org.josso.agent.php
 *
 * @version $Id: josso.php 518 2008-03-04 10:58:22Z sgonzalez $
 * @author Sebastian Gonzalez Oyuela <sgonzalez@josso.org>
 */

/**
 JOSSO: Java Open Single Sign-On

 Copyright 2004-2008, Atricore, Inc.

 This is free software; you can redistribute it and/or modify it
 under the terms of the GNU Lesser General Public License as
 published by the Free Software Foundation; either version 2.1 of
 the License, or (at your option) any later version.

 This software is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with this software; if not, write to the Free
 Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

// This is required to avoid exceptions being thrown for secondary session_start() calls and for possible undefined index notices
// error_reporting(E_ALL ^ E_NOTICE);

require_once('class.jossoagent.php');
require_once('class.jossouser.php');
require_once('class.jossorole.php');
require('josso-cfg.inc');

// error_log("josso.php: josso_gatewayLoginUrl=$josso_gatewayLoginUrl");
// error_log("josso.php: josso_gatewayLogoutUrl=$josso_gatewayLogoutUrl");

try {
session_start();	
} catch (exception $e) {
	error_log("exception seen with session_start");
}

// PEAR coding standards only allow assignment of references from variables
// $josso_agent = & jossoagent::getNewInstance();
if (!isset($josso_agent)) {
//	$josso_agent = jossoagent::getNewInstance();

	// error_log("josso.php.init: creating new agent");

	$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
}
$josso_agent->accessSession();

/**
 * Use this function when ever you want to start user authentication.
 */
function jossoRequestLogin($josso_agent) {

    $currentUrl = $_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING'];

    jossoRequestLoginForUrl($josso_agent,$currentUrl);
}


/**
 * Use this function when ever you want to logout the current user.
 */
function jossoRequestLogout($josso_agent) {

    $currentUrl = $_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING'];

    jossoRequestLogoutForUrl($josso_agent,$currentUrl);
}



/**
 * Creates a login url for the current page, use to create links to JOSSO login page
 */
function jossoCreateLoginUrl($josso_agent) {

	// Get JOSSO Agent instance
	/*
	if (!isset($josso_agent)) {
		error_log("josso.php.createLoginUrl: creating new agent");
		$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
	*/

    $currentUrl = createBaseUrl() . $_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING'];
    $loginUrl = $josso_agent->getBaseCode().'/josso-login.php'. '?josso_current_url=' . $currentUrl;

    return $loginUrl;

}

function returnUrl($josso_agent) {

	 if (!isset($josso_agent)) {
		error_log("josso.php.returnUrl: missing agent");
	 }
	 /*
		$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
	*/
    $currentUrl = createBaseUrl() . $_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING'];
    return $currentUrl;

}

/**
 * Creates a logout url for the current page, use to create links to JOSSO logout page
 */
function jossoCreateLogoutUrl($josso_agent) {

	// Get JOSSO Agent instance
	 if (!isset($josso_agent)) {
		error_log("josso.php.createLogoutUrl: missing agent");
	 }
	 /*
		$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
	*/

    $currentUrl = createBaseUrl() . $_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING'];
    $logoutUrl =  $josso_agent->getBaseCode().'/josso-logout.php'. '?josso_current_url=' . $currentUrl;

    return $logoutUrl;

}

function jossoRequestLoginForUrl($josso_agent,$currentUrl) {

    $_SESSION['JOSSO_ORIGINAL_URL'] = $currentUrl;

    // Get JOSSO Agent instance
	if (!isset($josso_agent)) {
		// error_log("josso.php.requestLoginForUrl: creating new agent");
		$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
    $securityCheckUrl = createBaseUrl().$josso_agent->getBaseCode().'/josso-security-check.php';
	// error_log("josso_agent.requestLoginForUrl: ".var_export($joss_agent, TRUE));
    $loginUrl = $josso_agent->getGatewayLoginUrl(). '?josso_back_to=' . $securityCheckUrl;

	// error_log("### requestLoginForUrl: $loginUrl");
    forceRedirect($loginUrl);

}

function jossoRequestLogoutForUrl($josso_agent,$currentUrl) {

	// Get JOSSO Agent instance
	if (!isset($josso_agent)) {
		// error_log("josso.php.requestLogoutForUrl: creating new agent");
		$josso_agent = new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
    $logoutUrl = $josso_agent->getGatewayLogoutUrl(). '?josso_back_to=' . $currentUrl;
	// error_log("### requestLogoutForUrl: $logoutUrl");
    forceRedirect($logoutUrl);

}

function forceRedirect($url,$die=true) {
    if (!headers_sent()) {
        ob_end_clean();
        header("Location: " . $url);
    }
    printf('<HTML>');
    printf('<META http-equiv="Refresh" content="0;url=%s">', $url);
    printf('<BODY onload="try {self.location.href="%s" } catch(e) {}"><a href="%s">Redirect </a></BODY>', $url, $url);
    printf('</HTML>');
    if ($die)
        die();
}

function createBaseUrl() {
	// error_log("### createBaseUrl()");
    // ReBuild securityCheck URL
    $protocol = 'http';
    $host = $_SERVER['HTTP_HOST'];

    // error_log(__FUNCTION__."() server_info=".print_r($_SERVER,TRUE));

    /* HACK! we may be running on a system that has been pinned to a particular server,
     * so we may need to map the reverse proxy host back to the expected host
     */
    $reverseProxyMap = array(
      'natwebsddev1.cr.usgs.gov' => 'internal.usgs.gov', // OR: 'staging-internal.usgs.gov'
    );
    if (array_key_exists(strtolower($host), $reverseProxyMap)) {
      // error_log(__FUNCTION__."() mapping host($host) to ".$reverseProxyMap[$host]);
      $host = $reverseProxyMap[$host];
    }

    if (isset($_SERVER['HTTPS'])) {

        // This is a secure connection, the default PORT is 443
        $protocol = 'https';
        if ($_SERVER['SERVER_PORT'] != 443) {
            $port = $_SERVER['SERVER_PORT'];
        }

    } else {
        // This is a NON secure connection, the default PORT is 80
        $protocol = 'http';
        if ($_SERVER['SERVER_PORT'] != 80) {
            $port = $_SERVER['SERVER_PORT'];
        }
    }

    $newUrl = $protocol.'://'.$host.(isset($port) ? ':'.$port : '');
	// error_log("createBaseUrl returning ".$newUrl);
	return $newUrl;

}
?>
