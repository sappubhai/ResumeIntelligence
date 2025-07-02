<?php
echo "PHP is working!";
echo "\nPHP Version: " . phpversion();
echo "\nCurrent directory: " . getcwd();
echo "\nFiles in directory: " . implode(", ", scandir('.'));
?>