<?php
// $headers = apache_request_headers();

// foreach ($headers as $header => $value) {
	// echo "$header: $value <br />\n";
// }
function Login() {
	if(empty($_POST['username'])) {
		$this->HandleError("username is empty!");
		return false;
	}
	if(empty($_POST['password'])) {
		$this->HandleError("password is empty!");
		return false;
	}

	$username = trim($_POST['username']);
	$password = trim($_POST['password']);

	get_login($username, $password);

}

function get_login($username, $password) {
	$headerName1 = "Set-Cookie";
	// $username = "depth";
    // $password = "3l3ctricSheep-";
    $loginUrl = "https://my.usgs.gov/catalog/?josso_username=$username&josso_password=$password";
	file_get_contents($loginUrl);
	// var_dump($http_response_header);
	foreach ($http_response_header as $header => $value) {
		//echo "$header: $value <br />\n";
		if(stripos($value, $headerName1) !== FALSE){
			list($headername, $headervalue) = explode(":", $value);
			echo trim($headername);
			echo ":<br />\n";
			$cookieName = "";
			$cookieVal = "";
			$path = "";
			$secure = FALSE;
			foreach (explode(";", $headervalue) as $head) {
				list($key, $val) = explode("=", $head);
				$key = trim($key);
				$value = trim($value);
				if($key === "JOSSO_SESSIONID" || $key === "JSESSIONID"){
					$cookieName = $key;
					$cookieVal = $val;
				}
				if($key === "Path"){
					$path = $val;
				}
				if($key === "Secure"){
					$secure = TRUE;
				}
				echo "$key + $val <br />\n";
			}
			echo "cookie = $cookieName: $cookieVal; Path: $path; Secure: $secure<br />\n";
			echo "<br />\n";

			$cookieState = setcookie($cookieName, $cookieVal, 0, $path, "", $secure);
			$path = "/depth";
			$cookieState = setcookie($cookieName, $cookieVal, 0, $path, "", $secure);
		}
	}
}

// get_login("Set-Cookie");
Login();
header("Location: /depth/index.html");
exit;

// var_dump($http_response_header);
//foreach ($http_response_header as $header => $value) {
//	echo "$header: $value <br />\n";
//}
?>
