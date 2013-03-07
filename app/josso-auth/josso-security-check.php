<?php
/**
 * PHP Josso lib.  Include this in all pages you want to use josso.
 *
 * @package  org.josso.agent.php
 *
 * @version $Id: josso.php 340 2006-02-09 17:02:13Z sgonzalez $
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

// Resolve the assertion :

error_reporting (E_ALL ^ E_NOTICE);

include_once __DIR__."/../josso-config/josso.php";

$assertionId = $_REQUEST['josso_assertion_id'];

$backToUrl = $_SESSION['JOSSO_ORIGINAL_URL'];
    
$ssoSessionId = $josso_agent->resolveAuthenticationAssertion($assertionId);

// Set SSO Cookie ...
setcookie("JOSSO_SESSIONID", $ssoSessionId, 0, "/depth"); // session cookie ...

if (isset($backToUrl)) {
//	error_log("backToUrl=$backToUrl");
    forceRedirect($backToUrl, true);
} else {
	forceRedirect('/depth', true);
}

$_COOKIE['JOSSO_SESSIONID'] = $ssoSessionId;

// No page is stored, just display this one ...
// Get current sso user information,
$user = $josso_agent->getUserInSession();

$username = null;
if ($user) {
	$username = $user->getname();
}

$json = array('user' => $username, 'josso' => $ssoSessionId, 'assertionId' => $assertionId);

echo json_encode($json);

?>
<!-- <!doctype html public "-//w3c//dtd html 4.0 transitional//en">
<html>
<head>
	<title>JOSSO - PHP Information</title>
	<meta name="description" content="Java Open Single Signon">
</head>

<body>
    <h1>SSO Session : <?php echo $ssoSessionId;?></h1>
    <h1>User  : <?php echo $user->getName();?></h1>
    <h1>Username  : <?php echo $username;?></h1>
</body> -->


