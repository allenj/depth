<?php
/**
 * JOSSO Agent class definition.
 *
 * @package org.josso.agent.php
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
error_reporting(E_ALL ^ E_NOTICE);

/**
 * Include NUSOAP soap client.
 */
require_once('nusoap/nusoap.php');

/**
 * PHP Josso Agent implementation based on WS.
 *
 * @package  org.josso.agent.php
 *
 * @author Sebastian Gonzalez Oyuela <sgonzalez@josso.org>
 * @version $Id: class.jossoagent.php 613 2008-08-26 16:42:10Z sgonzalez $
 * @author <a href="mailto:sgonzalez@josso.org">Sebastian Gonzalez Oyuela</a>
 *
 */
 
 // TODO: NOTE:  due to possible name conflicts, have modified all "new soapclient" references to use "new nusoap_client"
class jossoagent  {


	// ---------------------------------------
	// JOSSO Agent configuration : 
	// --------------------------------------- 
	
	/**
	 * WS End-point
	 * @var string
	 * @access private
	 */
	var $endpoint = 'http://localhost:8080';
	
	/**
	 * WS Proxy Settings
     * @var string
     * @access private
     */
	var $proxyhost = '';

	/**
     * @var string
     * @access private
     */
	var $proxyport = '';

	/**
     * @var string
     * @access private
     */
	var $proxyusername = '';

	/**
     * @var string
     * @access private
     */
	var $proxypassword = '';
	
	// Gateway
    /**
     * @var string
     * @access private
     */
	var $gatewayLoginUrl;

	/**
     * @var string
     * @access private
     */
	var $gatewayLogoutUrl;

	/**
     * @var string
     * @access private
     */
	var $sessionAccessMinInterval = 1000;

	/**
	 * Base path where JOSSO pages  can be found, like josso-security-check.php
	 */
	var $baseCode ;

	// ---------------------------------------
	// JOSSO Agent internal state : 
	// --------------------------------------- 

	/**
	 * SOAP Clienty for identity mgr.
     * @var string
     * @access private
     */
	var $identityMgrClient;


	/**
	 * SOAP Clienty for identity provider.
     * @var string
     * @access private
     */
	var $identityProviderClient;

	
	/**
	 * SOAP Clienty for session mgr.
     * @var string
     * @access private
     */
	var $sessionMgrClient;
	
	/**
	 * Last occurred error
     * @var string
     * @access private
     */
	var $fault;

	/**
	 * Last occurred fault
     * @var string
     * @access private
     */
	var $err;
	
	/**
	 * @return jossoagent a new Josso PHP Agent instance.
	 */
	static function getNewInstance() {
		// Get config variable values from josso.inc.
		global $josso_gatewayLoginUrl, $josso_gatewayLogoutUrl, $josso_endpoint, $josso_proxyhost, $josso_proxyport, $josso_proxyusername, $josso_proxypassword, $josso_agentBasecode;
		
		return new jossoagent($josso_gatewayLoginUrl, 
							  $josso_gatewayLogoutUrl, 
							  $josso_endpoint, 
							  $josso_proxyhost, 
							  $josso_proxyport, 
							  $josso_proxyusername, 
							  $josso_proxypassword,
							  $josso_agentBasecode);
	}
	
	//* @access private
	/**
	* constructor
	* @param    string $josso_gatewayLoginUrl 
	* @param    string $josso_gatewayLogoutUrl 
	* @param    string $josso_endpoint SOAP server
	* @param    string $josso_proxyhost
	* @param    string $josso_proxyport
	* @param    string $josso_proxyusername
	* @param    string $josso_proxypassword
	*/
	function jossoagent($josso_gatewayLoginUrl, $josso_gatewayLogoutUrl, $josso_endpoint, 
						$josso_proxyhost, $josso_proxyport, $josso_proxyusername, $josso_proxypassword, $josso_agentBasecode) {
	
		// error_log("jossoagent::ctor($josso_gatewayLoginUrl)");
		// error_log("jossoagent.php gatewayLoginUrl (arg): ".$josso_gatewayLoginUrl);

		// WS Config
		$this->endpoint = $josso_endpoint;
		$this->proxyhost = $josso_proxyhost;
		$this->proxyport = $josso_proxyport;
		$this->proxyusername = $josso_proxyusername;
		$this->proxypassoword = $josso_proxypassword;
		$this->baseCode = $josso_agentBasecode;
		
		// Agent config
		$this->gatewayLoginUrl = $josso_gatewayLoginUrl;
		$this->gatewayLogoutUrl = $josso_gatewayLogoutUrl;
		

		if (isset($josso_sessionAccessMinInterval)) {
			$this->sessionAccessMinInterval = $josso_sessionAccessMinInterval;
		}
										
		// error_log("jossoagent.php gatewayLoginUrl (assigned): ".$this->gatewayLoginUrl);
	}
	
