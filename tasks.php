<?php
	include "lib_hash.php";

	$filename = "json/tasks.json";

	// Update Event DB
	if($_SERVER['REQUEST_METHOD'] == "POST"){

		verif_hash($_POST["hash"], $_POST["title"]);
		@$id = $_POST["id"];
		$title = $_POST["title"];

		if (filesize($filename) != 0) {
			$handle = fopen($filename, "r");
			$contents = fread($handle, filesize($filename));
			fclose($handle);
			
			$data = json_decode($contents, true);
		} else {
			$data = array();
		}

		/* Search existing event */
		$found = false;
		if (isset($_POST["id"])) { 
			for ($i=0;$i<count($data);$i++){
				if ($data[$i]['id'] == $id) {

					// Update
					if (strlen($title) != 0) {
						$data[$i]['title'] = $title;
					// Delete
					} else {
						unset($data[$i]);
						$data = array_values($data);
					}

					$found = true;
					break;
				}
			}
			if (!$found){
				echo "Unable to find given ID";
			}
		} else { 
			$last_val = end($data);
			if ($last_val) {
				$last_id = $last_val["id"]; 
				$id = $last_id+1;
			} else {
				$id = 0;
			}
				$data[] =
				array (
				  'id' => $id,
				  'title' => $title,
					);	
		}

		$new_contents = json_encode($data);
		$handle = fopen($filename, "w");
		$contents = fwrite($handle, $new_contents);
		fclose($handle);

		echo $id;

	// GET Event DB
	} else {
		if (filesize($filename) != 0) {
			$handle = fopen($filename, "r");
			$contents = fread($handle, filesize($filename));
			fclose($handle);
		} else {
			$contents = "[]";
		}
		header('Content-Type: application/json');
		echo $contents;
	
	
	}

?>
