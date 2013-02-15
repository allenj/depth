<?php
// $headers = apache_request_headers();

// foreach ($headers as $header => $value) {
	// echo "$header: $value <br />\n";
// }
function get_login($headerName1) {
	$username = "depth";
    $password = "3l3ctricSheep-";
    // $loginUrl = "http://localhost:8090/catalog/?josso_username=$username&josso_password=$password";
    $loginUrl = "https://my-beta.usgs.gov/catalog/?josso_username=$username&josso_password=$password";
    // $loginUrl = "https://my-beta.usgs.gov/catalog/?josso_username=$username&josso_password=$password";
    // $loginUrl = "https://my.usgs.gov/josso/logon/?josso_username=$username&josso_password=$password";
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

get_login("Set-Cookie");
header("Location: /depth/index.html");
exit;

// var_dump($http_response_header);
//foreach ($http_response_header as $header => $value) {
//	echo "$header: $value <br />\n";
//}
?>