	/**
	* Gets the authnenticated jossouser, if any.
	*
	* @return jossouser the authenticated user information.
	* @access public
	*/
	function getUserInSession() {
	
		$sessionId = $this->getSessionId();
		if (!isset($sessionId)) {
			return ;
		}

		// SOAP Invocation
		$soapclient = $this->getIdentityMgrSoapClient();
		$result = $soapclient ->call('findUserInSession', array('in0' => $sessionId));
		
		if (! $this->checkError($soapclient)) {
			return $this->newUser($result);
		}
		
	}
	
	/**
	* Returns true if current authenticated user is associated to the received role.
	* If no user is logged in, returns false.
    *
	* @param string $rolename the name of the role.
	*
	* @return bool
	* @access public
	*/
	function isUserInRole($rolename) {
		$user = $this->getUserInSession();
		if (!isset($user)) {
			return false;
		}
		
		$roles = $this->findRolesByUsername($user->getName()) ;
		
		foreach($roles as $role) {
			if ($role->getName() == $rolename) 
				return TRUE;
		}
		return FALSE;
	}
	
	/**
	* Returns all roles associated to the given username.
	*
	* @return jossorole[] an array with all jossorole instances
	* @access public
	*/
	function findRolesByUsername ($username) {
	
		// SOAP Invocation
		$soapclient = $this->getIdentityMgrSoapClient();
		$result = $soapclient->call('findRolesByUsername', array('in0' => $username));
		if (! $this->checkError($soapclient)) {
			// Build array of roles
			$i = 0;
			foreach($result as $roledata) {
				$roles[$i] = $this->newRole($roledata);
				$i++;
			}
			return $roles;
		}
		
	}
	
	/**
	 * Sends a keep-alive notification to the SSO server so that SSO sesison is not lost.
	 * @access public
	 */
	function accessSession() {
	
		// Check if a session ID is pressent.
		$sessionId = $this->getSessionid();
		if (!isset($sessionId )) {
			return;
		}
		// Check last access time :
		$lastAccessTime = $_SESSION['JOSSO_LAST_ACCESS_TIME'];
		$now = time();
		// Assume that _SESSION is set.
		if (!isset($lastAccessTime) || $lastAccessTime + $this->sessionAccessMinInterval < $now ) {
			$_SESSION['JOSSO_LAST_ACCESS_TIME'] = $now;
			$soapclient = $this->getSessionMgrSoapClient();
			$result = $soapclient->call('accessSession', array('in0' => $sessionId));
			$this->checkError($soapclient) ;
		}
		
	}
	
	/**
	 * Returns the URL where the user should be redireted to authenticate.
	 *
	 * @return string the configured login url.
	 *
	 * @access public
	 */
	function getGatewayLoginUrl() {
		return $this->gatewayLoginUrl;
	}

	/**
	 * Returns the SSO Session ID given an assertion id.
	 *
	 * @param string $assertionId
	 *
	 * @return string, the SSO Session associated with the given assertion.
	 *
	 * @access public
	 */
	function resolveAuthenticationAssertion($assertionId) {
		// SOAP Invocation
		$soapclient = $this->getIdentityProvdierSoapClient();
		$result = $soapclient->call('resolveAuthenticationAssertion', array('in0' => $assertionId));
		if (! $this->checkError($soapclient)) {
			// Return SSO Session ID
			return $result;
		}
	}
	
