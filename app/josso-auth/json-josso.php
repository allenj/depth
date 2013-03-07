<?php

error_reporting (E_ALL ^ E_NOTICE);

include_once __DIR__."/../josso-config/josso.php";

$ssoSessionId = $_COOKIE['JOSSO_SESSIONID'];

// No page is stored, just display this one ...
// Get current sso user information,
$user = $josso_agent->getUserInSession();

$username = null;
if ($user) {
	$username = $user->getname();
}

$json = array('user' => $username, 'josso' => $ssoSessionId);

echo json_encode($json);

?>
