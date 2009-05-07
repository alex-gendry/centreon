<?php
/*
 * Copyright 2005-2009 MERETHIS
 * Centreon is developped by : Julien Mathis and Romain Le Merlus under
 * GPL Licence 2.0.
 * 
 * This program is free software; you can redistribute it and/or modify it under 
 * the terms of the GNU General Public License as published by the Free Software 
 * Foundation ; either version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with 
 * this program; if not, see <http://www.gnu.org/licenses>.
 * 
 * Linking this program statically or dynamically with other modules is making a 
 * combined work based on this program. Thus, the terms and conditions of the GNU 
 * General Public License cover the whole combination.
 * 
 * As a special exception, the copyright holders of this program give MERETHIS 
 * permission to link this program with independent modules to produce an executable, 
 * regardless of the license terms of these independent modules, and to copy and 
 * distribute the resulting executable under terms of MERETHIS choice, provided that 
 * MERETHIS also meet, for each linked independent module, the terms  and conditions 
 * of the license of that module. An independent module is a module which is not 
 * derived from this program. If you modify this program, you may extend this 
 * exception to your version of the program, but you are not obliged to do so. If you
 * do not wish to do so, delete this exception statement from your version.
 * 
 * For more information : contact@centreon.com
 * 
 * SVN : $URL$
 * SVN : $Id$
 * 
 */
	require_once ("@CENTREON_ETC@/centreon.conf.php");		
	require_once ("../../$classdir/Session.class.php");
	require_once ("../../$classdir/Oreon.class.php");
	require_once ("../../$classdir/centreonDB.class.php");
	
	$pearDB = new CentreonDB();
	Session::start();
	$oreon =& $_SESSION["oreon"];
	
	$session =& $pearDB->query("SELECT * FROM `session` WHERE `session_id` = '".session_id()."'");
	if (!$session->numRows())
		exit;
	
	$logos_path = "";
	
	if (isset($_GET["logo"]) && $_GET["logo"] && ($_GET["logo"] == "1")){
		$logos_path = $oreon->optGen["nagios_path_img"];
	}

	if (isset($_GET["path"]) && $_GET["path"] && is_file($logos_path . $_GET["path"])){
		$fd = fopen($logos_path . $_GET["path"], "r");
		$buffer = NULL;
		while (!feof($fd))
		    $buffer .= fgets($fd, 4096);
		fclose ($fd);
		print $buffer;
	}
?>