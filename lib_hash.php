<?php

function verif_hash($mhash, $request){
  $good_hash = include 'hash.php';
  if (strcmp(base64_encode(hash('sha256', $request.$good_hash)), $mhash) != 0) {
    echo "\nError hash verification :";
    echo "\nGood hash : " . $good_hash;
    echo "\nfound B64 : " . $mhash;
		echo "\ncalculating hash of : ".$request.$good_hash;
		echo "\ncalculated  : ".hash('sha256', $request.$good_hash) ;
		echo "\ncalculated B64 : ".base64_encode(hash('sha256', $request.$good_hash)) ;
		echo base64_decode($mhash);
    echo "\nTotal res  : " .$request. "   " . $mhash;
    exit();
  }
}

?>