	/**
	 * Returns the URL where the user should be redireted to logout.
	 *
     * @return string the configured logout url.
     *
     * @access public
	 */
	function getGatewayLogoutUrl() {
		return $this->gatewayLogoutUrl;
	}

	/**
	 * Returns the base path where JOSSO code is stored.
	 */
	function getBaseCode() {
	    return $this->baseCode;
    }

	
	/**
	 * Allows client applications to access error messages
	 *
	 * @access public
	 */
	function getError() {
		return $this->err;
	}
	
	/**
	 * Allows client applications to access error messages
	 *
	 * @access public
	 */
	function getFault() {
		return $this->fault;
	}
	
	//----------------------------------------------------------------------------------------
	// Protected methods intended to be invoked only within this class or subclasses.
	//----------------------------------------------------------------------------------------
	
	/**
	 * Gets current JOSSO session id, if any.
	 *
	 * @access private
	 */
	function getSessionId() {
		return $_COOKIE['JOSSO_SESSIONID'];
	}
	
	/**
	 * Factory method to build a user from soap data.
	 *
	 * @param array user information as received from WS.
	 * @return jossouser a new jossouser instance.
	 *
	 * @access private
	 */
	function newUser($data) {
		// Build a new jossouser 
		$username = $data['name'];
		$properties = $data['properties'];

		$user = new jossouser($username, $properties);
		
		return $user;
	}
	
	/**
	 * Factory method to build a role from soap data.
	 *
	 * @param array role information as received from WS.
	 * @return jossorole a new jossorole instance
	 *
	 * @access private
	 */
	function newRole($data) {
		// Build a new jossouser 
		$rolename = $data['name'];
		$role = new jossorole($rolename);
		return $role;
	}
	
	/**
	 * Checks if an error occured with the received soapclient and stores information in agent state.
	 *
	 * @access private
	 */
	function checkError($soapclient) {
		// Clear old error/fault information.
		unset($this->fault);				
		unset($this->err);

		// Check for a fault
		if ($soapclient->fault) {
			$this->fault = $soapclient->fault;
			return TRUE;
		} else {
			// Check for errors
			$err = $soapclient->getError();
			if ($err) {
				$this->err = $soapclient->getError();
echo $err;
				return TRUE;
			} 
		}
		
		// No errors ...
		return FALSE;
	
	}
	
	/**
	 * Gets the soap client to access identity service.
	 *
	 * @access private
	 */
	function getIdentityMgrSoapClient() {
		// Lazy load the propper soap client
		if (!isset($this->identityMgrClient)) {
			$this->identityMgrClient = new nusoap_client($this->endpoint . '/josso/services/SSOIdentityManager?wsdl', true,
											$this->proxyhost, $this->proxyport, $this->proxyusername, $this->proxypassword);

            // Sets default encoding to UTF-8 ...
            $this->identityMgrClient->soap_defencoding = 'UTF-8';
            $this->identityMgrClient->decodeUTF8(false);
		}
		return $this->identityMgrClient;
	}

	/**
	 * Gets the soap client to access identity provider.
	 *
	 * @access private
	 */
	function getIdentityProvdierSoapClient() {
		// Lazy load the propper soap client
		if (!isset($this->identityProviderClient)) {
			$this->identityProviderClient = new nusoap_client($this->endpoint . '/josso/services/SSOIdentityProvider?wsdl', true,
											$this->proxyhost, $this->proxyport, $this->proxyusername, $this->proxypassword);

            // Sets default encoding to UTF-8 ...
            $this->identityProviderClient->soap_defencoding = 'UTF-8';
            $this->identityProviderClient->decodeUTF8(false);
		}
		return $this->identityProviderClient;
	}

	
	/**
	 * Gets the soap client to access session service.
	 *
	 * @access private
	 */
	function getSessionMgrSoapClient() {
		// Lazy load the propper soap client
		if (!isset($this->sessionMgrClient)) {
			// SSOSessionManager SOAP Client
			$this->sessionMgrClient = new nusoap_client($this->endpoint . '/josso/services/SSOSessionManager?wsdl', true,
										$this->proxyhost, $this->proxyport, $this->proxyusername, $this->proxypassword);
		}
		return $this->sessionMgrClient;

	}

}
?>
